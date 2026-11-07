export const FEED_HISTORY_LIMIT = 200;
export const FEED_REFRESH_SIZE = 20;
export type FeedAnchor = { entryKey: string; progress: number };
export type FeedEntry = { key: string; playerId: string };
export type FeedSession = {
  version: 1;
  generation: number;
  entries: FeedEntry[];
  anchor: FeedAnchor | null;
};
const validId = (id: unknown): id is string =>
  typeof id === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(id);

export function createFeedSession(ids: string[]): FeedSession {
  return {
    version: 1,
    generation: 0,
    entries: [...new Set(ids)]
      .filter(validId)
      .slice(0, FEED_HISTORY_LIMIT)
      .map((playerId) => ({ key: `0:${playerId}`, playerId })),
    anchor: null,
  };
}

// Cada lote tem identidade própria: o feed anterior continua na mesma sequência abaixo dele.
export function refreshFeedSession(session: FeedSession, rankedIds: string[]): FeedSession {
  const generation = session.generation + 1;
  const ids = [...new Set(rankedIds)].filter(validId);
  const previous = new Set(session.entries.map((entry) => entry.playerId));
  const fresh = [
    ...ids.filter((id) => !previous.has(id)),
    ...ids.filter((id) => previous.has(id)),
  ].slice(0, FEED_REFRESH_SIZE);
  const entries = [
    ...fresh.map((playerId) => ({ key: `${generation}:${playerId}`, playerId })),
    ...session.entries,
  ].slice(0, FEED_HISTORY_LIMIT);
  return {
    version: 1,
    generation,
    entries,
    anchor: entries[0] ? { entryKey: entries[0].key, progress: 0 } : null,
  };
}

export function parseFeedSession(raw: string | null): FeedSession | null {
  if (!raw || raw.length > 100_000) return null;
  try {
    const data = JSON.parse(raw) as FeedSession;
    if (
      data.version !== 1 ||
      !Number.isSafeInteger(data.generation) ||
      data.generation < 0 ||
      !Array.isArray(data.entries) ||
      data.entries.length > FEED_HISTORY_LIMIT
    )
      return null;
    const keys = new Set<string>();
    for (const entry of data.entries) {
      if (
        !entry ||
        !validId(entry.playerId) ||
        typeof entry.key !== "string" ||
        !/^[0-9]+:[A-Za-z0-9_-]{1,128}$/.test(entry.key) ||
        keys.has(entry.key)
      )
        return null;
      keys.add(entry.key);
    }
    const anchor =
      data.anchor &&
      keys.has(data.anchor.entryKey) &&
      Number.isFinite(data.anchor.progress) &&
      data.anchor.progress >= 0 &&
      data.anchor.progress <= 1
        ? { entryKey: data.anchor.entryKey, progress: data.anchor.progress }
        : null;
    return {
      version: 1,
      generation: data.generation,
      entries: data.entries.map(({ key, playerId }) => ({ key, playerId })),
      anchor,
    };
  } catch {
    return null;
  }
}

export function resolveFeedAnchor(keys: string[], anchor: FeedAnchor | null) {
  const found = anchor ? keys.indexOf(anchor.entryKey) : -1;
  return { index: Math.max(0, found), progress: found >= 0 ? anchor!.progress : 0 };
}
