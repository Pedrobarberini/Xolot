import type { AuthenticatedUser, AuthIdentity } from "../domain/types";

export type SessionRepository = {
  isAvailable: () => boolean;
  observe: (
    onIdentity: (identity: AuthIdentity | null) => void,
    onError: (error: unknown) => void,
  ) => () => void;
  loadAccount: (identity: AuthIdentity) => Promise<AuthenticatedUser>;
  hasAccount: (uid: string) => Promise<boolean>;
  watchAccount: (
    identity: AuthIdentity,
    onAccount: (account: AuthenticatedUser) => void,
    onError: (error: unknown) => void,
  ) => () => void;
  signOut: (expectedUid: string) => Promise<void>;
};

export type SessionState = {
  status: "restoring" | "signedOut" | "registrationRequired" | "authenticated" | "error";
  isSessionLoaded: boolean;
  sessionError: string;
  user: AuthenticatedUser | null;
};
