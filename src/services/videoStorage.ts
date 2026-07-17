import { Platform } from "react-native";
import {
  createLocalVideoReference,
  getLocalVideoStorageKey
} from "../utils/videoMediaReference";

const VIDEO_DATABASE_NAME = "nextstar-media";
const VIDEO_DATABASE_VERSION = 1;
const VIDEO_STORE_NAME = "videos";

type PersistVideoInput = {
  file?: File;
  fileName: string;
  mimeType?: string;
  uri: string;
};

type StoredVideo = {
  blob: Blob;
  createdAt: string;
  fileName: string;
  mimeType: string;
};

function openVideoDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is unavailable."));
      return;
    }

    const request = indexedDB.open(
      VIDEO_DATABASE_NAME,
      VIDEO_DATABASE_VERSION
    );

    request.onerror = () => reject(request.error ?? new Error("Database error."));
    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(VIDEO_STORE_NAME)) {
        database.createObjectStore(VIDEO_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function getVideoBlob(input: PersistVideoInput) {
  if (input.file) {
    return input.file;
  }

  const response = await fetch(input.uri);

  if (!response.ok) {
    throw new Error("The selected video could not be read.");
  }

  return response.blob();
}

export async function persistPickedVideo(
  storageKey: string,
  input: PersistVideoInput
) {
  if (Platform.OS !== "web") {
    return input.uri;
  }

  const blob = await getVideoBlob(input);

  if (blob.size <= 0) {
    throw new Error("The selected video is empty.");
  }

  const database = await openVideoDatabase();

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(VIDEO_STORE_NAME, "readwrite");
      const record: StoredVideo = {
        blob,
        createdAt: new Date().toISOString(),
        fileName: input.fileName,
        mimeType: input.mimeType || blob.type || "video/mp4"
      };

      transaction.onabort = () =>
        reject(transaction.error ?? new Error("Video storage was aborted."));
      transaction.onerror = () =>
        reject(transaction.error ?? new Error("Video storage failed."));
      transaction.oncomplete = () => resolve();
      transaction.objectStore(VIDEO_STORE_NAME).put(record, storageKey);
    });
  } finally {
    database.close();
  }

  return createLocalVideoReference(storageKey);
}

export async function loadStoredVideo(reference: string) {
  const storageKey = getLocalVideoStorageKey(reference);

  if (!storageKey || Platform.OS !== "web") {
    return null;
  }

  const database = await openVideoDatabase();

  try {
    return await new Promise<Blob | null>((resolve, reject) => {
      const transaction = database.transaction(VIDEO_STORE_NAME, "readonly");
      const request = transaction.objectStore(VIDEO_STORE_NAME).get(storageKey);

      request.onerror = () =>
        reject(request.error ?? new Error("Stored video could not be read."));
      request.onsuccess = () => {
        const record = request.result as StoredVideo | undefined;
        resolve(record?.blob instanceof Blob ? record.blob : null);
      };
    });
  } finally {
    database.close();
  }
}

export async function deleteStoredVideo(reference: string) {
  const storageKey = getLocalVideoStorageKey(reference);

  if (!storageKey || Platform.OS !== "web") {
    return false;
  }

  const database = await openVideoDatabase();

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(VIDEO_STORE_NAME, "readwrite");

      transaction.onabort = () =>
        reject(transaction.error ?? new Error("Video deletion was aborted."));
      transaction.onerror = () =>
        reject(transaction.error ?? new Error("Video deletion failed."));
      transaction.oncomplete = () => resolve();
      transaction.objectStore(VIDEO_STORE_NAME).delete(storageKey);
    });
  } finally {
    database.close();
  }

  return true;
}
