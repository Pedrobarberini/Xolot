import { reportOperationFailure } from "./platform/logger";
import { protectedOnCall } from "./platform/abuseProtection";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import {
  InvalidWebhookSignatureError,
  MercadoPagoConfig,
  PreApproval,
  WebhookSignatureValidator,
} from "mercadopago";
import { createHash, randomUUID } from "node:crypto";
import { HttpsError, onRequest } from "firebase-functions/v2/https";
import { requireVerifiedUser, verifyRegisteredUser } from "./auth";
import {
  REGION,
  mercadoPagoAccessToken,
  mercadoPagoEnvironment,
  mercadoPagoTestPayerEmail,
  mercadoPagoWebhookSecret,
} from "./config";

const PLUS_AMOUNT = 9.9;
const LEGACY_PLUS_AMOUNTS = [19.9];
const PLUS_CURRENCY = "BRL";
const PLUS_REASON = "Folko Plus";
const CHECKOUT_RETURN_URL = "https://xolot.com.br/?subscription=return";
const WEBHOOK_URL =
  "https://southamerica-east1-xolot-384e9.cloudfunctions.net/mercadoPagoWebhook?source_news=webhooks";

type SubscriptionStatus = "authorized" | "canceled" | "paused" | "pending";
type MercadoPagoEnvironment = "production" | "test";

type CheckoutContext = {
  checkoutAttemptId?: string;
  paymentEnvironment?: MercadoPagoEnvironment;
  payerEmailHash?: string;
};

type MercadoPagoSubscription = {
  auto_recurring?: {
    currency_id?: string;
    transaction_amount?: number;
  };
  external_reference?: string;
  id?: string;
  init_point?: string;
  next_payment_date?: string;
  status?: string;
};

type MercadoPagoApiError = {
  cause?: Array<{ code?: string; description?: string }>;
  error?: string;
  message?: string;
  status?: number;
};

function readMercadoPagoApiError(error: unknown): MercadoPagoApiError {
  if (!error || typeof error !== "object") {
    return {
      message: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }

  const candidate = error as MercadoPagoApiError;
  return {
    cause: Array.isArray(candidate.cause)
      ? candidate.cause.map((item) => ({
          code: typeof item?.code === "string" ? item.code : undefined,
          description: typeof item?.description === "string" ? item.description : undefined,
        }))
      : undefined,
    error: typeof candidate.error === "string" ? candidate.error : undefined,
    message:
      typeof candidate.message === "string"
        ? candidate.message
        : error instanceof Error
          ? error.message
          : "Erro desconhecido",
    status: typeof candidate.status === "number" ? candidate.status : undefined,
  };
}

function toCheckoutError(error: unknown) {
  const details = readMercadoPagoApiError(error);
  const normalizedMessage = details.message?.toLowerCase() ?? "";

  if (normalizedMessage.includes("both payer and collector must be real or test users")) {
    return new HttpsError(
      "failed-precondition",
      "O teste do Mercado Pago está usando contas incompatíveis. Configure o Access Token de produção da conta vendedora de teste e mantenha o comprador de teste.",
    );
  }

  return new HttpsError(
    "unavailable",
    "Não foi possível abrir o pagamento agora. Tente novamente em instantes.",
  );
}

function getClient() {
  return new PreApproval(
    new MercadoPagoConfig({
      accessToken: mercadoPagoAccessToken.value(),
      options: { timeout: 10_000 },
    }),
  );
}

function normalizeStatus(status: string | undefined): SubscriptionStatus {
  if (status === "authorized" || status === "paused" || status === "canceled") {
    return status;
  }

  if (status === "cancelled") {
    return "canceled";
  }

  return "pending";
}

function getUidFromExternalReference(reference: string | undefined) {
  if (!reference?.startsWith("xolot_plus:")) {
    return null;
  }

  const [, uid] = reference.split(":");
  return uid || null;
}

function assertExpectedSubscription(subscription: MercadoPagoSubscription) {
  const amount = subscription.auto_recurring?.transaction_amount;
  const currency = subscription.auto_recurring?.currency_id;

  if (
    typeof amount !== "number" ||
    ![PLUS_AMOUNT, ...LEGACY_PLUS_AMOUNTS].some(
      (expected) => Math.abs(amount - expected) <= 0.001,
    ) ||
    currency !== PLUS_CURRENCY
  ) {
    throw new Error("A assinatura recebida não corresponde ao plano Folko Plus.");
  }
}

async function saveSubscription(
  uid: string,
  subscription: MercadoPagoSubscription,
  context: CheckoutContext = {},
) {
  assertExpectedSubscription(subscription);

  if (!subscription.id) {
    throw new Error("O Mercado Pago não retornou o identificador da assinatura.");
  }

  const database = getFirestore();
  const reference = database.doc(`subscriptions/${uid}`);
  const profileReference = database.doc(`profiles/${uid}`);
  const identityReference = database.doc(`identityVerifications/${uid}`);
  const status = normalizeStatus(subscription.status);

  await database.runTransaction(async (transaction) => {
    const [snapshot, profileSnapshot, identitySnapshot] = await Promise.all([
      transaction.get(reference),
      transaction.get(profileReference),
      transaction.get(identityReference),
    ]);
    const payload: Record<string, unknown> = {
      amount: subscription.auto_recurring?.transaction_amount ?? PLUS_AMOUNT,
      checkoutUrl: subscription.init_point ?? null,
      currency: PLUS_CURRENCY,
      nextPaymentAt: subscription.next_payment_date ?? null,
      ownerUid: uid,
      plan: "pro",
      provider: "mercado_pago",
      providerSubscriptionId: subscription.id,
      status,
      updatedAt: FieldValue.serverTimestamp(),
    };

    const previousStatus = snapshot.data()?.status;
    if (status === "authorized" && previousStatus !== "authorized") {
      payload.authorizedAt = FieldValue.serverTimestamp();
    }
    if (status === "canceled" && previousStatus !== "canceled" && previousStatus !== "cancelled") {
      payload.canceledAt = FieldValue.serverTimestamp();
    }

    if (!snapshot.exists) {
      payload.createdAt = FieldValue.serverTimestamp();
    }
    if (context.checkoutAttemptId) {
      payload.checkoutAttemptId = context.checkoutAttemptId;
    }
    if (context.paymentEnvironment) {
      payload.paymentEnvironment = context.paymentEnvironment;
    }
    if (context.payerEmailHash) {
      payload.payerEmailHash = context.payerEmailHash;
    }

    transaction.set(reference, payload, { merge: true });
    if (profileSnapshot.exists) {
      transaction.update(profileReference, {
        identityVerified: identitySnapshot.data()?.status === "approved",
        plusActive: status === "authorized" && identitySnapshot.data()?.status === "approved",
      });
    }
  });

  return status;
}

async function loadProviderSubscription(subscriptionId: string) {
  return (await getClient().get({ id: subscriptionId })) as MercadoPagoSubscription;
}

export async function cancelPlusSubscriptionForAccountDeletion(uid: string) {
  const reference = getFirestore().doc(`subscriptions/${uid}`);
  const snapshot = await reference.get();
  const subscriptionId = snapshot.data()?.providerSubscriptionId;

  if (typeof subscriptionId !== "string" || !subscriptionId) {
    return false;
  }

  const currentSubscription = await loadProviderSubscription(subscriptionId);
  const externalUid = getUidFromExternalReference(currentSubscription.external_reference);

  if (externalUid !== uid) {
    throw new Error("A assinatura não pertence à conta excluída.");
  }

  if (normalizeStatus(currentSubscription.status) !== "canceled") {
    await getClient().update({
      body: { status: "canceled" },
      id: subscriptionId,
    });

    const updatedSubscription = await loadProviderSubscription(subscriptionId);
    if (
      getUidFromExternalReference(updatedSubscription.external_reference) !== uid ||
      normalizeStatus(updatedSubscription.status) !== "canceled"
    ) {
      throw new Error("O Mercado Pago não confirmou o cancelamento da conta.");
    }
  }

  return true;
}

function getPaymentEnvironment(): MercadoPagoEnvironment {
  const value = mercadoPagoEnvironment.value().trim().toLowerCase();
  if (value === "test" || value === "production") {
    return value;
  }

  throw new HttpsError(
    "failed-precondition",
    "O ambiente de pagamento não está configurado corretamente.",
  );
}

function getPayerEmail(accountEmail: string, environment: MercadoPagoEnvironment) {
  if (environment === "production") {
    return accountEmail;
  }

  const testEmail = mercadoPagoTestPayerEmail.value().trim().toLowerCase();
  if (!/^[^\s@]+@testuser\.com$/i.test(testEmail)) {
    throw new HttpsError(
      "failed-precondition",
      "O comprador de teste do Mercado Pago não está configurado corretamente.",
    );
  }

  return testEmail;
}

const callableOptions = {
  region: REGION,
  secrets: [mercadoPagoAccessToken],
};

const createSubscriptionOptions = {
  region: REGION,
  secrets: [mercadoPagoAccessToken, mercadoPagoTestPayerEmail],
};

export const createPlusSubscription = protectedOnCall(
  "createPlusSubscription",
  createSubscriptionOptions,
  async (request) => {
    const uid = requireVerifiedUser(request);
    await verifyRegisteredUser(uid);

    const identity = await getFirestore().doc(`identityVerifications/${uid}`).get();
    if (identity.data()?.status !== "approved") {
      throw new HttpsError(
        "failed-precondition",
        "Conclua a verificação de identidade antes de assinar o selo Folko Plus.",
      );
    }

    const accountEmail =
      typeof request.auth?.token.email === "string"
        ? request.auth.token.email.trim().toLowerCase()
        : "";

    if (!accountEmail) {
      throw new HttpsError(
        "failed-precondition",
        "Sua conta precisa ter um e-mail válido para assinar o Folko Plus.",
      );
    }

    const paymentEnvironment = getPaymentEnvironment();
    const payerEmail = getPayerEmail(accountEmail, paymentEnvironment);
    const payerEmailHash = createHash("sha256").update(payerEmail).digest("hex");

    const reference = getFirestore().doc(`subscriptions/${uid}`);
    const existing = await reference.get();
    const existingData = existing.data();

    if (existingData?.status === "authorized") {
      return { checkoutUrl: null, status: "authorized" as const };
    }

    if (
      existingData?.status === "pending" &&
      existingData.paymentEnvironment === paymentEnvironment &&
      existingData.payerEmailHash === payerEmailHash &&
      typeof existingData.checkoutUrl === "string" &&
      existingData.checkoutUrl.startsWith("https://")
    ) {
      return {
        checkoutUrl: existingData.checkoutUrl,
        status: "pending" as const,
      };
    }

    const checkoutAttemptId = randomUUID();
    const externalReference = `xolot_plus:${uid}:${checkoutAttemptId}`;
    const body = {
      auto_recurring: {
        currency_id: PLUS_CURRENCY,
        frequency: 1,
        frequency_type: "months",
        transaction_amount: PLUS_AMOUNT,
      },
      back_url: CHECKOUT_RETURN_URL,
      external_reference: externalReference,
      notification_url: WEBHOOK_URL,
      payer_email: payerEmail,
      reason: PLUS_REASON,
      status: "pending",
    };

    try {
      const subscription = (await getClient().create({
        body,
        requestOptions: { idempotencyKey: checkoutAttemptId },
      })) as MercadoPagoSubscription;

      const status = await saveSubscription(uid, subscription, {
        checkoutAttemptId,
        paymentEnvironment,
        payerEmailHash,
      });

      if (!subscription.init_point) {
        throw new Error("O Mercado Pago não retornou o link de pagamento.");
      }

      return {
        checkoutUrl: subscription.init_point,
        status,
      };
    } catch (error) {
      reportOperationFailure("billing.create", error);
      throw toCheckoutError(error);
    }
  },
);

export const syncPlusSubscription = protectedOnCall(
  "syncPlusSubscription",
  callableOptions,
  async (request) => {
    const uid = requireVerifiedUser(request);
    await verifyRegisteredUser(uid);

    const reference = getFirestore().doc(`subscriptions/${uid}`);
    const snapshot = await reference.get();
    const subscriptionId = snapshot.data()?.providerSubscriptionId;

    if (typeof subscriptionId !== "string" || !subscriptionId) {
      return { status: "pending" as const, synced: false };
    }

    try {
      const subscription = await loadProviderSubscription(subscriptionId);
      const externalUid = getUidFromExternalReference(subscription.external_reference);

      if (externalUid !== uid) {
        throw new Error("A assinatura não pertence à conta conectada.");
      }

      const status = await saveSubscription(uid, subscription);
      return { status, synced: true };
    } catch (error) {
      reportOperationFailure("billing.sync", error);
      throw new HttpsError("unavailable", "Não foi possível atualizar a assinatura agora.");
    }
  },
);

export const cancelPlusSubscription = protectedOnCall(
  "cancelPlusSubscription",
  callableOptions,
  async (request) => {
    const uid = requireVerifiedUser(request);
    await verifyRegisteredUser(uid);

    const reference = getFirestore().doc(`subscriptions/${uid}`);
    const snapshot = await reference.get();
    const subscriptionId = snapshot.data()?.providerSubscriptionId;

    if (typeof subscriptionId !== "string" || !subscriptionId) {
      throw new HttpsError(
        "failed-precondition",
        "Nenhuma assinatura foi encontrada para esta conta.",
      );
    }

    try {
      const currentSubscription = await loadProviderSubscription(subscriptionId);
      const externalUid = getUidFromExternalReference(currentSubscription.external_reference);

      if (externalUid !== uid) {
        throw new Error("A assinatura não pertence à conta conectada.");
      }

      if (normalizeStatus(currentSubscription.status) === "canceled") {
        const status = await saveSubscription(uid, currentSubscription);
        return { status };
      }

      await getClient().update({
        body: { status: "canceled" },
        id: subscriptionId,
      });

      const updatedSubscription = await loadProviderSubscription(subscriptionId);
      const updatedUid = getUidFromExternalReference(updatedSubscription.external_reference);

      if (updatedUid !== uid) {
        throw new Error("A assinatura atualizada não pertence à conta conectada.");
      }

      const status = await saveSubscription(uid, updatedSubscription);
      if (status !== "canceled") {
        throw new Error("O Mercado Pago não confirmou o cancelamento.");
      }

      return { status };
    } catch (error) {
      reportOperationFailure("billing.cancel", error);
      throw new HttpsError(
        "unavailable",
        "Não foi possível cancelar a assinatura agora. Tente novamente.",
      );
    }
  },
);

export const mercadoPagoWebhook = onRequest(
  {
    cors: false,
    invoker: "public",
    region: REGION,
    secrets: [mercadoPagoAccessToken, mercadoPagoWebhookSecret],
  },
  async (request, response) => {
    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    const bodyDataId = request.body?.data?.id;
    const queryDataId = request.query["data.id"] ?? request.query.data_id;
    const dataId =
      typeof queryDataId === "string"
        ? queryDataId
        : Array.isArray(queryDataId) && typeof queryDataId[0] === "string"
          ? queryDataId[0]
          : typeof bodyDataId === "string" || typeof bodyDataId === "number"
            ? String(bodyDataId)
            : undefined;

    try {
      WebhookSignatureValidator.validate({
        dataId,
        secret: mercadoPagoWebhookSecret.value(),
        xRequestId: request.headers["x-request-id"],
        xSignature: request.headers["x-signature"],
      });
    } catch (error) {
      console.warn("Webhook Mercado Pago rejeitado.", {
        reason: error instanceof InvalidWebhookSignatureError ? error.reason : "validation_error",
      });
      response.status(401).send("Invalid signature");
      return;
    }

    const eventType = typeof request.body?.type === "string" ? request.body.type : "";

    if (eventType !== "subscription_preapproval" || typeof dataId !== "string") {
      response.status(200).send("Ignored");
      return;
    }

    try {
      const subscription = await loadProviderSubscription(dataId);
      const uid = getUidFromExternalReference(subscription.external_reference);

      if (!uid) {
        response.status(200).send("Unknown subscription");
        return;
      }

      await saveSubscription(uid, subscription);
      response.status(200).send("OK");
    } catch (error) {
      reportOperationFailure("billing.webhook", error);
      response.status(500).send("Retry");
    }
  },
);
