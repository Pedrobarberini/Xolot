export const metricOperations = [
  "feed.first_item",
  "post.like.confirm",
  "post.view.confirm",
  "message.send.confirm",
  "notification.resolve",
  "media.publish",
  "camera.preview",
  "query.posts.documents",
] as const;
export const metricCodes = [
  "ok",
  "cancelled",
  "aborted",
  "already-exists",
  "deadline-exceeded",
  "failed-precondition",
  "invalid-argument",
  "not-found",
  "permission-denied",
  "resource-exhausted",
  "unauthenticated",
  "unavailable",
  "internal",
] as const;
type MetricSample = {
  operation: (typeof metricOperations)[number];
  outcome: "success" | "failure" | "cancelled";
  code: (typeof metricCodes)[number];
  value: number;
};
export type MetricBatch = {
  schemaVersion: 1;
  source: "client";
  platform: "web" | "android" | "ios";
  sampleRate: 0.2;
  releaseId: string;
  dropped: number;
  samples: MetricSample[];
};

function record(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function hasOnly(value: Record<string, unknown>, keys: string[]) {
  return (
    Object.keys(value).length === keys.length &&
    Object.keys(value).every((key) => keys.includes(key))
  );
}
export function parseMetricBatch(value: unknown): MetricBatch | null {
  if (
    !record(value) ||
    !hasOnly(value, [
      "schemaVersion",
      "source",
      "platform",
      "sampleRate",
      "releaseId",
      "dropped",
      "samples",
    ])
  )
    return null;
  if (
    value.schemaVersion !== 1 ||
    value.source !== "client" ||
    value.sampleRate !== 0.2 ||
    typeof value.platform !== "string" ||
    !["web", "android", "ios"].includes(value.platform)
  )
    return null;
  if (
    typeof value.releaseId !== "string" ||
    !/^(?:[a-f0-9]{7,40}|development|unknown)$/.test(value.releaseId)
  )
    return null;
  if (
    !Number.isInteger(value.dropped) ||
    Number(value.dropped) < 0 ||
    Number(value.dropped) > 10000
  )
    return null;
  if (!Array.isArray(value.samples) || value.samples.length < 1 || value.samples.length > 20)
    return null;
  const samples: MetricSample[] = [];
  for (const sample of value.samples) {
    if (!record(sample) || !hasOnly(sample, ["operation", "outcome", "code", "value"])) return null;
    if (
      !metricOperations.includes(sample.operation as MetricSample["operation"]) ||
      !metricCodes.includes(sample.code as MetricSample["code"])
    )
      return null;
    if (
      typeof sample.outcome !== "string" ||
      !["success", "failure", "cancelled"].includes(sample.outcome)
    )
      return null;
    if (
      !Number.isInteger(sample.value) ||
      Number(sample.value) < 0 ||
      Number(sample.value) > (sample.operation === "query.posts.documents" ? 10000 : 300000)
    )
      return null;
    if (
      (sample.outcome === "success" && sample.code !== "ok") ||
      (sample.outcome === "cancelled" && sample.code !== "cancelled") ||
      (sample.outcome === "failure" && ["ok", "cancelled"].includes(sample.code as string))
    )
      return null;
    if (sample.operation === "query.posts.documents" && sample.outcome !== "success") return null;
    samples.push({
      operation: sample.operation as MetricSample["operation"],
      outcome: sample.outcome as MetricSample["outcome"],
      code: sample.code as MetricSample["code"],
      value: Number(sample.value),
    });
  }
  return {
    schemaVersion: 1,
    source: "client",
    platform: value.platform as MetricBatch["platform"],
    sampleRate: 0.2,
    releaseId: value.releaseId,
    dropped: Number(value.dropped),
    samples,
  };
}
