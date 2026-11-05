const expectedCodes = new Set([
  "aborted",
  "already-exists",
  "cancelled",
  "deadline-exceeded",
  "failed-precondition",
  "invalid-argument",
  "not-found",
  "permission-denied",
  "resource-exhausted",
  "unauthenticated",
  "unavailable",
]);
const operations = new Set(["cache.load", "cache.save", "media.upload.sign"]);
export type OperationName = "cache.load" | "cache.save" | "media.upload.sign";

export function failureEvent(operation: OperationName, error: unknown, correlationId: string) {
  const rawCode = error && typeof error === "object" && "code" in error ? error.code : undefined;
  const candidate = typeof rawCode === "string" ? rawCode.split("/").at(-1) : undefined;
  const code = candidate && expectedCodes.has(candidate) ? candidate : "internal";
  return {
    operation: operations.has(operation) ? operation : "operation.unknown",
    correlationId: /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(correlationId)
      ? correlationId
      : "unavailable",
    outcome: "failure" as const,
    code,
    expected: code !== "internal",
  };
}
