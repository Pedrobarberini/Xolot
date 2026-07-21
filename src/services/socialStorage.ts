import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ConversationPreferencesByUser,
  DirectMessage,
  FollowingByUser,
  HiddenPlayerIdsByUser,
  MessageContactsByUser,
  SocialSelectionsByUser
} from "../types";

const SOCIAL_STORAGE_KEY = "@xolot/social-state-v1";
const LEGACY_SOCIAL_STORAGE_KEY = "@nextstar/social-state-v1";

export type SocialState = {
  blockedProfileIdsByUser: SocialSelectionsByUser;
  conversationPreferencesByUser: ConversationPreferencesByUser;
  directMessages: DirectMessage[];
  followingByUser: FollowingByUser;
  hiddenPlayerIdsByUser: HiddenPlayerIdsByUser;
  interestedContentKeysByUser: SocialSelectionsByUser;
  likedPlayerIdsByUser: SocialSelectionsByUser;
  messageContactsByUser: MessageContactsByUser;
  mutedContentKeysByUser: SocialSelectionsByUser;
  viewedPlayerIdsByUser: SocialSelectionsByUser;
};

export const emptySocialState: SocialState = {
  blockedProfileIdsByUser: {},
  conversationPreferencesByUser: {},
  directMessages: [],
  followingByUser: {},
  hiddenPlayerIdsByUser: {},
  interestedContentKeysByUser: {},
  likedPlayerIdsByUser: {},
  messageContactsByUser: {},
  mutedContentKeysByUser: {},
  viewedPlayerIdsByUser: {}
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

function normalizeSelectionsByUser(value: unknown): SocialSelectionsByUser {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).map(([userId, selections]) => [
      userId,
      normalizeStringArray(selections)
    ])
  );
}

export async function loadSocialState(): Promise<SocialState> {
  try {
    const currentState = await AsyncStorage.getItem(SOCIAL_STORAGE_KEY);
    const storedState =
      currentState ?? await AsyncStorage.getItem(LEGACY_SOCIAL_STORAGE_KEY);

    if (!storedState) {
      return emptySocialState;
    }

    const parsedState = JSON.parse(storedState) as Partial<SocialState>;

    const normalizedState = {
      blockedProfileIdsByUser: normalizeSelectionsByUser(
        parsedState.blockedProfileIdsByUser
      ),
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
      hiddenPlayerIdsByUser:
        parsedState.hiddenPlayerIdsByUser &&
        typeof parsedState.hiddenPlayerIdsByUser === "object"
          ? Object.fromEntries(
              Object.entries(parsedState.hiddenPlayerIdsByUser).map(
                ([userId, playerIds]) => [
                  userId,
                  normalizeStringArray(playerIds)
                ]
              )
            )
          : {},
      interestedContentKeysByUser: normalizeSelectionsByUser(
        parsedState.interestedContentKeysByUser
      ),
      likedPlayerIdsByUser: normalizeSelectionsByUser(
        parsedState.likedPlayerIdsByUser
      ),
      messageContactsByUser:
        parsedState.messageContactsByUser &&
        typeof parsedState.messageContactsByUser === "object"
          ? parsedState.messageContactsByUser
          : {},
      mutedContentKeysByUser: normalizeSelectionsByUser(
        parsedState.mutedContentKeysByUser
      ),
      viewedPlayerIdsByUser: normalizeSelectionsByUser(
        parsedState.viewedPlayerIdsByUser
      )
    };

    if (!currentState) {
      await AsyncStorage.setItem(
        SOCIAL_STORAGE_KEY,
        JSON.stringify(normalizedState)
      );
    }

    return normalizedState;
  } catch {
    return emptySocialState;
  }
}

export async function saveSocialState(state: SocialState) {
  await AsyncStorage.setItem(SOCIAL_STORAGE_KEY, JSON.stringify(state));
}
