import { useEffect, useMemo, useState } from "react";
import {
  loadSocialState,
  saveSocialState
} from "../services/socialStorage";
import {
  AppUser,
  ConversationPreferencesByUser,
  DirectMessage,
  FollowingByUser,
  HiddenPlayerIdsByUser,
  MessageContact,
  MessageContactsByUser,
  Player,
  SocialSelectionsByUser
} from "../types";
import { buildFollowerUserIdsByProfile } from "../utils/profileFollowers";
import {
  EMPTY_CONVERSATION_PREFERENCES,
  filterMessagesAfterConversationDeletion,
  sortContactsByPinned,
  toggleConversationId,
  togglePinnedConversation
} from "../utils/conversations";
import { createSharedPostReference } from "../utils/socialSharing";
import {
  countSelectionsByPlayer,
  toggleSelection
} from "../utils/feedEngagement";

function upsertMessageContact(
  contacts: MessageContact[],
  contact: MessageContact
) {
  const contactExists = contacts.some((item) => item.id === contact.id);

  return contactExists
    ? contacts.map((item) => (item.id === contact.id ? contact : item))
    : [contact, ...contacts];
}

export function useSocialActions({
  players,
  user
}: {
  players: Player[];
  user: AppUser | null;
}) {
  const [followingByUser, setFollowingByUser] = useState<FollowingByUser>({});
  const [conversationPreferencesByUser, setConversationPreferencesByUser] =
    useState<ConversationPreferencesByUser>({});
  const [messageContactsByUser, setMessageContactsByUser] =
    useState<MessageContactsByUser>({});
  const [hiddenPlayerIdsByUser, setHiddenPlayerIdsByUser] =
    useState<HiddenPlayerIdsByUser>({});
  const [blockedProfileIdsByUser, setBlockedProfileIdsByUser] =
    useState<SocialSelectionsByUser>({});
  const [interestedContentKeysByUser, setInterestedContentKeysByUser] =
    useState<SocialSelectionsByUser>({});
  const [likedPlayerIdsByUser, setLikedPlayerIdsByUser] =
    useState<SocialSelectionsByUser>({});
  const [mutedContentKeysByUser, setMutedContentKeysByUser] =
    useState<SocialSelectionsByUser>({});
  const [viewedPlayerIdsByUser, setViewedPlayerIdsByUser] =
    useState<SocialSelectionsByUser>({});
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [isSocialStateLoaded, setIsSocialStateLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadSocialState().then((socialState) => {
      if (!isMounted) {
        return;
      }

      setDirectMessages(socialState.directMessages);
      setBlockedProfileIdsByUser(socialState.blockedProfileIdsByUser);
      setConversationPreferencesByUser(
        socialState.conversationPreferencesByUser
      );
      setFollowingByUser(socialState.followingByUser);
      setHiddenPlayerIdsByUser(socialState.hiddenPlayerIdsByUser);
      setInterestedContentKeysByUser(
        socialState.interestedContentKeysByUser
      );
      setLikedPlayerIdsByUser(socialState.likedPlayerIdsByUser);
      setMessageContactsByUser(socialState.messageContactsByUser);
      setMutedContentKeysByUser(socialState.mutedContentKeysByUser);
      setViewedPlayerIdsByUser(socialState.viewedPlayerIdsByUser);
      setIsSocialStateLoaded(true);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isSocialStateLoaded) {
      return;
    }

    saveSocialState({
      blockedProfileIdsByUser,
      conversationPreferencesByUser,
      directMessages,
      followingByUser,
      hiddenPlayerIdsByUser,
      interestedContentKeysByUser,
      likedPlayerIdsByUser,
      messageContactsByUser,
      mutedContentKeysByUser,
      viewedPlayerIdsByUser
    }).catch(() => undefined);
  }, [
    blockedProfileIdsByUser,
    conversationPreferencesByUser,
    directMessages,
    followingByUser,
    hiddenPlayerIdsByUser,
    interestedContentKeysByUser,
    isSocialStateLoaded,
    likedPlayerIdsByUser,
    messageContactsByUser,
    mutedContentKeysByUser,
    viewedPlayerIdsByUser
  ]);

  const followingProfileIds = useMemo(
    () => (user ? followingByUser[user.id] ?? [] : []),
    [followingByUser, user]
  );
  const followingProfileSet = useMemo(
    () => new Set(followingProfileIds),
    [followingProfileIds]
  );
  const followersByProfile = useMemo(() => {
    const followerCounts: Record<string, number> = {};

    Object.values(followingByUser).forEach((profileIds) => {
      new Set(profileIds).forEach((profileId) => {
        followerCounts[profileId] = (followerCounts[profileId] ?? 0) + 1;
      });
    });

    return followerCounts;
  }, [followingByUser]);
  const followerUserIdsByProfile = useMemo(
    () => buildFollowerUserIdsByProfile(followingByUser),
    [followingByUser]
  );
  const currentConversationPreferences = user
    ? conversationPreferencesByUser[user.id] ?? EMPTY_CONVERSATION_PREFERENCES
    : EMPTY_CONVERSATION_PREFERENCES;
  const currentMessageContacts = useMemo(
    () =>
      sortContactsByPinned(
        user ? messageContactsByUser[user.id] ?? [] : [],
        currentConversationPreferences.pinnedContactIds
      ),
    [currentConversationPreferences.pinnedContactIds, messageContactsByUser, user]
  );
  const hiddenPlayerIds = useMemo(
    () => (user ? hiddenPlayerIdsByUser[user.id] ?? [] : []),
    [hiddenPlayerIdsByUser, user]
  );
  const hiddenPlayerIdSet = useMemo(
    () => new Set(hiddenPlayerIds),
    [hiddenPlayerIds]
  );
  const blockedProfileIds = useMemo(
    () => (user ? blockedProfileIdsByUser[user.id] ?? [] : []),
    [blockedProfileIdsByUser, user]
  );
  const blockedProfileIdSet = useMemo(
    () => new Set(blockedProfileIds),
    [blockedProfileIds]
  );
  const interestedContentKeys = useMemo(
    () => (user ? interestedContentKeysByUser[user.id] ?? [] : []),
    [interestedContentKeysByUser, user]
  );
  const interestedContentKeySet = useMemo(
    () => new Set(interestedContentKeys),
    [interestedContentKeys]
  );
  const likedPlayerIds = useMemo(
    () => (user ? likedPlayerIdsByUser[user.id] ?? [] : []),
    [likedPlayerIdsByUser, user]
  );
  const likedPlayerIdSet = useMemo(
    () => new Set(likedPlayerIds),
    [likedPlayerIds]
  );
  const mutedContentKeys = useMemo(
    () => (user ? mutedContentKeysByUser[user.id] ?? [] : []),
    [mutedContentKeysByUser, user]
  );
  const mutedContentKeySet = useMemo(
    () => new Set(mutedContentKeys),
    [mutedContentKeys]
  );
  const likeCountsByPlayer = useMemo(
    () => countSelectionsByPlayer(likedPlayerIdsByUser),
    [likedPlayerIdsByUser]
  );
  const viewCountsByPlayer = useMemo(
    () => countSelectionsByPlayer(viewedPlayerIdsByUser),
    [viewedPlayerIdsByUser]
  );
  const currentDirectMessages = useMemo(
    () =>
      user
        ? filterMessagesAfterConversationDeletion(
            directMessages,
            user.id,
            currentConversationPreferences.deletedAtByContactId
          )
        : [],
    [currentConversationPreferences.deletedAtByContactId, directMessages, user]
  );
  const ownPlayer = user
    ? players.find((player) => player.ownerUserId === user.id)
    : undefined;
  const ownProfileId = user
    ? ownPlayer?.profileId ?? `profile-${user.id}`
    : undefined;

  function addMessageContact(contact: MessageContact) {
    if (!user) {
      return;
    }

    setMessageContactsByUser((current) => ({
      ...current,
      [user.id]: upsertMessageContact(current[user.id] ?? [], contact)
    }));
  }

  function sendMessageToContact(
    contact: MessageContact,
    body: string,
    sharedPost?: DirectMessage["sharedPost"]
  ) {
    const trimmedBody = body.trim();

    if (!user || !trimmedBody) {
      return;
    }

    const reciprocalContact: MessageContact = {
      id: user.id,
      profileId: ownPlayer?.profileId ?? `profile-${user.id}`,
      name: ownPlayer?.name ?? user.name,
      subtitle: ownPlayer
        ? `${ownPlayer.position} | ${ownPlayer.city}`
        : "Usuário Xolot",
      username: user.username
    };

    setDirectMessages((current) => [
      ...current,
      {
        body: trimmedBody,
        createdAt: new Date().toISOString(),
        id: `message-${Date.now()}-${current.length}`,
        recipientUserId: contact.id,
        senderUserId: user.id,
        ...(sharedPost ? { sharedPost } : {})
      }
    ]);
    setMessageContactsByUser((current) => ({
      ...current,
      [user.id]: upsertMessageContact(current[user.id] ?? [], contact),
      [contact.id]: upsertMessageContact(
        current[contact.id] ?? [],
        reciprocalContact
      )
    }));
  }

  function sendDirectMessage(contactId: string, body: string) {
    const contact = currentMessageContacts.find((item) => item.id === contactId);

    if (!contact) {
      return;
    }

    sendMessageToContact(contact, body);
  }

  function sendSharedPost(
    contact: MessageContact,
    player: Player,
    message = ""
  ) {
    const trimmedMessage = message.trim();

    sendMessageToContact(
      contact,
      "Compartilhou uma publicação",
      createSharedPostReference(player, trimmedMessage)
    );
  }

  function deleteConversation(contactId: string) {
    if (!user) {
      return;
    }

    setMessageContactsByUser((current) => ({
      ...current,
      [user.id]: (current[user.id] ?? []).filter(
        (contact) => contact.id !== contactId
      )
    }));
    setConversationPreferencesByUser((current) => {
      const preferences =
        current[user.id] ?? EMPTY_CONVERSATION_PREFERENCES;

      return {
        ...current,
        [user.id]: {
          deletedAtByContactId: {
            ...preferences.deletedAtByContactId,
            [contactId]: new Date().toISOString()
          },
          mutedContactIds: preferences.mutedContactIds.filter(
            (id) => id !== contactId
          ),
          pinnedContactIds: preferences.pinnedContactIds.filter(
            (id) => id !== contactId
          )
        }
      };
    });
  }

  function toggleMuteConversation(contactId: string) {
    if (!user) {
      return;
    }

    setConversationPreferencesByUser((current) => {
      const preferences =
        current[user.id] ?? EMPTY_CONVERSATION_PREFERENCES;

      return {
        ...current,
        [user.id]: {
          ...preferences,
          mutedContactIds: toggleConversationId(
            preferences.mutedContactIds,
            contactId
          )
        }
      };
    });
  }

  function togglePinConversation(contactId: string) {
    if (!user) {
      return;
    }

    setConversationPreferencesByUser((current) => {
      const preferences =
        current[user.id] ?? EMPTY_CONVERSATION_PREFERENCES;

      return {
        ...current,
        [user.id]: {
          ...preferences,
          pinnedContactIds: togglePinnedConversation(
            preferences.pinnedContactIds,
            contactId
          )
        }
      };
    });
  }

  function toggleFollowProfile(profileId: string) {
    if (!user || profileId === ownProfileId) {
      return;
    }

    setFollowingByUser((current) => {
      const currentFollowing = current[user.id] ?? [];
      const isFollowing = currentFollowing.includes(profileId);

      return {
        ...current,
        [user.id]: isFollowing
          ? currentFollowing.filter((item) => item !== profileId)
          : [...currentFollowing, profileId]
      };
    });
  }

  function setPlayerHidden(playerId: string, hidden: boolean) {
    if (!user) {
      return;
    }

    setHiddenPlayerIdsByUser((current) => {
      const currentPlayerIds = current[user.id] ?? [];
      const nextPlayerIds = hidden
        ? [...new Set([...currentPlayerIds, playerId])]
        : currentPlayerIds.filter((item) => item !== playerId);

      return {
        ...current,
        [user.id]: nextPlayerIds
      };
    });
  }

  function toggleLikePlayer(playerId: string) {
    if (!user) {
      return;
    }

    setLikedPlayerIdsByUser((current) => ({
      ...current,
      [user.id]: toggleSelection(current[user.id] ?? [], playerId)
    }));
  }

  function recordPlayerView(playerId: string) {
    if (!user) {
      return;
    }

    setViewedPlayerIdsByUser((current) => {
      const currentPlayerIds = current[user.id] ?? [];

      if (currentPlayerIds.includes(playerId)) {
        return current;
      }

      return {
        ...current,
        [user.id]: [...currentPlayerIds, playerId]
      };
    });
  }

  function toggleBlockedProfile(profileId: string) {
    if (!user || profileId === ownProfileId) {
      return;
    }

    setBlockedProfileIdsByUser((current) => ({
      ...current,
      [user.id]: toggleSelection(current[user.id] ?? [], profileId)
    }));
  }

  function toggleInterestedContent(contentKey: string) {
    if (!user) {
      return;
    }

    setInterestedContentKeysByUser((current) => ({
      ...current,
      [user.id]: toggleSelection(current[user.id] ?? [], contentKey)
    }));
  }

  function toggleMutedContent(contentKey: string) {
    if (!user) {
      return;
    }

    setMutedContentKeysByUser((current) => ({
      ...current,
      [user.id]: toggleSelection(current[user.id] ?? [], contentKey)
    }));
  }

  return {
    addMessageContact,
    blockedProfileIdSet,
    currentMessageContacts,
    deleteConversation,
    directMessages: currentDirectMessages,
    followersByProfile,
    followerUserIdsByProfile,
    followingProfileIds,
    followingProfileSet,
    hiddenPlayerIds,
    hiddenPlayerIdSet,
    interestedContentKeySet,
    likedPlayerIdSet,
    likeCountsByPlayer,
    mutedContentKeySet,
    ownProfileId,
    mutedContactIds: currentConversationPreferences.mutedContactIds,
    pinnedContactIds: currentConversationPreferences.pinnedContactIds,
    recordPlayerView,
    sendDirectMessage,
    sendSharedPost,
    setPlayerHidden,
    toggleBlockedProfile,
    toggleFollowProfile,
    toggleInterestedContent,
    toggleLikePlayer,
    toggleMuteConversation,
    toggleMutedContent,
    togglePinConversation,
    viewCountsByPlayer
  };
}
