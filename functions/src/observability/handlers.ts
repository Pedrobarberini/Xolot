import * as logger from "firebase-functions/logger";
import { HttpsError } from "firebase-functions/v2/https";
import { REGION } from "../config";
import { protectedOnCall } from "../platform/abuseProtection";
import { parseMetricBatch } from "./metricProtocol";

export function acceptOperationMetrics(data: unknown, write: (data: object) => void) {
  const batch = parseMetricBatch(data);
  if (!batch) throw new HttpsError("invalid-argument", "Lote de diagnóstico inválido.");
  try {
    write({ event: "folko.operation_metrics", ...batch });
  } catch {
    throw new HttpsError("unavailable", "Diagnóstico temporariamente indisponível.");
  }
  return { accepted: batch.samples.length };
}

export const ingestOperationMetrics = protectedOnCall(
  "ingestOperationMetrics",
  { region: REGION, timeoutSeconds: 15, maxInstances: 5, concurrency: 10 },
  (request) =>
    acceptOperationMetrics(request.data, (data) => logger.info("folko.operation_metrics", data)),
);
