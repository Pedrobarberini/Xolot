import type { AppNotification, DirectMessage, Player, PostComment } from "../types";

export type NotificationContent = {
  userId: string;
  player?: Player;
  comments?: PostComment[];
  message?: DirectMessage | null;
};

export type NotificationDestination =
  | { type: "conversation"; contactId: string; messageId: string }
  | { type: "post"; playerId: string; commentId?: string };

export function isNotificationDocumentId(value: string) {
  return (
    Boolean(value.trim()) &&
    value.length <= 180 &&
    !/[\/]/.test(value) &&
    value !== "." &&
    value !== ".."
  );
}

export function getNotificationDestination(
  notification: AppNotification,
  currentUserId: string,
): NotificationDestination | null {
  if (notification.recipientUserId !== currentUserId) return null;

  if (notification.kind === "message" || notification.kind === "shared-post") {
    return isNotificationDocumentId(notification.actorUserId) &&
      isNotificationDocumentId(notification.sourceId)
      ? {
          type: "conversation",
          contactId: notification.actorUserId,
          messageId: notification.sourceId,
        }
      : null;
  }

  if (!notification.playerId || !isNotificationDocumentId(notification.playerId)) return null;
  const isComment = notification.kind === "comment" || notification.kind === "reply";
  return {
    type: "post",
    playerId: notification.playerId,
    ...(isComment && isNotificationDocumentId(notification.sourceId)
      ? { commentId: notification.sourceId }
      : {}),
  };
}

export function isSameNotificationPost(left: string, right: string) {
  const postId = (value: string) =>
    value.startsWith("approved-") ? value.slice("approved-".length) : value;
  return postId(left) === postId(right);
}
