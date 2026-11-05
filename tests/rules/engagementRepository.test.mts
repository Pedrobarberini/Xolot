import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { after, before, beforeEach, test } from "node:test";
import { initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { assertRulesTarget, rulesProject } from "../../scripts/rules-target.mjs";

assertRulesTarget(process.env);
const require = createRequire(import.meta.url);
const { initializeApp, deleteApp } =
  require("firebase-admin/app") as typeof import("firebase-admin/app");
const { getFirestore } =
  require("firebase-admin/firestore") as typeof import("firebase-admin/firestore");
const { createFirestoreEngagementRepository } =
  require("../../functions/lib/modules/engagement/data/firestoreEngagement.js") as typeof import("../../functions/src/modules/engagement/data/firestoreEngagement");
const { createEngagementService } =
  require("../../functions/lib/modules/engagement/application/engagementService.js") as typeof import("../../functions/src/modules/engagement/application/engagementService");
const { createEngagementCommandHandlers } =
  require("../../functions/lib/modules/engagement/handlers.js") as typeof import("../../functions/src/modules/engagement/handlers");
const { verifyRegisteredUser } =
  require("../../functions/lib/auth.js") as typeof import("../../functions/src/auth");
const app = initializeApp({ projectId: rulesProject });
const db = getFirestore(app);
db.settings({ host: "127.0.0.1:8085", ssl: false });
const api = createEngagementCommandHandlers(
  createEngagementService(createFirestoreEngagementRepository(() => db)),
  verifyRegisteredUser,
);
const request = (data: unknown, uid = "alice") => ({
  auth: { uid, token: { email_verified: true } },
  data,
});
let environment: RulesTestEnvironment;
before(async () => {
  environment = await initializeTestEnvironment({
    projectId: rulesProject,
    firestore: { host: "127.0.0.1", port: 8085 },
  });
});
after(async () => {
  await db.terminate();
  await deleteApp(app);
  await environment?.cleanup();
});
beforeEach(async () => {
  await environment.clearFirestore();
  await db.doc("posts/post-1").set({ status: "published", authorId: "owner" });
  for (const uid of ["alice", "bruno"]) await db.doc(`accounts/${uid}`).set({ uid });
  await db.doc("postEngagement/approved-post-1").set({ likes: 0, shares: 7, views: 0 });
});

test("visualizações concorrentes da mesma conta contam uma vez e somente um retorno é true", async () => {
  const results = await Promise.all(
    Array.from({ length: 5 }, () => api.recordView(request({ playerId: "approved-post-1" }))),
  );
  assert.equal(results.filter((result) => result.recorded).length, 1);
  assert.deepEqual(await api.recordView(request({ playerId: "approved-post-1" })), {
    recorded: false,
  });
  const counts = (await db.doc("postEngagement/approved-post-1").get()).data();
  assert.equal(counts?.views, 1);
  assert.equal(counts?.likes, 0);
  assert.equal(counts?.shares, 7);
  assert.equal((await db.collection("userPostViews/alice/posts").get()).size, 1);
});

test("curtir/descurtir repetidos e duas contas preservam contagem e isolamento dos marcadores", async () => {
  await Promise.all(
    Array.from({ length: 4 }, () =>
      api.setLike(request({ playerId: "approved-post-1", liked: true })),
    ),
  );
  assert.equal((await db.doc("postEngagement/approved-post-1").get()).data()?.likes, 1);
  await Promise.all(
    Array.from({ length: 4 }, () =>
      api.setLike(request({ playerId: "approved-post-1", liked: false })),
    ),
  );
  assert.equal((await db.doc("postEngagement/approved-post-1").get()).data()?.likes, 0);
  assert.equal((await db.doc("userPostLikes/alice/posts/approved-post-1").get()).exists, false);
  await Promise.all(
    ["alice", "bruno"].map((uid) =>
      api.setLike(request({ playerId: "approved-post-1", liked: true }, uid)),
    ),
  );
  await Promise.all(
    ["alice", "bruno"].map((uid) => api.recordView(request({ playerId: "approved-post-1" }, uid))),
  );
  const counts = (await db.doc("postEngagement/approved-post-1").get()).data();
  assert.deepEqual(
    { likes: counts?.likes, views: counts?.views, shares: counts?.shares },
    { likes: 2, views: 2, shares: 7 },
  );
  for (const uid of ["alice", "bruno"])
    assert.equal(
      (await db.doc(`userPostLikes/${uid}/posts/approved-post-1`).get()).data()?.userId,
      uid,
    );
});

test("post ausente ou não publicado e identidade sem cadastro não gravam interação", async () => {
  for (const status of [null, "draft"]) {
    if (status === null) await db.doc("posts/post-1").delete();
    else await db.doc("posts/post-1").set({ status });
    await assert.rejects(
      api.recordView(request({ playerId: "approved-post-1" })),
      (error: unknown) =>
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "not-found",
    );
    await assert.rejects(
      api.setLike(request({ playerId: "approved-post-1", liked: true })),
      (error: unknown) =>
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "not-found",
    );
  }
  await assert.rejects(
    api.recordView(request({ playerId: "approved-post-1" }, "unregistered")),
    (error: unknown) =>
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "permission-denied",
  );
  assert.equal((await db.collection("userPostViews/alice/posts").get()).size, 0);
  assert.equal((await db.collection("userPostLikes/alice/posts").get()).size, 0);
  assert.equal((await db.doc("postEngagement/approved-post-1").get()).data()?.views, 0);
});
