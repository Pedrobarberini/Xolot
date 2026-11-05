import { OperationError } from "../../../domain/OperationError";

export type RequestInput = {
  auth?: { uid: string; token: Record<string, unknown> };
  data?: unknown;
};
export type RequestContext = Readonly<{
  uid: string;
  authTimeSeconds: number | null;
  isAdmin: boolean;
}>;

export function verifiedRequestContext(request: RequestInput): RequestContext {
  const auth = request.auth;
  if (
    !auth ||
    typeof auth.uid !== "string" ||
    !auth.uid ||
    auth.uid.length > 128 ||
    auth.uid.trim() !== auth.uid ||
    /[\u0000-\u001f/]/.test(auth.uid)
  )
    throw new OperationError("unauthenticated", "Entre na sua conta para publicar.");
  if (!auth.token || auth.token.email_verified !== true)
    throw new OperationError("permission-denied", "Confirme seu e-mail antes de publicar.");
  const time = auth.token.auth_time;
  return Object.freeze({
    uid: auth.uid,
    isAdmin: auth.token.admin === true,
    authTimeSeconds: typeof time === "number" && Number.isInteger(time) && time > 0 ? time : null,
  });
}

export function requireResourceOwner(context: RequestContext, ownerUid: unknown, message: string) {
  if (ownerUid !== context.uid) throw new OperationError("permission-denied", message);
}

export function requireRecentAuthentication(
  context: RequestContext,
  nowSeconds: number,
  maxAgeSeconds = 600,
) {
  const time = context.authTimeSeconds;
  if (time === null || time - nowSeconds > 60 || nowSeconds - time > maxAgeSeconds)
    throw new OperationError(
      "failed-precondition",
      "Entre novamente na sua conta antes de confirmar a exclusão.",
    );
}

export function requireAdministrator(context: RequestContext) {
  if (!context.isAdmin)
    throw new OperationError("permission-denied", "Operação administrativa não autorizada.");
}
