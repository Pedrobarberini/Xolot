import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
const require = createRequire(import.meta.url);
const { acceptOperationMetrics } = require("../../functions/lib/observability/handlers.js");
const {
  guardCallable,
  callableBudgets,
} = require("../../functions/lib/platform/abuseProtection.js");
const data = {
  schemaVersion: 1,
  source: "client",
  platform: "web",
  sampleRate: 0.2,
  releaseId: "dcf3622",
  dropped: 0,
  samples: [{ operation: "post.like.confirm", outcome: "success", code: "ok", value: 123 }],
};
test("ingestão exige identidade verificada e a quota antes de gerar um log", async () => {
  let quota = 0;
  const events = [];
  const run = guardCallable(
    "ingestOperationMetrics",
    (request) => acceptOperationMetrics(request.data, (event) => events.push(event)),
    async () => {
      quota++;
    },
    () => false,
  );
  await assert.rejects(run({ data }), (error) => error.code === "unauthenticated");
  await assert.rejects(
    run({ auth: { uid: "alice", token: { email_verified: false } }, data }),
    (error) => error.code === "permission-denied",
  );
  assert.equal(events.length, 0);
  assert.equal(quota, 0);
  assert.deepEqual(await run({ auth: { uid: "alice", token: { email_verified: true } }, data }), {
    accepted: 1,
  });
  assert.equal(quota, 1);
  assert.equal(events.length, 1);
  assert.ok(!JSON.stringify(events).includes("alice"));
  assert.equal(callableBudgets.ingestOperationMetrics, 6);
});
test("lote inválido não gera log e lote aceito é um único evento estruturado sem autenticação/payload arbitrário", () => {
  const events = [];
  assert.throws(
    () => acceptOperationMetrics({ ...data, token: "private" }, (event) => events.push(event)),
    (error) => error.code === "invalid-argument",
  );
  assert.equal(events.length, 0);
  acceptOperationMetrics(data, (event) => events.push(event));
  assert.deepEqual(events, [{ event: "folko.operation_metrics", ...data }]);
});
