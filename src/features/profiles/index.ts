export type { AccountProfile, PublicProfileDocument, SocialUser } from "./domain/types";
export { toSocialUser } from "./application/profileView.ts";
export type {
  ProfileReader,
  ProfileRepository,
  ProfileWrite,
} from "./application/profileRepository";
export { createProfileCommands, normalizeProfileWrite } from "./application/saveProfile.ts";
export { UsernameAlreadyInUseError, InvalidPublicProfileError } from "./domain/errors.ts";
export {
  getProfileAreaSuggestions,
  getProfilePresentationSuggestions,
} from "./domain/presentationCatalog.ts";
