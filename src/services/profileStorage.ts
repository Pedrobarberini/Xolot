import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  parseProfileAvatars,
  serializeProfileAvatars
} from "../repositories/profileAvatarSchema";
import { ProfileAvatarsByProfile } from "../types";

const PROFILE_AVATARS_STORAGE_KEY = "@nextstar/profile-avatars-v1";

export async function loadProfileAvatars(): Promise<ProfileAvatarsByProfile> {
  try {
    const storedValue = await AsyncStorage.getItem(PROFILE_AVATARS_STORAGE_KEY);

    return parseProfileAvatars(storedValue);
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
