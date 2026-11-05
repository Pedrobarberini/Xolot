import {
  getFirebaseAuth,
  getFirebaseFirestore,
  getFirebaseFunctions,
  getPublicAppUrl,
  isFirebaseConfigured,
} from "../config/firebase";
import { createFirebaseAccountGateway } from "../features/auth/data/firebaseAccountGateway";
import { createFirebaseSessionRepository } from "../features/auth/data/firebaseSessionRepository";
import { createFirebaseProfileReader } from "../features/profiles/data/firebaseProfileReader";
const gateway = createFirebaseAccountGateway({
  getFirebaseAuth,
  getFirebaseFirestore,
  getFirebaseFunctions,
  getPublicAppUrl,
  isFirebaseConfigured,
});
export const sessionRepository = createFirebaseSessionRepository({
  accounts: gateway,
  profiles: createFirebaseProfileReader(getFirebaseFirestore),
  isAvailable: isFirebaseConfigured,
});
export const {
  hasFirebaseAccount,
  sendFirebasePasswordReset,
  observeFirebaseAuth,
  getCurrentFirebaseUser,
  deleteCurrentFirebaseAccount,
  signOutFirebaseSession,
  completeCurrentFirebaseAccountRegistration,
  registerWithEmailAndPassword,
  signInWithEmailAndPasswordSecurely,
} = gateway;
