export type OperationErrorCode =
  | "unauthenticated"
  | "permission-denied"
  | "invalid-argument"
  | "failed-precondition"
  | "not-found"
  | "already-exists"
  | "resource-exhausted"
  | "deadline-exceeded";

export class OperationError extends Error {
  constructor(
    public readonly code: OperationErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "OperationError";
  }
}
