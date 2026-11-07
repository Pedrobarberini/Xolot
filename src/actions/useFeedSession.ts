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
  const latestState = useRef(state);
  latestState.current = state;
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    const ids = rankedPlayers.map((player) => player.id);
    const available = new Set(ids);
    setState((current) => {
      if (current?.uid !== uid) return current;
      if (!current.value) return { uid, value: createFeedSession(ids) };
      // Uma resposta inicial vazia ou um histórico fora da janela atual não pode
      // impedir a exibição dos posts que chegaram depois. Históricos visíveis
      // mantêm a ordem e a posição até o usuário tocar no mascote.
      if (ids.length && !current.value.entries.some((entry) => available.has(entry.playerId))) {
        return { uid, value: refreshFeedSession(current.value, ids) };
      }
      return current;
    });
  }, [uid, ready, rankedPlayers, state?.uid]);
  useEffect(() => {
    if (!state?.value || state.uid !== uid) return;
    const key = feedSessionStorageKey(state.uid);
    const value = JSON.stringify(state.value);
    saveTimer.current = setTimeout(() => {
      void AsyncStorage.setItem(key, value).catch((error: unknown) =>
        reportOperationFailure("cache.save", error),
      );
    }, 100);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
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
    const current = latestState.current;
    if (
      !current?.value ||
      current.uid !== currentUid.current ||
      !current.value.entries.some((entry) => entry.key === anchor.entryKey) ||
      !Number.isFinite(anchor.progress)
    )
      return;
    const safe = {
      entryKey: anchor.entryKey,
      progress: Math.max(0, Math.min(1, anchor.progress)),
    };
    if (
      current.value.anchor?.entryKey === safe.entryKey &&
      current.value.anchor.progress === safe.progress
    )
      return;
    const next = { ...current, value: { ...current.value, anchor: safe } };
    latestState.current = next;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    // A última posição também é salva ao sair/recarregar. Nesse momento não
    // podemos depender de um novo render ou de um timer para iniciar a escrita.
    void AsyncStorage.setItem(feedSessionStorageKey(next.uid), JSON.stringify(next.value)).catch(
      (error: unknown) => reportOperationFailure("cache.save", error),
    );
    setState(next);
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
