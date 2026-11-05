import { requireRegisteredAccount } from "./modules/accounts/application/requireRegisteredAccount";
import { firestoreRegistration } from "./modules/accounts/data/firestoreRegistration";
import { toCallableError } from "./platform/callableErrors";
import {
  verifiedRequestContext, requireAdministrator, requireRecentAuthentication, requireResourceOwner,
  type RequestContext, type RequestInput,
} from "./modules/accounts/domain/requestContext";

function callablePolicy<T>(run: () => T): T {
  try { return run(); } catch (error: unknown) { throw toCallableError(error); }
}
export function getVerifiedRequestContext(request: RequestInput) {
  return callablePolicy(() => verifiedRequestContext(request));
}
export function requireVerifiedUser(request: RequestInput) {
  return getVerifiedRequestContext(request).uid;
}
export function assertResourceOwner(context: RequestContext, ownerUid: unknown, message: string) {
  return callablePolicy(() => requireResourceOwner(context, ownerUid, message));
}
export function assertRecentAuthentication(context: RequestContext, nowSeconds: number, maxAgeSeconds = 600) {
  return callablePolicy(() => requireRecentAuthentication(context, nowSeconds, maxAgeSeconds));
}
export function getAdminRequestContext(request: RequestInput) {
  const context = getVerifiedRequestContext(request);
  callablePolicy(() => requireAdministrator(context));
  return context;
}
export async function verifyRegisteredUser(uid: string) {
  try { await requireRegisteredAccount(uid, firestoreRegistration); }
  catch (error: unknown) { throw toCallableError(error); }
}
