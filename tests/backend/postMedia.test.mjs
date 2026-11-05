import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
const require = createRequire(import.meta.url);
const {
  createPostMediaService,
} = require("../../functions/lib/modules/posts/application/postMediaService.js");
const {
  advanceUploadQuota,
} = require("../../functions/lib/modules/posts/application/uploadQuota.js");
const { createMediaCommandHandlers } = require("../../functions/lib/modules/posts/handlers.js");
const { OperationError } = require("../../functions/lib/domain/OperationError.js");
const request = (data, uid = "alice") => ({ auth: { uid, token: { email_verified: true } }, data });
const createInput = {
  postId: "post-1",
  fileName: "photo.png",
  fileSize: 32,
  mediaType: "image",
  mimeType: "image/png",
};
const finalInput = {
  uploadId: "upload-1",
  title: "Foto de teste",
  description: "Descrição de teste",
  durationMs: 0,
  width: 100,
  height: 200,
  tags: ["futebol"],
  mentions: [],
};

function fixture() {
  const state = {
    now: 1_000_000,
    intent: null,
    post: null,
    quota: undefined,
    events: [],
    ids: ["upload-1", "object-1"],
    head: { size: 32, mimeType: "image/png" },
    signError: null,
    copyError: null,
    publishError: null,
    deleteError: null,
  };
  const repository = {
    async getPost() {
      return state.post;
    },
    async createIntent(id, intent) {
      state.events.push("intent");
      state.intent = structuredClone(intent);
      state.uploadId = id;
    },
    async getIntent() {
      return state.intent;
    },
    async markFinalizing() {
      state.events.push("finalizing");
      state.intent.status = "finalizing";
    },
    async publish(uploadId, postId, record) {
      state.events.push("publish");
      if (state.publishError) throw state.publishError;
      if (state.post)
        throw new OperationError("already-exists", "Esta publicação já foi finalizada.");
      state.post = record;
      state.intent.status = "completed";
    },
    async deletePost() {
      state.events.push("delete-doc");
      if (state.deleteError) throw state.deleteError;
      state.post = null;
    },
    async consumeCreateQuota(uid, now, maximum) {
      state.events.push("quota");
      state.quota = advanceUploadQuota(state.quota, now, maximum);
    },
  };
  const storage = {
    async signUpload() {
      state.events.push("sign");
      if (state.signError) throw state.signError;
      return "https://upload.example.test/signed";
    },
    async headUpload() {
      state.events.push("head");
      if (!state.head) throw new Error("missing");
      return state.head;
    },
    async copyToPublic() {
      state.events.push("copy");
      if (state.copyError) throw state.copyError;
    },
    async deleteUpload() {
      state.events.push("delete-pending");
    },
    async deletePublic() {
      state.events.push("delete-object");
    },
  };
  const service = createPostMediaService({
    repository,
    createStorage: () => storage,
    publicUrl: (key) => `https://media.example.test/${key}`,
    clock: { now: () => state.now },
    ids: { next: () => state.ids.shift() },
    reportSigningFailure: () => state.events.push("log-signing"),
    intentTtlSeconds: 1800,
    uploadUrlTtlSeconds: 900,
    maximumIntentsPerMinute: 10,
  });
  const api = createMediaCommandHandlers(service, async () => {
    state.events.push("registered");
  });
  return { state, api };
}

test("criação v1 conserva campos, chaves, quota e identidade do token", async () => {
  const { state, api } = fixture();
  assert.deepEqual(await api.create(request(createInput)), {
    contentType: "image/png",
    expiresAt: new Date(state.now + 1_800_000).toISOString(),
    uploadId: "upload-1",
    uploadUrl: "https://upload.example.test/signed",
  });
  assert.equal(state.intent.ownerUid, "alice");
  assert.equal(state.intent.uploadKey, "pending/alice/post-1/object-1.png");
  assert.equal(state.intent.mediaKey, "users/alice/posts/post-1/object-1.png");
  assert.deepEqual(state.events, ["registered", "quota", "intent", "sign"]);
  assert.equal(state.quota.count, 1);
});

test("payload inválido é recusado antes da intenção e conserva quota de tentativa", async () => {
  const { state, api } = fixture();
  await assert.rejects(
    api.create(request({ ...createInput, ownerUid: "another" })),
    (error) => error.code === "invalid-argument",
  );
  assert.equal(state.intent, null);
  assert.deepEqual(state.events, ["registered", "quota"]);
});

test("falha de assinatura conserva intenção pendente e código seguro existente", async () => {
  const { state, api } = fixture();
  state.signError = new Error("segredo que não pode virar resposta");
  await assert.rejects(
    api.create(request(createInput)),
    (error) => error.code === "failed-precondition" && !error.message.includes("segredo"),
  );
  assert.equal(state.intent.status, "pending");
  assert.ok(state.events.includes("log-signing"));
});

test("finalização direta mantém resposta, publicação e ordem dos efeitos v1", async () => {
  const { state, api } = fixture();
  await api.create(request(createInput));
  state.events = [];
  const finalized = await api.finalize(request(finalInput));
  assert.deepEqual(finalized, {
    mediaKey: "users/alice/posts/post-1/object-1.png",
    mediaURL: "https://media.example.test/users/alice/posts/post-1/object-1.png",
    postId: "post-1",
  });
  assert.deepEqual(state.events, [
    "registered",
    "head",
    "finalizing",
    "copy",
    "publish",
    "delete-pending",
  ]);
  assert.equal(state.post.status, "published");
  assert.equal(state.post.authorId, "alice");
  assert.equal(state.post.storageProvider, "r2");
  assert.deepEqual(state.post.tags, ["futebol"]);
  state.events = [];
  assert.deepEqual(await api.finalize(request({ uploadId: "upload-1" })), finalized);
  assert.deepEqual(state.events, ["registered"]);
});

test("dono/expiração são conferidos antes do storage, inclusive no concluído", async () => {
  const { state, api } = fixture();
  await api.create(request(createInput));
  state.events = [];
  await assert.rejects(
    api.finalize(request(finalInput, "bruno")),
    (error) => error.code === "permission-denied",
  );
  assert.deepEqual(state.events, ["registered"]);
  state.intent.status = "completed";
  state.now = state.intent.expiresAtMs + 1;
  await assert.rejects(
    api.finalize(request({ uploadId: "upload-1" })),
    (error) => error.code === "deadline-exceeded",
  );
});

test("arquivo incompatível limpa pending sem publicar; ausente conserva not-found", async () => {
  const { state, api } = fixture();
  await api.create(request(createInput));
  state.events = [];
  state.head = { size: 33, mimeType: "image/png" };
  await assert.rejects(
    api.finalize(request(finalInput)),
    (error) => error.code === "invalid-argument",
  );
  assert.deepEqual(state.events, ["registered", "head", "delete-pending"]);
  assert.equal(state.post, null);
  state.head = null;
  await assert.rejects(api.finalize(request(finalInput)), (error) => error.code === "not-found");
});

test("falha de cópia conserva finalizing; corrida após cópia é dívida de I01", async () => {
  const { state, api } = fixture();
  await api.create(request(createInput));
  state.events = [];
  state.copyError = new Error("copy failed");
  await assert.rejects(api.finalize(request(finalInput)), /copy failed/);
  assert.equal(state.intent.status, "finalizing");
  assert.equal(state.events.includes("publish"), false);
  state.copyError = null;
  state.events = [];
  state.publishError = new OperationError("already-exists", "Esta publicação já foi finalizada.");
  await assert.rejects(
    api.finalize(request(finalInput)),
    (error) => error.code === "already-exists",
  );
  assert.ok(state.events.includes("copy"));
  assert.equal(state.events.includes("delete-pending"), false);
});

test("exclusão confere dono, conserva ausência idempotente e remove objeto antes do documento", async () => {
  const { state, api } = fixture();
  assert.deepEqual(await api.delete(request({ postId: "post-1" })), { deleted: false });
  await api.create(request(createInput));
  await api.finalize(request(finalInput));
  state.events = [];
  await assert.rejects(
    api.delete(request({ postId: "post-1" }, "bruno")),
    (error) => error.code === "permission-denied",
  );
  assert.deepEqual(state.events, []);
  state.deleteError = new Error("database unavailable");
  await assert.rejects(api.delete(request({ postId: "post-1" })), /database unavailable/);
  assert.deepEqual(state.events, ["delete-object", "delete-doc"]);
  assert.ok(state.post); // I04: bytes podem sumir antes de uma falha na remoção do documento.
  state.deleteError = null;
  state.events = [];
  assert.deepEqual(await api.delete(request({ postId: "post-1" })), { deleted: true });
});

test("quota aceita décima tentativa, recusa décima primeira e reinicia na janela seguinte", () => {
  let state;
  for (let index = 0; index < 10; index++) state = advanceUploadQuota(state, 1_000_000, 10);
  assert.equal(state.count, 10);
  assert.throws(
    () => advanceUploadQuota(state, 1_000_001, 10),
    (error) => error.code === "resource-exhausted",
  );
  assert.deepEqual(advanceUploadQuota(state, 1_060_000, 10), {
    count: 1,
    windowStartedAtMs: 1_060_000,
  });
});

test("vídeo preserva extensão e duração máxima; imagem não aceita duração positiva", async () => {
  const video = fixture();
  await video.api.create(
    request({
      ...createInput,
      fileName: "clip.mp4",
      fileSize: 100,
      mediaType: "video",
      mimeType: "video/mp4",
    }),
  );
  video.state.head = { size: 100, mimeType: "video/mp4" };
  video.state.events = [];
  await assert.rejects(
    video.api.finalize(request({ ...finalInput, durationMs: 120001 })),
    (error) => error.code === "invalid-argument",
  );
  assert.equal(video.state.events.includes("head"), false);
  await video.api.finalize(request({ ...finalInput, durationMs: 120000 }));
  assert.equal(video.state.post.durationMs, 120000);
  assert.match(video.state.post.mediaKey, /\.mp4$/);
  const photo = fixture();
  await photo.api.create(request(createInput));
  await assert.rejects(
    photo.api.finalize(request({ ...finalInput, durationMs: 1 })),
    (error) => error.code === "invalid-argument",
  );
});
