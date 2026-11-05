import type { AccountProfile } from "../domain/types.ts";
import { InvalidPublicProfileError } from "../domain/errors.ts";
import type { ProfileWrite, ProfileRepository } from "./profileRepository.ts";
import { isValidUsername, normalizeUsername } from "../../../utils/userIdentity.ts";
import { MAX_PROFILE_TAGS, normalizeTagList } from "../../../utils/tagCatalog.ts";
export function normalizeProfileWrite(
  uid: string,
  profile: AccountProfile,
  photoURL = "",
): ProfileWrite {
  if (
    profile.age === null ||
    !Number.isInteger(profile.age) ||
    profile.age < 5 ||
    profile.age > 100
  )
    throw new InvalidPublicProfileError();
  const username = normalizeUsername(profile.username);
  const normalizedProfile: ProfileWrite = {
    age: profile.age,
    bio: profile.bio.trim(),
    city: profile.city.trim(),
    club: profile.club.trim(),
    interestTags: normalizeTagList(profile.interestTags, MAX_PROFILE_TAGS),
    name: profile.name.trim(),
    photoURL: photoURL.trim(),
    position: profile.position.trim(),
    sport: profile.sport.trim(),
    profileCompleted: true as const,
    uid,
    username,
  };

  if (
    !isValidUsername(username) ||
    normalizedProfile.name.length < 3 ||
    normalizedProfile.name.length > 80 ||
    normalizedProfile.bio.length < 10 ||
    normalizedProfile.bio.length > 240 ||
    normalizedProfile.position.length < 2 ||
    normalizedProfile.position.length > 40 ||
    normalizedProfile.sport.length < 2 ||
    normalizedProfile.sport.length > 40 ||
    normalizedProfile.city.length < 2 ||
    normalizedProfile.city.length > 80 ||
    normalizedProfile.club.length > 80 ||
    (normalizedProfile.club.length > 0 && normalizedProfile.club.length < 2) ||
    normalizedProfile.photoURL.length > 2048
  ) {
    throw new InvalidPublicProfileError();
  }

  return normalizedProfile;
}
export function createProfileCommands(dependencies: {
  repository: Pick<ProfileRepository, "saveWithUsername">;
  currentIdentity: () => { uid: string; emailVerified: boolean } | null;
}) {
  return {
    async save(uid: string, profile: AccountProfile, photoURL = "") {
      const user = dependencies.currentIdentity();
      if (!user || !user.emailVerified || user.uid !== uid) throw new InvalidPublicProfileError();
      const normalized = normalizeProfileWrite(uid, profile, photoURL);
      await dependencies.repository.saveWithUsername(normalized);
      return normalized;
    },
  };
}
