import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DirectMessage,
  FollowingByUser,
  MessageContactsByUser
} from "../types";

const SOCIAL_STORAGE_KEY = "@nextstar/social-state-v1";

export type SocialState = {
  directMessages: DirectMessage[];
  followingByUser: FollowingByUser;
  messageContactsByUser: MessageContactsByUser;
};

export const emptySocialState: SocialState = {
  directMessages: [],
  followingByUser: {},
  messageContactsByUser: {}
};

export async function loadSocialState(): Promise<SocialState> {
  try {
    const storedState = await AsyncStorage.getItem(SOCIAL_STORAGE_KEY);

    if (!storedState) {
      return emptySocialState;
    }

    const parsedState = JSON.parse(storedState) as Partial<SocialState>;

    return {
      directMessages: Array.isArray(parsedState.directMessages)
        ? parsedState.directMessages
        : [],
      followingByUser:
        parsedState.followingByUser &&
        typeof parsedState.followingByUser === "object"
          ? parsedState.followingByUser
          : {},
      messageContactsByUser:
        parsedState.messageContactsByUser &&
        typeof parsedState.messageContactsByUser === "object"
          ? parsedState.messageContactsByUser
          : {}
    };
  } catch {
    return emptySocialState;
  }
}

export async function saveSocialState(state: SocialState) {
  await AsyncStorage.setItem(SOCIAL_STORAGE_KEY, JSON.stringify(state));
}
