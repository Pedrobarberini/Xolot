import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ThemeMode } from "./tokens";

export const THEME_STORAGE_KEY = "@xolot/theme-mode-v1";

export type ThemePreferences = {
  load: () => Promise<unknown>;
  save: (mode: ThemeMode) => Promise<void>;
};

export const themePreferences: ThemePreferences = {
  load: () => AsyncStorage.getItem(THEME_STORAGE_KEY),
  save: (mode) => AsyncStorage.setItem(THEME_STORAGE_KEY, mode),
};
