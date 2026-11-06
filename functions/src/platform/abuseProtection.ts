import { createHash } from "node:crypto";
import { FieldValue, type Firestore, getFirestore } from "firebase-admin/firestore";
import {
  HttpsError,
  onCall,
  type CallableOptions,
  type CallableRequest,
} from "firebase-functions/v2/https";
import { getVerifiedRequestContext, assertRecentAuthentication } from "../auth";

// Ativar somente após registrar os provedores e validar os clientes em monitoramento.
export const isAppCheckEnforced = () => {
  const value = process.env.ENFORCE_APP_CHECK?.trim();
  if (value && value !== "true" && value !== "false")
    throw new Error("ENFORCE_APP_CHECK deve ser true ou false.");
  return value === "true";
};
export const callableBudgets = {
  setPostLike: 120,
  recordPostView: 120,
  sendDirectMessage: 60,
  updateDirectMessageReceipts: 120,
  markNotificationsRead: 60,
  finalizeAccountRegistration: 10,
  createMediaUpload: 10,
  finalizeMediaUpload: 20,
  deleteR2Post: 20,
  createAvatarUpload: 5,
  finalizeAvatarUpload: 10,
  updateAvatarCrop: 20,
  ensureTagCatalogEntry: 20,
  createPlusSubscription: 5,
  syncPlusSubscription: 20,
  cancelPlusSubscription: 5,
  deleteOwnAccount: 3,
  ingestOperationMetrics: 6,
} as const;
export type CallableOperation = keyof typeof callableBudgets;
export const callableQuotaId = (operation: CallableOperation, uid: string) =>
  createHash("sha256").update(`${operation}\0${uid}`).digest("hex");
type Quota = { count?: unknown; windowStartedAtMs?: unknown };

export function nextQuota(quota: Quota, now: number, maximum: number) {
  const started = quota.windowStartedAtMs;
  const current = typeof started === "number" && started <= now && now - started < 60_000;
  const count =
    current && Number.isSafeInteger(quota.count) && Number(quota.count) >= 0
      ? Number(quota.count)
      : 0;
  if (count >= maximum)
    throw new HttpsError("resource-exhausted", "Muitas solicitações. Aguarde um minuto.", {
      retryAfterMs: Math.max(1, Number(started) + 60_000 - now),
    });
  return { count: count + 1, windowStartedAtMs: current ? Number(started) : now };
}

export function createAbuseLimiter(database: () => Firestore, clock = Date.now) {
  const cooldowns = new Map<string, number>();
  return async (operation: CallableOperation, uid: string) => {
    // Um documento estável por conta/operação, compartilhado por todas as instâncias.
    const key = callableQuotaId(operation, uid);
    const until = cooldowns.get(key);
    if (until && until > clock())
      throw new HttpsError("resource-exhausted", "Muitas solicitações. Aguarde um minuto.", {
        retryAfterMs: until - clock(),
      });
    cooldowns.delete(key);
    const db = database();
    const reference = db.doc(`callableRateLimits/${key}`);
    try {
      await db.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(reference);
        transaction.set(reference, {
          ...nextQuota(snapshot.data() ?? {}, clock(), callableBudgets[operation]),
          operation,
          updatedAt: FieldValue.serverTimestamp(),
        });
      });
    } catch (error) {
      if (error instanceof HttpsError && error.code === "resource-exhausted") {
        const retry = (error.details as { retryAfterMs?: unknown })?.retryAfterMs;
        if (typeof retry === "number" && Number.isFinite(retry) && retry > 0) {
          // Cache é apenas uma recusa antecipada; a autoridade continua na transação.
          if (cooldowns.size >= 2048) cooldowns.delete(cooldowns.keys().next().value!);
          cooldowns.set(key, clock() + retry);
        }
      }
      throw error;
    }
  };
}

export function guardCallable<Data, Result>(
  operation: CallableOperation,
  handler: (request: CallableRequest<Data>) => Result,
  consume: (operation: CallableOperation, uid: string) => Promise<void>,
  requireAttestation = isAppCheckEnforced,
) {
  return async (request: CallableRequest<Data>) => {
    const context = getVerifiedRequestContext(request);
    const { uid } = context;
    if (operation === "deleteOwnAccount")
      assertRecentAuthentication(context, Math.floor(Date.now() / 1000));
    if (requireAttestation() && !request.app)
      throw new HttpsError(
        "unauthenticated",
        "Conclua a verificação de segurança e tente novamente.",
      );
    if (request.app?.alreadyConsumed)
      throw new HttpsError("failed-precondition", "Verificação de segurança já utilizada.");
    const serialized = JSON.stringify(request.data);
    if (!serialized || Buffer.byteLength(serialized, "utf8") > 32 * 1024)
      throw new HttpsError("invalid-argument", "Solicitação muito grande ou inválida.");
    await consume(operation, uid);
    return handler(request);
  };
}

const consume = createAbuseLimiter(getFirestore);
export function protectedOnCall<Data = Record<string, unknown>, Result = unknown>(
  operation: CallableOperation,
  options: CallableOptions<Data>,
  handler: (request: CallableRequest<Data>) => Result,
) {
  return onCall(
    {
      maxInstances: 20,
      concurrency: 40,
      timeoutSeconds: 60,
      ...options,
      enforceAppCheck: isAppCheckEnforced(),
      cors: [
        "https://xolot.com.br",
        "https://www.xolot.com.br",
        "https://xolot.web.app",
        "https://xolot-384e9.web.app",
        "https://xolot-384e9.firebaseapp.com",
        /^https:\/\/xolot--[a-z0-9-]+\.web\.app$/,
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
      ],
    },
    guardCallable(operation, handler, consume),
  );
}
