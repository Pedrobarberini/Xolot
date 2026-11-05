import { randomUUID } from "node:crypto";
import * as logger from "firebase-functions/logger";
import { failureEvent, type OperationName } from "./failureEvent";

export function reportOperationFailure(operation: OperationName, error: unknown) {
  try {
    const event = failureEvent(operation, error, randomUUID());
    if (event.expected) logger.warn("xolot.operation", event);
    else logger.error("xolot.operation", event);
  } catch {
    // Preservar o erro original e o contrato do callable mesmo se o sink falhar.
  }
}
