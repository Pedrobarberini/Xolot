import type { ProfileAvatar, ProfileAvatarsByProfile } from "../types";

export const DEFAULT_AVATAR_FOCUS = 50;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function clampFocus(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_AVATAR_FOCUS;
  }

  return Math.min(Math.max(value, 0), 100);
}

function normalizeDimension(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : undefined;
}

export function normalizeProfileAvatar(value: unknown): ProfileAvatar | null {
  if (typeof value === "string" && value.trim()) {
    return {
      focusX: DEFAULT_AVATAR_FOCUS,
      focusY: DEFAULT_AVATAR_FOCUS,
      uri: value
    };
  }

  if (!isRecord(value) || typeof value.uri !== "string" || !value.uri.trim()) {
    return null;
  }

  return {
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
