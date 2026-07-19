import type { GoogleIdentity } from "../services/googleAuth";

export type UseGoogleSignInResult = {
  isAvailable: boolean;
  isReady: boolean;
  isSigningIn: boolean;
  signInWithGoogle: () => Promise<GoogleIdentity>;
};
