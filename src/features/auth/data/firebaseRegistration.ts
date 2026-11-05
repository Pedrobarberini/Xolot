import { FirebaseError } from "firebase/app";
import {
  type User,
  createUserWithEmailAndPassword,
  deleteUser,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import {
  EmailVerificationRequiredError,
  AccountRegistrationRequiredError,
  AccountCompletionRequiredError,
} from "../domain/errors.ts";
import { isGoogleFirebaseUser } from "./firebaseIdentity.ts";
import type { FirebaseAccountDependencies } from "./firebaseDependencies.ts";
export function createFirebaseRegistrationCommands(
  dependencies: FirebaseAccountDependencies & {
    assertFirebaseAvailable: () => void;
    hasFirebaseAccount: (uid: string) => Promise<boolean>;
  },
) {
  const {
    getFirebaseAuth,
    getFirebaseFirestore,
    getFirebaseFunctions,
    getPublicAppUrl,
    assertFirebaseAvailable,
    hasFirebaseAccount,
  } = dependencies;
  function getPendingAccountReference(uid: string) {
    return doc(getFirebaseFirestore(), "pendingAccounts", uid);
  }
  async function createPendingFirebaseAccount(user: User, acceptedTerms: boolean) {
    if (!acceptedTerms || !user.uid) {
      throw new Error("Aceite os termos para criar a conta.");
    }

    await setDoc(getPendingAccountReference(user.uid), {
      authProvider: "password",
      createdAt: serverTimestamp(),
      termsAcceptedAt: serverTimestamp(),
      uid: user.uid,
    });
  }

  async function activateVerifiedFirebaseAccount(user: User, acceptedTerms = false) {
    if (!user.uid || !user.emailVerified) {
      throw new EmailVerificationRequiredError();
    }

    const finalizeAccount = httpsCallable<{ acceptedTerms: boolean }, { created: boolean }>(
      getFirebaseFunctions(),
      "finalizeAccountRegistration",
    );

    try {
      await finalizeAccount({ acceptedTerms });
    } catch (error) {
      if (error instanceof FirebaseError && error.code === "functions/failed-precondition") {
        throw new AccountCompletionRequiredError();
      }
      throw error;
    }
  }

  async function completeCurrentFirebaseAccountRegistration(acceptedTerms: boolean) {
    assertFirebaseAvailable();

    if (!acceptedTerms) {
      throw new Error("É necessário aceitar os termos para criar a conta.");
    }

    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;

    if (!currentUser || !isGoogleFirebaseUser(currentUser)) {
      throw new AccountRegistrationRequiredError();
    }

    await currentUser.reload();
    const authenticatedUser = auth.currentUser ?? currentUser;
    await authenticatedUser.getIdToken(true);
    await activateVerifiedFirebaseAccount(authenticatedUser, true);

    return authenticatedUser;
  }

  async function registerWithEmailAndPassword(
    email: string,
    password: string,
    acceptedTerms: boolean,
  ) {
    assertFirebaseAvailable();

    if (!acceptedTerms) {
      throw new Error("É necessário aceitar os termos para criar a conta.");
    }

    const auth = getFirebaseAuth();
    const credential = await createUserWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password,
    );

    try {
      await sendEmailVerification(credential.user, {
        url: `${getPublicAppUrl()}/?emailVerified=1`,
      });
      await createPendingFirebaseAccount(credential.user, acceptedTerms);
    } catch (error) {
      await deleteUser(credential.user).catch(() => undefined);
      throw error;
    } finally {
      await signOut(auth).catch(() => undefined);
    }
  }

  async function signInWithEmailAndPasswordSecurely(
    email: string,
    password: string,
    acceptedTerms = false,
  ) {
    assertFirebaseAvailable();
    const auth = getFirebaseAuth();
    const credential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);

    await credential.user.reload();
    const authenticatedUser = auth.currentUser ?? credential.user;
    await authenticatedUser.getIdToken(true);

    if (!authenticatedUser.emailVerified) {
      await sendEmailVerification(authenticatedUser, {
        url: `${getPublicAppUrl()}/?emailVerified=1`,
      }).catch(() => undefined);
      await signOut(auth).catch(() => undefined);
      throw new EmailVerificationRequiredError();
    }

    try {
      if (!(await hasFirebaseAccount(authenticatedUser.uid))) {
        await activateVerifiedFirebaseAccount(authenticatedUser, acceptedTerms);
      }
    } catch (error) {
      await signOut(auth).catch(() => undefined);
      throw error;
    }

    return authenticatedUser;
  }

  return {
    completeCurrentFirebaseAccountRegistration,
    registerWithEmailAndPassword,
    signInWithEmailAndPasswordSecurely,
  };
}
