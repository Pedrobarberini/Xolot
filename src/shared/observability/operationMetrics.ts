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
export type MetricOperation = (typeof metricOperations)[number];
export type MetricCode = (typeof metricCodes)[number];
export type MetricSample = {
  operation: MetricOperation;
  outcome: "success" | "failure" | "cancelled";
  code: MetricCode;
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
export type MetricFinish = (outcome?: MetricSample["outcome"], error?: unknown) => void;
const noop: MetricFinish = () => {};
export function metricErrorCode(error: unknown): MetricCode {
  try {
    const raw = error && typeof error === "object" && "code" in error ? error.code : undefined;
    const code = typeof raw === "string" ? raw.split("/").at(-1) : undefined;
    return code && metricCodes.includes(code as MetricCode) && code !== "ok"
      ? (code as MetricCode)
      : "internal";
  } catch {
    return "internal";
  }
}
export function metricReleaseId(value: string | undefined) {
  return value && /^(?:[a-f0-9]{7,40}|development)$/.test(value) ? value : "unknown";
}

export function createOperationMetrics(options: {
  platform: MetricBatch["platform"];
  releaseId?: string;
  clock?: () => number;
  random?: () => number;
  send: (batch: MetricBatch, expectedUserId: string) => Promise<unknown>;
}) {
  const clock = options.clock ?? (() => globalThis.performance?.now() ?? Date.now());
  const random = options.random ?? Math.random;
  const readClock = () => {
    try {
      return clock();
    } catch {
      return NaN;
    }
  };
  const sampled = () => {
    try {
      const value = random();
      return Number.isFinite(value) && value >= 0 && value < 0.2;
    } catch {
      return false;
    }
  };
  let owner = "";
  let enabled = false;
  let generation = 0;
  let queue: { sample: MetricSample; recordedAt: number }[] = [];
  let dropped = 0;
  let pending = false;
  let lastFlush = -Infinity;
  function configure(userId: string | undefined, active: boolean) {
    if (owner === (userId ?? "") && enabled === active) return;
    owner = userId ?? "";
    enabled = active && Boolean(owner);
    generation++;
    queue = [];
    dropped = 0;
    lastFlush = -Infinity;
  }
  function append(sample: MetricSample, session: number) {
    if (!enabled || !owner || generation !== session) return;
    if (queue.length >= 80) {
      dropped = Math.min(dropped + 1, 10000);
      return;
    }
    const recordedAt = readClock();
    if (Number.isFinite(recordedAt)) queue.push({ sample, recordedAt });
  }
  function begin(operation: MetricOperation): MetricFinish {
    if (
      !enabled ||
      !owner ||
      !metricOperations.includes(operation) ||
      operation === "query.posts.documents" ||
      !sampled()
    )
      return noop;
    const session = generation;
    const started = readClock();
    let ended = false;
    return (outcome = "success", error) => {
      if (ended) return;
      ended = true;
      const elapsed = readClock() - started;
      if (!Number.isFinite(elapsed) || elapsed < 0 || elapsed > 300000) return;
      const code =
        outcome === "success"
          ? "ok"
          : outcome === "cancelled"
            ? "cancelled"
            : metricErrorCode(error);
      append(
        {
          operation,
          outcome: code === "cancelled" ? "cancelled" : outcome,
          code,
          value: Math.round(elapsed),
        },
        session,
      );
    };
  }
  async function measure<T>(operation: MetricOperation, run: () => Promise<T>): Promise<T> {
    const finish = begin(operation);
    try {
      const result = await run();
      finish();
      return result;
    } catch (error) {
      finish("failure", error);
      throw error;
    }
  }
  function observePostDocuments(count: number) {
    if (!enabled || !owner || !Number.isInteger(count) || count < 0 || count > 10000 || !sampled())
      return;
    append(
      { operation: "query.posts.documents", outcome: "success", code: "ok", value: count },
      generation,
    );
  }
  async function flush() {
    const now = readClock();
    if (
      !enabled ||
      !owner ||
      pending ||
      queue.length === 0 ||
      !Number.isFinite(now) ||
      now - lastFlush < 60000
    )
      return;
    const session = generation;
    const userId = owner;
    const before = queue.length;
    queue = queue.filter((item) => now >= item.recordedAt && now - item.recordedAt <= 300000);
    dropped = Math.min(dropped + before - queue.length, 10000);
    if (queue.length === 0) return;
    const samples = queue.splice(0, 20).map((item) => item.sample);
    const loss = dropped;
    dropped = 0;
    lastFlush = now;
    pending = true;
    try {
      await options.send(
        {
          schemaVersion: 1,
          source: "client",
          platform: options.platform,
          sampleRate: 0.2,
          releaseId: metricReleaseId(options.releaseId),
          dropped: loss,
          samples,
        },
        userId,
      );
    } catch {
      // Diagnostic delivery is best effort: never retry an uncertain batch or fail a user action.
      if (session === generation) dropped = Math.min(dropped + samples.length + loss, 10000);
    } finally {
      pending = false;
    }
  }
  return {
    begin,
    configure,
    flush,
    measure,
    observePostDocuments,
    pendingCount: () => queue.length,
  };
}
