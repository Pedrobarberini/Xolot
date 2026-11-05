import React, { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { ThemeContext, type ThemeContextValue } from "./context";
import { getThemeColors, setActiveThemeMode } from "./legacy";
import { applyDocumentTheme } from "./platform";
import { themePreferences, type ThemePreferences } from "./preferences";
import { DEFAULT_THEME_MODE, normalizeThemeMode, type ThemeMode } from "./tokens";

export function ThemeProvider({
  children,
  preferences = themePreferences,
}: {
  children: ReactNode;
  preferences?: ThemePreferences;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [themeMode, setThemeModeState] = useState<ThemeMode>(DEFAULT_THEME_MODE);

  useEffect(() => {
    let active = true;
    const restore = (stored: unknown) => {
      if (!active) return;
      const mode = normalizeThemeMode(stored);
      // Compatibilidade com estilos legados: sincronizar antes de agendar o render.
      setActiveThemeMode(mode);
      setThemeModeState(mode);
      setIsLoaded(true);
    };
    preferences.load().then(restore, () => restore(DEFAULT_THEME_MODE));
    return () => {
      active = false;
    };
  }, [preferences]);

  const setThemeMode = useCallback(
    (requested: ThemeMode) => {
      const mode = normalizeThemeMode(requested);
      setActiveThemeMode(mode);
      setThemeModeState(mode);
      // Uma falha local de persistência não desfaz a escolha visual da sessão.
      void preferences.save(mode).catch(() => undefined);
    },
    [preferences],
  );
  const context = useMemo<ThemeContextValue>(
    () => ({ colors: getThemeColors(themeMode), setThemeMode, themeMode }),
    [themeMode, setThemeMode],
  );
  useEffect(() => applyDocumentTheme(themeMode, context.colors), [themeMode, context.colors]);

  if (!isLoaded) return null;
  return <ThemeContext.Provider value={context}>{children}</ThemeContext.Provider>;
}
