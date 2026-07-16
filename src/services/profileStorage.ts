import AsyncStorage from "@react-native-async-storage/async-storage";
import { ProfileAvatarsByProfile } from "../types";

const PROFILE_AVATARS_STORAGE_KEY = "@nextstar/profile-avatars-v1";

export async function loadProfileAvatars(): Promise<ProfileAvatarsByProfile> {
  try {
    const storedValue = await AsyncStorage.getItem(PROFILE_AVATARS_STORAGE_KEY);

    if (!storedValue) {
      return {};
    }

    const parsedValue = JSON.parse(storedValue);

    if (!parsedValue || typeof parsedValue !== "object") {
      return {};
    }

    const profileAvatars: ProfileAvatarsByProfile = {};

    Object.entries(parsedValue as Record<string, unknown>).forEach(
      ([profileId, uri]) => {
        if (
          profileId.trim().length > 0 &&
          typeof uri === "string" &&
          uri.trim().length > 0
        ) {
          profileAvatars[profileId] = uri;
        }
      }
    );

    return profileAvatars;
  } catch {
    return {};
  }
}

export async function saveProfileAvatars(
  profileAvatars: ProfileAvatarsByProfile
) {
  await AsyncStorage.setItem(
    PROFILE_AVATARS_STORAGE_KEY,
    JSON.stringify(profileAvatars)
  );
}
