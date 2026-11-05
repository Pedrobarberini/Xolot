import { getFirebaseFirestore } from "../config/firebase";
import { getCurrentFirebaseUser } from "./authServices";
import { createProfileCommands } from "../features/profiles";
import { createFirebaseProfileRepository } from "../features/profiles/data/firebaseProfileRepository";
export const profileRepository = createFirebaseProfileRepository(getFirebaseFirestore);
export const { save: saveFirebaseProfile } = createProfileCommands({
  repository: profileRepository,
  currentIdentity: getCurrentFirebaseUser,
});
