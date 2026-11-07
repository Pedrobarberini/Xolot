import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { ReCaptchaEnterpriseProvider, initializeAppCheck } from "firebase/app-check";
import type { Auth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { Functions, getFunctions } from "firebase/functions";
import { FirebaseStorage, getStorage } from "firebase/storage";
import { Platform } from "react-native";
import { initializeFirebaseAuth } from "./firebaseAuth";
import { appCheckPolicy, createAppCheckInitializer } from "./appCheckPolicy";
import { appCheckRequiredForPlatform, firebaseApiKeyForPlatform } from "./firebaseClientPolicy";

export type FirebasePublicConfig = {
  apiKey: string;
  appId: string;
  authDomain: string;
  messagingSenderId: string;
  projectId: string;
  storageBucket?: string;
};

function readConfig(): FirebasePublicConfig | null {
  const apiKey = firebaseApiKeyForPlatform(
    Platform.OS,
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    process.env.EXPO_PUBLIC_FIREBASE_WEB_API_KEY,
  );
  const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim();
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const storageBucket = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();
  const messagingSenderId = process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim();
  const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID?.trim();

  if (!apiKey || !authDomain || !projectId || !messagingSenderId || !appId) {
    return null;
  }

  return {
    apiKey,
    appId,
    authDomain,
    messagingSenderId,
    projectId,
    ...(storageBucket ? { storageBucket } : {}),
  };
}

const firebaseConfig = readConfig();
let firebaseAuth: Auth | null = null;
let firebaseFunctions: Functions | null = null;
let firebaseStorage: FirebaseStorage | null = null;

const initializeClientProtection = createAppCheckInitializer((siteKey) => {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig!);
  initializeAppCheck(app, {
    isTokenAutoRefreshEnabled: true,
    provider: new ReCaptchaEnterpriseProvider(siteKey),
  });
});

export function isFirebaseConfigured() {
  return firebaseConfig !== null;
}

export function getFirebaseApp(): FirebaseApp {
  if (!firebaseConfig) {
    throw new Error(
      "Firebase não configurado. Defina as variáveis EXPO_PUBLIC_FIREBASE_* no arquivo .env.",
    );
  }

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  initializeClientProtection(
    appCheckPolicy(
      Platform.OS,
      process.env.EXPO_PUBLIC_FIREBASE_APPCHECK_SITE_KEY,
      appCheckRequiredForPlatform(
        Platform.OS,
        process.env.EXPO_PUBLIC_REQUIRE_APP_CHECK === "true",
        process.env.EXPO_PUBLIC_REQUIRE_WEB_APP_CHECK === "true",
      ),
    ),
  );
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!firebaseAuth) {
    firebaseAuth = initializeFirebaseAuth(getFirebaseApp());
    firebaseAuth.languageCode = "pt-BR";
  }

  return firebaseAuth;
}

export function getFirebaseFirestore(): Firestore {
  return getFirestore(getFirebaseApp());
}

export function isFirebaseStorageConfigured() {
  return Boolean(firebaseConfig?.storageBucket);
}

export function isR2MediaEnabled() {
  return process.env.EXPO_PUBLIC_R2_MEDIA_ENABLED?.trim().toLowerCase() === "true";
}

export function isFirebaseMediaEnabled() {
  return (
    isR2MediaEnabled() ||
    (process.env.EXPO_PUBLIC_FIREBASE_MEDIA_ENABLED?.trim().toLowerCase() === "true" &&
      isFirebaseStorageConfigured())
  );
}

export function getFirebaseFunctions(): Functions {
  if (!firebaseFunctions) {
    firebaseFunctions = getFunctions(getFirebaseApp(), "southamerica-east1");
  }
  return firebaseFunctions;
}

export function getR2PublicMediaUrl() {
  return (
    process.env.EXPO_PUBLIC_R2_MEDIA_URL?.trim().replace(/\/$/, "") || "https://media.xolot.com.br"
  );
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!isFirebaseStorageConfigured()) {
    throw new Error(
      "Firebase Storage não configurado. Defina EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET.",
    );
  }

  if (!firebaseStorage) {
    firebaseStorage = getStorage(getFirebaseApp());
  }

  return firebaseStorage;
}

export function getGoogleClientIds() {
  return {
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?.trim(),
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim(),
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim(),
  };
}

export function getPublicAppUrl() {
  return process.env.EXPO_PUBLIC_APP_URL?.trim() || "https://xolot.com.br";
}
