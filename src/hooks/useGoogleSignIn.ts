import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useRef, useState } from "react";
import { getGoogleClientIds, isFirebaseConfigured } from "../config/firebase";
import {
  GoogleAuthCancelledError,
  GoogleAuthConfigurationError,
  GoogleIdentity,
  assertGoogleAuthConfigured,
  signInWithGoogleIdToken
} from "../services/googleAuth";
import type { UseGoogleSignInResult } from "./useGoogleSignIn.types";

WebBrowser.maybeCompleteAuthSession();

export function useGoogleSignIn(): UseGoogleSignInResult {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const resolveRef = useRef<((identity: GoogleIdentity) => void) | null>(null);
  const rejectRef = useRef<((error: unknown) => void) | null>(null);
  const clientIds = getGoogleClientIds();
  const isAvailable = isFirebaseConfigured() && Boolean(clientIds.webClientId);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: clientIds.androidClientId,
    iosClientId: clientIds.iosClientId,
    // expo-auth-session exige string; sem Client ID o botão fica indisponível.
    webClientId: clientIds.webClientId || "missing-web-client-id.apps.googleusercontent.com"
  });

  const settleError = useCallback((error: unknown) => {
    const reject = rejectRef.current;
    resolveRef.current = null;
    rejectRef.current = null;
    setIsSigningIn(false);

    if (reject) {
      reject(error);
    }
  }, []);

  const settleSuccess = useCallback((identity: GoogleIdentity) => {
    const resolve = resolveRef.current;
    resolveRef.current = null;
    rejectRef.current = null;
    setIsSigningIn(false);

    if (resolve) {
      resolve(identity);
    }
  }, []);

  useEffect(() => {
    if (!response) {
      return;
    }

    if (response.type === "dismiss" || response.type === "cancel") {
      settleError(new GoogleAuthCancelledError());
      return;
    }

    if (response.type !== "success") {
      settleError(
        new Error("Não foi possível concluir o login com Google. Tente novamente.")
      );
      return;
    }

    const idToken = response.params.id_token;

    if (!idToken) {
      settleError(
        new Error("O Google não retornou um token válido. Verifique o Client ID.")
      );
      return;
    }

    void signInWithGoogleIdToken(idToken)
      .then(settleSuccess)
      .catch(settleError);
  }, [response, settleError, settleSuccess]);

  const signInWithGoogle = useCallback(async () => {
    assertGoogleAuthConfigured();

    if (!clientIds.webClientId) {
      throw new GoogleAuthConfigurationError(
        "Defina EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID no .env para login Google no mobile."
      );
    }

    if (!request) {
      throw new GoogleAuthConfigurationError(
        "Login Google ainda não está pronto. Confira os Client IDs no .env e reinicie o Expo."
      );
    }

    setIsSigningIn(true);

    return new Promise<GoogleIdentity>((resolve, reject) => {
      resolveRef.current = resolve;
      rejectRef.current = reject;

      void promptAsync().then((result) => {
        if (result.type === "dismiss" || result.type === "cancel") {
          settleError(new GoogleAuthCancelledError());
        }
      });
    });
  }, [clientIds.webClientId, promptAsync, request, settleError]);

  return {
    isAvailable,
    isReady: Boolean(request) && Boolean(clientIds.webClientId),
    isSigningIn,
    signInWithGoogle
  };
}
