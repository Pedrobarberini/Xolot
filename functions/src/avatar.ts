import { reportOperationFailure } from "./platform/logger";
import { protectedOnCall } from "./platform/abuseProtection";
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";
import { randomUUID } from "node:crypto";
import { HttpsError } from "firebase-functions/v2/https";
import { requireVerifiedUser, verifyRegisteredUser } from "./auth";
import {
  REGION,
  R2_MEDIA_BUCKET,
  R2_UPLOADS_BUCKET,
  UPLOAD_INTENT_TTL_SECONDS,
  UPLOAD_URL_TTL_SECONDS,
  r2AccessKeyId,
  r2SecretAccessKey,
} from "./config";
import { createR2Client, getCopySource, getPublicMediaUrl } from "./r2";
import {
  MAX_IMAGE_SIZE,
  allowedMimeTypes,
  requireInteger,
  requireCommandRecord,
  requireRecord,
  requireText,
} from "./validation";

const callableOptions = {
  region: REGION,
  secrets: [r2AccessKeyId, r2SecretAccessKey],
};

const allowedAvatarMimeTypes = new Set([
  "image/heic",
  "image/heif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

type AvatarUploadIntentData = {
  expectedSize: number;
  expiresAt: Timestamp;
  mediaKey: string;
  mimeType: string;
  ownerUid: string;
  status: "pending" | "finalizing" | "completed";
  uploadKey: string;
};

function requireNumber(value: unknown, name: string, minimum: number, maximum: number) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < minimum || value > maximum) {
    throw new HttpsError("invalid-argument", `Valor inválido para ${name.toLocaleLowerCase()}.`);
  }
  return value;
}

export const createAvatarUpload = protectedOnCall(
  "createAvatarUpload",
  callableOptions,
  async (request) => {
    const uid = requireVerifiedUser(request);
    await verifyRegisteredUser(uid);

    const data = requireRecord(request.data);
    const mimeType = requireText(data.mimeType, "Formato", 3, 100).toLowerCase();
    const mime = allowedMimeTypes.get(mimeType);
    if (!mime || !allowedAvatarMimeTypes.has(mimeType)) {
      throw new HttpsError("invalid-argument", "Formato de foto não permitido.");
    }

    const fileSize = requireInteger(data.fileSize, "Tamanho", 1, MAX_IMAGE_SIZE);
    const uploadId = randomUUID();
    const objectId = randomUUID();
    const uploadKey = `pending/${uid}/avatar/${objectId}.${mime.extension}`;
    const mediaKey = `users/${uid}/avatars/${objectId}.${mime.extension}`;
    const expiresAtMs = Date.now() + UPLOAD_INTENT_TTL_SECONDS * 1000;
    const intent: AvatarUploadIntentData = {
      expectedSize: fileSize,
      expiresAt: Timestamp.fromMillis(expiresAtMs),
      mediaKey,
      mimeType,
      ownerUid: uid,
      status: "pending",
      uploadKey,
    };

    await getFirestore()
      .doc(`avatarUploadIntents/${uploadId}`)
      .set({
        ...intent,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

    try {
      const uploadUrl = await getSignedUrl(
        createR2Client(),
        new PutObjectCommand({
          Bucket: R2_UPLOADS_BUCKET,
          ContentType: mimeType,
          Key: uploadKey,
        }),
        { expiresIn: UPLOAD_URL_TTL_SECONDS },
      );

      return {
        contentType: mimeType,
        expiresAt: new Date(expiresAtMs).toISOString(),
        uploadId,
        uploadUrl,
      };
    } catch (error) {
      reportOperationFailure("media.upload.sign", error);
      throw new HttpsError(
        "failed-precondition",
        "O armazenamento da foto ainda não está configurado corretamente.",
      );
    }
  },
);

export const finalizeAvatarUpload = protectedOnCall(
  "finalizeAvatarUpload",
  callableOptions,
  async (request) => {
    const uid = requireVerifiedUser(request);
    await verifyRegisteredUser(uid);

    const data = requireRecord(request.data);
    const uploadId = requireText(data.uploadId, "Upload", 1, 80);
    const cropScale = requireNumber(data.cropScale, "Escala", 0.3, 1);
    const focusX = requireNumber(data.focusX, "Foco horizontal", 0, 100);
    const focusY = requireNumber(data.focusY, "Foco vertical", 0, 100);
    const sourceHeight = requireInteger(data.sourceHeight, "Altura", 1, 10_000);
    const sourceWidth = requireInteger(data.sourceWidth, "Largura", 1, 10_000);
    const database = getFirestore();
    const intentReference = database.doc(`avatarUploadIntents/${uploadId}`);
    const intentSnapshot = await intentReference.get();

    if (!intentSnapshot.exists) {
      throw new HttpsError("not-found", "O envio expirou. Escolha a foto novamente.");
    }

    const intent = intentSnapshot.data() as AvatarUploadIntentData;
    if (intent.ownerUid !== uid) {
      throw new HttpsError("permission-denied", "Este envio pertence a outra conta.");
    }
    if (intent.expiresAt.toMillis() < Date.now()) {
      throw new HttpsError("deadline-exceeded", "O envio expirou. Tente novamente.");
    }

    const profileMediaReference = database.doc(`profileMedia/${uid}`);
    if (intent.status === "completed") {
      const existing = await profileMediaReference.get();
      const existingData = existing.data();
      return {
        avatarURL: existingData?.avatarURL ?? getPublicMediaUrl(intent.mediaKey),
        cropScale: existingData?.cropScale ?? cropScale,
        focusX: existingData?.focusX ?? focusX,
        focusY: existingData?.focusY ?? focusY,
        mediaKey: intent.mediaKey,
        sourceHeight: existingData?.sourceHeight ?? sourceHeight,
        sourceWidth: existingData?.sourceWidth ?? sourceWidth,
      };
    }

    const client = createR2Client();
    const uploaded = await client
      .send(
        new HeadObjectCommand({
          Bucket: R2_UPLOADS_BUCKET,
          Key: intent.uploadKey,
        }),
      )
      .catch(() => null);

    if (!uploaded) {
      throw new HttpsError("not-found", "A foto não chegou ao armazenamento.");
    }
    if (
      uploaded.ContentLength !== intent.expectedSize ||
      uploaded.ContentType !== intent.mimeType
    ) {
      await client
        .send(
          new DeleteObjectCommand({
            Bucket: R2_UPLOADS_BUCKET,
            Key: intent.uploadKey,
          }),
        )
        .catch(() => undefined);
      throw new HttpsError(
        "invalid-argument",
        "A foto enviada não corresponde ao arquivo autorizado.",
      );
    }

    await intentReference.update({
      status: "finalizing",
      updatedAt: FieldValue.serverTimestamp(),
    });

    await client.send(
      new CopyObjectCommand({
        Bucket: R2_MEDIA_BUCKET,
        CacheControl: "public,max-age=31536000,immutable",
        ContentType: intent.mimeType,
        CopySource: getCopySource(R2_UPLOADS_BUCKET, intent.uploadKey),
        Key: intent.mediaKey,
        MetadataDirective: "REPLACE",
      }),
    );

    const avatarURL = getPublicMediaUrl(intent.mediaKey);
    const profileReference = database.doc(`profiles/${uid}`);
    let previousMediaKey = "";

    await database.runTransaction(async (transaction) => {
      const [existingMedia, profile] = await Promise.all([
        transaction.get(profileMediaReference),
        transaction.get(profileReference),
      ]);
      const existingData = existingMedia.data();
      previousMediaKey =
        existingData?.storageProvider === "r2" && typeof existingData?.mediaKey === "string"
          ? existingData.mediaKey
          : "";

      transaction.set(profileMediaReference, {
        avatarPath: intent.mediaKey,
        avatarURL,
        createdAt: existingMedia.exists ? existingData?.createdAt : FieldValue.serverTimestamp(),
        cropScale,
        focusX,
        focusY,
        mediaKey: intent.mediaKey,
        sourceHeight,
        sourceWidth,
        storageProvider: "r2",
        uid,
        updatedAt: FieldValue.serverTimestamp(),
      });
      if (profile.exists) {
        transaction.update(profileReference, {
          photoURL: avatarURL,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      transaction.update(intentReference, {
        completedAt: FieldValue.serverTimestamp(),
        status: "completed",
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    await client
      .send(
        new DeleteObjectCommand({
          Bucket: R2_UPLOADS_BUCKET,
          Key: intent.uploadKey,
        }),
      )
      .catch(() => undefined);

    if (previousMediaKey && previousMediaKey !== intent.mediaKey) {
      await client
        .send(
          new DeleteObjectCommand({
            Bucket: R2_MEDIA_BUCKET,
            Key: previousMediaKey,
          }),
        )
        .catch(() => undefined);
    }
    client.destroy();

    return {
      avatarURL,
      cropScale,
      focusX,
      focusY,
      mediaKey: intent.mediaKey,
      sourceHeight,
      sourceWidth,
    };
  },
);
export const updateAvatarCrop = protectedOnCall(
  "updateAvatarCrop",
  { region: REGION },
  async (request) => {
    const uid = requireVerifiedUser(request);
    await verifyRegisteredUser(uid);

    const data = requireCommandRecord(request.data, ["cropScale", "focusX", "focusY"]);
    const cropScale = requireNumber(data.cropScale, "Escala", 0.3, 1);
    const focusX = requireNumber(data.focusX, "Foco horizontal", 0, 100);
    const focusY = requireNumber(data.focusY, "Foco vertical", 0, 100);
    const database = getFirestore();
    const profileMediaReference = database.doc(`profileMedia/${uid}`);

    await database.runTransaction(async (transaction) => {
      const profileMedia = await transaction.get(profileMediaReference);
      if (!profileMedia.exists) {
        throw new HttpsError(
          "failed-precondition",
          "Escolha uma foto antes de ajustar o enquadramento.",
        );
      }

      transaction.update(profileMediaReference, {
        cropScale,
        focusX,
        focusY,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    return { cropScale, focusX, focusY, saved: true };
  },
);
