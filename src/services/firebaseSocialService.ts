import { FirebaseError } from "firebase/app";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import {
  getFirebaseFirestore,
  getFirebaseFunctions
} from "../config/firebase";
import type {
  AppNotification,
  ConversationPreferences,
  DirectMessage,
  FollowingByUser,
  PostComment,
  SharedPostReference
} from "../types";
import { EMPTY_CONVERSATION_PREFERENCES } from "../utils/conversations";
import { normalizePostComments } from "../utils/postComments";
import {
  normalizeAppNotification,
  sortNotificationsNewestFirst
} from "../utils/notifications";
import { getCurrentFirebaseUser } from "./firebaseAccountService";
import type { SocialState } from "./socialStorage";

const FOLLOWS_COLLECTION = "follows";
const ENGAGEMENT_COLLECTION = "postEngagement";
const DIRECT_MESSAGES_COLLECTION = "directMessages";
const POST_COMMENTS_COLLECTION = "postComments";
const SOCIAL_PREFERENCES_COLLECTION = "socialPreferences";
const NOTIFICATIONS_COLLECTION = "notifications";
const MAX_FOLLOWS = 5_000;
const MAX_ENGAGEMENT_DOCUMENTS = 2_000;
const MAX_MESSAGES_PER_DIRECTION = 500;
const MAX_COMMENTS = 2_000;
const MAX_NOTIFICATIONS = 100;

type EngagementCounts = {
  likes: number;
  shares: number;
  views: number;
};

export type FirebaseSocialPreferences = ConversationPreferences & {
  autoplayEnabled: boolean;
  blockedProfileIds: string[];
  hiddenPlayerIds: string[];
  interestedContentKeys: string[];
  mutedContentKeys: string[];
  notificationsEnabled: boolean;
  reportedPlayerIds: string[];
};

export type FirebaseSocialSnapshot = {
  directMessages: DirectMessage[];
  engagementByPlayer: Record<string, EngagementCounts>;
  followingByUser: FollowingByUser;
  likedPlayerIds: string[];
  notifications: AppNotification[];
  postComments: PostComment[];
  preferences: FirebaseSocialPreferences;
  viewedPlayerIds: string[];
};

const emptyPreferences: FirebaseSocialPreferences = {
  ...EMPTY_CONVERSATION_PREFERENCES,
  autoplayEnabled: true,
  blockedProfileIds: [],
  hiddenPlayerIds: [],
  interestedContentKeys: [],
  mutedContentKeys: [],
  notificationsEnabled: false,
  reportedPlayerIds: []
};

function assertCurrentUser(uid: string) {
  const user = getCurrentFirebaseUser();
  if (!user || !user.emailVerified || user.uid !== uid) {
    throw new Error("Sua sessão não pode sincronizar estes dados.");
  }
}

function normalizeStringArray(value: unknown, maximum = 500) {
  return Array.isArray(value)
    ? Array.from(
        new Set(
          value
            .filter((item): item is string => typeof item === "string")
            .map((item) => item.trim())
            .filter(Boolean)
        )
      ).slice(0, maximum)
    : [];
}

function normalizeDate(value: unknown) {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  if (typeof value === "string" && !Number.isNaN(Date.parse(value))) {
    return new Date(value).toISOString();
  }
  return new Date(0).toISOString();
}

function normalizeOptionalDate(value: unknown) {
  if (value === undefined || value === null) {
    return undefined;
  }
  const normalized = normalizeDate(value);
  return normalized === new Date(0).toISOString() ? undefined : normalized;
}

function normalizeSharedPost(value: unknown): SharedPostReference | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  const data = value as Record<string, unknown>;
  if (
    typeof data.authorName !== "string" ||
    typeof data.playerId !== "string" ||
    typeof data.profileId !== "string" ||
    typeof data.title !== "string" ||
    !["image", "video"].includes(String(data.mediaType))
  ) {
    return undefined;
  }
  return {
    authorName: data.authorName,
    ...(typeof data.caption === "string" && data.caption.trim()
      ? { caption: data.caption.trim() }
      : {}),
    mediaType: data.mediaType as "image" | "video",
    playerId: data.playerId,
    profileId: data.profileId,
    title: data.title
  };
}

export function normalizeDirectMessage(
  id: string,
  value: unknown
): DirectMessage | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const data = value as Record<string, unknown>;
  if (
    typeof data.body !== "string" ||
    typeof data.senderUserId !== "string" ||
    typeof data.recipientUserId !== "string"
  ) {
    return null;
  }
  const sharedPost = normalizeSharedPost(data.sharedPost);
  const deliveredAt = normalizeOptionalDate(data.deliveredAt);
  const readAt = normalizeOptionalDate(data.readAt);
  return {
    body: data.body,
    createdAt: normalizeDate(data.createdAt),
    ...(deliveredAt ? { deliveredAt } : {}),
    id,
    ...(readAt ? { readAt } : {}),
    recipientUserId: data.recipientUserId,
    senderUserId: data.senderUserId,
    ...(sharedPost ? { sharedPost } : {})
  };
}

function normalizePreferences(value: unknown): FirebaseSocialPreferences {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return emptyPreferences;
  }
  const data = value as Record<string, unknown>;
  const deletedAtByContactId =
    data.deletedAtByContactId &&
    typeof data.deletedAtByContactId === "object" &&
    !Array.isArray(data.deletedAtByContactId)
      ? Object.fromEntries(
          Object.entries(data.deletedAtByContactId).filter(
            ([contactId, deletedAt]) =>
              contactId.length > 0 && typeof deletedAt === "string"
          )
        )
      : {};

  return {
    autoplayEnabled:
      typeof data.autoplayEnabled === "boolean" ? data.autoplayEnabled : true,
    blockedProfileIds: normalizeStringArray(data.blockedProfileIds),
    deletedAtByContactId,
    hiddenPlayerIds: normalizeStringArray(data.hiddenPlayerIds),
    interestedContentKeys: normalizeStringArray(data.interestedContentKeys),
    mutedContactIds: normalizeStringArray(data.mutedContactIds),
    mutedContentKeys: normalizeStringArray(data.mutedContentKeys),
    notificationsEnabled:
      typeof data.notificationsEnabled === "boolean"
        ? data.notificationsEnabled
        : false,
    pinnedContactIds: normalizeStringArray(data.pinnedContactIds, 3),
    reportedPlayerIds: normalizeStringArray(data.reportedPlayerIds)
  };
}

function normalizedMetric(value: unknown) {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0
    ? value
    : 0;
}

function mergeMessages(
  outgoing: DirectMessage[],
  incoming: DirectMessage[]
) {
  return Array.from(
    new Map([...outgoing, ...incoming].map((message) => [message.id, message])).values()
  ).sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

export function subscribeFirebaseSocialState(
  uid: string,
  onChange: (snapshot: FirebaseSocialSnapshot) => void,
  onError?: (error: Error) => void
) {
  assertCurrentUser(uid);
  const firestore = getFirebaseFirestore();
  let followingByUser: FollowingByUser = {};
  let engagementByPlayer: Record<string, EngagementCounts> = {};
  let likedPlayerIds: string[] = [];
  let viewedPlayerIds: string[] = [];
  let outgoingMessages: DirectMessage[] = [];
  let incomingMessages: DirectMessage[] = [];
  const pendingDeliveryReceiptIds = new Set<string>();
  let postComments: PostComment[] = [];
  let notifications: AppNotification[] = [];
  let preferences = emptyPreferences;

  const emit = () =>
    onChange({
      directMessages: mergeMessages(outgoingMessages, incomingMessages),
      engagementByPlayer,
      followingByUser,
      likedPlayerIds,
      notifications,
      postComments,
      preferences,
      viewedPlayerIds
    });
  const reportError = (error: Error) => onError?.(error);

  const unsubscribeFollows = onSnapshot(
    query(collection(firestore, FOLLOWS_COLLECTION), limit(MAX_FOLLOWS)),
    (snapshot) => {
      const next: FollowingByUser = {};
      snapshot.docs.forEach((follow) => {
        const data = follow.data();
        if (
          typeof data.followerUid === "string" &&
          typeof data.targetProfileId === "string"
        ) {
          next[data.followerUid] = Array.from(
            new Set([...(next[data.followerUid] ?? []), data.targetProfileId])
          );
        }
      });
      followingByUser = next;
      emit();
    },
    reportError
  );
  const unsubscribeEngagement = onSnapshot(
    query(
      collection(firestore, ENGAGEMENT_COLLECTION),
      limit(MAX_ENGAGEMENT_DOCUMENTS)
    ),
    (snapshot) => {
      engagementByPlayer = Object.fromEntries(
        snapshot.docs.map((engagement) => {
          const data = engagement.data();
          return [
            engagement.id,
            {
              likes: normalizedMetric(data.likes),
              shares: normalizedMetric(data.shares),
              views: normalizedMetric(data.views)
            }
          ];
        })
      );
      emit();
    },
    reportError
  );
  const unsubscribeLikes = onSnapshot(
    collection(firestore, "userPostLikes", uid, "posts"),
    (snapshot) => {
      likedPlayerIds = snapshot.docs.map((like) => like.id);
      emit();
    },
    reportError
  );
  const unsubscribeViews = onSnapshot(
    collection(firestore, "userPostViews", uid, "posts"),
    (snapshot) => {
      viewedPlayerIds = snapshot.docs.map((view) => view.id);
      emit();
    },
    reportError
  );
  const unsubscribeOutgoing = onSnapshot(
    query(
      collection(firestore, DIRECT_MESSAGES_COLLECTION),
      where("senderUserId", "==", uid),
      limit(MAX_MESSAGES_PER_DIRECTION)
    ),
    (snapshot) => {
      outgoingMessages = snapshot.docs.flatMap((message) => {
        const normalized = normalizeDirectMessage(message.id, message.data());
        return normalized ? [normalized] : [];
      });
      emit();
    },
    reportError
  );
  const unsubscribeIncoming = onSnapshot(
    query(
      collection(firestore, DIRECT_MESSAGES_COLLECTION),
      where("recipientUserId", "==", uid),
      limit(MAX_MESSAGES_PER_DIRECTION)
    ),
    (snapshot) => {
      incomingMessages = snapshot.docs.flatMap((message) => {
        const normalized = normalizeDirectMessage(message.id, message.data());
        return normalized ? [normalized] : [];
      });
      emit();
      const undeliveredMessageIds = incomingMessages
        .filter(
          (message) =>
            !message.deliveredAt && !pendingDeliveryReceiptIds.has(message.id)
        )
        .map((message) => message.id);
      if (undeliveredMessageIds.length > 0) {
        undeliveredMessageIds.forEach((messageId) =>
          pendingDeliveryReceiptIds.add(messageId)
        );
        void updateFirebaseDirectMessageReceipts(
          undeliveredMessageIds,
          "delivered"
        )
          .catch(reportError)
          .finally(() => {
            undeliveredMessageIds.forEach((messageId) =>
              pendingDeliveryReceiptIds.delete(messageId)
            );
          });
      }
    },
    reportError
  );
  const unsubscribeComments = onSnapshot(
    query(collection(firestore, POST_COMMENTS_COLLECTION), limit(MAX_COMMENTS)),
    (snapshot) => {
      postComments = normalizePostComments(
        snapshot.docs.map((comment) => ({
          ...comment.data(),
          createdAt: normalizeDate(comment.data().createdAt),
          id: comment.id
        }))
      );
      emit();
    },
    reportError
  );
  const unsubscribeNotifications = onSnapshot(
    query(
      collection(firestore, NOTIFICATIONS_COLLECTION),
      where("recipientUserId", "==", uid),
      limit(MAX_NOTIFICATIONS)
    ),
    (snapshot) => {
      notifications = sortNotificationsNewestFirst(
        snapshot.docs.flatMap((notification) => {
          const normalized = normalizeAppNotification(
            notification.id,
            notification.data()
          );
          return normalized ? [normalized] : [];
        })
      );
      emit();
    },
    reportError
  );
  const unsubscribePreferences = onSnapshot(
    doc(firestore, SOCIAL_PREFERENCES_COLLECTION, uid),
    (snapshot) => {
      preferences = normalizePreferences(snapshot.data());
      emit();
    },
    reportError
  );

  return () => {
    unsubscribeFollows();
    unsubscribeEngagement();
    unsubscribeLikes();
    unsubscribeViews();
    unsubscribeOutgoing();
    unsubscribeIncoming();
    unsubscribeComments();
    unsubscribeNotifications();
    unsubscribePreferences();
  };
}

export async function setFirebaseFollow(
  uid: string,
  targetProfileId: string,
  following: boolean
) {
  assertCurrentUser(uid);
  const targetUid = targetProfileId.startsWith("profile-")
    ? targetProfileId.slice("profile-".length)
    : "";
  if (!targetUid || targetUid === uid) {
    return;
  }
  const reference = doc(
    getFirebaseFirestore(),
    FOLLOWS_COLLECTION,
    `${uid}_${targetUid}`
  );
  if (!following) {
    await deleteDoc(reference);
    return;
  }
  if ((await getDoc(reference)).exists()) {
    return;
  }
  await setDoc(reference, {
    createdAt: serverTimestamp(),
    followerUid: uid,
    targetProfileId: `profile-${targetUid}`,
    targetUid
  });
}

export async function setFirebaseSocialPreferences(
  uid: string,
  preferences: FirebaseSocialPreferences
) {
  assertCurrentUser(uid);
  await setDoc(doc(getFirebaseFirestore(), SOCIAL_PREFERENCES_COLLECTION, uid), {
    autoplayEnabled: preferences.autoplayEnabled,
    blockedProfileIds: normalizeStringArray(preferences.blockedProfileIds),
    deletedAtByContactId: preferences.deletedAtByContactId,
    hiddenPlayerIds: normalizeStringArray(preferences.hiddenPlayerIds),
    interestedContentKeys: normalizeStringArray(
      preferences.interestedContentKeys
    ),
    mutedContactIds: normalizeStringArray(preferences.mutedContactIds),
    mutedContentKeys: normalizeStringArray(preferences.mutedContentKeys),
    notificationsEnabled: preferences.notificationsEnabled,
    ownerUid: uid,
    pinnedContactIds: normalizeStringArray(preferences.pinnedContactIds, 3),
    reportedPlayerIds: normalizeStringArray(preferences.reportedPlayerIds),
    updatedAt: serverTimestamp()
  });
}

export async function setFirebasePostLike(
  playerId: string,
  liked: boolean
) {
  const setLike = httpsCallable<
    { liked: boolean; playerId: string },
    { liked: boolean }
  >(getFirebaseFunctions(), "setPostLike");
  return (await setLike({ liked, playerId })).data.liked;
}

export async function recordFirebasePostView(playerId: string) {
  const recordView = httpsCallable<
    { playerId: string },
    { recorded: boolean }
  >(getFirebaseFunctions(), "recordPostView");
  return (await recordView({ playerId })).data.recorded;
}

export async function saveFirebaseDirectMessage(message: DirectMessage) {
  const sendMessage = httpsCallable<
    {
      body: string;
      messageId: string;
      recipientUserId: string;
      sharedPlayerId?: string;
    },
    DirectMessage
  >(getFirebaseFunctions(), "sendDirectMessage");
  return (
    await sendMessage({
      body: message.body,
      messageId: message.id,
      recipientUserId: message.recipientUserId,
      ...(message.sharedPost?.playerId
        ? { sharedPlayerId: message.sharedPost.playerId }
        : {})
    })
  ).data;
}

export async function updateFirebaseDirectMessageReceipts(
  messageIds: string[],
  status: "delivered" | "read"
) {
  const updateReceipts = httpsCallable<
    { messageIds: string[]; status: "delivered" | "read" },
    { updated: number }
  >(getFirebaseFunctions(), "updateDirectMessageReceipts");
  return (await updateReceipts({ messageIds, status })).data.updated;
}

function getPostDocumentId(playerId: string) {
  return playerId.startsWith("approved-")
    ? playerId.slice("approved-".length)
    : playerId;
}

export async function saveFirebasePostComment(comment: PostComment) {
  const user = getCurrentFirebaseUser();
  if (!user || user.uid !== comment.authorUserId) {
    throw new Error("Sua sessão não pode publicar este comentário.");
  }
  const reference = doc(
    getFirebaseFirestore(),
    POST_COMMENTS_COLLECTION,
    comment.id
  );
  if ((await getDoc(reference)).exists()) {
    return;
  }
  await setDoc(reference, {
    authorName: comment.authorName,
    authorProfileId: comment.authorProfileId,
    authorUserId: comment.authorUserId,
    authorUsername: comment.authorUsername,
    body: comment.body,
    createdAt: serverTimestamp(),
    playerId: comment.playerId,
    postId: getPostDocumentId(comment.playerId),
    ...(comment.parentCommentId
      ? { parentCommentId: comment.parentCommentId }
      : {}),
    ...(comment.replyToUserId
      ? { replyToUserId: comment.replyToUserId }
      : {}),
    ...(comment.replyToUsername
      ? { replyToUsername: comment.replyToUsername }
      : {})
  });
}

export async function deleteFirebasePostComment(
  uid: string,
  commentId: string
) {
  assertCurrentUser(uid);
  await deleteDoc(
    doc(getFirebaseFirestore(), POST_COMMENTS_COLLECTION, commentId)
  );
}

export async function migrateLocalFirebaseSocialState(
  uid: string,
  state: SocialState,
  validPlayerIds: string[],
  validUserIds: string[]
) {
  assertCurrentUser(uid);
  const allowedPlayers = new Set(validPlayerIds);
  const allowedUsers = new Set(validUserIds);
  const localPreferences: FirebaseSocialPreferences = {
    autoplayEnabled: true,
    blockedProfileIds: state.blockedProfileIdsByUser[uid] ?? [],
    deletedAtByContactId:
      state.conversationPreferencesByUser[uid]?.deletedAtByContactId ?? {},
    hiddenPlayerIds: state.hiddenPlayerIdsByUser[uid] ?? [],
    interestedContentKeys: state.interestedContentKeysByUser[uid] ?? [],
    mutedContactIds:
      state.conversationPreferencesByUser[uid]?.mutedContactIds ?? [],
    mutedContentKeys: state.mutedContentKeysByUser[uid] ?? [],
    notificationsEnabled: false,
    pinnedContactIds:
      state.conversationPreferencesByUser[uid]?.pinnedContactIds ?? [],
    reportedPlayerIds: state.reportedPlayerIdsByUser[uid] ?? []
  };
  const hasLocalPreferences = Object.values(localPreferences).some((value) =>
    Array.isArray(value)
      ? value.length > 0
      : typeof value === "object" && value !== null
        ? Object.keys(value).length > 0
        : false
  );

  if (hasLocalPreferences) {
    const preferenceReference = doc(
      getFirebaseFirestore(),
      SOCIAL_PREFERENCES_COLLECTION,
      uid
    );
    const remotePreferences = normalizePreferences(
      (await getDoc(preferenceReference)).data()
    );
    const mergeSelection = (remote: string[], local: string[], maximum = 500) =>
      Array.from(new Set([...remote, ...local])).slice(0, maximum);

    await setFirebaseSocialPreferences(uid, {
      autoplayEnabled: remotePreferences.autoplayEnabled,
      blockedProfileIds: mergeSelection(
        remotePreferences.blockedProfileIds,
        localPreferences.blockedProfileIds
      ),
      deletedAtByContactId: {
        ...localPreferences.deletedAtByContactId,
        ...remotePreferences.deletedAtByContactId
      },
      hiddenPlayerIds: mergeSelection(
        remotePreferences.hiddenPlayerIds,
        localPreferences.hiddenPlayerIds
      ),
      interestedContentKeys: mergeSelection(
        remotePreferences.interestedContentKeys,
        localPreferences.interestedContentKeys
      ),
      mutedContactIds: mergeSelection(
        remotePreferences.mutedContactIds,
        localPreferences.mutedContactIds
      ),
      mutedContentKeys: mergeSelection(
        remotePreferences.mutedContentKeys,
        localPreferences.mutedContentKeys
      ),
      notificationsEnabled: remotePreferences.notificationsEnabled,
      pinnedContactIds: mergeSelection(
        remotePreferences.pinnedContactIds,
        localPreferences.pinnedContactIds,
        3
      ),
      reportedPlayerIds: mergeSelection(
        remotePreferences.reportedPlayerIds,
        localPreferences.reportedPlayerIds
      )
    });
  }

  for (const profileId of (state.followingByUser[uid] ?? []).slice(0, 500)) {
    const targetUid = profileId.startsWith("profile-")
      ? profileId.slice("profile-".length)
      : "";
    if (allowedUsers.has(targetUid) && targetUid !== uid) {
      await setFirebaseFollow(uid, profileId, true);
    }
  }

  for (const playerId of (state.likedPlayerIdsByUser[uid] ?? []).slice(0, 200)) {
    if (allowedPlayers.has(playerId)) {
      await setFirebasePostLike(playerId, true);
    }
  }

  for (const playerId of (state.viewedPlayerIdsByUser[uid] ?? []).slice(0, 200)) {
    if (allowedPlayers.has(playerId)) {
      await recordFirebasePostView(playerId);
    }
  }

  for (const message of state.directMessages
    .filter(
      (item) =>
        item.senderUserId === uid &&
        allowedUsers.has(item.recipientUserId) &&
        /^[A-Za-z0-9_-]{1,128}$/.test(item.id)
    )
    .slice(-50)) {
    await saveFirebaseDirectMessage(message);
  }

  for (const comment of state.postComments
    .filter(
      (item) =>
        item.authorUserId === uid && allowedPlayers.has(item.playerId)
    )
    .slice(-100)) {
    await saveFirebasePostComment(comment);
  }
}

export async function markFirebaseNotificationsRead(
  notificationIds: string[]
) {
  if (notificationIds.length === 0) {
    return;
  }

  const callable = httpsCallable<
    { notificationIds: string[] },
    { updated: number }
  >(getFirebaseFunctions(), "markNotificationsRead");
  await callable({ notificationIds });
}
export function getSafeFirebaseSocialMessage(error: unknown) {
  if (error instanceof Error && !(error instanceof FirebaseError)) {
    return error.message;
  }
  if (error instanceof FirebaseError && error.message.trim()) {
    return error.message.replace(/^Firebase:\s*/i, "");
  }
  return "Não foi possível sincronizar esta ação. Tente novamente.";
}
