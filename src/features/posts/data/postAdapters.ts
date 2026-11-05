import { authUid, postId } from "../../../shared/primitives/ids.ts";
import type { PublishedPost } from "../domain/types";
import { firebasePostToSubmission, type FirebasePostDocument } from "./postDocument.ts";

export function publishedPostFromDocument(
  id: string,
  document: FirebasePostDocument,
): PublishedPost {
  return {
    id: postId(id),
    authorUid: authUid(document.authorId),
    title: document.title,
    description: document.description,
    tags: [...document.tags],
    mentions: [...document.mentions],
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
    status: "published",
    media: {
      kind: document.mediaType,
      provider: document.storageProvider,
      key: document.mediaPath,
      mimeType: document.mimeType,
      fileName: document.fileName,
      sizeBytes: document.fileSize,
      width: document.width,
      height: document.height,
      durationMs: document.durationMs,
    },
  };
}

export function publishedPostToSubmission(post: PublishedPost, mediaURL: string) {
  return firebasePostToSubmission(
    post.id,
    {
      authorId: post.authorUid,
      createdAt: post.createdAt,
      description: post.description,
      durationMs: post.media.durationMs,
      fileName: post.media.fileName,
      fileSize: post.media.sizeBytes,
      height: post.media.height,
      mediaKey: post.media.provider === "r2" ? post.media.key : "",
      mediaPath: post.media.key,
      mediaType: post.media.kind,
      mentions: [...post.mentions],
      mimeType: post.media.mimeType,
      status: "published",
      storageProvider: post.media.provider,
      tags: [...post.tags],
      title: post.title,
      updatedAt: post.updatedAt,
      width: post.media.width,
    },
    mediaURL,
  );
}
