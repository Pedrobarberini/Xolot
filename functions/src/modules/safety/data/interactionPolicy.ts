import type { Firestore, Transaction } from "firebase-admin/firestore";
import { toCallableError } from "../../../platform/callableErrors";
import { assertInteractionPolicy } from "../domain/interactionPolicy";

export async function assertInteractionAllowed(
  transaction: Transaction,
  database: Firestore,
  actorUid: string,
  targetUid: string,
) {
  if (actorUid === targetUid) return;
  const [actor, target] = await Promise.all([
    transaction.get(database.doc(`socialPreferences/${actorUid}`)),
    transaction.get(database.doc(`socialPreferences/${targetUid}`)),
  ]);
  try {
    assertInteractionPolicy(actorUid, targetUid, actor.data(), target.data());
  } catch (error) {
    throw toCallableError(error);
  }
}
