import type { PublishedPostRecord, StoredMediaPost, UploadIntent } from "../domain/mediaTypes";

export type PostMediaRepository = {
  getPost: (id: string) => Promise<StoredMediaPost | null>;
  createIntent: (id: string, intent: UploadIntent) => Promise<void>;
  getIntent: (id: string) => Promise<UploadIntent | null>;
  markFinalizing: (id: string) => Promise<void>;
  publish: (uploadId: string, postId: string, record: PublishedPostRecord) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  consumeCreateQuota: (uid: string, nowMs: number, maximum: number) => Promise<void>;
};
export type PostMediaStorage = {
  signUpload: (key: string, mimeType: string, ttlSeconds: number) => Promise<string>;
  headUpload: (key: string) => Promise<{ size?: number; mimeType?: string }>;
  copyToPublic: (sourceKey: string, targetKey: string, mimeType: string) => Promise<void>;
  deleteUpload: (key: string) => Promise<void>;
  deletePublic: (key: string) => Promise<void>;
};
export type MediaDependencies = {
  repository: PostMediaRepository;
  createStorage: () => PostMediaStorage;
  publicUrl: (key: string) => string;
  clock: { now: () => number };
  ids: { next: () => string };
  reportSigningFailure: (error: unknown) => void;
  intentTtlSeconds: number;
  uploadUrlTtlSeconds: number;
  maximumIntentsPerMinute: number;
};
