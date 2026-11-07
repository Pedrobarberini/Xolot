import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { before, beforeEach, after, test } from "node:test";
import { initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import { assertRulesTarget, rulesProject } from "../../scripts/rules-target.mjs";
assertRulesTarget(process.env);
const require = createRequire(import.meta.url);
const { initializeApp, deleteApp } =
  require("firebase-admin/app") as typeof import("firebase-admin/app");
const { getFirestore, Timestamp } =
  require("firebase-admin/firestore") as typeof import("firebase-admin/firestore");
const app = initializeApp({ projectId: rulesProject }, "social-reliability");
const db = getFirestore(app);
db.settings({ host: "127.0.0.1:8085", ssl: false });
// Os handlers usam a instância default, igualmente vinculada ao emulador demo.
const defaultApp = initializeApp({ projectId: rulesProject });
const defaultDb = getFirestore(defaultApp);
defaultDb.settings({ host: "127.0.0.1:8085", ssl: false });
const { sendDirectMessage } = require("../../functions/lib/social.js");
const { updateDirectMessageReceipts } = require("../../functions/lib/messageReceipts.js");
const { updateAvatarCrop } = require("../../functions/lib/avatar.js");
const { deleteOwnAccount } = require("../../functions/lib/accountDeletion.js");
const {
  setPostReport,
  listModerationReports,
  resolveModerationReport,
  postReportId,
} = require("../../functions/lib/modules/safety/reports.js");
const { getAuth } = require("firebase-admin/auth") as typeof import("firebase-admin/auth");
const {
  createAbuseLimiter,
  guardCallable,
} = require("../../functions/lib/platform/abuseProtection.js");
const {
  createEngagementCommandHandlers,
} = require("../../functions/lib/modules/engagement/handlers.js");
const {
  createEngagementService,
} = require("../../functions/lib/modules/engagement/application/engagementService.js");
const {
  createFirestoreEngagementRepository,
} = require("../../functions/lib/modules/engagement/data/firestoreEngagement.js");
const { verifyRegisteredUser } = require("../../functions/lib/auth.js");
const request = (data: unknown, uid = "alice") => ({
  auth: { uid, token: { email_verified: true } },
  data,
});
const codeIs = (code: string) => (error: { code?: string }) => error?.code === code;
let environment: RulesTestEnvironment;
before(async () => {
  environment = await initializeTestEnvironment({
    projectId: rulesProject,
    firestore: { host: "127.0.0.1", port: 8085, rules: readFileSync("firestore.rules", "utf8") },
  });
});
after(async () => {
  await db.terminate();
  await defaultDb.terminate();
  await deleteApp(app);
  await deleteApp(defaultApp);
  await environment?.cleanup();
});
beforeEach(async () => {
  await environment.clearFirestore();
  for (const uid of ["alice", "bruno", "carla"]) {
    await db.doc(`accounts/${uid}`).set({ uid });
    await db.doc(`profiles/${uid}`).set({ name: uid, username: uid });
  }
  await db.doc("posts/post").set({ status: "published", authorId: "alice" });
});

test("bloqueio bilateral recusa novas mensagens/compartilhamentos sem apagar histórico", async () => {
  await sendDirectMessage.run(
    request({ messageId: "before-block", recipientUserId: "bruno", body: "Histórico sintético" }),
  );
  await db
    .doc("socialPreferences/bruno")
    .set({ ownerUid: "bruno", blockedProfileIds: ["profile-alice"] });
  for (const [from, to] of [
    ["alice", "bruno"],
    ["bruno", "alice"],
  ])
    await assert.rejects(
      sendDirectMessage.run(
        request({ messageId: `blocked-${from}`, recipientUserId: to, body: "Não enviar" }, from),
      ),
      codeIs("permission-denied"),
    );
  await assert.rejects(
    sendDirectMessage.run(
      request(
        {
          messageId: "share-blocked",
          recipientUserId: "bruno",
          body: "Não enviar",
          sharedPlayerId: "approved-post",
        },
        "carla",
      ),
    ),
    codeIs("permission-denied"),
  );
  assert.equal((await db.collection("directMessages").get()).size, 1);
});

test("bloqueio recusa novas curtidas/views e permite remover curtida anterior", async () => {
  const service = createEngagementService(createFirestoreEngagementRepository(() => db));
  const post = { playerId: "approved-post", postId: "post" };
  await service.setLike("bruno", post, true);
  await db
    .doc("socialPreferences/alice")
    .set({ ownerUid: "alice", blockedProfileIds: ["profile-bruno"] });
  await assert.rejects(service.recordView("bruno", post), codeIs("permission-denied"));
  assert.deepEqual(await service.setLike("bruno", post, false), { liked: false });
  await assert.rejects(service.setLike("bruno", post, true), codeIs("permission-denied"));
});

test("denúncias são idempotentes, privadas e revisadas somente por claim administrativo", async () => {
  const data = { playerId: "approved-post", active: true, reason: "spam" };
  await setPostReport.run(request(data, "bruno"));
  await setPostReport.run(request(data, "bruno"));
  const reportId = postReportId("bruno", "post");
  assert.equal((await db.collection("moderationReports").get()).size, 1);
  await assert.rejects(listModerationReports.run(request({})), codeIs("permission-denied"));
  const admin = { auth: { uid: "alice", token: { email_verified: true, admin: true } }, data: {} };
  const result = await listModerationReports.run(admin);
  assert.equal(result.reports[0].id, reportId);
  assert.equal("reporterUid" in result.reports[0], false);
  await resolveModerationReport.run({ ...admin, data: { reportId, decision: "no_violation" } });
  await setPostReport.run(request(data, "bruno"));
  assert.equal((await db.doc(`moderationReports/${reportId}`).get()).data()?.status, "resolved");
  const client = environment.authenticatedContext("bruno", { email_verified: true }).firestore();
  await assert.rejects(client.doc(`moderationReports/${reportId}`).get());
  await assert.rejects(client.doc(`moderationReports/${reportId}`).set({ status: "resolved" }));
  await assert.rejects(
    setPostReport.run(request({ ...data, reporterUid: "alice" }, "bruno")),
    codeIs("invalid-argument"),
  );
});

test("duas instâncias compartilham a quota e burst controlado não ultrapassa o orçamento", async () => {
  const first = createAbuseLimiter(
    () => db,
    () => 10000,
  );
  const second = createAbuseLimiter(
    () => db,
    () => 10000,
  );
  const results = [];
  for (let batch = 0; batch < 4; batch++) {
    results.push(
      ...(await Promise.allSettled(
        Array.from({ length: 6 }, (_, index) =>
          (index % 2 ? first : second)("createAvatarUpload", "alice"),
        ),
      )),
    );
  }
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 5);
  for (const result of results)
    if (result.status === "rejected") assert.equal(result.reason.code, "resource-exhausted");
});

test("mensagem repetida retorna o registro real; colisão e troca de dono são negadas", async () => {
  const data = { messageId: "message-local", recipientUserId: "bruno", body: "Mensagem sintética" };
  const sent = await sendDirectMessage.run(request(data));
  assert.equal(sent.deliveredAt, undefined);
  const stored = (await db.doc("directMessages/message-local").get()).data()!;
  const retried = await sendDirectMessage.run(request(data));
  assert.equal(retried.createdAt, stored.createdAt.toDate().toISOString());
  assert.equal((await db.collection("directMessages").get()).size, 1);
  await assert.rejects(sendDirectMessage.run(request(data, "carla")), codeIs("already-exists"));
  await assert.rejects(
    sendDirectMessage.run(request({ ...data, body: "Alterada" })),
    codeIs("already-exists"),
  );
  await assert.rejects(
    sendDirectMessage.run(request({ ...data, recipientUserId: "path/uid" })),
    codeIs("invalid-argument"),
  );
  const receipt = { messageIds: [data.messageId], status: "read" };
  await assert.rejects(
    updateDirectMessageReceipts.run(request(receipt)),
    codeIs("permission-denied"),
  );
  const results = await Promise.all(
    Array.from({ length: 3 }, () => updateDirectMessageReceipts.run(request(receipt, "bruno"))),
  );
  assert.equal(
    results.reduce((sum, result) => sum + result.updated, 0),
    1,
  );
  const received = (await db.doc("directMessages/message-local").get()).data()!;
  assert.ok(received.deliveredAt && received.readAt);
  assert.deepEqual(await updateDirectMessageReceipts.run(request(receipt, "bruno")), {
    updated: 0,
  });
});

test("enquadramento com proteção de abuso atualiza somente metadados da própria foto", async () => {
  for (const uid of ["alice", "bruno"])
    await db.doc(`profileMedia/${uid}`).set({
      mediaKey: `users/${uid}/avatar/original.png`,
      avatarURL: `https://example.test/${uid}.png`,
      cropScale: 1,
      focusX: 50,
      focusY: 50,
    });
  const change = { cropScale: 0.8, focusX: 30, focusY: 70 };
  assert.deepEqual(await updateAvatarCrop.run(request(change)), { ...change, saved: true });
  const own = (await db.doc("profileMedia/alice").get()).data()!;
  assert.equal(own.mediaKey, "users/alice/avatar/original.png");
  assert.equal(own.avatarURL, "https://example.test/alice.png");
  assert.equal(own.cropScale, 0.8);
  assert.equal(own.focusY, 70);
  assert.equal((await db.doc("profileMedia/bruno").get()).data()?.cropScale, 1);
  await assert.rejects(
    updateAvatarCrop.run(request({ ...change, uid: "bruno" })),
    codeIs("invalid-argument"),
  );
  await assert.rejects(
    updateAvatarCrop.run(request({ ...change, cropScale: 2 })),
    codeIs("invalid-argument"),
  );
  await assert.rejects(updateAvatarCrop.run({ data: change }), codeIs("unauthenticated"));
});

test("exclusão com quota remove somente o UID autenticado no Auth emulado; sessão antiga não acessa o banco", async () => {
  const uid = "security-delete-own-account";
  await getAuth(defaultApp).createUser({ uid, emailVerified: true });
  const stale = request({ uid: "another" }, uid);
  stale.auth.token = { ...stale.auth.token, auth_time: Math.floor(Date.now() / 1000) - 1000 };
  await assert.rejects(deleteOwnAccount.run(stale), codeIs("failed-precondition"));
  assert.equal((await db.collection("callableRateLimits").get()).size, 0);
  const recent = request({ uid: "another" }, uid);
  recent.auth.token = { ...recent.auth.token, auth_time: Math.floor(Date.now() / 1000) };
  assert.deepEqual(await deleteOwnAccount.run(recent), { deleted: true });
  await assert.rejects(getAuth(defaultApp).getUser(uid), codeIs("auth/user-not-found"));
});

test("consulta ordenada continua recebendo mensagens novas após ultrapassar o limite", async () => {
  for (let base = 0; base < 512; base += 256) {
    const batch = db.batch();
    for (let index = base; index < base + 256; index++)
      batch.set(db.doc(`directMessages/m${String(index).padStart(4, "0")}`), {
        senderUserId: "bruno",
        recipientUserId: "alice",
        body: "Sintética",
        createdAt: Timestamp.fromMillis(index + 1),
      });
    await batch.commit();
  }
  const client = environment.authenticatedContext("alice", { email_verified: true }).firestore();
  const messages = await client
    .collection("directMessages")
    .where("recipientUserId", "==", "alice")
    .orderBy("createdAt", "desc")
    .orderBy("__name__", "desc")
    .limit(500)
    .get();
  assert.equal(messages.docs[0].id, "m0511");
  assert.equal(messages.size, 500);
  assert.equal(
    messages.docs.some((message) => message.id === "m0000"),
    false,
  );
});

test("burst local em duas instâncias respeita quota atômica, isola contas e reabre a janela", async () => {
  let now = 1_000_000;
  let executed = 0;
  const first = createAbuseLimiter(
    () => db,
    () => now,
  );
  const second = createAbuseLimiter(
    () => db,
    () => now,
  );
  const guards = [first, second].map((consume) =>
    guardCallable(
      "createPlusSubscription",
      async () => ++executed,
      consume,
      () => false,
    ),
  );
  const results: PromiseSettledResult<unknown>[] = [];
  // No máximo quatro requisições simultâneas e apenas loopback.
  for (let offset = 0; offset < 40; offset += 4)
    results.push(
      ...(await Promise.allSettled(
        Array.from({ length: 4 }, (_, index) => guards[index % 2](request({}))),
      )),
    );
  const rejected = results.filter((result) => result.status === "rejected");
  assert.equal(executed, 5);
  assert.equal(rejected.length, 35);
  for (const result of rejected)
    assert.equal((result as PromiseRejectedResult).reason.code, "resource-exhausted");
  await guards[0](request({}, "bruno"));
  now += 60_000;
  await guards[1](request({}));
  assert.equal(executed, 7);
  mkdirSync("output/testes", { recursive: true });
  writeFileSync(
    "output/testes/abuse-local.json",
    JSON.stringify(
      {
        target: rulesProject,
        host: "127.0.0.1:8085",
        requests: 40,
        concurrency: 4,
        accepted: 5,
        rejected: 35,
        accountIsolation: true,
        resetAfterWindow: true,
        volumetricDdosTest: false,
      },
      null,
      2,
    ),
  );
});

test("mede confirmação transacional e propagação realtime de curtidas e visualizações no emulador", async () => {
  const api = createEngagementCommandHandlers(
    createEngagementService(createFirestoreEngagementRepository(() => db)),
    verifyRegisteredUser,
  );
  const limiter = createAbuseLimiter(() => db);
  const like = guardCallable("setPostLike", api.setLike, limiter, () => false);
  const view = guardCallable("recordPostView", api.recordView, limiter, () => false);
  const durations: Record<string, number[]> = {
    likeCommit: [],
    viewCommit: [],
    realtime: [],
    messageCommit: [],
    messageReceive: [],
    receiptCommit: [],
  };
  const client = environment.authenticatedContext("alice", { email_verified: true }).firestore();
  let observedLikes = -1;
  let observedViews = -1;
  let notify: (() => void) | undefined;
  let receivedIds = new Set<string>();
  const recipient = environment.authenticatedContext("bruno", { email_verified: true }).firestore();
  const stopMessages = recipient
    .collection("directMessages")
    .where("recipientUserId", "==", "bruno")
    .onSnapshot((snapshot) => {
      receivedIds = new Set(snapshot.docs.map((document) => document.id));
      notify?.();
    });
  const stop = client.doc("postEngagement/approved-post").onSnapshot((snapshot) => {
    observedLikes = snapshot.data()?.likes ?? 0;
    observedViews = snapshot.data()?.views ?? 0;
    notify?.();
  });
  async function until(predicate: () => boolean) {
    if (predicate()) return;
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        notify = undefined;
        reject(new Error("Realtime não propagou em 10s"));
      }, 10_000);
      notify = () => {
        if (predicate()) {
          clearTimeout(timeout);
          notify = undefined;
          resolve();
        }
      };
    });
  }
  try {
    await until(() => observedLikes === 0);
    for (let index = 0; index < 12; index++) {
      const liked = index % 2 === 0;
      const started = performance.now();
      await like(request({ playerId: "approved-post", liked }));
      durations.likeCommit.push(performance.now() - started);
      await until(() => observedLikes === Number(liked));
      durations.realtime.push(performance.now() - started);
      const uid = `viewer-${index}`;
      await db.doc(`accounts/${uid}`).set({ uid });
      const viewing = performance.now();
      await view(request({ playerId: "approved-post" }, uid));
      durations.viewCommit.push(performance.now() - viewing);
      await until(() => observedViews === index + 1);
      const messageId = `latency-message-${index}`;
      const sending = performance.now();
      await sendDirectMessage.run(
        request({ messageId, recipientUserId: "bruno", body: "Mensagem sintética local" }),
      );
      durations.messageCommit.push(performance.now() - sending);
      await until(() => receivedIds.has(messageId));
      durations.messageReceive.push(performance.now() - sending);
      const reading = performance.now();
      await updateDirectMessageReceipts.run(
        request({ messageIds: [messageId], status: "read" }, "bruno"),
      );
      durations.receiptCommit.push(performance.now() - reading);
    }
  } finally {
    stop();
    stopMessages();
  }
  const summary = Object.fromEntries(
    Object.entries(durations).map(([key, values]) => {
      const sorted = [...values].sort((a, b) => a - b);
      return [
        key,
        {
          samples: sorted.length,
          p50Ms: sorted[Math.ceil(sorted.length * 0.5) - 1],
          p95Ms: sorted[Math.ceil(sorted.length * 0.95) - 1],
          maxMs: sorted.at(-1),
        },
      ];
    }),
  );
  mkdirSync("output/testes", { recursive: true });
  writeFileSync(
    "output/testes/latency-local.json",
    JSON.stringify(
      {
        at: new Date().toISOString(),
        target: rulesProject,
        includesQuotaAndRegistration: true,
        excludes: ["internet", "coldStart", "captchaProvider"],
        metrics: summary,
      },
      null,
      2,
    ),
  );
  assert.equal((await db.doc("postEngagement/approved-post").get()).data()?.views, 12);
});
