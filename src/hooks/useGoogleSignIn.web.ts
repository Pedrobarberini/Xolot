import { useCallback, useState } from "react";
import { isFirebaseConfigured } from "../config/firebase";
import {
  GoogleIdentity,
  assertGoogleAuthConfigured,
  signInWithGoogleOnWeb
} from "../services/googleAuth";
import type { UseGoogleSignInResult } from "./useGoogleSignIn.types";

export function useGoogleSignIn(): UseGoogleSignInResult {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const isAvailable = isFirebaseConfigured();

  const signInWithGoogle = useCallback(async (): Promise<GoogleIdentity> => {
    assertGoogleAuthConfigured();
    setIsSigningIn(true);

    try {
      return await signInWithGoogleOnWeb();
    } finally {
      setIsSigningIn(false);
    }
  }, []);

  return {
    isAvailable,
    isReady: isAvailable,
    isSigningIn,
    signInWithGoogle
  };
}
