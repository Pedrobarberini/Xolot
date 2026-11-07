import { protectedOnCall } from "./platform/abuseProtection";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import { requireVerifiedUser, verifyRegisteredUser } from "./auth";
import { REGION } from "./config";
import { requireRecord } from "./validation";
import { assertInteractionAllowed } from "./modules/safety/data/interactionPolicy";

const callableOptions = { region: REGION };
const triggerOptions = { region: REGION };
const NOTIFICATIONS_COLLECTION = "notifications";
const MAX_NOTIFICATION_IDS = 100;

type NotificationKind = "comment" | "like" | "message" | "reply" | "shared-post";

type NotificationInput = {
  actorName?: string;
  actorUserId: string;
  actorUsername?: string;
  createdAt?: unknown;
  id: string;
  kind: NotificationKind;
  mediaType?: "image" | "video";
  playerId?: string;
  preview?: string;
  recipientUserId: string;
  sourceId: string;
};

function cleanText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function previewText(value: unknown) {
  return cleanText(value).slice(0, 120);
}

async function loadActor(actorUserId: string) {
  const profile = await getFirestore()
    .doc("profiles/" + actorUserId)
    .get();
  const data = profile.data();

  return {
    actorName: cleanText(data?.name, "Alguém"),
    actorUsername: cleanText(data?.username),
  };
}

async function createNotification(input: NotificationInput) {
  if (!input.actorUserId || !input.recipientUserId || input.actorUserId === input.recipientUserId) {
    return;
  }

  const database = getFirestore();
  const reference = database.doc(NOTIFICATIONS_COLLECTION + "/" + input.id);
  const actor =
    input.actorName && input.actorUsername
      ? {
          actorName: input.actorName,
          actorUsername: input.actorUsername,
        }
      : await loadActor(input.actorUserId);

  await database.runTransaction(async (transaction) => {
    if ((await transaction.get(reference)).exists) {
      return;
    }

    try {
      await assertInteractionAllowed(transaction, database, input.actorUserId, input.recipientUserId);
    } catch (error) {
      if (error instanceof HttpsError && ["permission-denied", "failed-precondition"].includes(error.code)) return;
      throw error;
    }

    transaction.create(reference, {
      actorName: actor.actorName,
      actorUserId: input.actorUserId,
      actorUsername: actor.actorUsername,
      createdAt: input.createdAt ?? FieldValue.serverTimestamp(),
      id: input.id,
      kind: input.kind,
      recipientUserId: input.recipientUserId,
      sourceId: input.sourceId,
      ...(input.mediaType ? { mediaType: input.mediaType } : {}),
      ...(input.playerId ? { playerId: input.playerId } : {}),
      ...(input.preview ? { preview: input.preview } : {}),
    });
  });
}

export const notifyDirectMessage = onDocumentCreated(
  {
    document: "directMessages/{messageId}",
    ...triggerOptions,
  },
  async (event) => {
    const message = event.data?.data();
    const messageId = event.params.messageId;
    const actorUserId = cleanText(message?.senderUserId);
    const recipientUserId = cleanText(message?.recipientUserId);
    if (!actorUserId || !recipientUserId) {
      return;
    }

    const sharedPost =
      message?.sharedPost &&
      typeof message.sharedPost === "object" &&
      !Array.isArray(message.sharedPost)
        ? (message.sharedPost as Record<string, unknown>)
        : undefined;
    const playerId = cleanText(sharedPost?.playerId);
    const mediaType = sharedPost?.mediaType === "image" ? "image" : "video";

    await createNotification({
      actorUserId,
      createdAt: message?.createdAt,
      id: "message-" + messageId,
      kind: sharedPost ? "shared-post" : "message",
      ...(sharedPost ? { mediaType, playerId } : {}),
      preview: previewText(message?.body),
      recipientUserId,
      sourceId: messageId,
    });
  },
);

export const notifyPostLike = onDocumentCreated(
  {
    document: "userPostLikes/{actorUid}/posts/{playerId}",
    ...triggerOptions,
  },
  async (event) => {
    const actorUserId = event.params.actorUid;
    const playerId = event.params.playerId;
    const postId = playerId.startsWith("approved-") ? playerId.slice("approved-".length) : playerId;
    const post = await getFirestore()
      .doc("posts/" + postId)
      .get();
    const recipientUserId = cleanText(post.data()?.authorId);
    if (!post.exists || !recipientUserId) {
      return;
    }

    await createNotification({
      actorUserId,
      createdAt: event.data?.data()?.createdAt,
      id: "like-" + playerId + "-" + actorUserId,
      kind: "like",
      playerId,
      recipientUserId,
      sourceId: actorUserId + "-" + playerId,
    });
  },
);

export const notifyPostComment = onDocumentCreated(
  {
    document: "postComments/{commentId}",
    ...triggerOptions,
  },
  async (event) => {
    const comment = event.data?.data();
    const commentId = event.params.commentId;
    const actorUserId = cleanText(comment?.authorUserId);
    const playerId = cleanText(comment?.playerId);
    const postId = cleanText(comment?.postId);
    if (!actorUserId || !playerId || !postId) {
      return;
    }

    const post = await getFirestore()
      .doc("posts/" + postId)
      .get();
    const postOwnerId = cleanText(post.data()?.authorId);
    const replyToUserId = cleanText(comment?.replyToUserId);
    const recipientUserId =
      replyToUserId && replyToUserId !== actorUserId ? replyToUserId : postOwnerId;
    if (!recipientUserId) {
      return;
    }

    await createNotification({
      actorName: cleanText(comment?.authorName, "Alguém"),
      actorUserId,
      actorUsername: cleanText(comment?.authorUsername),
      createdAt: comment?.createdAt,
      id: "comment-" + commentId,
      kind: replyToUserId ? "reply" : "comment",
      playerId,
      preview: previewText(comment?.body),
      recipientUserId,
      sourceId: commentId,
    });
  },
);

export const markNotificationsRead = protectedOnCall(
  "markNotificationsRead",
  callableOptions,
  async (request) => {
    const uid = requireVerifiedUser(request);
    await verifyRegisteredUser(uid);
    const data = requireRecord(request.data);
    const notificationIds = Array.isArray(data.notificationIds)
      ? Array.from(
          new Set(
            data.notificationIds.filter(
              (value): value is string =>
                typeof value === "string" && /^[A-Za-z0-9_-]+$/.test(value) && value.length <= 256,
            ),
          ),
        ).slice(0, MAX_NOTIFICATION_IDS)
      : [];

    if (notificationIds.length === 0) {
      throw new HttpsError("invalid-argument", "Nenhuma notificação válida foi informada.");
    }

    const database = getFirestore();
    const references = notificationIds.map((notificationId) =>
      database.doc(NOTIFICATIONS_COLLECTION + "/" + notificationId),
    );
    const updated = await database.runTransaction(async (transaction) => {
      let changed = 0;
      const snapshots = await Promise.all(
        references.map((reference) => transaction.get(reference)),
      );

      snapshots.forEach((snapshot, index) => {
        if (
          snapshot.exists &&
          snapshot.data()?.recipientUserId === uid &&
          !snapshot.data()?.readAt
        ) {
          transaction.update(references[index], {
            readAt: FieldValue.serverTimestamp(),
          });
          changed += 1;
        }
      });
      return changed;
    });

    return { updated };
  },
);
