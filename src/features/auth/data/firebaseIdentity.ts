import type { User } from "firebase/auth";
import type { AuthIdentity } from "../domain/types";

export function isGoogleFirebaseUser(user: User) {
  return user.providerData.some((provider) => provider.providerId === "google.com");
}

export function firebaseIdentity(user: User): AuthIdentity {
  return {
    uid: user.uid,
    email: user.email ?? "",
    emailVerified: user.emailVerified,
    hasGoogleProvider: isGoogleFirebaseUser(user),
    provider: user.providerData.some((provider) => provider.providerId === "apple.com")
      ? "apple"
      : isGoogleFirebaseUser(user)
        ? "google"
        : "password",
    displayName: user.displayName ?? "",
    photoURL: user.photoURL ?? "",
    // Autoridade de cadastro permanece em accounts/callable; compatibilidade v1.
    acceptedTerms: true,
  };
}
