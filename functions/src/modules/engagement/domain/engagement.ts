import { OperationError } from "../../../domain/OperationError";

export type EngagementCounts = { likes: number; shares: number; views: number };
export type EngagementSnapshot = {
  published: boolean;
  edgeExists: boolean;
  counts: EngagementCounts;
};
export type EngagementChange<Result> = {
  result: Result;
  mutation?: { edge: "create" | "delete"; counts: EngagementCounts };
};

export function normalizedCount(value: unknown) {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0 ? value : 0;
}
function requirePublished(snapshot: EngagementSnapshot) {
  if (!snapshot.published)
    throw new OperationError("not-found", "Esta publicação não está disponível.");
}
export function likeTransition(
  snapshot: EngagementSnapshot,
  liked: boolean,
): EngagementChange<{ liked: boolean }> {
  requirePublished(snapshot);
  if (snapshot.edgeExists === liked) return { result: { liked } };
  return {
    result: { liked },
    mutation: {
      edge: liked ? "create" : "delete",
      counts: {
        ...snapshot.counts,
        likes: liked ? snapshot.counts.likes + 1 : Math.max(0, snapshot.counts.likes - 1),
      },
    },
  };
}
export function viewTransition(
  snapshot: EngagementSnapshot,
): EngagementChange<{ recorded: boolean }> {
  requirePublished(snapshot);
  if (snapshot.edgeExists) return { result: { recorded: false } };
  return {
    result: { recorded: true },
    mutation: { edge: "create", counts: { ...snapshot.counts, views: snapshot.counts.views + 1 } },
  };
}
