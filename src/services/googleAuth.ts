import {
  GoogleAuthProvider,
  User,
  signInWithCredential,
  signInWithPopup,
  signOut
} from "firebase/auth";
import { Platform } from "react-native";
import {
  getFirebaseAuth,
  getGoogleClientIds,
  isFirebaseConfigured
} from "../config/firebase";

export type GoogleIdentity = {
  email: string;
  name: string;
  photoURL?: string;
  uid: string;
};

export class GoogleAuthConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoogleAuthConfigurationError";
  }
}

export class GoogleAuthCancelledError extends Error {
  constructor() {
    super("Login com Google cancelado.");
    this.name = "GoogleAuthCancelledError";
  }
}

function toGoogleIdentity(user: User): GoogleIdentity {
  const email = user.email?.trim().toLowerCase();

  if (!email) {
    throw new Error(
      "A conta Google não retornou um email. Use outra conta ou o login por email."
    );
  }

  return {
    email,
    name: user.displayName?.trim() || email.split("@")[0] || "Usuário",
    uid: user.uid,
    ...(user.photoURL ? { photoURL: user.photoURL } : {})
  };
}

export function assertGoogleAuthConfigured() {
  if (!isFirebaseConfigured()) {
    throw new GoogleAuthConfigurationError(
      "Configure as variaveis EXPO_PUBLIC_FIREBASE_* no arquivo .env para ativar o login com Google."
    );
  }

  // Na web o Firebase popup usa o Client ID do próprio projeto Firebase.
  // No mobile o expo-auth-session ainda precisa do Web Client ID OAuth.
  if (Platform.OS !== "web" && !getGoogleClientIds().webClientId) {
    throw new GoogleAuthConfigurationError(
      "Defina EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID no .env para login Google no mobile."
    );
  }
}

export async function signInWithGoogleOnWeb(): Promise<GoogleIdentity> {
  assertGoogleAuthConfigured();

  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  provider.addScope("profile");
  provider.addScope("email");

  const result = await signInWithPopup(auth, provider);
  return toGoogleIdentity(result.user);
}

export async function signInWithGoogleIdToken(
  idToken: string
): Promise<GoogleIdentity> {
  assertGoogleAuthConfigured();

  const auth = getFirebaseAuth();
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  return toGoogleIdentity(result.user);
}

export async function signOutFromGoogle() {
  if (!isFirebaseConfigured()) {
    return;
  }

  try {
    await signOut(getFirebaseAuth());
  } catch {
    // Sessão local do app continua independente do Firebase.
  }
}
