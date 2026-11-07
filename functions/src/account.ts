import { protectedOnCall } from "./platform/abuseProtection";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import { requireVerifiedUser } from "./auth";
import { REGION } from "./config";

const callableOptions = { region: REGION };

function getSignInProvider(token: Record<string, unknown>) {
  const firebaseClaim = token.firebase;
  if (!firebaseClaim || typeof firebaseClaim !== "object") {
    return "";
  }

  const provider = (firebaseClaim as Record<string, unknown>).sign_in_provider;
  return typeof provider === "string" ? provider : "";
}

export const finalizeAccountRegistration = protectedOnCall(
  "finalizeAccountRegistration",
  callableOptions,
  async (request) => {
    const uid = requireVerifiedUser(request);
    const signInProvider = getSignInProvider(request.auth?.token ?? {});
    const authProvider =
      signInProvider === "google.com" ? "google" : signInProvider === "password" ? "password" : "";

    if (!authProvider) {
      throw new HttpsError(
        "failed-precondition",
        "Este método de autenticação não pode concluir o cadastro.",
      );
    }

    const acceptedTerms = request.data?.acceptedTerms === true;
    const database = getFirestore();
    const accountReference = database.doc(`accounts/${uid}`);
    const pendingReference = database.doc(`pendingAccounts/${uid}`);

    const created = await database.runTransaction(async (transaction) => {
      const [account, pending] = await Promise.all([
        transaction.get(accountReference),
        transaction.get(pendingReference),
      ]);

      if (account.exists) {
        return false;
      }

      const pendingData = pending.data();
      const hasValidPendingAccount =
        pending.exists &&
        pendingData?.uid === uid &&
        pendingData.authProvider === authProvider &&
        Boolean(pendingData.termsAcceptedAt);

      if (!hasValidPendingAccount && !acceptedTerms) {
        throw new HttpsError(
          "failed-precondition",
          "Aceite os Termos de Uso para concluir o cadastro desta identidade.",
        );
      }

      transaction.create(accountReference, {
        authProvider,
        createdAt: FieldValue.serverTimestamp(),
        termsAcceptedAt: hasValidPendingAccount
          ? pendingData?.termsAcceptedAt
          : FieldValue.serverTimestamp(),
        uid,
      });

      if (pending.exists) {
        transaction.delete(pendingReference);
      }

      return true;
    });

    return { created };
  },
);
