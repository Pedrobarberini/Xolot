import { getFirestore } from "firebase-admin/firestore";
import type { AccountRegistrationReader } from "../application/requireRegisteredAccount";

export const firestoreRegistration: AccountRegistrationReader = {
  async read(uid) {
    const database = getFirestore();
    const [account, profile] = await Promise.all([
      database.doc(`accounts/${uid}`).get(),
      database.doc(`profiles/${uid}`).get(),
    ]);
    return {
      accountExists: account.exists,
      profileCompleted: profile.data()?.profileCompleted === true,
    };
  },
};
