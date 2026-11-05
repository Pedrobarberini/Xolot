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
import { reportOperationFailure } from "../shared/observability/logger";
import {
  ProfessionalSettingsByUser,
  PromotionCampaign,
  VideoSubmission
} from "../types";

type PersistedSlice = Exclude<keyof LocalAppState, "version">;

export function usePersistentAppState() {
  const [appState, setAppState] = useState<LocalAppState>(() =>
    createDefaultLocalAppState()
  );
  const [isAppStateLoaded, setIsAppStateLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fallback = createDefaultLocalAppState();

    loadLocalAppState(fallback)
      .then((storedState) => {
        if (isMounted) {
          setAppState(storedState);
        }
      })
      .catch((error: unknown) => {
        reportOperationFailure("cache.load", error);
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
  }, []);

  useEffect(() => {
    if (!isAppStateLoaded) {
      return;
    }

    const saveTimer = setTimeout(() => {
      saveLocalAppState(appState).catch((error: unknown) => {
        reportOperationFailure("cache.save", error);
      });
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

  const setCampaigns: Dispatch<SetStateAction<PromotionCampaign[]>> =
    useCallback((update) => setSlice("campaigns", update), [setSlice]);
  const setProfessionalSettingsByUser: Dispatch<
    SetStateAction<ProfessionalSettingsByUser>
  > = useCallback(
    (update) => setSlice("professionalSettingsByUser", update),
    [setSlice]
  );
  const setSubmissions: Dispatch<SetStateAction<VideoSubmission[]>> =
    useCallback((update) => setSlice("submissions", update), [setSlice]);

  return {
    campaigns: appState.campaigns,
    isAppStateLoaded,
    professionalSettingsByUser: appState.professionalSettingsByUser,
    setCampaigns,
    setProfessionalSettingsByUser,
    setSubmissions,
    submissions: appState.submissions
  };
}
