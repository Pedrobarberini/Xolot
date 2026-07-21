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
  Player
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
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [isSocialStateLoaded, setIsSocialStateLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadSocialState().then((socialState) => {
      if (!isMounted) {
        return;
      }

      setDirectMessages(socialState.directMessages);
      setConversationPreferencesByUser(
        socialState.conversationPreferencesByUser
      );
      setFollowingByUser(socialState.followingByUser);
      setHiddenPlayerIdsByUser(socialState.hiddenPlayerIdsByUser);
      setMessageContactsByUser(socialState.messageContactsByUser);
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
      conversationPreferencesByUser,
      directMessages,
      followingByUser,
      hiddenPlayerIdsByUser,
      messageContactsByUser
    }).catch(() => undefined);
  }, [
    conversationPreferencesByUser,
    directMessages,
    followingByUser,
    hiddenPlayerIdsByUser,
    isSocialStateLoaded,
    messageContactsByUser
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
        : "Usuário NextStar",
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

  function sendSharedPost(contact: MessageContact, player: Player) {
    sendMessageToContact(
      contact,
      "Compartilhou uma publicação",
      createSharedPostReference(player)
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

  return {
    addMessageContact,
    currentMessageContacts,
    deleteConversation,
    directMessages: currentDirectMessages,
    followersByProfile,
    followerUserIdsByProfile,
    followingProfileIds,
    followingProfileSet,
    hiddenPlayerIds,
    hiddenPlayerIdSet,
    ownProfileId,
    mutedContactIds: currentConversationPreferences.mutedContactIds,
    pinnedContactIds: currentConversationPreferences.pinnedContactIds,
    sendDirectMessage,
    sendSharedPost,
    setPlayerHidden,
    toggleFollowProfile,
    toggleMuteConversation,
    togglePinConversation
  };
}
