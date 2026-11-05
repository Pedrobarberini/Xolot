import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useSession } from "../features/auth";
import { getCurrentFirebaseUser } from "../services/firebaseAccountService";
import { subscribeFirebaseProfiles } from "../services/firebaseProfileService";
import type { AppUser } from "../types";

// Fachada de composição: sessão pertence a auth, lista social será paginada em Q03.
export function useFirebaseAccounts() {
  const { isSessionLoaded, sessionError, user, replaceAccount } = useSession();
  const [registeredUsers, setRegisteredUsers] = useState<AppUser[]>([]);
  const [profilesError, setProfilesError] = useState("");
  const currentAccount = useRef(user);
  currentAccount.current = user;
  const uid = user?.id;
  useEffect(() => {
    let active = true;
    const account = currentAccount.current;
    setProfilesError("");
    setRegisteredUsers(account?.profileCompleted ? [account] : []);
    const identity = getCurrentFirebaseUser();
    if (!uid || !identity?.emailVerified || identity.uid !== uid) return;
    const cleanup = subscribeFirebaseProfiles(
      identity,
      (profiles) => {
        if (active) setRegisteredUsers(profiles);
      },
      () => {
        if (active) setProfilesError("Não foi possível sincronizar os perfis agora.");
      },
    );
    return () => {
      active = false;
      cleanup();
    };
  }, [uid]);

  const setUser: Dispatch<SetStateAction<AppUser | null>> = useCallback(
    (update) => {
      const next = typeof update === "function" ? update(currentAccount.current) : update;
      if (next === null) {
        replaceAccount(null);
        return;
      }
      if (typeof next.email !== "string" || typeof next.acceptedTerms !== "boolean") return;
      replaceAccount({ ...next, email: next.email, acceptedTerms: next.acceptedTerms });
    },
    [replaceAccount],
  );

  return {
    isSessionLoaded,
    registeredUsers,
    sessionError: sessionError || profilesError,
    setRegisteredUsers,
    setUser,
    user,
  };
}
