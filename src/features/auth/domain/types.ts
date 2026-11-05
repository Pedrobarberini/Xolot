import type { AccountProfile } from "../../profiles/index";

export type UserRole = "Usuário" | "Admin";

export type AuthProvider = "password" | "google" | "apple";

export type AuthenticatedUser = AccountProfile & {
  id: string;
  email: string;
  role: UserRole;
  username: string;
  acceptedTerms: boolean;
  authProvider?: AuthProvider;
  googleUid?: string;
  photoURL?: string;
  identityVerified?: boolean;
  plusActive?: boolean;
  profileCompleted: boolean;
};

export type AuthIdentity = {
  uid: string;
  email: string;
  emailVerified: boolean;
  provider: AuthProvider;
  hasGoogleProvider?: boolean;
  displayName: string;
  photoURL: string;
  acceptedTerms: boolean;
};

export type OnboardingAccount = AuthenticatedUser & { profileCompleted: false };
