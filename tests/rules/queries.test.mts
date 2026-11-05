import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, before, beforeEach, test } from "node:test";
import {
  initializeTestEnvironment,
  assertFails,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { initializeApp, deleteApp, type FirebaseApp } from "firebase/app";
import {
  connectFirestoreEmulator,
  disableNetwork,
  enableNetwork,
  getFirestore,
  Timestamp,
} from "firebase/firestore";
import { readFirestorePage } from "../../src/shared/data/firestorePage.ts";
import { assertRulesTarget, rulesProject } from "../../scripts/rules-target.mjs";

assertRulesTarget(process.env);
let environment: RulesTestEnvironment;
const instant = new Timestamp(1735689600, 123456789);
const clients: FirebaseApp[] = [];
const actor = (uid?: string) => {
  const app = initializeApp({ projectId: rulesProject }, `demo-query-${clients.length}`);
  clients.push(app);
  const db = getFirestore(app);
  // A instância modular precisa de conexão explícita, independente do SDK compat.
  connectFirestoreEmulator(
    db,
    "127.0.0.1",
    8085,
    uid ? { mockUserToken: { sub: uid, email_verified: true } } : undefined,
  );
  return db;
};

before(async () => {
  environment = await initializeTestEnvironment({
    projectId: rulesProject,
    firestore: { host: "127.0.0.1", port: 8085, rules: readFileSync("firestore.rules", "utf8") },
  });
});
after(async () => {
  await Promise.all(clients.map((app) => deleteApp(app)));
  await environment?.cleanup();
});
beforeEach(async () => {
  await environment.clearFirestore();
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    for (const uid of ["alice", "alex", "bruno", "carla"]) {
      await db.doc(`accounts/${uid}`).set({ uid });
      await db.doc(`profiles/${uid}`).set({ uid, username: uid, profileCompleted: true });
    }
    for (const id of ["a", "b", "c", "d", "e"])
      await db
        .doc(`posts/${id}`)
        .set({ authorId: "alice", status: "published", createdAt: instant });
    await db.doc("posts/hidden").set({ authorId: "alice", status: "draft", createdAt: instant });
    await db.doc("posts/legacy").set({ authorId: "alice", status: "published" });
    await db
      .doc("follows/edge")
      .set({ followerUid: "alice", targetUid: "bruno", createdAt: instant });
    await db.doc("postComments/c1").set({ postId: "a", createdAt: instant });
    await db.doc("postComments/c2").set({ postId: "b", createdAt: instant });
    for (const uid of ["alice", "bruno"])
      await db.doc(`notifications/${uid}`).set({ recipientUserId: uid, createdAt: instant });
    await db
      .doc("directMessages/m1")
      .set({ senderUserId: "alice", recipientUserId: "bruno", createdAt: instant });
    await db
      .doc("directMessages/m2")
      .set({ senderUserId: "bruno", recipientUserId: "alice", createdAt: instant });
    for (const key of ["alpha", "beta"]) await db.doc(`tagCatalog/${key}`).set({ key, label: key });
  });
});

test("datas iguais e exclusão do documento do cursor não perdem nem duplicam páginas", async () => {
  const db = actor("alice");
  const first = await readFirestorePage(db, "feed", { pageSize: 2 });
  assert.deepEqual(
    first.items.map((doc) => doc.id),
    ["e", "d"],
  );
  assert.equal(first.hasMore, true);
  assert.deepEqual(first.nextCursor?.value, {
    kind: "timestamp",
    seconds: instant.seconds,
    nanoseconds: Math.floor(instant.nanoseconds / 1000) * 1000,
  });
  await environment.withSecurityRulesDisabled(async (context) => {
    await context.firestore().doc("posts/d").delete();
    await context
      .firestore()
      .doc("posts/new")
      .set({
        authorId: "alice",
        status: "published",
        createdAt: new Timestamp(instant.seconds + 1, 0),
      });
  });
  const second = await readFirestorePage(db, "feed", {
    pageSize: 2,
    cursor: JSON.parse(JSON.stringify(first.nextCursor)),
  });
  assert.deepEqual(
    second.items.map((doc) => doc.id),
    ["c", "b"],
  );
  const last = await readFirestorePage(db, "feed", { pageSize: 2, cursor: second.nextCursor });
  assert.deepEqual(
    last.items.map((doc) => doc.id),
    ["a"],
  );
  assert.equal(last.hasMore, false);
  assert.equal(last.nextCursor, null);
  // hidden não entra; documento sem createdAt é excluído por orderBy e requer inventário/backfill.
});

test("microssegundos diferentes no mesmo milissegundo continuam na ordem exata", async () => {
  await environment.withSecurityRulesDisabled(async (context) => {
    await context
      .firestore()
      .doc("posts/nano-a")
      .set({ authorId: "bruno", status: "published", createdAt: new Timestamp(1000, 2000) });
    await context
      .firestore()
      .doc("posts/nano-z")
      .set({ authorId: "bruno", status: "published", createdAt: new Timestamp(1000, 1000) });
  });
  const db = actor("alice");
  const first = await readFirestorePage(db, "authorPosts", { scope: "bruno", pageSize: 1 });
  const second = await readFirestorePage(db, "authorPosts", {
    scope: "bruno",
    pageSize: 1,
    cursor: first.nextCursor,
  });
  assert.deepEqual(
    [...first.items, ...second.items].map((doc) => doc.id),
    ["nano-a", "nano-z"],
  );
  await assert.rejects(
    readFirestorePage(db, "authorPosts", { scope: "alice", cursor: first.nextCursor }),
  );
  await assert.rejects(readFirestorePage(db, "feed", { cursor: first.nextCursor }));
  await assert.rejects(readFirestorePage(db, "feed", { pageSize: 0 }));
  await assert.rejects(readFirestorePage(db, "feed", { pageSize: 51 }));
});

test("consultas sociais são limitadas por contexto; consultas privadas exigem o próprio UID", async () => {
  const db = actor("alice");
  const ids = async (name: Parameters<typeof readFirestorePage>[1], scope?: string) =>
    (await readFirestorePage(db, name, { scope })).items.map((item) => item.id);
  assert.deepEqual(await ids("following", "alice"), ["edge"]);
  assert.deepEqual(await ids("followers", "bruno"), ["edge"]);
  assert.deepEqual(await ids("comments", "a"), ["c1"]);
  assert.deepEqual(await ids("notifications", "alice"), ["alice"]);
  assert.deepEqual(await ids("messagesSent", "alice"), ["m1"]);
  assert.deepEqual(await ids("messagesReceived", "alice"), ["m2"]);
  for (const name of ["notifications", "messagesSent", "messagesReceived"] as const)
    await assertFails(readFirestorePage(db, name, { scope: "bruno" }));
  await assertFails(readFirestorePage(actor(), "feed"));
});

test("prefixos de username e catálogo de tags usam cursor de string sem catálogo global", async () => {
  const db = actor("alice");
  const first = await readFirestorePage(db, "profilesPrefix", { scope: "@AL", pageSize: 1 });
  assert.deepEqual(
    first.items.map((item) => item.id),
    ["alex"],
  );
  const second = await readFirestorePage(db, "profilesPrefix", {
    scope: "al",
    pageSize: 1,
    cursor: first.nextCursor,
  });
  assert.deepEqual(
    second.items.map((item) => item.id),
    ["alice"],
  );
  assert.equal(second.hasMore, false);
  const tags = await readFirestorePage(db, "tags", { pageSize: 1 });
  assert.deepEqual(
    tags.items.map((item) => item.id),
    ["alpha"],
  );
  assert.deepEqual(
    (await readFirestorePage(db, "tags", { pageSize: 1, cursor: tags.nextCursor })).items.map(
      (item) => item.id,
    ),
    ["beta"],
  );
});

test("offline não transforma cache parcial em fim da lista", async () => {
  const db = actor("alice");
  await readFirestorePage(db, "feed", { pageSize: 2 });
  await disableNetwork(db);
  try {
    await assert.rejects(readFirestorePage(db, "feed", { pageSize: 2 }));
  } finally {
    await enableNetwork(db);
  }
});
