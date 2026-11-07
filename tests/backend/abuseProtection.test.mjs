import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
const require = createRequire(import.meta.url);
const {
  nextQuota,
  guardCallable,
  callableBudgets,
  createAbuseLimiter,
} = require("../../functions/lib/platform/abuseProtection.js");
const request = (data = {}) => ({ auth: { uid: "alice", token: { email_verified: true } }, data });
const codeIs = (code) => (error) => error?.code === code;

test("janela de abuso não aceita excesso e reabre exatamente ao expirar", () => {
  assert.deepEqual(nextQuota({}, 100, 2), { count: 1, windowStartedAtMs: 100 });
  assert.deepEqual(nextQuota({ count: 1, windowStartedAtMs: 100 }, 200, 2), {
    count: 2,
    windowStartedAtMs: 100,
  });
  assert.throws(
    () => nextQuota({ count: 2, windowStartedAtMs: 100 }, 60099, 2),
    codeIs("resource-exhausted"),
  );
  assert.deepEqual(nextQuota({ count: 2, windowStartedAtMs: 100 }, 60100, 2), {
    count: 1,
    windowStartedAtMs: 60100,
  });
});

test("abuso já recusado não gera novas leituras na mesma instância até expirar", async () => {
  let now = 1000;
  let reads = 0;
  const consume = createAbuseLimiter(
    () => ({
      doc: (path) => ({ path }),
      runTransaction: async (run) =>
        run({
          get: async () => {
            reads++;
            return { data: () => ({ count: 5, windowStartedAtMs: 1000 }) };
          },
          set: () => undefined,
        }),
    }),
    () => now,
  );
  await assert.rejects(consume("createPlusSubscription", "alice"), codeIs("resource-exhausted"));
  await assert.rejects(consume("createPlusSubscription", "alice"), codeIs("resource-exhausted"));
  assert.equal(reads, 1);
  now += 60000;
  await consume("createPlusSubscription", "alice");
  assert.equal(reads, 2);
});
test("requisição sem identidade/CAPTCHA, token consumido e payload enorme não chegam ao banco", async () => {
  let reads = 0;
  let executions = 0;
  const guard = guardCallable(
    "setPostLike",
    async () => ++executions,
    async () => {
      reads++;
    },
    () => true,
  );
  await assert.rejects(guard({ data: {} }), codeIs("unauthenticated"));
  await assert.rejects(guard(request()), codeIs("unauthenticated"));
  await assert.rejects(
    guard({ ...request(), app: { appId: "app", alreadyConsumed: true } }),
    codeIs("failed-precondition"),
  );
  await assert.rejects(
    guard({ ...request({ value: "x".repeat(33000) }), app: { appId: "app" } }),
    codeIs("invalid-argument"),
  );
  assert.equal(reads, 0);
  assert.equal(executions, 0);
  assert.equal(await guard({ ...request(), app: { appId: "app" } }), 1);
  assert.equal(reads, 1);
});
test("todos os 21 comandos têm orçamento e erro de quota impede o efeito", async () => {
  assert.equal(Object.keys(callableBudgets).length, 21);
  const denied = guardCallable(
    "sendDirectMessage",
    () => assert.fail("não executar"),
    async () => {
      const error = new Error("limite");
      error.code = "resource-exhausted";
      throw error;
    },
    () => false,
  );
  await assert.rejects(denied(request()), codeIs("resource-exhausted"));
});
