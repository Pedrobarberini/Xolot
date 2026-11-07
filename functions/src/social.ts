import { protectedOnCall } from "./platform/abuseProtection";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { randomUUID } from "node:crypto";
import { HttpsError } from "firebase-functions/v2/https";
import { requireVerifiedUser, verifyRegisteredUser } from "./auth";
import { REGION } from "./config";
import { requireCommandRecord, requireText } from "./validation";
import { assertInteractionAllowed } from "./modules/safety/data/interactionPolicy";

const callableOptions = { region: REGION };

function normalizedCount(value: unknown) {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0 ? value : 0;
}

function getPostDocumentId(playerId: string) {
  return playerId.startsWith("approved-") ? playerId.slice("approved-".length) : playerId;
}

export const sendDirectMessage = protectedOnCall(
  "sendDirectMessage",
  callableOptions,
  async (request) => {
    const uid = requireVerifiedUser(request);
    await verifyRegisteredUser(uid);

    const data = requireCommandRecord(request.data, [
      "recipientUserId",
      "body",
      "messageId",
      "sharedPlayerId",
    ]);
    const recipientUserId = requireText(data.recipientUserId, "Destinatário", 1, 128);
    if (
      /[\u0000-\u001f/]/.test(recipientUserId) ||
      recipientUserId === "." ||
      recipientUserId === ".."
    )
      throw new HttpsError("invalid-argument", "Destinatário inválido.");
    const body = requireText(data.body, "Mensagem", 1, 2000);
    const requestedMessageId = typeof data.messageId === "string" ? data.messageId.trim() : "";
    const messageId = requestedMessageId || `message-${randomUUID()}`;
    if (!/^[A-Za-z0-9_-]+$/.test(messageId) || messageId.length > 128) {
      throw new HttpsError("invalid-argument", "Identificador da mensagem inválido.");
    }

    const sharedPlayerId =
      typeof data.sharedPlayerId === "string" ? data.sharedPlayerId.trim() : "";
    if (
      sharedPlayerId &&
      (!/^[A-Za-z0-9_-]+$/.test(sharedPlayerId) ||
        sharedPlayerId.length > 128 ||
        sharedPlayerId === "approved-")
    ) {
      throw new HttpsError("invalid-argument", "Publicação compartilhada inválida.");
    }
    const sharedPostId = sharedPlayerId ? getPostDocumentId(sharedPlayerId) : "";

    const database = getFirestore();
    const recipientReference = database.doc(`profiles/${recipientUserId}`);
    const messageReference = database.doc(`directMessages/${messageId}`);
    const sharedPostReference = sharedPlayerId ? database.doc(`posts/${sharedPostId}`) : null;
    const engagementReference = sharedPlayerId
      ? database.doc(`postEngagement/${sharedPlayerId}`)
      : null;

    const result = await database.runTransaction(async (transaction) => {
      // Variáveis de resultado pertencem à tentativa confirmada.
      let sharedPost: Record<string, unknown> | undefined;
      const reads = await Promise.all([
        transaction.get(recipientReference),
        transaction.get(messageReference),
        ...(sharedPostReference ? [transaction.get(sharedPostReference)] : []),
        ...(engagementReference ? [transaction.get(engagementReference)] : []),
      ]);
      const recipient = reads[0];
      const existingMessage = reads[1];
      const post = sharedPostReference ? reads[2] : null;
      const engagement = engagementReference ? reads[3] : null;

      if (!recipient.exists) {
        throw new HttpsError("not-found", "O perfil destinatário não existe.");
      }
      if (existingMessage.exists) {
        const existing = existingMessage.data();
        if (
          existing?.senderUserId !== uid ||
          existing.recipientUserId !== recipientUserId ||
          existing.body !== body ||
          (existing.sharedPost?.playerId ?? "") !== sharedPlayerId
        )
          throw new HttpsError("already-exists", "Identificador de mensagem já utilizado.");
        return {
          ...existing,
          id: messageId,
          createdAt: existing.createdAt.toDate().toISOString(),
          ...(existing.deliveredAt
            ? { deliveredAt: existing.deliveredAt.toDate().toISOString() }
            : {}),
          ...(existing.readAt ? { readAt: existing.readAt.toDate().toISOString() } : {}),
        };
      }

      await assertInteractionAllowed(transaction, database, uid, recipientUserId);

      if (sharedPostReference && post) {
        const postData = post.data();
        if (!post.exists || postData?.status !== "published") {
          throw new HttpsError("not-found", "A publicação compartilhada não existe.");
        }
        const authorId = requireText(postData?.authorId, "Autor", 1, 128);
        await assertInteractionAllowed(transaction, database, uid, authorId);
        await assertInteractionAllowed(transaction, database, recipientUserId, authorId);
        const authorProfile = await transaction.get(database.doc(`profiles/${authorId}`));
        const authorData = authorProfile.data();
        sharedPost = {
          authorName: typeof authorData?.name === "string" ? authorData.name : "Perfil Folko",
          mediaType: postData?.mediaType === "image" ? "image" : "video",
          playerId: sharedPlayerId,
          profileId: `profile-${authorId}`,
          title: typeof postData?.title === "string" ? postData.title : "Publicação",
        };
      }

      transaction.set(messageReference, {
        body,
        createdAt: FieldValue.serverTimestamp(),
        id: messageId,
        recipientUserId,
        senderUserId: uid,
        ...(sharedPost ? { sharedPost } : {}),
      });

      if (engagementReference && engagement) {
        transaction.set(
          engagementReference,
          {
            likes: normalizedCount(engagement.data()?.likes),
            playerId: sharedPlayerId,
            shares: normalizedCount(engagement.data()?.shares) + 1,
            updatedAt: FieldValue.serverTimestamp(),
            views: normalizedCount(engagement.data()?.views),
          },
          { merge: true },
        );
      }
      return {
        body,
        createdAt: new Date().toISOString(),
        id: messageId,
        recipientUserId,
        senderUserId: uid,
        ...(sharedPost ? { sharedPost } : {}),
      };
    });

    return result;
  },
);
