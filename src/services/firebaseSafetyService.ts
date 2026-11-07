import { httpsCallable } from "firebase/functions";
import { getFirebaseFunctions } from "../config/firebase";
import { getCurrentFirebaseUser } from "./firebaseAccountService";

export async function setFirebasePostReport(uid: string, playerId: string, active: boolean) {
  const identity = getCurrentFirebaseUser();
  if (identity?.uid !== uid || !identity.emailVerified)
    throw new Error("Entre novamente para enviar a denúncia.");
  const command = httpsCallable<{ playerId: string; active: boolean }, { active: boolean }>(
    getFirebaseFunctions(),
    "setPostReport",
  );
  return (await command({ playerId, active })).data;
}
