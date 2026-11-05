import { FirebaseError } from "firebase/app";
import {
  doc,
  getDocFromServer,
  runTransaction,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";
import { UsernameAlreadyInUseError, InvalidPublicProfileError } from "../domain/errors.ts";
import { normalizeUsername } from "../../../utils/userIdentity.ts";
import type { ProfileRepository, ProfileWrite } from "../application/profileRepository.ts";
import { createFirebaseProfileReader } from "./firebaseProfileReader.ts";
export function createFirebaseProfileRepository(database: () => Firestore): ProfileRepository {
  return {
    ...createFirebaseProfileReader(database),
    async saveWithUsername(normalizedProfile: ProfileWrite) {
      const { uid, username } = normalizedProfile;
      const firestore = database();
      const PROFILES_COLLECTION = "profiles";
      const USERNAMES_COLLECTION = "usernames";
      const profileReference = doc(firestore, PROFILES_COLLECTION, uid);
      const usernameReference = doc(firestore, USERNAMES_COLLECTION, username);

      await runTransaction(firestore, async (transaction) => {
        const profileSnapshot = await transaction.get(profileReference);
        const previousUsername = profileSnapshot.exists()
          ? normalizeUsername(String(profileSnapshot.data().username ?? ""))
          : "";
        const usernameSnapshot = await transaction.get(usernameReference);
        const previousUsernameReference =
          previousUsername && previousUsername !== username
            ? doc(firestore, USERNAMES_COLLECTION, previousUsername)
            : null;
        const previousUsernameSnapshot = previousUsernameReference
          ? await transaction.get(previousUsernameReference)
          : null;

        if (usernameSnapshot.exists() && usernameSnapshot.data().uid !== uid) {
          throw new UsernameAlreadyInUseError();
        }

        if (previousUsernameSnapshot?.exists() && previousUsernameSnapshot.data().uid !== uid) {
          throw new InvalidPublicProfileError();
        }

        const currentProfileData = profileSnapshot.data();
        const serverManagedProfileFields = {
          ...(typeof currentProfileData?.identityVerified === "boolean"
            ? { identityVerified: currentProfileData.identityVerified }
            : {}),
          ...(typeof currentProfileData?.plusActive === "boolean"
            ? { plusActive: currentProfileData.plusActive }
            : {}),
        };

        transaction.set(profileReference, {
          ...normalizedProfile,
          ...serverManagedProfileFields,
          createdAt: profileSnapshot.exists()
            ? profileSnapshot.data().createdAt
            : serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        if (!usernameSnapshot.exists()) {
          transaction.set(usernameReference, {
            createdAt: serverTimestamp(),
            uid,
          });
        }

        if (previousUsernameReference && previousUsernameSnapshot?.exists()) {
          transaction.delete(previousUsernameReference);
        }
      }).catch(async (error: unknown) => {
        // Rules podem negar o commit concorrente antes de o SDK refazer a leitura.
        // Só traduzir o erro se o servidor comprovar uma reserva de outro UID.
        if (
          error instanceof FirebaseError &&
          (error.code === "permission-denied" || error.code === "aborted")
        ) {
          const reservation = await getDocFromServer(usernameReference).catch(() => null);
          if (reservation?.exists() && reservation.data().uid !== uid) {
            throw new UsernameAlreadyInUseError();
          }
        }
        throw error;
      });
    },
  };
}
