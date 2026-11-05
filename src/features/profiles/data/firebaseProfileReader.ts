import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  query,
  type Firestore,
} from "firebase/firestore";
import { normalizePublicProfileDocument } from "../../../utils/firebaseProfileDocument.ts";
import type { PublicProfileDocument } from "../domain/types";
import type { ProfileReader } from "../application/profileRepository";

export function createFirebaseProfileReader(database: () => Firestore): ProfileReader {
  return {
    async read(uid: string) {
      const snapshot = await getDoc(doc(database(), "profiles", uid));
      return snapshot.exists() ? normalizePublicProfileDocument(uid, snapshot.data()) : null;
    },
    watchOwn(
      uid: string,
      onProfile: (profile: PublicProfileDocument | null) => void,
      onError: (error: Error) => void,
    ) {
      return onSnapshot(
        doc(database(), "profiles", uid),
        (snapshot) => {
          onProfile(
            snapshot.exists() ? normalizePublicProfileDocument(uid, snapshot.data()) : null,
          );
        },
        onError,
      );
    },
    watchPublic(
      currentUid: string,
      onProfiles: (profiles: PublicProfileDocument[]) => void,
      onError?: (error: Error) => void,
    ) {
      // Compatibilidade da consulta legada; Q03 substitui o limite global por páginas.
      return onSnapshot(
        query(collection(database(), "profiles"), limit(200)),
        (snapshot) => {
          onProfiles(
            snapshot.docs
              .map((item) =>
                normalizePublicProfileDocument(item.id, item.data(), {
                  allowLegacyFallback: item.id !== currentUid,
                }),
              )
              .filter((profile): profile is PublicProfileDocument => profile !== null),
          );
        },
        onError,
      );
    },
  };
}
