export type ThemeMode = "dark" | "light";
export const DEFAULT_THEME_MODE: ThemeMode = "dark";

export type ThemeColors = {
  accent: string;
  accentSoft: string;
  background: string;
  border: string;
  borderStrong: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;
  like: string;
  media: string;
  muted: string;
  onAccent: string;
  onPrimary: string;
  primary: string;
  primaryText: string;
  primaryPressed: string;
  primarySoft: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  warning: string;
  warningSoft: string;
};

export const lightColors: ThemeColors = {
  accent: "#FFD21F",
  accentSoft: "#FFF6D8",
  background: "#F7F4ED",
  border: "#D8CFBD",
  borderStrong: "#9B8B6E",
  danger: "#C43D4D",
  dangerSoft: "#FCEBED",
  info: "#006F59",
  infoSoft: "#E2F4EC",
  like: "#F0445A",
  media: "#07080D",
  muted: "#6D6558",
  onAccent: "#18130A",
  onPrimary: "#FFFFFF",
  primary: "#A34B00",
  primaryText: "#8B4100",
  primaryPressed: "#843A00",
  primarySoft: "#FFF0C2",
  surface: "#FFFEFB",
  surfaceMuted: "#EEE8DC",
  text: "#171613",
  warning: "#895400",
  warningSoft: "#FFF0D6",
};

export const darkColors: ThemeColors = {
  accent: "#FFCA18",
  accentSoft: "#3C2D05",
  background: "#090A0F",
  border: "#2B2F39",
  borderStrong: "#69707E",
  danger: "#FF7180",
  dangerSoft: "#3B1D23",
  info: "#6DE2B7",
  infoSoft: "#133A2D",
  like: "#FF5B70",
  media: "#000000",
  muted: "#ACB1BD",
  onAccent: "#161108",
  onPrimary: "#FFFFFF",
  primary: "#AD5000",
  primaryText: "#FFD21F",
  primaryPressed: "#843A00",
  primarySoft: "#30260B",
  surface: "#13151B",
  surfaceMuted: "#1C1F27",
  text: "#FFF5EC",
  warning: "#F1AE45",
  warningSoft: "#3B2B14",
};

export function normalizeThemeMode(value: unknown): ThemeMode {
  return value === "light" ? "light" : DEFAULT_THEME_MODE;
}

export const radius = {
  small: 4,
  medium: 6,
  large: 8,
} as const;

export const spacing = {
  xsmall: 4,
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 24,
  xxlarge: 32,
} as const;
