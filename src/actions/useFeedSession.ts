import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Player } from "../types";
import {
  createFeedSession,
  parseFeedSession,
  refreshFeedSession,
  type FeedAnchor,
  type FeedSession,
} from "../utils/feedSession";
import { reportOperationFailure } from "../shared/observability/logger";

export const feedSessionStorageKey = (uid: string) =>
  `@folko/feed-session-v1/${encodeURIComponent(uid)}`;

export function useFeedSession(uid: string | undefined, rankedPlayers: Player[], ready: boolean) {
  const [state, setState] = useState<{ uid: string; value: FeedSession | null } | null>(null);
  const currentUid = useRef(uid);
  currentUid.current = uid;
  const ranked = useRef(rankedPlayers);
  ranked.current = rankedPlayers;
  useEffect(() => {
    let active = true;
    if (!uid) {
      setState(null);
      return;
    }
    void AsyncStorage.getItem(feedSessionStorageKey(uid))
      .then((raw) => {
        if (active) setState({ uid, value: parseFeedSession(raw) });
      })
      .catch((error: unknown) => {
        reportOperationFailure("cache.load", error);
        if (active) setState({ uid, value: null });
      });
    return () => {
      active = false;
    };
  }, [uid]);
  useEffect(() => {
    if (!uid || !ready) return;
    setState((current) =>
      current?.uid === uid && !current.value
        ? { uid, value: createFeedSession(ranked.current.map((player) => player.id)) }
        : current,
    );
  }, [uid, ready, state?.uid]);
  useEffect(() => {
    if (!state?.value || state.uid !== uid) return;
    const key = feedSessionStorageKey(state.uid);
    const value = JSON.stringify(state.value);
    const timer = setTimeout(() => {
      void AsyncStorage.setItem(key, value).catch((error: unknown) =>
        reportOperationFailure("cache.save", error),
      );
    }, 100);
    return () => clearTimeout(timer);
  }, [state, uid]);

  const session = state && state.uid === uid ? state.value : null;
  const entries = useMemo(() => {
    const players = new Map(rankedPlayers.map((player) => [player.id, player]));
    return (
      session?.entries.flatMap((entry) => {
        const player = players.get(entry.playerId);
        return player ? [{ key: entry.key, player }] : [];
      }) ?? []
    );
  }, [rankedPlayers, session?.entries]);
  const saveAnchor = useCallback((anchor: FeedAnchor) => {
    setState((current) => {
      if (
        !current?.value ||
        current.uid !== currentUid.current ||
        !current.value.entries.some((entry) => entry.key === anchor.entryKey) ||
        !Number.isFinite(anchor.progress)
      )
        return current;
      const safe = {
        entryKey: anchor.entryKey,
        progress: Math.max(0, Math.min(1, anchor.progress)),
      };
      if (
        current.value.anchor?.entryKey === safe.entryKey &&
        current.value.anchor.progress === safe.progress
      )
        return current;
      return { ...current, value: { ...current.value, anchor: safe } };
    });
  }, []);
  const refresh = useCallback(() => {
    setState((current) =>
      current?.value && current.uid === currentUid.current
        ? {
            ...current,
            value: refreshFeedSession(
              current.value,
              ranked.current.map((player) => player.id),
            ),
          }
        : current,
    );
  }, []);
  return {
    players: entries.map((entry) => entry.player),
    entryKeys: entries.map((entry) => entry.key),
    anchor: session?.anchor ?? null,
    saveAnchor,
    refresh,
    loaded: !uid || Boolean(session),
  };
}
