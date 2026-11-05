// Compatibilidade durante a migração das telas de autenticação (U07).
export {
  FirebaseUnavailableError,
  EmailVerificationRequiredError,
  AccountRegistrationRequiredError,
  AccountCompletionRequiredError,
} from "../features/auth";
export { isGoogleFirebaseUser } from "../features/auth/data/firebaseIdentity";
export {
  getSafeFirebaseAccountDeletionMessage,
  getSafeFirebaseAuthMessage,
} from "../features/auth/data/firebaseAuthMessages";
export {
  hasFirebaseAccount,
  sendFirebasePasswordReset,
  observeFirebaseAuth,
  getCurrentFirebaseUser,
  deleteCurrentFirebaseAccount,
  signOutFirebaseSession,
  completeCurrentFirebaseAccountRegistration,
  registerWithEmailAndPassword,
  signInWithEmailAndPasswordSecurely,
} from "../bootstrap/authServices";
