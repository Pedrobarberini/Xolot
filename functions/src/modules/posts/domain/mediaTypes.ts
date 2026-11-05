export type MediaKind = "image" | "video";
export type UploadIntent = {
  expectedSize: number;
  expiresAtMs: number;
  fileName: string;
  mediaKey: string;
  mediaType: MediaKind;
  mimeType: string;
  ownerUid: string;
  postId: string;
  status: "pending" | "finalizing" | "completed";
  uploadKey: string;
};
export type CreateUploadCommand = {
  postId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  mediaType: MediaKind;
  extension: string;
};
export type FinalizationMetadata = {
  title: string;
  description: string;
  durationMs: number;
  width: number;
  height: number;
  tags: string[];
  mentions: string[];
};
export type PublishedPostRecord = FinalizationMetadata & {
  authorId: string;
  fileName: string;
  fileSize: number;
  mediaKey: string;
  mediaPath: string;
  mediaType: MediaKind;
  mimeType: string;
  status: "published";
  storageProvider: "r2";
};
export type StoredMediaPost = {
  authorId?: unknown;
  mediaKey?: unknown;
  storageProvider?: unknown;
  thumbnailKey?: unknown;
};
