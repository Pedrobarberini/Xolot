import { useCallback, useEffect, useRef, useState } from "react";
import { subscribeFirebaseEngagement } from "../services/firebaseEngagementSubscription";
import { recordFirebasePostView, setFirebasePostLike } from "../services/firebaseSocialService";
import { createOptimisticEngagement, type EngagementSnapshot } from "../utils/optimisticEngagement";

const empty: EngagementSnapshot = {
  engagementByPlayer: {},
  likedPlayerIds: [],
  viewedPlayerIds: [],
};
export function usePostEngagement(
  uid: string | undefined,
  ids: string[],
  onError: (error: unknown) => void,
) {
  const [state, setState] = useState<{ uid: string; snapshot: EngagementSnapshot } | null>(null);
  const controller = useRef<ReturnType<typeof createOptimisticEngagement> | null>(null);
  const errorHandler = useRef(onError);
  errorHandler.current = onError;
  const scope = JSON.stringify([...new Set(ids)].sort());

  useEffect(() => {
    if (!uid) return;
    const session = createOptimisticEngagement({
      setLike: setFirebasePostLike,
      recordView: recordFirebasePostView,
      onChange: (snapshot) => setState({ uid, snapshot }),
      onError: (error) => errorHandler.current(error),
    });
    controller.current = session;
    return () => {
      session.dispose();
      controller.current = null;
    };
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    const session = controller.current;
    let active = true;
    const stop = subscribeFirebaseEngagement(
      uid,
      JSON.parse(scope) as string[],
      (snapshot) => {
        if (active) session?.update(snapshot);
      },
      (error) => {
        if (active) errorHandler.current(error);
      },
    );
    return () => {
      active = false;
      stop();
    };
  }, [uid, scope]);

  return {
    ...(state && state.uid === uid ? state.snapshot : empty),
    toggleLike: useCallback((id: string) => controller.current?.toggleLike(id), []),
    recordView: useCallback((id: string) => controller.current?.recordView(id), []),
    beginShare: useCallback(
      (id: string, operationId: string) =>
        controller.current?.beginShare(id, operationId) ?? (() => undefined),
      [],
    ),
  };
}
