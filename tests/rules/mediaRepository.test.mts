import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { after, before, beforeEach, test } from "node:test";
import { initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { assertRulesTarget, rulesProject } from "../../scripts/rules-target.mjs";
import { normalizeFirebasePostDocument } from "../../src/utils/firebasePostDocument.ts";

assertRulesTarget(process.env);
const require = createRequire(import.meta.url);
const { initializeApp, deleteApp } =
  require("firebase-admin/app") as typeof import("firebase-admin/app");
const { getFirestore } =
  require("firebase-admin/firestore") as typeof import("firebase-admin/firestore");
const { firestorePostMedia } =
  require("../../functions/lib/modules/posts/data/firestorePostMedia.js") as typeof import("../../functions/src/modules/posts/data/firestorePostMedia");
const { createPostMediaService } =
  require("../../functions/lib/modules/posts/application/postMediaService.js") as typeof import("../../functions/src/modules/posts/application/postMediaService");
const { createMediaCommandHandlers } =
  require("../../functions/lib/modules/posts/handlers.js") as typeof import("../../functions/src/modules/posts/handlers");
const app = initializeApp({ projectId: rulesProject });
const database = getFirestore(app);
database.settings({ host: "127.0.0.1:8085", ssl: false });
let environment: RulesTestEnvironment;
const context = { auth: { uid: "alice", token: { email_verified: true } } };
const input = {
  postId: "post-1",
  fileName: "photo.png",
  fileSize: 32,
  mediaType: "image",
  mimeType: "image/png",
};
const finalizeInput = {
  uploadId: "upload-1",
  title: "Minha publicação",
  description: "Descrição sintética",
  durationMs: 0,
  width: 100,
  height: 200,
  tags: ["treino"],
  mentions: [],
};
let events: string[];
let now: number;
let api: ReturnType<typeof createMediaCommandHandlers>;

before(async () => {
  environment = await initializeTestEnvironment({
    projectId: rulesProject,
    firestore: { host: "127.0.0.1", port: 8085 },
  });
});
after(async () => {
  await database.terminate();
  await deleteApp(app);
  await environment?.cleanup();
});
beforeEach(async () => {
  await environment.clearFirestore();
  events = [];
  now = Date.now();
  let nextId = 0;
  const service = createPostMediaService({
    repository: firestorePostMedia,
    clock: { now: () => now },
    ids: { next: () => ["upload-1", "object-1"][nextId++] },
    publicUrl: (key) => `https://media.example.test/${key}`,
    intentTtlSeconds: 1800,
    uploadUrlTtlSeconds: 900,
    maximumIntentsPerMinute: 10,
    reportSigningFailure: () => undefined,
    createStorage: () => ({
      signUpload: async () => "https://upload.example.test/signed",
      headUpload: async () => ({ size: 32, mimeType: "image/png" }),
      copyToPublic: async () => {
        events.push("copy");
      },
      deleteUpload: async () => {
        events.push("delete-pending");
      },
      deletePublic: async () => {
        events.push("delete-public");
      },
    }),
  });
  api = createMediaCommandHandlers(service, async () => undefined);
});

test("adaptador grava intenção/Timestamp e publica post compatível em transação real", async () => {
  const created = await api.create({ ...context, data: input });
  assert.equal(created.uploadId, "upload-1");
  const intent = (await database.doc("mediaUploadIntents/upload-1").get()).data();
  assert.ok(intent);
  assert.equal(intent.expiresAt.toMillis(), now + 1_800_000);
  assert.equal("expiresAtMs" in intent, false);
  assert.equal(intent.ownerUid, "alice");
  assert.equal((await database.doc("mediaRateLimits/alice").get()).data()?.count, 1);
  const result = await api.finalize({ ...context, data: finalizeInput });
  const record = (await database.doc("posts/post-1").get()).data();
  assert.ok(record);
  assert.equal(record.status, "published");
  assert.equal(record.authorId, "alice");
  assert.equal(record.mediaPath, result.mediaKey);
  assert.ok(normalizeFirebasePostDocument("post-1", record));
  const completed = (await database.doc("mediaUploadIntents/upload-1").get()).data();
  assert.equal(completed?.status, "completed");
  assert.ok(completed?.completedAt.toDate() instanceof Date);
  assert.deepEqual(events, ["copy", "delete-pending"]);
  assert.deepEqual(await api.finalize({ ...context, data: { uploadId: "upload-1" } }), result);
});

test("conflito de publicação não sobrescreve post nem conclui intenção", async () => {
  await api.create({ ...context, data: input });
  await database.doc("posts/post-1").set({ authorId: "other", marker: "preserve" });
  await assert.rejects(api.finalize({ ...context, data: finalizeInput }), (error: unknown) =>
    Boolean(
      error && typeof error === "object" && "code" in error && error.code === "already-exists",
    ),
  );
  assert.equal((await database.doc("posts/post-1").get()).data()?.marker, "preserve");
  assert.equal(
    (await database.doc("mediaUploadIntents/upload-1").get()).data()?.status,
    "finalizing",
  );
  assert.deepEqual(events, ["copy"]); // Cópia anterior ao commit continua dívida explícita de I01.
});

test("quota transacional bloqueia tentativa excedente e exclusão de outro UID não toca dados", async () => {
  await api.create({ ...context, data: input });
  await api.finalize({ ...context, data: finalizeInput });
  events = [];
  await assert.rejects(
    api.delete({
      auth: { uid: "bruno", token: { email_verified: true } },
      data: { postId: "post-1" },
    }),
  );
  assert.deepEqual(events, []);
  assert.equal((await database.doc("posts/post-1").get()).exists, true);
  await database.doc("mediaRateLimits/alice").set({ count: 10, windowStartedAtMs: now });
  await assert.rejects(
    api.create({ ...context, data: { ...input, postId: "post-2" } }),
    (error: unknown) =>
      Boolean(
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "resource-exhausted",
      ),
  );
  assert.equal((await database.doc("mediaRateLimits/alice").get()).data()?.count, 10);
});
