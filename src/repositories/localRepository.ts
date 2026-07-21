import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  LocalAppState,
  createLocalAppStateRepository,
  parseLocalAppState
} from "./appStateSchema";

export const APP_STATE_STORAGE_KEY = "@xolot/app-state-v1";
const LEGACY_APP_STATE_STORAGE_KEY = "@nextstar/app-state-v1";
const appStateRepository = createLocalAppStateRepository(
  AsyncStorage,
  APP_STATE_STORAGE_KEY
);

export async function loadLocalAppState(fallback: LocalAppState) {
  const storedState = await AsyncStorage.getItem(APP_STATE_STORAGE_KEY);

  if (storedState) {
    return parseLocalAppState(storedState, fallback);
  }

  const legacyState = await AsyncStorage.getItem(LEGACY_APP_STATE_STORAGE_KEY);
  const migratedState = parseLocalAppState(legacyState, fallback);

  if (legacyState) {
    await appStateRepository.save(migratedState);
  }

  return migratedState;
}

export async function saveLocalAppState(state: LocalAppState) {
  await appStateRepository.save(state);
}

export async function clearLocalAppState() {
  await Promise.all([
    appStateRepository.clear(),
    AsyncStorage.removeItem(LEGACY_APP_STATE_STORAGE_KEY)
  ]);
}
