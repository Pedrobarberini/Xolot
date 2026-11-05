import type { AccountProfile, PublicProfileDocument } from "../domain/types";

export type ProfileWrite = Omit<AccountProfile, "age"> & {
  age: number;
  uid: string;
  photoURL: string;
  profileCompleted: true;
};

export type ProfileReader = {
  read: (uid: string) => Promise<PublicProfileDocument | null>;
  watchOwn: (
    uid: string,
    onProfile: (profile: PublicProfileDocument | null) => void,
    onError: (error: Error) => void,
  ) => () => void;
  watchPublic: (
    uid: string,
    onProfiles: (profiles: PublicProfileDocument[]) => void,
    onError?: (error: Error) => void,
  ) => () => void;
};

export type ProfileRepository = ProfileReader & {
  saveWithUsername: (profile: ProfileWrite) => Promise<void>;
};
