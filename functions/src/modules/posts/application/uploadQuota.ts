import { OperationError } from "../../../domain/OperationError";

export function advanceUploadQuota(
  data: Record<string, unknown> | undefined,
  now: number,
  maximum: number,
) {
  const previousWindow = typeof data?.windowStartedAtMs === "number" ? data.windowStartedAtMs : 0;
  const isCurrentWindow = now - previousWindow < 60_000;
  const count = isCurrentWindow && typeof data?.count === "number" ? data.count : 0;
  if (count >= maximum)
    throw new OperationError(
      "resource-exhausted",
      "Muitos envios em pouco tempo. Aguarde um minuto.",
    );
  return { count: count + 1, windowStartedAtMs: isCurrentWindow ? previousWindow : now };
}
