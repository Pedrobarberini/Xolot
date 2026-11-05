import { HttpsError } from "firebase-functions/v2/https";
import {
  MAX_IMAGE_SIZE,
  MAX_VIDEO_DURATION_MS,
  MAX_VIDEO_SIZE,
  allowedMimeTypes,
  normalizeStringList,
  normalizeTagList,
  requireCommandRecord,
  requireDocumentId,
  requireInteger,
  requireText,
} from "../../validation";
import type { CreateUploadCommand, FinalizationMetadata, MediaKind } from "./domain/mediaTypes";
import { mediaCommandFields } from "./mediaCommandFields";

export function parseCreateUpload(value: unknown): CreateUploadCommand {
  const data = requireCommandRecord(value, mediaCommandFields.create);
  const postId = requireDocumentId(data.postId, "Identificador");
  if (!/^[A-Za-z0-9_-]+$/.test(postId))
    throw new HttpsError("invalid-argument", "Identificador da publicação inválido.");
  const mimeType = requireText(data.mimeType, "Formato", 3, 100).toLowerCase();
  const mime = allowedMimeTypes.get(mimeType);
  const mediaType =
    data.mediaType === "image" ? "image" : data.mediaType === "video" ? "video" : null;
  if (!mime || !mediaType || mime.mediaType !== mediaType)
    throw new HttpsError("invalid-argument", "Formato de mídia não permitido.");
  return {
    postId,
    mimeType,
    mediaType,
    extension: mime.extension,
    fileSize: requireInteger(
      data.fileSize,
      "Tamanho",
      1,
      mediaType === "image" ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE,
    ),
    fileName: requireText(data.fileName, "Nome do arquivo", 1, 160),
  };
}
export function parseFinalization(value: unknown) {
  const data = requireCommandRecord(value, mediaCommandFields.finalize);
  const uploadId = requireDocumentId(data.uploadId, "Upload", 80);
  return {
    uploadId,
    metadata(kind: MediaKind): FinalizationMetadata {
      return {
        durationMs: requireInteger(
          data.durationMs,
          "Duração",
          0,
          kind === "video" ? MAX_VIDEO_DURATION_MS : 0,
        ),
        width: requireInteger(data.width, "Largura", 0, 10_000),
        height: requireInteger(data.height, "Altura", 0, 10_000),
        title: requireText(data.title, "Título", 4, 120),
        description: requireText(data.description, "Descrição", 4, 2000),
        tags: normalizeTagList(data.tags, 10),
        mentions: normalizeStringList(data.mentions, 10, 30),
      };
    },
  };
}
export function parseDeletePost(value: unknown) {
  return requireDocumentId(
    requireCommandRecord(value, mediaCommandFields.delete).postId,
    "Publicação",
  );
}
