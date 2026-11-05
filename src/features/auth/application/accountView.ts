import type { AuthIdentity, AuthenticatedUser, OnboardingAccount } from "../domain/types";
import type { SocialUser } from "../../profiles/index";
import { isValidUsername } from "../../../utils/userIdentity.ts";

export function authenticatedAccount(
  profile: SocialUser,
  identity: AuthIdentity,
): AuthenticatedUser {
  if (identity.uid !== profile.id) throw new Error("Perfil não pertence à sessão autenticada.");
  return {
    ...profile,
    acceptedTerms: identity.acceptedTerms,
    authProvider: identity.provider,
    email: identity.email.trim().toLowerCase(),
    googleUid: identity.provider === "google" ? identity.uid : undefined,
  };
}

export function onboardingAccount(identity: AuthIdentity): OnboardingAccount {
  const prefix = identity.email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9._]/g, "")
    .replace(/^[._]+|[._]+$/g, "")
    .slice(0, 30);
  return {
    acceptedTerms: identity.acceptedTerms,
    age: null,
    authProvider: identity.provider,
    bio: "",
    city: "",
    club: "",
    interestTags: [],
    email: identity.email.trim().toLowerCase(),
    googleUid: identity.provider === "google" ? identity.uid : undefined,
    id: identity.uid,
    name: identity.displayName.trim() || "Novo perfil",
    photoURL: identity.photoURL || undefined,
    position: "",
    sport: "",
    profileCompleted: false,
    role: "Usuário",
    username: isValidUsername(prefix) ? prefix : "usuario.xolot",
  };
}
