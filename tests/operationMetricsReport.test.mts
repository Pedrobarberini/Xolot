import assert from "node:assert/strict";
import test from "node:test";
import {
  summarizeOperationLogs,
  renderOperationMetricsMarkdown,
} from "../scripts/report-operation-metrics.mjs";
const entry = (
  samples: { operation: string; outcome: string; code: string; value: number }[],
  insertId = "1",
) => ({
  insertId,
  logName: "private-operational-log",
  jsonPayload: {
    event: "folko.operation_metrics",
    message: "folko.operation_metrics",
    schemaVersion: 1,
    source: "client",
    platform: "web",
    sampleRate: 0.2,
    releaseId: "dcf3622",
    dropped: 0,
    samples,
  },
});
test("relatório calcula percentis de amostra e não exporta IDs, logName ou dados estranhos", () => {
  const sample = { operation: "post.like.confirm", outcome: "success", code: "ok", value: 100 };
  const good = entry([sample, { ...sample, value: 200 }, { ...sample, value: 300 }]);
  const report = summarizeOperationLogs([
    good,
    good,
    { ...entry([sample], "2"), jsonPayload: { ...good.jsonPayload, uid: "private-owner" } },
    { jsonPayload: { text: "private-message" } },
  ]);
  assert.equal(report.acceptedBatches, 1);
  assert.equal(report.duplicateEntries, 1);
  assert.equal(report.rejectedBatches, 1);
  assert.equal(report.metrics[0].p50, 200);
  assert.equal(report.metrics[0].p95, 300);
  assert.equal(report.metrics[0].sampleWarning, "small_sample");
  for (const privateText of [
    "private-owner",
    "private-message",
    "private-operational-log",
    "insertId",
  ])
    assert.ok(!JSON.stringify(report).includes(privateText));
  assert.ok(renderOperationMetricsMarkdown(report).includes("p95"));
});
test("dados de documentos não viram latência, cancelamentos não viram sucesso e vazio não vira SLA", () => {
  const report = summarizeOperationLogs([
    entry([
      { operation: "query.posts.documents", outcome: "success", code: "ok", value: 50 },
      { operation: "media.publish", outcome: "cancelled", code: "cancelled", value: 1200 },
    ]),
  ]);
  assert.equal(
    report.metrics.find((metric) => metric.operation === "query.posts.documents")?.unit,
    "returned_documents",
  );
  assert.equal(report.metrics.find((metric) => metric.operation === "media.publish")?.successes, 0);
  assert.equal(
    report.metrics.find((metric) => metric.operation === "media.publish")?.cancellations,
    1,
  );
  assert.ok(
    renderOperationMetricsMarkdown(summarizeOperationLogs([])).includes(
      "Não interpretar como sucesso",
    ),
  );
});
