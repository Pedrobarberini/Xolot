export type PostCounts = { likes: number; shares: number; views: number };
export type EngagementSnapshot = {
  engagementByPlayer: Record<string, PostCounts>;
  likedPlayerIds: string[];
  viewedPlayerIds: string[];
};
type LikeIntent = {
  desired: boolean;
  confirmed: boolean;
  base: boolean;
  likes: number;
  running: boolean;
};
const emptyCounts = () => ({ likes: 0, shares: 0, views: 0 });

// Intenções são serializadas por post. Callbacks de uma sessão encerrada não alcançam a UI.
export function createOptimisticEngagement(ports: {
  setLike: (id: string, liked: boolean) => Promise<boolean>;
  recordView: (id: string) => Promise<boolean>;
  onChange: (snapshot: EngagementSnapshot) => void;
  onError: (error: unknown) => void;
}) {
  let active = true;
  let remote: EngagementSnapshot = {
    engagementByPlayer: {},
    likedPlayerIds: [],
    viewedPlayerIds: [],
  };
  const likes = new Map<string, LikeIntent>();
  const views = new Map<string, { views: number; done: boolean }>();
  const shares = new Map<string, { base: number; operations: Map<string, boolean> }>();
  const seen = new Set<string>();

  function emit() {
    if (!active) return;
    const liked = new Set(remote.likedPlayerIds);
    const viewed = new Set(remote.viewedPlayerIds);
    const counts = { ...remote.engagementByPlayer };
    for (const [id, intent] of likes) {
      if (intent.desired) liked.add(id);
      else liked.delete(id);
      counts[id] = {
        ...(counts[id] ?? emptyCounts()),
        likes: Math.max(0, intent.likes + Number(intent.desired) - Number(intent.base)),
      };
    }
    for (const [id, intent] of views) {
      viewed.add(id);
      counts[id] = { ...(counts[id] ?? emptyCounts()), views: intent.views + 1 };
    }
    for (const [id, intent] of shares) {
      counts[id] = {
        ...(counts[id] ?? emptyCounts()),
        shares: Math.max(counts[id]?.shares ?? 0, intent.base + intent.operations.size),
      };
    }
    ports.onChange({
      engagementByPlayer: counts,
      likedPlayerIds: [...liked],
      viewedPlayerIds: [...viewed],
    });
  }

  function settle(id: string, intent: LikeIntent) {
    if (!intent.running && remote.likedPlayerIds.includes(id) === intent.desired) likes.delete(id);
  }
  function settleShares(id: string) {
    const intent = shares.get(id);
    if (
      intent &&
      (!intent.operations.size ||
        ([...intent.operations.values()].every(Boolean) &&
          (remote.engagementByPlayer[id]?.shares ?? 0) >= intent.base + intent.operations.size))
    )
      shares.delete(id);
  }
  async function sendLike(id: string, intent: LikeIntent) {
    intent.running = true;
    try {
      while (active) {
        const sent = intent.desired;
        const confirmed = await ports.setLike(id, sent);
        if (!active) return;
        intent.confirmed = confirmed;
        if (sent === intent.desired) break;
      }
      intent.running = false;
      settle(id, intent);
    } catch (error) {
      if (!active) return;
      likes.delete(id);
      // Reverte para o último valor confirmado, sem manter curtida fictícia após falha.
      remote.likedPlayerIds = remote.likedPlayerIds.filter((value) => value !== id);
      if (intent.confirmed) remote.likedPlayerIds.push(id);
      remote.engagementByPlayer = {
        ...remote.engagementByPlayer,
        [id]: {
          ...(remote.engagementByPlayer[id] ?? emptyCounts()),
          likes: Math.max(0, intent.likes + Number(intent.confirmed) - Number(intent.base)),
        },
      };
      ports.onError(error);
    }
    emit();
  }

  return {
    update(snapshot: EngagementSnapshot) {
      if (!active) return;
      remote = snapshot;
      for (const [id, intent] of likes) settle(id, intent);
      for (const [id, intent] of views)
        if (intent.done && snapshot.viewedPlayerIds.includes(id)) views.delete(id);
      for (const id of snapshot.viewedPlayerIds) seen.add(id);
      for (const id of shares.keys()) settleShares(id);
      emit();
    },
    toggleLike(id: string) {
      if (!active) return;
      let intent = likes.get(id);
      if (!intent) {
        const base = remote.likedPlayerIds.includes(id);
        intent = {
          desired: base,
          confirmed: base,
          base,
          likes: remote.engagementByPlayer[id]?.likes ?? 0,
          running: false,
        };
        likes.set(id, intent);
      }
      intent.desired = !intent.desired;
      emit();
      if (!intent.running) void sendLike(id, intent);
    },
    recordView(id: string) {
      if (!active || seen.has(id) || views.has(id)) return;
      const intent = { views: remote.engagementByPlayer[id]?.views ?? 0, done: false };
      views.set(id, intent);
      emit();
      void ports
        .recordView(id)
        .then((recorded) => {
          if (!active) return;
          seen.add(id);
          intent.done = true;
          if (!recorded || remote.viewedPlayerIds.includes(id)) views.delete(id);
          emit();
        })
        .catch((error: unknown) => {
          if (!active) return;
          views.delete(id);
          ports.onError(error);
          emit();
        });
    },
    beginShare(id: string, operationId: string) {
      if (!active) return (_succeeded: boolean) => undefined;
      let intent = shares.get(id);
      if (!intent) {
        intent = { base: remote.engagementByPlayer[id]?.shares ?? 0, operations: new Map() };
        shares.set(id, intent);
      }
      if (!intent.operations.has(operationId)) intent.operations.set(operationId, false);
      emit();
      const current = intent;
      let completed = false;
      return (succeeded: boolean) => {
        if (!active || completed || shares.get(id) !== current) return;
        completed = true;
        if (succeeded) current.operations.set(operationId, true);
        else current.operations.delete(operationId);
        settleShares(id);
        emit();
      };
    },
    dispose() {
      active = false;
      likes.clear();
      views.clear();
      shares.clear();
      seen.clear();
    },
  };
}
