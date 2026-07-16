import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { loadStoredVideo } from "../services/videoStorage";
import {
  getLocalVideoStorageKey,
  isEphemeralBrowserVideoUri
} from "../utils/videoMediaReference";

type VideoSource = string | number;

type ResolvedVideoSource = {
  source: VideoSource | null;
  status: "loading" | "ready" | "unavailable";
};

function getInitialState(
  source: VideoSource,
  allowEphemeralBrowserUri: boolean
): ResolvedVideoSource {
  if (typeof source === "number") {
    return { source, status: "ready" };
  }

  if (getLocalVideoStorageKey(source)) {
    return { source: null, status: "loading" };
  }

  if (
    Platform.OS === "web" &&
    isEphemeralBrowserVideoUri(source) &&
    !allowEphemeralBrowserUri
  ) {
    return { source: null, status: "unavailable" };
  }

  return { source, status: "ready" };
}

export function useResolvedVideoSource(
  source: VideoSource,
  { allowEphemeralBrowserUri = false } = {}
) {
  const [resolved, setResolved] = useState<ResolvedVideoSource>(() =>
    getInitialState(source, allowEphemeralBrowserUri)
  );

  useEffect(() => {
    let isMounted = true;
    let objectUrl: string | null = null;
    const localReference = typeof source === "string" ? source : null;
    const storageKey = localReference
      ? getLocalVideoStorageKey(localReference)
      : null;

    if (!storageKey || !localReference) {
      setResolved(getInitialState(source, allowEphemeralBrowserUri));
      return () => undefined;
    }

    setResolved({ source: null, status: "loading" });
    loadStoredVideo(localReference)
      .then((blob) => {
        if (!isMounted) {
          return;
        }

        if (!blob || typeof URL === "undefined") {
          setResolved({ source: null, status: "unavailable" });
          return;
        }

        objectUrl = URL.createObjectURL(blob);
        setResolved({ source: objectUrl, status: "ready" });
      })
      .catch(() => {
        if (isMounted) {
          setResolved({ source: null, status: "unavailable" });
        }
      });

    return () => {
      isMounted = false;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [allowEphemeralBrowserUri, source]);

  return resolved;
}
