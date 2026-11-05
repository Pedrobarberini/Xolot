import { authenticatedAccount, onboardingAccount } from "../application/accountView.ts";
import type { SessionRepository } from "../application/sessionRepository.ts";
import { toSocialUser, type ProfileReader } from "../../profiles/index.ts";
import type { createFirebaseAccountGateway } from "./firebaseAccountGateway.ts";
import { firebaseIdentity } from "./firebaseIdentity.ts";

export function createFirebaseSessionRepository(dependencies: {
  isAvailable: () => boolean;
  accounts: ReturnType<typeof createFirebaseAccountGateway>;
  profiles: ProfileReader;
}): SessionRepository {
  const { accounts, profiles } = dependencies;
  return {
    isAvailable: dependencies.isAvailable,
    observe: (onIdentity, onError) =>
      accounts.observeFirebaseAuth(
        (user) => onIdentity(user ? firebaseIdentity(user) : null),
        onError,
      ),
    async loadAccount(identity) {
      const profile = await profiles.read(identity.uid);
      return profile
        ? authenticatedAccount(toSocialUser(profile), identity)
        : onboardingAccount(identity);
    },
    hasAccount: accounts.hasFirebaseAccount,
    watchAccount: (identity, onAccount, onError) =>
      profiles.watchOwn(
        identity.uid,
        (profile) => {
          if (profile) onAccount(authenticatedAccount(toSocialUser(profile), identity));
        },
        onError,
      ),
    async signOut(expectedUid) {
      if (accounts.getCurrentFirebaseUser()?.uid === expectedUid)
        await accounts.signOutFirebaseSession();
    },
  };
}
