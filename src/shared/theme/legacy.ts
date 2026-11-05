import { darkColors, lightColors, type ThemeColors, type ThemeMode } from "./tokens.ts";
export { darkColors, lightColors, normalizeThemeMode, radius, spacing } from "./tokens.ts";
export type { ThemeColors, ThemeMode } from "./tokens.ts";

const palettes: Record<ThemeMode, ThemeColors> = {
  dark: darkColors,
  light: lightColors,
};

let activeThemeMode: ThemeMode = "light";

export const colors = new Proxy(lightColors, {
  get(_target, property: keyof ThemeColors) {
    return palettes[activeThemeMode][property];
  },
}) as ThemeColors;

const colorTokenByLightValue = new Map<string, keyof ThemeColors>(
  Object.entries(lightColors).map(([token, value]) => [value, token as keyof ThemeColors]),
);

const themedValueCache: Record<ThemeMode, WeakMap<object, unknown>> = {
  dark: new WeakMap<object, unknown>(),
  light: new WeakMap<object, unknown>(),
};

export function setActiveThemeMode(mode: ThemeMode) {
  activeThemeMode = mode;
}

export function getActiveThemeMode() {
  return activeThemeMode;
}

export function getThemeColors(mode = activeThemeMode) {
  return palettes[mode];
}

function resolveThemeValue(value: unknown, mode: ThemeMode): unknown {
  if (typeof value === "string") {
    const token = colorTokenByLightValue.get(value);
    return token ? palettes[mode][token] : value;
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const cached = themedValueCache[mode].get(value);
  if (cached) {
    return cached;
  }

  if (Array.isArray(value)) {
    const resolvedArray: unknown[] = [];
    themedValueCache[mode].set(value, resolvedArray);
    value.forEach((item) => resolvedArray.push(resolveThemeValue(item, mode)));
    return resolvedArray;
  }

  const resolvedObject: Record<PropertyKey, unknown> = {};
  themedValueCache[mode].set(value, resolvedObject);
  Reflect.ownKeys(value).forEach((key) => {
    resolvedObject[key] = resolveThemeValue((value as Record<PropertyKey, unknown>)[key], mode);
  });
  return resolvedObject;
}

export function createThemedStyles<T extends object>(styleSheet: T): T {
  return new Proxy(styleSheet, {
    get(target, property, receiver) {
      return resolveThemeValue(Reflect.get(target, property, receiver), activeThemeMode);
    },
  });
}
