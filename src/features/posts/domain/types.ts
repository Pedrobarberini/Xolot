import type { AuthUid, PostId } from "../../../shared/primitives/ids";

export type SubmissionMediaType = "image" | "video";
export type PublicationStatus =
  | "draft"
  | "processing"
  | "published"
  | "hidden"
  | "rejected"
  | "deleting"
  | "deleted";

export type MediaAsset = {
  kind: SubmissionMediaType;
  provider: "firebase" | "r2";
  key: string;
  mimeType: string;
  fileName: string;
  sizeBytes: number;
  width: number;
  height: number;
  durationMs: number;
};

type PostContent = {
  id: PostId;
  authorUid: AuthUid;
  title: string;
  description: string;
  tags: readonly string[];
  mentions: readonly string[];
  createdAt: string;
  updatedAt: string;
};

export type PublishedPost = PostContent & { status: "published"; media: MediaAsset };
export type Post =
  | PublishedPost
  | (PostContent & {
      status: Exclude<PublicationStatus, "published">;
      media?: MediaAsset;
    });

export type Draft = {
  draftId: string;
  ownerUid: AuthUid;
  title: string;
  description: string;
  tags: string[];
  mentions: string[];
  localMedia?: { uri: string; kind: SubmissionMediaType; fileName: string };
  updatedAt: string;
};
