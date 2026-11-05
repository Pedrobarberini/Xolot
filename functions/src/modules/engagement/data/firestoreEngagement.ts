import { FieldValue, type Firestore } from "firebase-admin/firestore";
import type { EngagementRepository } from "../application/engagementRepository";
import { normalizedCount } from "../domain/engagement";

export function createFirestoreEngagementRepository(
  database: () => Firestore,
): EngagementRepository {
  return {
    async transact(key, decide) {
      const db = database();
      const postReference = db.doc(`posts/${key.postId}`);
      const edgeReference = db.doc(
        `${key.kind === "like" ? "userPostLikes" : "userPostViews"}/${key.uid}/posts/${key.playerId}`,
      );
      const engagementReference = db.doc(`postEngagement/${key.playerId}`);
      // O resultado pertence apenas à tentativa que o SDK confirmar; não há acumulador externo.
      return db.runTransaction(async (transaction) => {
        const [post, edge, engagement] = await Promise.all([
          transaction.get(postReference),
          transaction.get(edgeReference),
          transaction.get(engagementReference),
        ]);
        const data = engagement.data();
        const change = decide({
          published: post.exists && post.data()?.status === "published",
          edgeExists: edge.exists,
          counts: {
            likes: normalizedCount(data?.likes),
            shares: normalizedCount(data?.shares),
            views: normalizedCount(data?.views),
          },
        });
        if (change.mutation) {
          if (change.mutation.edge === "create")
            transaction.set(edgeReference, {
              createdAt: FieldValue.serverTimestamp(),
              playerId: key.playerId,
              userId: key.uid,
            });
          else transaction.delete(edgeReference);
          transaction.set(
            engagementReference,
            {
              ...change.mutation.counts,
              playerId: key.playerId,
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true },
          );
        }
        return change.result;
      });
    },
  };
}
