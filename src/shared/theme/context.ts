import { createContext, useContext } from "react";
import { darkColors, type ThemeColors, type ThemeMode } from "./tokens";

export type ThemeContextValue = {
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => void;
  themeMode: ThemeMode;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme deve ser usado dentro de ThemeProvider.");
  return context;
}

export function useThemeColors() {
  return useContext(ThemeContext)?.colors ?? darkColors;
}
