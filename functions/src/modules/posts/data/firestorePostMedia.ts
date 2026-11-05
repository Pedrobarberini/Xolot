import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";
import { OperationError } from "../../../domain/OperationError";
import type { PostMediaRepository } from "../application/mediaPorts";
import { advanceUploadQuota } from "../application/uploadQuota";
import type { UploadIntent } from "../domain/mediaTypes";

function readIntent(data: Record<string, unknown>): UploadIntent {
  const expiry = data.expiresAt;
  if (
    !expiry ||
    typeof expiry !== "object" ||
    !("toMillis" in expiry) ||
    typeof expiry.toMillis !== "function"
  )
    throw new Error("Intenção de upload sem expiração válida.");
  const expiresAtMs: unknown = expiry.toMillis();
  if (
    typeof expiresAtMs !== "number" ||
    !Number.isFinite(expiresAtMs) ||
    typeof data.expectedSize !== "number" ||
    typeof data.fileName !== "string" ||
    typeof data.mediaKey !== "string" ||
    typeof data.mimeType !== "string" ||
    typeof data.ownerUid !== "string" ||
    typeof data.postId !== "string" ||
    typeof data.uploadKey !== "string" ||
    (data.mediaType !== "image" && data.mediaType !== "video") ||
    (data.status !== "pending" && data.status !== "finalizing" && data.status !== "completed")
  )
    throw new Error("Intenção de upload em formato não suportado.");
  return {
    expectedSize: data.expectedSize,
    expiresAtMs,
    fileName: data.fileName,
    mediaKey: data.mediaKey,
    mediaType: data.mediaType,
    mimeType: data.mimeType,
    ownerUid: data.ownerUid,
    postId: data.postId,
    status: data.status,
    uploadKey: data.uploadKey,
  };
}

export const firestorePostMedia: PostMediaRepository = {
  async getPost(id) {
    const snapshot = await getFirestore().doc(`posts/${id}`).get();
    if (!snapshot.exists) return null;
    const data = snapshot.data();
    return {
      authorId: data?.authorId,
      mediaKey: data?.mediaKey,
      storageProvider: data?.storageProvider,
      thumbnailKey: data?.thumbnailKey,
    };
  },
  async createIntent(id, intent) {
    const { expiresAtMs, ...data } = intent;
    await getFirestore()
      .doc(`mediaUploadIntents/${id}`)
      .set({
        ...data,
        expiresAt: Timestamp.fromMillis(expiresAtMs),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
  },
  async getIntent(id) {
    const snapshot = await getFirestore().doc(`mediaUploadIntents/${id}`).get();
    return snapshot.exists ? readIntent(snapshot.data() ?? {}) : null;
  },
  async markFinalizing(id) {
    await getFirestore()
      .doc(`mediaUploadIntents/${id}`)
      .update({ status: "finalizing", updatedAt: FieldValue.serverTimestamp() });
  },
  async publish(uploadId, postId, record) {
    const database = getFirestore();
    const post = database.doc(`posts/${postId}`);
    await database.runTransaction(async (transaction) => {
      if ((await transaction.get(post)).exists)
        throw new OperationError("already-exists", "Esta publicação já foi finalizada.");
      transaction.set(post, {
        ...record,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      transaction.update(database.doc(`mediaUploadIntents/${uploadId}`), {
        completedAt: FieldValue.serverTimestamp(),
        status: "completed",
        updatedAt: FieldValue.serverTimestamp(),
      });
    });
  },
  async deletePost(id) {
    await getFirestore().doc(`posts/${id}`).delete();
  },
  async consumeCreateQuota(uid, nowMs, maximum) {
    const database = getFirestore();
    const reference = database.doc(`mediaRateLimits/${uid}`);
    await database.runTransaction(async (transaction) => {
      const data = (await transaction.get(reference)).data();
      transaction.set(reference, {
        ...advanceUploadQuota(data, nowMs, maximum),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });
  },
};
