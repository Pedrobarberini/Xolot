import { likeTransition, viewTransition } from "../domain/engagement";
import type { EngagementRepository } from "./engagementRepository";

export type EngagementPostReference = { playerId: string; postId: string };
export function createEngagementService(repository: EngagementRepository) {
  return {
    setLike: (uid: string, post: EngagementPostReference, liked: boolean) =>
      repository.transact({ uid, ...post, kind: "like" }, (snapshot) =>
        likeTransition(snapshot, liked),
      ),
    recordView: (uid: string, post: EngagementPostReference) =>
      repository.transact({ uid, ...post, kind: "view" }, viewTransition),
  };
}
