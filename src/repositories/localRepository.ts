import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  LocalAppState,
  createLocalAppStateRepository
} from "./appStateSchema";

export const APP_STATE_STORAGE_KEY = "@nextstar/app-state-v1";
const appStateRepository = createLocalAppStateRepository(
  AsyncStorage,
  APP_STATE_STORAGE_KEY
);

export async function loadLocalAppState(fallback: LocalAppState) {
  return appStateRepository.load(fallback);
}

export async function saveLocalAppState(state: LocalAppState) {
  await appStateRepository.save(state);
}

export async function clearLocalAppState() {
  await appStateRepository.clear();
}
