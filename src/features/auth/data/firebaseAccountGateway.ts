import { type User, onAuthStateChanged, sendPasswordResetEmail, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { FirebaseUnavailableError } from "../domain/errors.ts";
import { createFirebaseRegistrationCommands } from "./firebaseRegistration.ts";
import type { FirebaseAccountDependencies } from "./firebaseDependencies.ts";
export function createFirebaseAccountGateway(dependencies: FirebaseAccountDependencies) {
  const {
    getFirebaseAuth,
    getFirebaseFirestore,
    getFirebaseFunctions,
    getPublicAppUrl,
    isFirebaseConfigured,
  } = dependencies;
  const ACCOUNTS_COLLECTION = "accounts";
  function assertFirebaseAvailable() {
    if (!isFirebaseConfigured()) {
      throw new FirebaseUnavailableError();
    }
  }

  function getAccountReference(uid: string) {
    return doc(getFirebaseFirestore(), ACCOUNTS_COLLECTION, uid);
  }

  async function hasFirebaseAccount(uid: string) {
    assertFirebaseAvailable();
    return (await getDoc(getAccountReference(uid))).exists();
  }

  async function sendFirebasePasswordReset(email: string) {
    assertFirebaseAvailable();
    await sendPasswordResetEmail(getFirebaseAuth(), email.trim().toLowerCase(), {
      url: getPublicAppUrl(),
    });
  }

  function observeFirebaseAuth(
    onChange: (user: User | null) => void,
    onError?: (error: Error) => void,
  ) {
    assertFirebaseAvailable();
    return onAuthStateChanged(getFirebaseAuth(), onChange, onError);
  }

  function getCurrentFirebaseUser() {
    return isFirebaseConfigured() ? getFirebaseAuth().currentUser : null;
  }

  async function deleteCurrentFirebaseAccount() {
    assertFirebaseAvailable();
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("Entre novamente para excluir sua conta.");
    }

    const deleteAccount = httpsCallable<void, { deleted: boolean }>(
      getFirebaseFunctions(),
      "deleteOwnAccount",
    );

    const result = await deleteAccount();
    if (result.data.deleted !== true) {
      throw new Error("O servidor não confirmou a exclusão da conta.");
    }

    await signOut(auth).catch(() => undefined);
  }

  async function signOutFirebaseSession() {
    if (!isFirebaseConfigured()) {
      return;
    }

    await signOut(getFirebaseAuth());
  }

  return {
    hasFirebaseAccount,
    sendFirebasePasswordReset,
    observeFirebaseAuth,
    getCurrentFirebaseUser,
    deleteCurrentFirebaseAccount,
    signOutFirebaseSession,
    ...createFirebaseRegistrationCommands({
      ...dependencies,
      assertFirebaseAvailable,
      hasFirebaseAccount,
    }),
  };
}
