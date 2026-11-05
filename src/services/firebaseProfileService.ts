// Fachada de compatibilidade: telas migram para profiles em U04/U07.
import type { User } from "firebase/auth";
import { authenticatedAccount, onboardingAccount } from "../features/auth";
import { firebaseIdentity } from "../features/auth/data/firebaseIdentity";
import { toSocialUser } from "../features/profiles";
import type { AppUser } from "../types";
import type { PublicProfileDocument } from "../features/profiles";
import { profileRepository } from "../bootstrap/profileServices";
export { saveFirebaseProfile } from "../bootstrap/profileServices";
export { UsernameAlreadyInUseError, InvalidPublicProfileError } from "../features/profiles";
const profileReader = profileRepository;
export function createProvisionalFirebaseUser(user: User) {
  return onboardingAccount(firebaseIdentity(user));
}

export function toPublicAppUser(
  profile: PublicProfileDocument,
  currentUser?: User | null,
): AppUser {
  const social = toSocialUser(profile);
  return currentUser?.uid === profile.uid
    ? authenticatedAccount(social, firebaseIdentity(currentUser))
    : social;
}

export async function loadFirebaseAppUser(user: User) {
  const profile = await profileReader.read(user.uid);
  return profile ? toPublicAppUser(profile, user) : createProvisionalFirebaseUser(user);
}
export function subscribeFirebaseProfiles(
  currentUser: User,
  onProfiles: (profiles: AppUser[]) => void,
  onError?: (error: Error) => void,
) {
  return profileReader.watchPublic(
    currentUser.uid,
    (profiles) => onProfiles(profiles.map((profile) => toPublicAppUser(profile, currentUser))),
    onError,
  );
}
