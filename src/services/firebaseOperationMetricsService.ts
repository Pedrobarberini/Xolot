import { httpsCallable } from "firebase/functions";
import { getFirebaseFunctions } from "../config/firebase";
import { getCurrentFirebaseUser } from "./firebaseAccountService";
import type { MetricBatch } from "../shared/observability/operationMetrics";

export async function sendOperationMetrics(batch: MetricBatch, expectedUserId: string) {
  const user = getCurrentFirebaseUser();
  if (!user?.emailVerified || user.uid !== expectedUserId) return;
  const send = httpsCallable<MetricBatch, { accepted: number }>(
    getFirebaseFunctions(),
    "ingestOperationMetrics",
    { timeout: 10000 },
  );
  await send(batch);
}
