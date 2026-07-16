import type { ProfileAvatar, ProfileAvatarsByProfile } from "../types";

export const DEFAULT_AVATAR_FOCUS = 50;
export const DEFAULT_AVATAR_CROP_SCALE = 1 / 1.22;
const MIN_AVATAR_CROP_SCALE = 0.3;
const MAX_AVATAR_CROP_SCALE = 1;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function clampFocus(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_AVATAR_FOCUS;
  }

  return Math.min(Math.max(value, 0), 100);
}

function normalizeCropScale(value: number) {
  return Math.min(
    Math.max(value, MIN_AVATAR_CROP_SCALE),
    MAX_AVATAR_CROP_SCALE
  );
}

function normalizeDimension(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : undefined;
}

export function normalizeProfileAvatar(value: unknown): ProfileAvatar | null {
  if (typeof value === "string" && value.trim()) {
    return {
      cropScale: DEFAULT_AVATAR_CROP_SCALE,
      focusX: DEFAULT_AVATAR_FOCUS,
      focusY: DEFAULT_AVATAR_FOCUS,
      uri: value
    };
  }

  if (!isRecord(value) || typeof value.uri !== "string" || !value.uri.trim()) {
    return null;
  }

  return {
    cropScale:
      typeof value.cropScale === "number" && Number.isFinite(value.cropScale)
        ? normalizeCropScale(value.cropScale)
        : DEFAULT_AVATAR_CROP_SCALE,
    focusX: clampFocus(value.focusX),
    focusY: clampFocus(value.focusY),
    sourceHeight: normalizeDimension(value.sourceHeight),
    sourceWidth: normalizeDimension(value.sourceWidth),
    uri: value.uri
  };
}

export function parseProfileAvatars(
  serializedValue: string | null
): ProfileAvatarsByProfile {
  if (!serializedValue) {
    return {};
  }

  try {
    const parsedValue: unknown = JSON.parse(serializedValue);

    if (!isRecord(parsedValue)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsedValue).flatMap(([profileId, value]) => {
        const avatar = normalizeProfileAvatar(value);

        return profileId.trim() && avatar ? [[profileId, avatar]] : [];
      })
    );
  } catch {
    return {};
  }
}

export function serializeProfileAvatars(
  profileAvatars: ProfileAvatarsByProfile
) {
  return JSON.stringify(profileAvatars);
}
