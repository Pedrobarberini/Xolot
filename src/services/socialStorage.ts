import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ConversationPreferencesByUser,
  DirectMessage,
  FollowingByUser,
  MessageContactsByUser
} from "../types";

const SOCIAL_STORAGE_KEY = "@nextstar/social-state-v1";

export type SocialState = {
  conversationPreferencesByUser: ConversationPreferencesByUser;
  directMessages: DirectMessage[];
  followingByUser: FollowingByUser;
  messageContactsByUser: MessageContactsByUser;
};

export const emptySocialState: SocialState = {
  conversationPreferencesByUser: {},
  directMessages: [],
  followingByUser: {},
  messageContactsByUser: {}
};

function normalizeStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function normalizeConversationPreferences(
  value: unknown
): ConversationPreferencesByUser {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).map(([userId, preferences]) => {
      const normalized =
        preferences && typeof preferences === "object" && !Array.isArray(preferences)
          ? (preferences as Record<string, unknown>)
          : {};
      const deletedAtByContactId =
        normalized.deletedAtByContactId &&
        typeof normalized.deletedAtByContactId === "object" &&
        !Array.isArray(normalized.deletedAtByContactId)
          ? Object.fromEntries(
              Object.entries(normalized.deletedAtByContactId).filter(
                ([contactId, deletedAt]) =>
                  contactId.length > 0 && typeof deletedAt === "string"
              )
            )
          : {};

      return [
        userId,
        {
          deletedAtByContactId,
          mutedContactIds: normalizeStringArray(normalized.mutedContactIds),
          pinnedContactIds: normalizeStringArray(
            normalized.pinnedContactIds
          ).slice(0, 3)
        }
      ];
    })
  );
}

export async function loadSocialState(): Promise<SocialState> {
  try {
    const storedState = await AsyncStorage.getItem(SOCIAL_STORAGE_KEY);

    if (!storedState) {
      return emptySocialState;
    }

    const parsedState = JSON.parse(storedState) as Partial<SocialState>;

    return {
      conversationPreferencesByUser: normalizeConversationPreferences(
        parsedState.conversationPreferencesByUser
      ),
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
