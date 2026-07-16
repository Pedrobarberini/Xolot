import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState
} from "react";
import {
  LocalAppState,
  createDefaultLocalAppState
} from "../repositories/appStateSchema";
import {
  loadLocalAppState,
  saveLocalAppState
} from "../repositories/localRepository";
import {
  AppUser,
  AthleteFund,
  Investment,
  VideoSubmission
} from "../types";

type PersistedSlice = Exclude<keyof LocalAppState, "version">;

export function usePersistentAppState(initialFunds: AthleteFund[]) {
  const [appState, setAppState] = useState<LocalAppState>(() =>
    createDefaultLocalAppState(initialFunds)
  );
  const [isAppStateLoaded, setIsAppStateLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fallback = createDefaultLocalAppState(initialFunds);

    loadLocalAppState(fallback)
      .then((storedState) => {
        if (isMounted) {
          setAppState(storedState);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAppState(fallback);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsAppStateLoaded(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [initialFunds]);

  useEffect(() => {
    if (!isAppStateLoaded) {
      return;
    }

    const saveTimer = setTimeout(() => {
      saveLocalAppState(appState).catch(() => undefined);
    }, 80);

    return () => clearTimeout(saveTimer);
  }, [appState, isAppStateLoaded]);

  const setSlice = useCallback(
    <Key extends PersistedSlice>(
      key: Key,
      update: SetStateAction<LocalAppState[Key]>
    ) => {
      setAppState((current) => ({
        ...current,
        [key]:
          typeof update === "function"
            ? (update as (value: LocalAppState[Key]) => LocalAppState[Key])(
                current[key]
              )
            : update
      }));
    },
    []
  );

  const setUser: Dispatch<SetStateAction<AppUser | null>> = useCallback(
    (update) => setSlice("activeUser", update),
    [setSlice]
  );
  const setAthleteFunds: Dispatch<SetStateAction<AthleteFund[]>> = useCallback(
    (update) => setSlice("athleteFunds", update),
    [setSlice]
  );
  const setInvestments: Dispatch<SetStateAction<Investment[]>> = useCallback(
    (update) => setSlice("investments", update),
    [setSlice]
  );
  const setRegisteredUsers: Dispatch<SetStateAction<AppUser[]>> = useCallback(
    (update) => setSlice("registeredUsers", update),
    [setSlice]
  );
  const setSubmissions: Dispatch<SetStateAction<VideoSubmission[]>> =
    useCallback((update) => setSlice("submissions", update), [setSlice]);
  const setWalletBalances: Dispatch<
    SetStateAction<Record<string, number>>
  > = useCallback(
    (update) => setSlice("walletBalances", update),
    [setSlice]
  );

  return {
    athleteFunds: appState.athleteFunds,
    investments: appState.investments,
    isAppStateLoaded,
    registeredUsers: appState.registeredUsers,
    setAthleteFunds,
    setInvestments,
    setRegisteredUsers,
    setSubmissions,
    setUser,
    setWalletBalances,
    submissions: appState.submissions,
    user: appState.activeUser,
    walletBalances: appState.walletBalances
  };
}
