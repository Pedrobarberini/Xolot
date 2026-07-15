export type Tab =
  | "feed"
  | "submit"
  | "search"
  | "messages"
  | "admin"
  | "profile";

export type CardPalette = {
  name: string;
  card: string;
  media: string;
  border: string;
  accent: string;
  accentSoft: string;
  text: string;
  muted: string;
  tagBackground: string;
  progressTrack: string;
  onAccent: string;
};
