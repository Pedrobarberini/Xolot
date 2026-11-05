import { HttpsError } from "firebase-functions/v2/https";
import { requireCommandRecord, requireText } from "../../validation";
import type { EngagementPostReference } from "./application/engagementService";

const commandFields = { like: ["playerId", "liked"], view: ["playerId"] } as const;
function postReference(
  data: Record<string, unknown>,
  kind: "like" | "view",
): EngagementPostReference {
  const playerId = requireText(data.playerId, "Publicação", 1, 128);
  // Alias do contrato v1; migração de IDs exige inventário, não renomeação de documentos.
  const postId = playerId.startsWith("approved-") ? playerId.slice("approved-".length) : playerId;
  if (!/^[A-Za-z0-9_-]+$/.test(playerId) || !postId)
    throw new HttpsError(
      "invalid-argument",
      kind === "like" ? "Curtida inválida." : "Visualização inválida.",
    );
  return { playerId, postId };
}
export function parseLikeCommand(value: unknown) {
  const data = requireCommandRecord(value, commandFields.like);
  const post = postReference(data, "like");
  if (typeof data.liked !== "boolean")
    throw new HttpsError("invalid-argument", "Curtida inválida.");
  return { ...post, liked: data.liked };
}
export function parseViewCommand(value: unknown) {
  return postReference(requireCommandRecord(value, commandFields.view), "view");
}
