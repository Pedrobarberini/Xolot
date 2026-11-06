import { BRAND } from "../config/brand.ts";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import {
  hasCompletedSocialCloudMigration,
  loadSocialState,
  markSocialCloudMigrationCompleted,
  saveSocialState,
  type SocialState
} from "../services/socialStorage";
import {
  deleteFirebasePostComment,
  type FirebaseSocialPreferences,
  getSafeFirebaseSocialMessage,
  markFirebaseNotificationsRead,
  migrateLocalFirebaseSocialState,
  recordFirebasePostView,
  saveFirebaseDirectMessage,
  saveFirebasePostComment,
  setFirebaseFollow,
  setFirebasePostLike,
  setFirebaseSocialPreferences,
  subscribeFirebaseSocialState,
  updateFirebaseDirectMessageReceipts
} from "../services/firebaseSocialService";
import {
  getDeviceNotificationPermission,
  requestDeviceNotificationPermission,
  showDeviceNotification,
  type DeviceNotificationPermission
} from "../services/deviceNotificationService";
import {
  AppNotification,
  AppUser,
  ConversationPreferencesByUser,
  DirectMessage,
  FollowingByUser,
  HiddenPlayerIdsByUser,
  MessageContact,
  MessageContactsByUser,
  Player,
  PostComment,
  SocialSelectionsByUser
} from "../types";
import { formatProfileActivity } from "../utils/profileActivity";
import { buildFollowerUserIdsByProfile } from "../utils/profileFollowers";
import {
  EMPTY_CONVERSATION_PREFERENCES,
  filterMessagesAfterConversationDeletion,
  sortContactsByPinned,
  toggleConversationId,
  togglePinnedConversation
} from "../utils/conversations";
import { setContentSafetySelection } from "../utils/contentSafety";
import {
  countSharedPostsByPlayer,
  createSharedPostDelivery
} from "../utils/socialSharing";
import {
  groupPostCommentsByPlayer,
  normalizePostCommentBody,
  removeOwnedPostComment
} from "../utils/postComments";
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
  notificationContent,
  onNotificationCommentDeleted,
  user,
  users
}: {
  players: Player[];
  notificationContent?: import("../utils/notificationDestination").NotificationContent | null;
  onNotificationCommentDeleted?: (commentId: string) => void;
  user: AppUser | null;
  users: AppUser[];
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
  const [reportedPlayerIdsByUser, setReportedPlayerIdsByUser] =
    useState<SocialSelectionsByUser>({});
  const [viewedPlayerIdsByUser, setViewedPlayerIdsByUser] =
    useState<SocialSelectionsByUser>({});
  const [syncedDirectMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const directMessages = useMemo(() => {
    const message = notificationContent?.userId === user?.id ? notificationContent?.message : null;
    return message && !syncedDirectMessages.some((item) => item.id === message.id)
      ? [...syncedDirectMessages, message].sort((left, right) => left.createdAt.localeCompare(right.createdAt))
      : syncedDirectMessages;
  }, [notificationContent, syncedDirectMessages, user?.id]);
  const [autoplayEnabled, setAutoplayEnabledState] = useState(true);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [
    notificationsPreferenceEnabled,
    setNotificationsPreferenceEnabled
  ] = useState(false);
  const [deviceNotificationPermission, setDeviceNotificationPermission] =
    useState<DeviceNotificationPermission>(getDeviceNotificationPermission);
  const [syncedPostComments, setPostComments] = useState<PostComment[]>([]);
  const postComments = useMemo(() => {
    if (notificationContent?.userId !== user?.id || !notificationContent?.comments?.length) return syncedPostComments;
    const comments = new Map(notificationContent.comments.map((comment) => [comment.id, comment]));
    syncedPostComments.forEach((comment) => comments.set(comment.id, comment));
    return [...comments.values()];
  }, [notificationContent, syncedPostComments, user?.id]);
  const [isSocialStateLoaded, setIsSocialStateLoaded] = useState(false);

  const [remoteEngagementByPlayer, setRemoteEngagementByPlayer] = useState<
    Record<string, { likes: number; shares: number; views: number }> | null
  >(null);
  const notificationsEnabled =
    notificationsPreferenceEnabled &&
    deviceNotificationPermission === "granted";
  const socialErrorShownRef = useRef(false);
  const loadedSocialStateRef = useRef<SocialState | null>(null);
  const socialMigrationUserIdsRef = useRef(new Set<string>());
  const knownNotificationIdsRef = useRef<Set<string> | null>(null);
  const notificationSessionStartedAtRef = useRef(Date.now());
  useEffect(() => {
    let isMounted = true;

    loadSocialState().then((socialState) => {
      if (!isMounted) {
        return;
      }

      setDirectMessages(socialState.directMessages);
      setBlockedProfileIdsByUser(socialState.blockedProfileIdsByUser);
      loadedSocialStateRef.current = socialState;
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
      setPostComments(socialState.postComments);
      setReportedPlayerIdsByUser(socialState.reportedPlayerIdsByUser);
      setViewedPlayerIdsByUser(socialState.viewedPlayerIdsByUser);
      setIsSocialStateLoaded(true);
    });

    return () => {
      isMounted = false;
    };
  }, []);
  useEffect(() => {
    if (
      !user ||
      !isSocialStateLoaded ||
      !loadedSocialStateRef.current ||
      socialMigrationUserIdsRef.current.has(user.id)
    ) {
      return;
    }

    const currentUserId = user.id;
    socialMigrationUserIdsRef.current.add(currentUserId);
    void (async () => {
      try {
        if (await hasCompletedSocialCloudMigration(currentUserId)) {
          return;
        }
        await migrateLocalFirebaseSocialState(
          currentUserId,
          loadedSocialStateRef.current!,
          players.map((player) => player.id),
          users.map((account) => account.id)
        );
        await markSocialCloudMigrationCompleted(currentUserId);
      } catch {
        // A migração será tentada novamente na próxima abertura do app.
      } finally {
        socialMigrationUserIdsRef.current.delete(currentUserId);
      }
    })();
  }, [isSocialStateLoaded, players, user?.id, users]);
  useEffect(() => {
    if (!user || !isSocialStateLoaded) {
      setAutoplayEnabledState(true);
      setNotificationsPreferenceEnabled(false);
      setRemoteEngagementByPlayer(null);
      setNotifications([]);
      return;
    }

    socialErrorShownRef.current = false;
    const currentUserId = user.id;
    return subscribeFirebaseSocialState(
      currentUserId,
      (remoteState) => {
        setAutoplayEnabledState(remoteState.preferences.autoplayEnabled);
        setFollowingByUser(remoteState.followingByUser);
        setNotificationsPreferenceEnabled(
          remoteState.preferences.notificationsEnabled
        );
        setLikedPlayerIdsByUser((current) => ({
          ...current,
          [currentUserId]: remoteState.likedPlayerIds
        }));
        setViewedPlayerIdsByUser((current) => ({
          ...current,
          [currentUserId]: remoteState.viewedPlayerIds
        }));
        setDirectMessages(remoteState.directMessages);
        setNotifications(remoteState.notifications);
        setPostComments(remoteState.postComments);
        setRemoteEngagementByPlayer(remoteState.engagementByPlayer);
        setConversationPreferencesByUser((current) => ({
          ...current,
          [currentUserId]: {
            deletedAtByContactId:
              remoteState.preferences.deletedAtByContactId,
            mutedContactIds: remoteState.preferences.mutedContactIds,
            pinnedContactIds: remoteState.preferences.pinnedContactIds
          }
        }));
        setBlockedProfileIdsByUser((current) => ({
          ...current,
          [currentUserId]: remoteState.preferences.blockedProfileIds
        }));
        setHiddenPlayerIdsByUser((current) => ({
          ...current,
          [currentUserId]: remoteState.preferences.hiddenPlayerIds
        }));
        setInterestedContentKeysByUser((current) => ({
          ...current,
          [currentUserId]: remoteState.preferences.interestedContentKeys
        }));
        setMutedContentKeysByUser((current) => ({
          ...current,
          [currentUserId]: remoteState.preferences.mutedContentKeys
        }));
        setReportedPlayerIdsByUser((current) => ({
          ...current,
          [currentUserId]: remoteState.preferences.reportedPlayerIds
        }));
      },
      (error) => {
        if (!socialErrorShownRef.current) {
          socialErrorShownRef.current = true;
          Alert.alert(
            "Sincronização indisponível",
            getSafeFirebaseSocialMessage(error)
          );
        }
      }
    );
  }, [isSocialStateLoaded, user?.id]);

  useEffect(() => {
    knownNotificationIdsRef.current = null;
    notificationSessionStartedAtRef.current = Date.now();
    setDeviceNotificationPermission(getDeviceNotificationPermission());
  }, [user?.id]);

  useEffect(() => {
    const knownNotificationIds = knownNotificationIdsRef.current;
    const currentNotificationIds = new Set(
      notifications.map((notification) => notification.id)
    );
    const sessionStartedAt = notificationSessionStartedAtRef.current;

    knownNotificationIdsRef.current = currentNotificationIds;
    if (!notificationsEnabled) {
      return;
    }

    notifications
      .filter((notification) => {
        const createdAt = Date.parse(notification.createdAt);

        return (
          !notification.readAt &&
          !knownNotificationIds?.has(notification.id) &&
          Number.isFinite(createdAt) &&
          createdAt >= sessionStartedAt
        );
      })
      .slice(0, 3)
      .forEach(showDeviceNotification);
  }, [notifications, notificationsEnabled]);

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
      postComments,
      reportedPlayerIdsByUser,
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
    postComments,
    reportedPlayerIdsByUser,
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
  const followingCountsByUser = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(followingByUser).map(([userId, profileIds]) => [
          userId,
          new Set(profileIds).size
        ])
      ),
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
  const reportedPlayerIds = useMemo(
    () => (user ? reportedPlayerIdsByUser[user.id] ?? [] : []),
    [reportedPlayerIdsByUser, user]
  );
  const reportedPlayerIdSet = useMemo(
    () => new Set(reportedPlayerIds),
    [reportedPlayerIds]
  );
  const likeCountsByPlayer = useMemo(
    () =>
      remoteEngagementByPlayer
        ? Object.fromEntries(
            Object.entries(remoteEngagementByPlayer).map(
              ([playerId, engagement]) => [playerId, engagement.likes]
            )
          )
        : countSelectionsByPlayer(likedPlayerIdsByUser),
    [likedPlayerIdsByUser, remoteEngagementByPlayer]
  );
  const shareCountsByPlayer = useMemo(
    () =>
      remoteEngagementByPlayer
        ? Object.fromEntries(
            Object.entries(remoteEngagementByPlayer).map(
              ([playerId, engagement]) => [playerId, engagement.shares]
            )
          )
        : countSharedPostsByPlayer(directMessages),
    [directMessages, remoteEngagementByPlayer]
  );
  const viewCountsByPlayer = useMemo(
    () =>
      remoteEngagementByPlayer
        ? Object.fromEntries(
            Object.entries(remoteEngagementByPlayer).map(
              ([playerId, engagement]) => [playerId, engagement.views]
            )
          )
        : countSelectionsByPlayer(viewedPlayerIdsByUser),
    [remoteEngagementByPlayer, viewedPlayerIdsByUser]
  );
  const commentsByPlayer = useMemo(
    () => groupPostCommentsByPlayer(postComments),
    [postComments]
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
  useEffect(() => {
    if (!user) {
      return;
    }

    const contactIds = Array.from(
      new Set(
        directMessages.flatMap((message) => {
          if (message.senderUserId === user.id) {
            return [message.recipientUserId];
          }
          if (message.recipientUserId === user.id) {
            return [message.senderUserId];
          }
          return [];
        })
      )
    );
    const contacts = contactIds.flatMap((contactId) => {
      const account = users.find((candidate) => candidate.id === contactId);
      if (!account) {
        return [];
      }
      const player = players.find(
        (candidate) => candidate.ownerUserId === contactId
      );
      return [
        {
          id: contactId,
          name: account.name,
          profileId: player?.profileId ?? `profile-${contactId}`,
          subtitle: formatProfileActivity(account.sport, account.position, account.city),
          username: account.username
        }
      ];
    });

    if (contacts.length > 0) {
      setMessageContactsByUser((current) => ({
        ...current,
        [user.id]: contacts.reduce(
          (currentContacts, contact) =>
            upsertMessageContact(currentContacts, contact),
          current[user.id] ?? []
        )
      }));
    }
  }, [directMessages, players, user?.id, users]);

  function reportSocialWriteError(error: unknown) {
    Alert.alert(
      "Ação não sincronizada",
      getSafeFirebaseSocialMessage(error)
    );
  }

  function syncSocialPreferences(
    overrides: Partial<FirebaseSocialPreferences> = {}
  ) {
    if (!user) {
      return;
    }

    void setFirebaseSocialPreferences(user.id, {
      autoplayEnabled: overrides.autoplayEnabled ?? autoplayEnabled,
      blockedProfileIds:
        overrides.blockedProfileIds ?? blockedProfileIds,
      deletedAtByContactId:
        overrides.deletedAtByContactId ??
        currentConversationPreferences.deletedAtByContactId,
      hiddenPlayerIds: overrides.hiddenPlayerIds ?? hiddenPlayerIds,
      interestedContentKeys:
        overrides.interestedContentKeys ?? interestedContentKeys,
      mutedContactIds:
        overrides.mutedContactIds ??
        currentConversationPreferences.mutedContactIds,
      mutedContentKeys: overrides.mutedContentKeys ?? mutedContentKeys,
      notificationsEnabled:
        overrides.notificationsEnabled ?? notificationsPreferenceEnabled,
      pinnedContactIds:
        overrides.pinnedContactIds ??
        currentConversationPreferences.pinnedContactIds,
      reportedPlayerIds:
        overrides.reportedPlayerIds ?? reportedPlayerIds
    }).catch(reportSocialWriteError);
  }

  function setAutoplayEnabled(enabled: boolean) {
    setAutoplayEnabledState(enabled);
    syncSocialPreferences({ autoplayEnabled: enabled });
  }

  async function setNotificationsEnabled(enabled: boolean) {
    if (!enabled) {
      setNotificationsPreferenceEnabled(false);
      syncSocialPreferences({ notificationsEnabled: false });
      return;
    }

    const permission = await requestDeviceNotificationPermission();
    setDeviceNotificationPermission(permission);

    if (permission !== "granted") {
      setNotificationsPreferenceEnabled(false);
      syncSocialPreferences({ notificationsEnabled: false });
      Alert.alert(
        permission === "unsupported"
          ? "Notificações indisponíveis"
          : "Permissão de notificações bloqueada",
        permission === "unsupported"
          ? `Este navegador não oferece pop-ups de notificação. No celular, abra a ${BRAND.name} em um navegador compatível.`
          : `Libere as notificações da ${BRAND.name} nas configurações do navegador e tente novamente.`
      );
      return;
    }

    setNotificationsPreferenceEnabled(true);
    syncSocialPreferences({ notificationsEnabled: true });
  }

  function addMessageContact(contact: MessageContact) {
    if (!user) {
      return;
    }

    setMessageContactsByUser((current) => ({
      ...current,
      [user.id]: upsertMessageContact(current[user.id] ?? [], contact)
    }));
  }

  async function sendMessageToContact(
    contact: MessageContact,
    body: string,
    sharedPost?: DirectMessage["sharedPost"]
  ) {
    const trimmedBody = body.trim();

    if (!user || !trimmedBody) {
      return false;
    }

    const reciprocalContact: MessageContact = {
      id: user.id,
      profileId: ownPlayer?.profileId ?? `profile-${user.id}`,
      name: ownPlayer?.name ?? user.name,
      subtitle: ownPlayer
        ? formatProfileActivity(ownPlayer.sport, ownPlayer.position, ownPlayer.city)
        : `Usuário ${BRAND.name}`,
      username: user.username
    };
    const directMessage: DirectMessage = {
      body: trimmedBody,
      createdAt: new Date().toISOString(),
      id: `message-${user.id}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      recipientUserId: contact.id,
      senderUserId: user.id,
      ...(sharedPost ? { sharedPost } : {})
    };

    setDirectMessages((current) =>
      current.some((message) => message.id === directMessage.id)
        ? current
        : [...current, directMessage]
    );
    setMessageContactsByUser((current) => ({
      ...current,
      [user.id]: upsertMessageContact(current[user.id] ?? [], contact),
      [contact.id]: upsertMessageContact(
        current[contact.id] ?? [],
        reciprocalContact
      )
    }));
    try {
      const remoteMessage = await saveFirebaseDirectMessage(directMessage);
      setDirectMessages((current) =>
        current.map((message) =>
          message.id === directMessage.id ? remoteMessage : message
        )
      );
      return true;
    } catch (error) {
      setDirectMessages((current) =>
        current.filter((message) => message.id !== directMessage.id)
      );
      reportSocialWriteError(error);
      return false;
    }
  }

  function sendDirectMessage(contactId: string, body: string) {
    const contact = currentMessageContacts.find((item) => item.id === contactId);

    if (!contact) {
      return;
    }

    void sendMessageToContact(contact, body);
  }

  function markNotificationsRead(notificationIds: string[]) {
    if (!user) {
      return;
    }

    const unreadNotificationIds = Array.from(
      new Set(notificationIds)
    ).filter((notificationId) =>
      notifications.some(
        (notification) =>
          notification.id === notificationId &&
          notification.recipientUserId === user.id &&
          !notification.readAt
      )
    );
    if (unreadNotificationIds.length === 0) {
      return;
    }

    const readAt = new Date().toISOString();
    setNotifications((current) =>
      current.map((notification) =>
        unreadNotificationIds.includes(notification.id)
          ? { ...notification, readAt }
          : notification
      )
    );
    void markFirebaseNotificationsRead(unreadNotificationIds).catch((error) => {
      setNotifications((current) =>
        current.map((notification) =>
          unreadNotificationIds.includes(notification.id)
            ? { ...notification, readAt: undefined }
            : notification
        )
      );
      reportSocialWriteError(error);
    });
  }
  function markDirectMessagesRead(messageIds: string[]) {
    if (!user) {
      return;
    }

    const unreadMessageIds = Array.from(new Set(messageIds)).filter(
      (messageId) =>
        directMessages.some(
          (message) =>
            message.id === messageId &&
            message.recipientUserId === user.id &&
            !message.readAt
        )
    );
    if (unreadMessageIds.length === 0) {
      return;
    }

    void updateFirebaseDirectMessageReceipts(unreadMessageIds, "read").catch(
      reportSocialWriteError
    );
  }

  async function sendSharedPost(
    contact: MessageContact,
    player: Player,
    message = ""
  ) {
    const delivery = createSharedPostDelivery(player, message);

    for (const item of delivery) {
      const wasSent = await sendMessageToContact(
        contact,
        item.body,
        item.sharedPost
      );
      if (!wasSent) {
        break;
      }
    }
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
    syncSocialPreferences({
      deletedAtByContactId: {
        ...currentConversationPreferences.deletedAtByContactId,
        [contactId]: new Date().toISOString()
      },
      mutedContactIds: currentConversationPreferences.mutedContactIds.filter(
        (id) => id !== contactId
      ),
      pinnedContactIds: currentConversationPreferences.pinnedContactIds.filter(
        (id) => id !== contactId
      )
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
    syncSocialPreferences({
      mutedContactIds: toggleConversationId(
        currentConversationPreferences.mutedContactIds,
        contactId
      )
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
    syncSocialPreferences({
      pinnedContactIds: togglePinnedConversation(
        currentConversationPreferences.pinnedContactIds,
        contactId
      )
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
      void setFirebaseFollow(
        user.id,
        profileId,
        !followingProfileSet.has(profileId)
      ).catch(reportSocialWriteError);
  }

  function setPlayerHidden(playerId: string, hidden: boolean) {
    if (!user) {
      return;
    }

    setHiddenPlayerIdsByUser((current) => {
      const currentPlayerIds = current[user.id] ?? [];
      const nextPlayerIds = setContentSafetySelection(
        currentPlayerIds,
        playerId,
        hidden
      );

      return {
        ...current,
        [user.id]: nextPlayerIds
      };
    });
    syncSocialPreferences({
      hiddenPlayerIds: setContentSafetySelection(
        hiddenPlayerIds,
        playerId,
        hidden
      )
    });
  }

  function setPlayerReported(playerId: string, reported: boolean) {
    if (!user) {
      return;
    }

    setReportedPlayerIdsByUser((current) => {
      const currentPlayerIds = current[user.id] ?? [];
      const nextPlayerIds = setContentSafetySelection(
        currentPlayerIds,
        playerId,
        reported
      );

      return {
        ...current,
        [user.id]: nextPlayerIds
      };
    });
    syncSocialPreferences({
      reportedPlayerIds: setContentSafetySelection(
        reportedPlayerIds,
        playerId,
        reported
      )
    });
  }

  function addPostComment(
    playerId: string,
    body: string,
    replyToCommentId?: string
  ) {
    const normalizedBody = normalizePostCommentBody(body);
    const replyTarget = replyToCommentId
      ? postComments.find(
          (comment) =>
            comment.id === replyToCommentId && comment.playerId === playerId
        )
      : undefined;

    if (
      !user ||
      !playerId.trim() ||
      !normalizedBody ||
      (replyToCommentId && !replyTarget)
    ) {
      return false;
    }

    const comment: PostComment = {
      authorName: user.name,
      authorProfileId: ownProfileId ?? `profile-${user.id}`,
      authorUserId: user.id,
      authorUsername: user.username,
      body: normalizedBody,
      createdAt: new Date().toISOString(),
      id: `comment-${user.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...(replyTarget
        ? {
            parentCommentId:
              replyTarget.parentCommentId ?? replyTarget.id,
            replyToUserId: replyTarget.authorUserId,
            replyToUsername:
              replyTarget.authorUsername || replyTarget.authorName
          }
        : {}),
      playerId
    };

    setPostComments((current) => [...current, comment]);
    if (players.some((player) => player.id === playerId)) {
      void saveFirebasePostComment(comment).catch(reportSocialWriteError);
    }
    return true;
  }

  function deletePostComment(commentId: string) {
    if (!user) {
      return;
    }

    if (postComments.some((comment) => comment.id === commentId && comment.authorUserId === user.id)) onNotificationCommentDeleted?.(commentId);

    setPostComments((current) =>
      removeOwnedPostComment(current, commentId, user.id)
    );
      void deleteFirebasePostComment(user.id, commentId).catch(
        reportSocialWriteError
      );
  }

  function toggleLikePlayer(playerId: string) {
    if (!user) {
      return;
    }

    setLikedPlayerIdsByUser((current) => ({
      ...current,
      [user.id]: toggleSelection(current[user.id] ?? [], playerId)
    }));
    if (players.some((player) => player.id === playerId)) {
      void setFirebasePostLike(
        playerId,
        !likedPlayerIdSet.has(playerId)
      ).catch(reportSocialWriteError);
    }
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
    if (players.some((player) => player.id === playerId)) {
      void recordFirebasePostView(playerId).catch(reportSocialWriteError);
    }
  }

  function toggleBlockedProfile(profileId: string) {
    if (!user || profileId === ownProfileId) {
      return;
    }

    setBlockedProfileIdsByUser((current) => ({
      ...current,
      [user.id]: toggleSelection(current[user.id] ?? [], profileId)
    }));
    syncSocialPreferences({
      blockedProfileIds: toggleSelection(blockedProfileIds, profileId)
    });
  }

  function toggleInterestedContent(contentKey: string) {
    if (!user) {
      return;
    }
    const selectedTagCount = interestedContentKeys.filter((key) =>
      key.startsWith("tag:")
    ).length;
    if (
      contentKey.startsWith("tag:") &&
      !interestedContentKeys.includes(contentKey) &&
      selectedTagCount >= 6
    ) {
      Alert.alert("Limite de interesses", "Escolha no máximo seis hashtags.");
      return;
    }

    setInterestedContentKeysByUser((current) => ({
      ...current,
      [user.id]: toggleSelection(current[user.id] ?? [], contentKey)
    }));
    syncSocialPreferences({
      interestedContentKeys: toggleSelection(
        interestedContentKeys,
        contentKey
      )
    });
  }

  function toggleMutedContent(contentKey: string) {
    if (!user) {
      return;
    }

    setMutedContentKeysByUser((current) => ({
      ...current,
      [user.id]: toggleSelection(current[user.id] ?? [], contentKey)
    }));
    syncSocialPreferences({
      mutedContentKeys: toggleSelection(mutedContentKeys, contentKey)
    });
  }

  return {
    addMessageContact,
    addPostComment,
    autoplayEnabled,
    blockedProfileIdSet,
    commentsByPlayer,
    currentMessageContacts,
    deleteConversation,
    deletePostComment,
    directMessages: currentDirectMessages,
    followersByProfile,
    followerUserIdsByProfile,
    followingCountsByUser,
    followingProfileIds,
    followingProfileSet,
    hiddenPlayerIds,
    hiddenPlayerIdSet,
    interestedContentKeySet,
    likedPlayerIdSet,
    likeCountsByPlayer,
    mutedContentKeySet,
    notifications,
    notificationsEnabled,
    ownProfileId,
    mutedContactIds: currentConversationPreferences.mutedContactIds,
    pinnedContactIds: currentConversationPreferences.pinnedContactIds,
    recordPlayerView,
    reportedPlayerIds,
    reportedPlayerIdSet,
    markDirectMessagesRead,
    markNotificationsRead,
    sendDirectMessage,
    sendSharedPost,
    shareCountsByPlayer,
    setAutoplayEnabled,
    setNotificationsEnabled,
    setPlayerHidden,
    setPlayerReported,
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
