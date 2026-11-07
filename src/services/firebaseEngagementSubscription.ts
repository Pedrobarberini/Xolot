import {
  collection,
  documentId,
  onSnapshot,
  onSnapshotsInSync,
  query,
  where,
} from "firebase/firestore";
import { getFirebaseFirestore } from "../config/firebase";
import type { EngagementSnapshot } from "../utils/optimisticEngagement";

export function engagementChunks(ids: readonly string[]) {
  const unique = [...new Set(ids)].filter(
    (id) => id.length > 0 && id.length <= 128 && !id.includes("/"),
  );
  return Array.from({ length: Math.ceil(unique.length / 30) }, (_, index) =>
    unique.slice(index * 30, (index + 1) * 30),
  );
}

// Apenas métricas/marcadores dos posts carregados, em lotes de até 30 IDs.
export function subscribeFirebaseEngagement(
  uid: string,
  playerIds: readonly string[],
  onChange: (snapshot: EngagementSnapshot) => void,
  onError: (error: Error) => void,
) {
  const db = getFirebaseFirestore();
  const groups = engagementChunks(playerIds);
  const counts = new Map<string, EngagementSnapshot["engagementByPlayer"]>();
  const liked = new Map<number, string[]>();
  const viewed = new Map<number, string[]>();
  let active = true;
  let scheduled = false;
  const ready = new Set<string>();
  const emit = () => {
    if (!active || scheduled || ready.size !== groups.length * 3) return;
    scheduled = true;
    void Promise.resolve().then(() => {
      scheduled = false;
      if (active)
        onChange({
          engagementByPlayer: Object.assign({}, ...counts.values()),
          likedPlayerIds: [...liked.values()].flat(),
          viewedPlayerIds: [...viewed.values()].flat(),
        });
    });
  };
  const fail = (error: Error) => {
    if (active) onError(error);
  };
  const unsubscribe = groups.flatMap((ids, index) => [
    onSnapshot(
      query(collection(db, "postEngagement"), where(documentId(), "in", ids)),
      (snapshot) => {
        const count = (value: unknown) =>
          typeof value === "number" && Number.isSafeInteger(value) && value > 0 ? value : 0;
        counts.set(
          String(index),
          Object.fromEntries(
            snapshot.docs.map((document) => {
              const data = document.data();
              return [
                document.id,
                { likes: count(data.likes), shares: count(data.shares), views: count(data.views) },
              ];
            }),
          ),
        );
        ready.add(`counts:${index}`);
      },
      fail,
    ),
    ...(["userPostLikes", "userPostViews"] as const).map((name) =>
      onSnapshot(
        query(collection(db, name, uid, "posts"), where(documentId(), "in", ids)),
        (snapshot) => {
          (name === "userPostLikes" ? liked : viewed).set(
            index,
            snapshot.docs.map((document) => document.id),
          );
          ready.add(`${name}:${index}`);
        },
        fail,
      ),
    ),
  ]);
  const stopSync = onSnapshotsInSync(db, emit);
  emit();
  return () => {
    active = false;
    stopSync();
    unsubscribe.forEach((stop) => stop());
  };
}
