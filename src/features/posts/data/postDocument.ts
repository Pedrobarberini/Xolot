import type { SubmissionMediaType, VideoSubmission } from "../../../types";
import {
  MAX_IMAGE_FILE_SIZE,
  MAX_VIDEO_DURATION_MS,
  MAX_VIDEO_FILE_SIZE,
  isAllowedMediaMimeType,
} from "../../../utils/publicationMedia.ts";

export type FirebasePostDocument = {
  authorId: string;
  createdAt: string;
  description: string;
  durationMs: number;
  fileName: string;
  fileSize: number;
  height: number;
  mediaKey: string;
  mediaPath: string;
  mediaType: SubmissionMediaType;
  mentions: string[];
  mimeType: string;
  status: "published";
  storageProvider: "firebase" | "r2";
  tags: string[];
  title: string;
  updatedAt: string;
  width: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeText(value: unknown, maximumLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maximumLength) : "";
}

function normalizeStringList(value: unknown, maximumItems: number, maximumItemLength: number) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().slice(0, maximumItemLength))
    .filter(Boolean)
    .slice(0, maximumItems);
}

function normalizeInteger(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) ? value : -1;
}

function normalizeTimestamp(value: unknown) {
  if (typeof value === "string" && value.trim()) {
    const timestamp = new Date(value);
    return Number.isNaN(timestamp.getTime()) ? "" : timestamp.toISOString();
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  if (isRecord(value) && typeof value.toDate === "function") {
    const timestamp = value.toDate();
    return timestamp instanceof Date && !Number.isNaN(timestamp.getTime())
      ? timestamp.toISOString()
      : "";
  }

  return "";
}

export function normalizeFirebasePostDocument(
  postId: string,
  value: unknown,
): FirebasePostDocument | null {
  if (!postId.trim() || !isRecord(value)) {
    return null;
  }
  if (value.schemaVersion !== undefined && value.schemaVersion !== 1) return null;

  const authorId = normalizeText(value.authorId, 128);
  const mediaType = value.mediaType === "image" ? "image" : "video";
  const createdAt = normalizeTimestamp(value.createdAt);
  const updatedAt = normalizeTimestamp(value.updatedAt);
  const mediaPath = normalizeText(value.mediaPath, 320);
  const storageProvider = value.storageProvider === "r2" ? "r2" : "firebase";
  const mediaKey = storageProvider === "r2" ? normalizeText(value.mediaKey, 320) : mediaPath;
  const normalized: FirebasePostDocument = {
    authorId,
    createdAt,
    description: normalizeText(value.description, 2000),
    durationMs: normalizeInteger(value.durationMs),
    fileName: normalizeText(value.fileName, 160),
    fileSize: normalizeInteger(value.fileSize),
    height: normalizeInteger(value.height),
    mediaKey,
    mediaPath,
    mediaType,
    mentions: normalizeStringList(value.mentions, 10, 30),
    mimeType: normalizeText(value.mimeType, 100).toLowerCase(),
    status: "published",
    storageProvider,
    tags: normalizeStringList(value.tags, 10, 40),
    title: normalizeText(value.title, 120),
    updatedAt,
    width: normalizeInteger(value.width),
  };
  const maximumFileSize = mediaType === "image" ? MAX_IMAGE_FILE_SIZE : MAX_VIDEO_FILE_SIZE;

  if (
    value.status !== "published" ||
    (value.mediaType !== "image" && value.mediaType !== "video") ||
    authorId.length < 1 ||
    normalized.title.length < 4 ||
    normalized.description.length < 4 ||
    !createdAt ||
    !updatedAt ||
    (normalized.storageProvider === "firebase" &&
      normalized.mediaPath !== `posts/${authorId}/${postId}/media`) ||
    (normalized.storageProvider === "r2" &&
      (normalized.mediaKey !== normalized.mediaPath ||
        !normalized.mediaKey.startsWith(`users/${authorId}/posts/${postId}/`))) ||
    !isAllowedMediaMimeType(mediaType, normalized.mimeType) ||
    normalized.fileName.length < 1 ||
    normalized.fileSize <= 0 ||
    normalized.fileSize > maximumFileSize ||
    normalized.durationMs < 0 ||
    normalized.durationMs > MAX_VIDEO_DURATION_MS ||
    (mediaType === "image" && normalized.durationMs !== 0) ||
    normalized.width < 0 ||
    normalized.width > 10_000 ||
    normalized.height < 0 ||
    normalized.height > 10_000
  ) {
    return null;
  }

  return normalized;
}

export function firebasePostToSubmission(
  postId: string,
  post: FirebasePostDocument,
  mediaURL: string,
): VideoSubmission {
  return {
    age: 0,
    approvedAt: post.createdAt,
    athleteName: "",
    city: "",
    club: "",
    hasGuardianConsent: false,
    highlight: post.description,
    id: postId,
    mediaHeight: post.height || undefined,
    mediaType: post.mediaType,
    mediaWidth: post.width || undefined,
    mentions: post.mentions,
    mimeType: post.mimeType,
    position: "",
    status: "Aprovado",
    storagePath: post.mediaPath,
    submittedAt: post.createdAt,
    tags: post.tags,
    userId: post.authorId,
    videoDurationMs: post.durationMs || undefined,
    videoFileName: post.fileName,
    videoFileSize: post.fileSize,
    videoLink: mediaURL,
    videoTitle: post.title,
  };
}
