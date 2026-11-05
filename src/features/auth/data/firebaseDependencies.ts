import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import type { Functions } from "firebase/functions";

export type FirebaseAccountDependencies = {
  getFirebaseAuth: () => Auth;
  getFirebaseFirestore: () => Firestore;
  getFirebaseFunctions: () => Functions;
  getPublicAppUrl: () => string;
  isFirebaseConfigured: () => boolean;
};
