const LOCAL_VIDEO_REFERENCE_PREFIX = "xolot-video:";
const LEGACY_LOCAL_VIDEO_REFERENCE_PREFIX = "nextstar-video:";

export function createLocalVideoReference(storageKey: string) {
  const normalizedKey = storageKey.trim();

  if (!normalizedKey) {
    throw new Error("A video storage key is required.");
  }

  return `${LOCAL_VIDEO_REFERENCE_PREFIX}${encodeURIComponent(normalizedKey)}`;
}

export function getLocalVideoStorageKey(reference: string) {
  const prefix = reference.startsWith(LOCAL_VIDEO_REFERENCE_PREFIX)
    ? LOCAL_VIDEO_REFERENCE_PREFIX
    : reference.startsWith(LEGACY_LOCAL_VIDEO_REFERENCE_PREFIX)
      ? LEGACY_LOCAL_VIDEO_REFERENCE_PREFIX
      : null;

  if (!prefix) {
    return null;
  }

  const encodedKey = reference.slice(prefix.length);

  if (!encodedKey) {
    return null;
  }

  try {
    return decodeURIComponent(encodedKey) || null;
  } catch {
    return null;
  }
}

export function isEphemeralBrowserVideoUri(uri: string) {
  return uri.startsWith("blob:");
}
