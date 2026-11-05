import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { randomUUID } from "node:crypto";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { requireVerifiedUser, verifyRegisteredUser } from "./auth";
import { REGION } from "./config";
import { requireRecord, requireText } from "./validation";

const callableOptions = { region: REGION };

function normalizedCount(value: unknown) {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0
    ? value
    : 0;
}

function getPostDocumentId(playerId: string) {
  return playerId.startsWith("approved-")
    ? playerId.slice("approved-".length)
    : playerId;
}

async function applyMessageRateLimit(uid: string) {
  const database = getFirestore();
  const reference = database.doc(`socialRateLimits/${uid}_messages`);
  const now = Date.now();

  await database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const data = snapshot.data();
    const windowStartedAtMs =
      typeof data?.windowStartedAtMs === "number" ? data.windowStartedAtMs : 0;
    const currentWindow = now - windowStartedAtMs < 60_000;
    const count = currentWindow && typeof data?.count === "number" ? data.count : 0;
    if (count >= 60) {
      throw new HttpsError(
        "resource-exhausted",
        "Muitas mensagens em pouco tempo. Aguarde um minuto."
      );
    }
    transaction.set(reference, {
      count: count + 1,
      updatedAt: FieldValue.serverTimestamp(),
      windowStartedAtMs: currentWindow ? windowStartedAtMs : now
    });
  });
}

export const sendDirectMessage = onCall(callableOptions, async (request) => {
  const uid = requireVerifiedUser(request);
  await verifyRegisteredUser(uid);
  await applyMessageRateLimit(uid);

  const data = requireRecord(request.data);
  const recipientUserId = requireText(data.recipientUserId, "Destinatário", 1, 128);
  const body = requireText(data.body, "Mensagem", 1, 2000);
  const requestedMessageId =
    typeof data.messageId === "string" ? data.messageId.trim() : "";
  const messageId = requestedMessageId || `message-${randomUUID()}`;
  if (!/^[A-Za-z0-9_-]+$/.test(messageId) || messageId.length > 128) {
    throw new HttpsError("invalid-argument", "Identificador da mensagem inválido.");
  }

  const sharedPlayerId =
    typeof data.sharedPlayerId === "string" ? data.sharedPlayerId.trim() : "";
  if (sharedPlayerId && !/^[A-Za-z0-9_-]+$/.test(sharedPlayerId)) {
    throw new HttpsError("invalid-argument", "Publicação compartilhada inválida.");
  }
  const sharedPostId = sharedPlayerId
    ? getPostDocumentId(sharedPlayerId)
    : "";

  const database = getFirestore();
  const recipientReference = database.doc(`profiles/${recipientUserId}`);
  const messageReference = database.doc(`directMessages/${messageId}`);
  const sharedPostReference = sharedPlayerId
    ? database.doc(`posts/${sharedPostId}`)
    : null;
  const engagementReference = sharedPlayerId
    ? database.doc(`postEngagement/${sharedPlayerId}`)
    : null;
  let sharedPost: Record<string, unknown> | undefined;

  await database.runTransaction(async (transaction) => {
    const reads = await Promise.all([
      transaction.get(recipientReference),
      transaction.get(messageReference),
      ...(sharedPostReference ? [transaction.get(sharedPostReference)] : []),
      ...(engagementReference ? [transaction.get(engagementReference)] : [])
    ]);
    const recipient = reads[0];
    const existingMessage = reads[1];
    const post = sharedPostReference ? reads[2] : null;
    const engagement = engagementReference ? reads[3] : null;

    if (!recipient.exists) {
      throw new HttpsError("not-found", "O perfil destinatário não existe.");
    }
    if (existingMessage.exists) {
      return;
    }

    if (sharedPostReference && post) {
      const postData = post.data();
      if (!post.exists || postData?.status !== "published") {
        throw new HttpsError("not-found", "A publicação compartilhada não existe.");
      }
      const authorId = requireText(postData?.authorId, "Autor", 1, 128);
      const authorProfile = await transaction.get(
        database.doc(`profiles/${authorId}`)
      );
      const authorData = authorProfile.data();
      sharedPost = {
        authorName:
          typeof authorData?.name === "string" ? authorData.name : "Perfil Folko",
        mediaType: postData?.mediaType === "image" ? "image" : "video",
        playerId: sharedPlayerId,
        profileId: `profile-${authorId}`,
        title: typeof postData?.title === "string" ? postData.title : "Publicação"
      };
    }

    transaction.set(messageReference, {
      body,
      createdAt: FieldValue.serverTimestamp(),
      deliveredAt: FieldValue.serverTimestamp(),
      id: messageId,
      recipientUserId,
      senderUserId: uid,
      ...(sharedPost ? { sharedPost } : {})
    });

    if (engagementReference && engagement) {
      transaction.set(
        engagementReference,
        {
          likes: normalizedCount(engagement.data()?.likes),
          playerId: sharedPlayerId,
          shares: normalizedCount(engagement.data()?.shares) + 1,
          updatedAt: FieldValue.serverTimestamp(),
          views: normalizedCount(engagement.data()?.views)
        },
        { merge: true }
      );
    }
  });

  return {
    body,
    createdAt: new Date().toISOString(),
    deliveredAt: new Date().toISOString(),
    id: messageId,
    recipientUserId,
    senderUserId: uid,
    ...(sharedPost ? { sharedPost } : {})
  };
});
