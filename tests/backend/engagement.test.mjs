import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const {
  likeTransition,
  viewTransition,
  normalizedCount,
} = require("../../functions/lib/modules/engagement/domain/engagement.js");
const {
  createEngagementService,
} = require("../../functions/lib/modules/engagement/application/engagementService.js");
const {
  createFirestoreEngagementRepository,
} = require("../../functions/lib/modules/engagement/data/firestoreEngagement.js");
const {
  createEngagementCommandHandlers,
} = require("../../functions/lib/modules/engagement/handlers.js");
const {
  parseLikeCommand,
  parseViewCommand,
} = require("../../functions/lib/modules/engagement/commands.js");
const { OperationError } = require("../../functions/lib/domain/OperationError.js");
const key = { playerId: "approved-post-1", postId: "post-1" };
const snapshot = (edgeExists = false) => ({
  published: true,
  edgeExists,
  counts: { likes: 2, shares: 3, views: 4 },
});
const request = (data, uid = "CaseUID") => ({
  auth: { uid, token: { email_verified: true } },
  data,
});
const codeIs = (code) => (error) => error?.code === code;

test("transições conservam noop, incremento único, remoção e demais contadores", () => {
  assert.deepEqual(likeTransition(snapshot(true), true), { result: { liked: true } });
  assert.deepEqual(likeTransition(snapshot(), false), { result: { liked: false } });
  assert.deepEqual(likeTransition(snapshot(), true), {
    result: { liked: true },
    mutation: { edge: "create", counts: { likes: 3, shares: 3, views: 4 } },
  });
  assert.deepEqual(likeTransition(snapshot(true), false), {
    result: { liked: false },
    mutation: { edge: "delete", counts: { likes: 1, shares: 3, views: 4 } },
  });
  assert.equal(
    likeTransition({ ...snapshot(true), counts: { likes: 0, shares: 0, views: 0 } }, false).mutation
      .counts.likes,
    0,
  );
  assert.deepEqual(viewTransition(snapshot(true)), { result: { recorded: false } });
  assert.deepEqual(viewTransition(snapshot()), {
    result: { recorded: true },
    mutation: { edge: "create", counts: { likes: 2, shares: 3, views: 5 } },
  });
  for (const value of [undefined, -1, NaN, Infinity, 1.5, "3"])
    assert.equal(normalizedCount(value), 0);
  assert.equal(normalizedCount(3), 3);
  for (const run of [(state) => likeTransition(state, true), viewTransition])
    assert.throws(() => run({ ...snapshot(), published: false }), codeIs("not-found"));
});

test("contratos v1 preservam IDs, trim e booleanos; payload extra e caminho inválido são negados", () => {
  assert.deepEqual(parseLikeCommand({ playerId: " approved-post-1 ", liked: true }), {
    ...key,
    liked: true,
  });
  assert.deepEqual(parseViewCommand({ playerId: "Post_1" }), {
    playerId: "Post_1",
    postId: "Post_1",
  });
  for (const value of [
    null,
    {},
    { playerId: "path/post" },
    { playerId: "approved-" },
    { playerId: "a", uid: "outro" },
  ])
    assert.throws(() => parseViewCommand(value), codeIs("invalid-argument"));
  for (const value of ["true", 1, null, undefined])
    assert.throws(
      () => parseLikeCommand({ playerId: "a", liked: value }),
      codeIs("invalid-argument"),
    );
  assert.throws(
    () => parseLikeCommand({ playerId: "a", liked: true, likes: 100 }),
    codeIs("invalid-argument"),
  );
});

test("handlers usam UID do token e exigem registro antes de alcançar a transação", async () => {
  const calls = [];
  const service = createEngagementService({
    transact: async (command, decide) => {
      calls.push(command);
      return decide(snapshot()).result;
    },
  });
  const registrations = [];
  const api = createEngagementCommandHandlers(service, async (uid) => {
    registrations.push(uid);
  });
  assert.deepEqual(await api.setLike(request({ playerId: key.playerId, liked: true })), {
    liked: true,
  });
  assert.deepEqual(await api.recordView(request({ playerId: key.playerId })), { recorded: true });
  assert.deepEqual(registrations, ["CaseUID", "CaseUID"]);
  assert.equal(calls[0].uid, "CaseUID");
  assert.equal(calls[0].postId, "post-1");
  assert.equal(calls[1].kind, "view");
  await assert.rejects(
    api.setLike({ data: { playerId: "x", liked: true } }),
    codeIs("unauthenticated"),
  );
  await assert.rejects(
    api.recordView({
      auth: { uid: "u", token: { email_verified: false } },
      data: { playerId: "x" },
    }),
    codeIs("permission-denied"),
  );
  await assert.rejects(
    api.recordView(request({ playerId: "x", uid: "another" })),
    codeIs("invalid-argument"),
  );
  const denied = createEngagementCommandHandlers(service, async () => {
    throw new OperationError("permission-denied", "Cadastro necessário.");
  });
  await assert.rejects(denied.recordView(request({ playerId: "x" })), codeIs("permission-denied"));
  assert.equal(calls.length, 2);
});

test("resultado de tentativa descartada não vaza para resposta da tentativa confirmada", async () => {
  const writes = [];
  let attempt = 0;
  const db = {
    doc: (path) => ({ path }),
    async runTransaction(run) {
      async function tryOnce(viewExists) {
        const pending = [];
        const transaction = {
          get: async (ref) => {
            if (ref.path.startsWith("posts/"))
              return { exists: true, data: () => ({ status: "published" }) };
            if (ref.path.startsWith("userPostViews/"))
              return { exists: viewExists, data: () => ({}) };
            return { exists: true, data: () => ({ likes: 2, shares: 3, views: 4 }) };
          },
          set: (...args) => {
            pending.push(args);
          },
          delete: (...args) => {
            pending.push(args);
          },
        };
        const result = await run(transaction);
        attempt += 1;
        return { result, pending };
      }
      const discarded = await tryOnce(false);
      assert.deepEqual(discarded.result, { recorded: true });
      assert.equal(discarded.pending.length, 2);
      const committed = await tryOnce(true);
      writes.push(...committed.pending);
      return committed.result;
    },
  };
  const service = createEngagementService(createFirestoreEngagementRepository(() => db));
  assert.deepEqual(await service.recordView("alice", key), { recorded: false });
  assert.equal(attempt, 2);
  assert.equal(writes.length, 0);
});
