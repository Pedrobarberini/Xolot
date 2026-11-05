import type { ThemeColors, ThemeMode } from "./tokens";

export function applyDocumentTheme(mode: ThemeMode, colors: ThemeColors) {
  if (typeof document === "undefined") return;
  document.documentElement.style.backgroundColor = colors.background;
  document.documentElement.style.colorScheme = mode;
  document.body.style.backgroundColor = colors.background;
}
