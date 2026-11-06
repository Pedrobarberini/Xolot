import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  createOperationMetrics,
  metricErrorCode,
  metricOperations,
  metricReleaseId,
} from "../src/shared/observability/operationMetrics.ts";
import {
  parseMetricBatch,
  metricOperations as serverOperations,
} from "../functions/src/observability/metricProtocol.ts";

function setup(send?: (batch: unknown, owner: string) => Promise<unknown>) {
  let now = 0;
  const batches: unknown[] = [];
  const owners: string[] = [];
  const metrics = createOperationMetrics({
    platform: "web",
    releaseId: "dcf3622",
    clock: () => now,
    random: () => 0,
    send:
      send ??
      (async (batch, owner) => {
        batches.push(batch);
        owners.push(owner);
      }),
  });
  return {
    metrics,
    batches,
    owners,
    advance: (ms: number) => {
      now += ms;
    },
  };
}
const sample = { operation: "post.like.confirm", outcome: "success", code: "ok", value: 100 };
const batch = {
  schemaVersion: 1,
  source: "client",
  platform: "web",
  sampleRate: 0.2,
  releaseId: "dcf3622",
  dropped: 0,
  samples: [sample],
};

test("coleta desativada não mantém nem envia dados; contrato do cliente coincide com backend", async () => {
  const { metrics, batches } = setup();
  metrics.begin("post.like.confirm")();
  await metrics.flush();
  assert.equal(metrics.pendingCount(), 0);
  assert.equal(batches.length, 0);
  assert.deepEqual(metricOperations, serverOperations);
  const contract = JSON.parse(
    readFileSync(new URL("../contracts/operational-metrics-v1.json", import.meta.url), "utf8"),
  );
  assert.deepEqual(contract.operations, metricOperations);
});

test("mede confirmação preservando resultado/erro e envia apenas campos permitidos", async () => {
  const input = setup();
  input.metrics.configure("private-owner", true);
  const result = await input.metrics.measure("post.like.confirm", async () => {
    input.advance(143);
    return "result";
  });
  assert.equal(result, "result");
  const error = {
    code: "functions/unavailable",
    message: "token=private https://private.test",
    uid: "private-person",
  };
  await assert.rejects(
    input.metrics.measure("message.send.confirm", async () => {
      input.advance(52);
      throw error;
    }),
    (actual) => actual === error,
  );
  await input.metrics.flush();
  const parsed = parseMetricBatch(input.batches[0]);
  assert.ok(parsed);
  assert.deepEqual(
    parsed.samples.map((item) => [item.value, item.outcome, item.code]),
    [
      [143, "success", "ok"],
      [52, "failure", "unavailable"],
    ],
  );
  for (const forbidden of [
    "private-owner",
    "private-person",
    "token=",
    "https:",
    "messageId",
    "playerId",
  ])
    assert.ok(!JSON.stringify(parsed).includes(forbidden));
  assert.equal(input.owners[0], "private-owner");
});

test("logout e troca de conta descartam fila e callbacks da sessão anterior", async () => {
  const { metrics, batches, owners } = setup();
  metrics.configure("alice", true);
  const old = metrics.begin("media.publish");
  metrics.begin("post.like.confirm")();
  metrics.configure("bruno", true);
  old();
  assert.equal(metrics.pendingCount(), 0);
  metrics.begin("post.view.confirm")();
  await metrics.flush();
  assert.deepEqual(owners, ["bruno"]);
  assert.equal(parseMetricBatch(batches[0])?.samples[0].operation, "post.view.confirm");
  metrics.configure(undefined, false);
  metrics.begin("post.like.confirm")();
  assert.equal(metrics.pendingCount(), 0);
});

test("fila é limitada, envio respeita um minuto e lotes têm no máximo 20 amostras", async () => {
  const { metrics, batches, advance } = setup();
  metrics.configure("alice", true);
  for (let i = 0; i < 85; i++) metrics.begin("post.like.confirm")();
  assert.equal(metrics.pendingCount(), 80);
  await metrics.flush();
  assert.equal(parseMetricBatch(batches[0])?.samples.length, 20);
  assert.equal(parseMetricBatch(batches[0])?.dropped, 5);
  await metrics.flush();
  assert.equal(batches.length, 1);
  advance(60000);
  await metrics.flush();
  assert.equal(batches.length, 2);
});

test("amostras antigas expiram e falha de diagnóstico não repete lote incerto", async () => {
  let attempts = 0;
  const { metrics, advance } = setup(async () => {
    attempts++;
    throw new Error("diagnostic only");
  });
  metrics.configure("alice", true);
  await metrics.measure("post.like.confirm", async () => "ok");
  await metrics.flush();
  assert.equal(attempts, 1);
  assert.equal(metrics.pendingCount(), 0);
  advance(60000);
  await metrics.flush();
  assert.equal(attempts, 1);
  metrics.begin("post.view.confirm")();
  advance(300001);
  await metrics.flush();
  assert.equal(attempts, 1);
});

test("não abre envio concorrente nem ressuscita lote anterior após trocar de conta", async () => {
  let finish!: () => void;
  let attempts = 0;
  const { metrics, advance } = setup(async () => {
    attempts++;
    await new Promise<void>((resolve) => {
      finish = resolve;
    });
  });
  metrics.configure("alice", true);
  metrics.begin("post.like.confirm")();
  const pending = metrics.flush();
  advance(60000);
  metrics.begin("post.view.confirm")();
  await metrics.flush();
  assert.equal(attempts, 1);
  metrics.configure("bruno", true);
  finish();
  await pending;
  assert.equal(metrics.pendingCount(), 0);
});

test("amostragem não mede todas as ações e uma operação termina somente uma vez", async () => {
  const batches: unknown[] = [];
  let random = 0.5;
  const metrics = createOperationMetrics({
    platform: "android",
    random: () => random,
    clock: () => 10,
    send: async (batch) => {
      batches.push(batch);
    },
  });
  metrics.configure("alice", true);
  metrics.begin("post.like.confirm")();
  assert.equal(metrics.pendingCount(), 0);
  random = 0.1;
  const finish = metrics.begin("camera.preview");
  finish();
  finish("failure");
  await metrics.flush();
  assert.equal(parseMetricBatch(batches[0])?.samples.length, 1);
});

test("código privado ou getter malicioso não vai para diagnóstico; cancelamento é consistente", async () => {
  assert.equal(metricReleaseId("uid-private"), "unknown");
  assert.equal(
    metricErrorCode({
      get code() {
        throw new Error("private");
      },
    }),
    "internal",
  );
  const { metrics, batches } = setup();
  metrics.configure("alice", true);
  await assert.rejects(
    metrics.measure("media.publish", async () => {
      throw { code: "functions/cancelled" };
    }),
  );
  await metrics.flush();
  assert.equal(parseMetricBatch(batches[0])?.samples[0].outcome, "cancelled");
});

test("backend rejeita dados pessoais, URLs, operações/códigos e formatos não autorizados", () => {
  assert.deepEqual(parseMetricBatch(batch), batch);
  for (const value of [
    { ...batch, uid: "private" },
    { ...batch, source: "server" },
    { ...batch, releaseId: "https://private.test" },
    { ...batch, samples: [{ ...sample, message: "private" }] },
    { ...batch, samples: [{ ...sample, operation: "private-message" }] },
    { ...batch, samples: [{ ...sample, code: "token=private" }] },
    { ...batch, samples: [{ ...sample, value: NaN }] },
    { ...batch, samples: [{ ...sample, value: Infinity }] },
    { ...batch, samples: [{ ...sample, value: -1 }] },
    { ...batch, samples: Array.from({ length: 21 }, () => sample) },
    { ...batch, samples: [] },
    { ...batch, sampleRate: 1 },
    { ...batch, platform: { toString: "private" } },
    { ...batch, samples: [{ ...sample, outcome: { toString: "private" } }] },
    { ...batch, samples: [{ ...sample, outcome: "failure" }] },
  ])
    assert.equal(parseMetricBatch(value), null);
});

test("quantidade de documentos é apenas volume de resultados, sem IDs e sem virar contador social", async () => {
  const { metrics, batches } = setup();
  metrics.configure("alice", true);
  metrics.observePostDocuments(50);
  metrics.observePostDocuments(-1);
  metrics.observePostDocuments(10001);
  await metrics.flush();
  assert.deepEqual(parseMetricBatch(batches[0])?.samples, [
    { operation: "query.posts.documents", outcome: "success", code: "ok", value: 50 },
  ]);
});

test("falha no relógio ou na amostragem não altera o resultado de uma ação", async () => {
  for (const source of ["clock", "random"] as const) {
    const metrics = createOperationMetrics({
      platform: "web",
      clock: () => {
        if (source === "clock") throw new Error("private-clock");
        return 1;
      },
      random: () => {
        if (source === "random") throw new Error("private-random");
        return 0;
      },
      send: async () => assert.fail("não enviar"),
    });
    metrics.configure("alice", true);
    assert.equal(await metrics.measure("post.like.confirm", async () => 42), 42);
    await metrics.flush();
    assert.equal(metrics.pendingCount(), 0);
  }
});
