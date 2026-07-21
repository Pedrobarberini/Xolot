import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  parseProfileAvatars,
  serializeProfileAvatars
} from "../repositories/profileAvatarSchema";
import { ProfileAvatarsByProfile } from "../types";

const PROFILE_AVATARS_STORAGE_KEY = "@xolot/profile-avatars-v1";
const LEGACY_PROFILE_AVATARS_STORAGE_KEY = "@nextstar/profile-avatars-v1";

export async function loadProfileAvatars(): Promise<ProfileAvatarsByProfile> {
  try {
    const storedValue = await AsyncStorage.getItem(PROFILE_AVATARS_STORAGE_KEY);

    if (storedValue) {
      return parseProfileAvatars(storedValue);
    }

    const legacyValue = await AsyncStorage.getItem(
      LEGACY_PROFILE_AVATARS_STORAGE_KEY
    );
    const migratedAvatars = parseProfileAvatars(legacyValue);

    if (legacyValue) {
      await AsyncStorage.setItem(
        PROFILE_AVATARS_STORAGE_KEY,
        serializeProfileAvatars(migratedAvatars)
      );
    }

    return migratedAvatars;
  } catch {
    return {};
  }
}

export async function saveProfileAvatars(
  profileAvatars: ProfileAvatarsByProfile
) {
  await AsyncStorage.setItem(
    PROFILE_AVATARS_STORAGE_KEY,
    serializeProfileAvatars(profileAvatars)
  );
}
