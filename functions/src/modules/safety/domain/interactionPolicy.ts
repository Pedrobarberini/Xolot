import { OperationError } from "../../../domain/OperationError";

function blockedProfiles(value: unknown, uid: string): string[] {
  if (value === undefined) return [];
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new OperationError("failed-precondition", "Preferências de segurança indisponíveis.");
  const preferences = value as Record<string, unknown>;
  const blocked = preferences.blockedProfileIds ?? [];
  if (
    (preferences.ownerUid !== undefined && preferences.ownerUid !== uid) ||
    !Array.isArray(blocked) ||
    blocked.length > 500 ||
    blocked.some((id) => typeof id !== "string" || id.length > 136)
  )
    throw new OperationError("failed-precondition", "Preferências de segurança indisponíveis.");
  return blocked as string[];
}

export function assertInteractionPolicy(
  actorUid: string,
  targetUid: string,
  actorPreferences: unknown,
  targetPreferences: unknown,
) {
  if (actorUid === targetUid) return;
  if (
    blockedProfiles(actorPreferences, actorUid).includes(`profile-${targetUid}`) ||
    blockedProfiles(targetPreferences, targetUid).includes(`profile-${actorUid}`)
  )
    throw new OperationError("permission-denied", "Interação indisponível entre estes perfis.");
}
