const LOCAL_VIDEO_REFERENCE_PREFIX = "nextstar-video:";

export function createLocalVideoReference(storageKey: string) {
  const normalizedKey = storageKey.trim();

  if (!normalizedKey) {
    throw new Error("A video storage key is required.");
  }

  return `${LOCAL_VIDEO_REFERENCE_PREFIX}${encodeURIComponent(normalizedKey)}`;
}

export function getLocalVideoStorageKey(reference: string) {
  if (!reference.startsWith(LOCAL_VIDEO_REFERENCE_PREFIX)) {
    return null;
  }

  const encodedKey = reference.slice(LOCAL_VIDEO_REFERENCE_PREFIX.length);

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
