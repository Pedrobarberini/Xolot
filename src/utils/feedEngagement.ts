import type { Player, SocialSelectionsByUser } from "../types";

function normalizeContentValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const GENERIC_CONTENT_TAGS = new Set([
  "novo",
  "publicado",
  "video-aprovado"
]);

function getPrimaryContentTag(player: Player) {
  return player.tags.find((tag) => {
    const normalizedTag = normalizeContentValue(tag);

    return normalizedTag.length > 0 && !GENERIC_CONTENT_TAGS.has(normalizedTag);
  });
}

export function getPlayerContentKey(player: Player) {
  const primaryTag = getPrimaryContentTag(player);

  if (primaryTag) {
    return `tag:${normalizeContentValue(primaryTag)}`;
  }

  return `media:${player.mediaType ?? "video"}`;
}

export function getPlayerContentLabel(player: Player) {
  const primaryTag = getPrimaryContentTag(player);

  if (primaryTag) {
    return `#${primaryTag}`;
  }

  return player.mediaType === "image" ? "fotos" : "vídeos";
}

export function countSelectionsByPlayer(
  selectionsByUser: SocialSelectionsByUser
) {
  const counts: Record<string, number> = {};

  Object.values(selectionsByUser).forEach((playerIds) => {
    new Set(playerIds).forEach((playerId) => {
      counts[playerId] = (counts[playerId] ?? 0) + 1;
    });
  });

  return counts;
}

export function toggleSelection(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}
