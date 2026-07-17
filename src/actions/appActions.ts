import { colors } from "../theme";
import { Player, VideoSubmission } from "../types";
import { CardPalette } from "../ui/types";

const CARD_PALETTE: CardPalette = {
  name: "NextStar",
  card: colors.surface,
  media: colors.media,
  border: colors.border,
  accent: colors.primary,
  accentSoft: colors.primarySoft,
  text: colors.text,
  muted: colors.muted,
  tagBackground: colors.surfaceMuted,
  progressTrack: colors.border,
  onAccent: colors.onPrimary
};

export function buildPlayerFromSubmission(submission: VideoSubmission): Player {
  return {
    id: `approved-${submission.id}`,
    profileId: `profile-${submission.userId}`,
    ownerUserId: submission.userId,
    name: submission.athleteName,
    age: submission.age,
    city: submission.city,
    position: submission.position,
    club: submission.club,
    videoTitle: submission.videoTitle,
    videoLength: formatVideoDuration(submission.videoDurationMs) ?? "",
    videoUri: submission.videoLink,
    hasAudio: true,
    highlight: submission.highlight,
    tags: ["Novo", "Publicado"]
  };
}

export function formatVideoDuration(milliseconds?: number | null) {
  if (!milliseconds || milliseconds <= 0) {
    return null;
  }

  const totalSeconds = Math.max(1, Math.round(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function formatPlaybackTime(seconds: number) {
  const totalSeconds = Number.isFinite(seconds)
    ? Math.max(0, Math.floor(seconds))
    : 0;
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function getPointerLocationX(nativeEvent: unknown) {
  if (!nativeEvent || typeof nativeEvent !== "object") {
    return null;
  }

  const { locationX, offsetX } = nativeEvent as {
    locationX?: unknown;
    offsetX?: unknown;
  };

  if (typeof locationX === "number" && Number.isFinite(locationX)) {
    return locationX;
  }

  if (typeof offsetX === "number" && Number.isFinite(offsetX)) {
    return offsetX;
  }

  return null;
}

export function getPointerLocationY(nativeEvent: unknown) {
  if (!nativeEvent || typeof nativeEvent !== "object") {
    return null;
  }

  const { locationY, offsetY } = nativeEvent as {
    locationY?: unknown;
    offsetY?: unknown;
  };

  if (typeof locationY === "number" && Number.isFinite(locationY)) {
    return locationY;
  }

  if (typeof offsetY === "number" && Number.isFinite(offsetY)) {
    return offsetY;
  }

  return null;
}

export function formatVideoFileSize(bytes?: number) {
  if (!bytes || bytes <= 0) {
    return null;
  }

  const megabytes = bytes / (1024 * 1024);
  return `${megabytes < 10 ? megabytes.toFixed(1) : Math.round(megabytes)} MB`;
}

export function getVideoTitleFromFileName(fileName?: string | null) {
  if (!fileName) {
    return "Meus melhores lances";
  }

  return fileName.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
}

export function getCardPalette(index: number) {
  return CARD_PALETTE;
}

export function getCardPaletteFromId(id: string) {
  const total = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return getCardPalette(total);
}

export function getScoreColor(score: number) {
  if (score >= 85) {
    return colors.primary;
  }

  if (score >= 78) {
    return colors.warning;
  }

  return colors.danger;
}
