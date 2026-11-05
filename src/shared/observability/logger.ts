import { randomUUID } from "expo-crypto";
import { failureEvent, type OperationName } from "./failureEvent";

export function reportOperationFailure(operation: OperationName, error: unknown) {
  try {
    const event = failureEvent(operation, error, randomUUID());
    if (event.expected) console.warn("xolot.operation", event);
    else console.error("xolot.operation", event);
  } catch {
    // Observabilidade não pode interromper recuperação de cache ou uma ação do usuário.
  }
}
