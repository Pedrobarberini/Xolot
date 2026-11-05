declare const idBrand: unique symbol;
export type AuthUid = string & { readonly [idBrand]: "AuthUid" };
export type PostId = string & { readonly [idBrand]: "PostId" };
export type ConversationId = string & { readonly [idBrand]: "ConversationId" };

function isDocumentIdentifier(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 128 &&
    value.trim() === value &&
    value !== "." &&
    value !== ".." &&
    !/[\u0000-\u001f\u007f/]/.test(value)
  );
}

export function authUid(value: unknown): AuthUid {
  if (!isDocumentIdentifier(value)) throw new Error("UID inválido.");
  return value as AuthUid;
}

export function postId(value: unknown): PostId {
  if (!isDocumentIdentifier(value)) throw new Error("ID de publicação inválido.");
  return value as PostId;
}

export type PostReferenceResolution =
  | { kind: "resolved"; id: PostId; source: "canonical" | "legacy" }
  | { kind: "ambiguous"; candidates: readonly PostId[] }
  | { kind: "missing" }
  | { kind: "invalid" };

/** Usa inventário explícito: um prefixo não prova que o ID é legado. */
export function resolvePostReference(
  value: unknown,
  canonicalPostIds: ReadonlySet<string>,
): PostReferenceResolution {
  if (!isDocumentIdentifier(value)) return { kind: "invalid" };
  const direct = canonicalPostIds.has(value) ? postId(value) : null;
  const legacyCandidate = value.startsWith("approved-") ? value.slice("approved-".length) : null;
  const legacy =
    legacyCandidate &&
    isDocumentIdentifier(legacyCandidate) &&
    canonicalPostIds.has(legacyCandidate)
      ? postId(legacyCandidate)
      : null;
  if (direct && legacy) return { kind: "ambiguous", candidates: [direct, legacy] };
  if (direct) return { kind: "resolved", id: direct, source: "canonical" };
  if (legacy) return { kind: "resolved", id: legacy, source: "legacy" };
  return { kind: "missing" };
}

export function profileReference(uid: AuthUid): string {
  return `profile-${uid}`;
}

export function uidFromLegacyProfileReference(value: unknown): AuthUid {
  if (typeof value !== "string" || !value.startsWith("profile-"))
    throw new Error("Referência de perfil inválida.");
  return authUid(value.slice("profile-".length));
}

export function conversationParticipants(
  first: AuthUid,
  second: AuthUid,
): readonly [AuthUid, AuthUid] {
  if (first === second)
    throw new Error("Uma conversa individual precisa de dois participantes diferentes.");
  return first < second ? [first, second] : [second, first];
}

/** A implementação injetada deve produzir SHA-256 hexadecimal sobre UTF-8. */
export async function conversationId(
  first: AuthUid,
  second: AuthUid,
  sha256: (serializedParticipants: string) => Promise<string>,
): Promise<ConversationId> {
  const serialized = JSON.stringify([
    "conversation-v1",
    ...conversationParticipants(first, second),
  ]);
  const digest = await sha256(serialized);
  if (!/^[a-f0-9]{64}$/.test(digest)) throw new Error("Digest de conversa inválido.");
  return `v1_${digest}` as ConversationId;
}

export function userPostIdentity(uid: AuthUid, id: PostId): string {
  return JSON.stringify([uid, id]);
}
