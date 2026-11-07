import type { FirebaseApp } from "firebase/app";
import { type Auth, getAuth, initializeRecaptchaConfig } from "firebase/auth";

const prepared = new WeakSet<Auth>();

export function initializeFirebaseAuth(app: FirebaseApp): Auth {
  const auth = getAuth(app);
  if (process.env.EXPO_PUBLIC_AUTH_RECAPTCHA_ENABLED === "true" && !prepared.has(auth)) {
    prepared.add(auth);
    // O SDK verifica o desafio com o Identity Platform, inclusive cadastro/login/reset.
    // Preload reduz a latência; falha não contorna a exigência configurada no servidor.
    void initializeRecaptchaConfig(auth).catch(() => {
      prepared.delete(auth);
      console.warn("Não foi possível antecipar a verificação de segurança do acesso.");
    });
  }
  return auth;
}
