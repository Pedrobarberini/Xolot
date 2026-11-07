import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { isFirebaseMediaEnabled } from "../config/firebase";
import {
  getSafeFirebasePostSyncMessage,
  subscribeFirebasePosts
} from "../services/firebasePostService";
import type { AppUser, VideoSubmission } from "../types";

export function useFirebasePosts(
  user: AppUser | null,
  setSubmissions: Dispatch<SetStateAction<VideoSubmission[]>>,
  isLocalStateLoaded: boolean
) {
  const uid = user?.id;
  const [loadedUserId, setLoadedUserId] = useState("");
  const [postsError, setPostsError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const postsOwner = useRef<string | undefined>(undefined);
  const retryPosts = useCallback(() => setAttempt((current) => current + 1), []);

  useEffect(() => {
    if (!isLocalStateLoaded) {
      return;
    }

    if (!uid || !isFirebaseMediaEnabled()) {
      postsOwner.current = undefined;
      setLoadedUserId("");
      setPostsError("");
      if (!uid) {
        setSubmissions([]);
      }
      return;
    }

    let isMounted = true;
    if (postsOwner.current !== uid) {
      // O cache de publicações legado não é separado por conta.
      setSubmissions([]);
      setLoadedUserId("");
      postsOwner.current = uid;
    }
    setPostsError("");

    const unsubscribe = subscribeFirebasePosts(
      (posts) => {
        if (!isMounted) {
          return;
        }
        setSubmissions(posts);
        setPostsError("");
        setLoadedUserId(uid);
      },
      (error) => {
        if (!isMounted) {
          return;
        }
        if ("code" in error && (error.code === "permission-denied" || error.code === "unauthenticated")) {
          setSubmissions([]);
        }
        setPostsError(getSafeFirebasePostSyncMessage(error));
        setLoadedUserId(uid);
      },
      (warning) => {
        if (isMounted) {
          setPostsError(warning.message);
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [attempt, isLocalStateLoaded, setSubmissions, uid]);

  return {
    isPostsLoaded:
      !user || !isFirebaseMediaEnabled() || loadedUserId === user.id,
    postsError,
    retryPosts
  };
}
