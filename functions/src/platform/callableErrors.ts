import { HttpsError } from "firebase-functions/v2/https";
import { OperationError } from "../domain/OperationError";

export function toCallableError(error: unknown): unknown {
  return error instanceof OperationError ? new HttpsError(error.code, error.message) : error;
}
