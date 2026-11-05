import type { SubmissionMediaType } from "../domain/types";

export type PublicationMediaInput = {
  durationMs?: number;
  file?: File;
  fileName: string;
  fileSize?: number;
  height?: number;
  mediaType: SubmissionMediaType;
  mimeType?: string;
  uri: string;
  width?: number;
};

export type Player = {
  id: string;
  profileId: string;
  ownerUserId?: string;
  name: string;
  username?: string;
  age: number;
  city: string;
  position: string;
  sport?: string;
  club: string;
  videoTitle: string;
  videoLength: string;
  videoUri: string | number;
  mediaType?: SubmissionMediaType;
  mediaHeight?: number;
  mediaWidth?: number;
  hasAudio?: boolean;
  highlight: string;
  tags: string[];
  mentions?: string[];
};

export type VideoSubmissionStatus = "Em revisão" | "Ajustes solicitados" | "Aprovado" | "Reprovado";

export type VideoSubmission = {
  id: string;
  userId: string;
  athleteName: string;
  age: number;
  city: string;
  position: string;
  club: string;
  videoTitle: string;
  videoLink: string;
  mediaType?: SubmissionMediaType;
  videoDurationMs?: number;
  videoFileName?: string;
  videoFileSize?: number;
  mediaHeight?: number;
  mediaWidth?: number;
  mimeType?: string;
  storagePath?: string;
  highlight: string;
  tags?: string[];
  mentions?: string[];
  hasGuardianConsent: boolean;
  status: VideoSubmissionStatus;
  submittedAt: string;
  reviewNote?: string;
  approvedAt?: string;
};
