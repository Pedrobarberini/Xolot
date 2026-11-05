import { HttpsError } from "firebase-functions/v2/https";

export const MAX_IMAGE_SIZE = 15 * 1024 * 1024;
export const MAX_VIDEO_SIZE = 200 * 1024 * 1024;
export const MAX_VIDEO_DURATION_MS = 120_000;

export const allowedMimeTypes = new Map<
  string,
  { extension: string; mediaType: "image" | "video" }
>([
  ["image/gif", { extension: "gif", mediaType: "image" }],
  ["image/heic", { extension: "heic", mediaType: "image" }],
  ["image/heif", { extension: "heif", mediaType: "image" }],
  ["image/jpeg", { extension: "jpg", mediaType: "image" }],
  ["image/png", { extension: "png", mediaType: "image" }],
  ["image/webp", { extension: "webp", mediaType: "image" }],
  ["video/3gpp", { extension: "3gp", mediaType: "video" }],
  ["video/mp4", { extension: "mp4", mediaType: "video" }],
  ["video/quicktime", { extension: "mov", mediaType: "video" }],
  ["video/webm", { extension: "webm", mediaType: "video" }],
  ["video/x-m4v", { extension: "m4v", mediaType: "video" }]
]);

export function requireRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HttpsError("invalid-argument", "Dados da publicação inválidos.");
  }
  return value as Record<string, unknown>;
}

export function requireCommandRecord(value: unknown, allowedFields: readonly string[], maxBytes = 16_384) {
  const record = requireRecord(value);
  if (Object.keys(record).some((key) => !allowedFields.includes(key)))
    throw new HttpsError("invalid-argument", "Campos não permitidos para esta operação.");
  try {
    if (Buffer.byteLength(JSON.stringify(record), "utf8") > maxBytes) throw new Error("oversized");
  } catch {
    throw new HttpsError("invalid-argument", "Dados da operação excedem o formato ou limite permitido.");
  }
  return record;
}

export function requireDocumentId(value: unknown, name: string, maximum = 128) {
  const id = requireText(value, name, 1, maximum);
  if (id !== value || /[\u0000-\u001f/]/.test(id) || id === "." || id === "..")
    throw new HttpsError("invalid-argument", "Identificador inválido para esta operação.");
  return id;
}

export function requireText(
  value: unknown,
  name: string,
  minimum: number,
  maximum: number
) {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (normalized.length < minimum || normalized.length > maximum) {
    throw new HttpsError("invalid-argument", `Valor inválido para ${name.toLocaleLowerCase()}.`);
  }
  return normalized;
}

export function requireInteger(
  value: unknown,
  name: string,
  minimum: number,
  maximum: number
) {
  if (
    !Number.isInteger(value) ||
    (value as number) < minimum ||
    (value as number) > maximum
  ) {
    throw new HttpsError("invalid-argument", `Valor inválido para ${name.toLocaleLowerCase()}.`);
  }
  return value as number;
}

function normalizeTagKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/^#+/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function normalizeTagList(value: unknown, maximumItems: number) {
  if (!Array.isArray(value)) return [];

  const tags = new Map<string, string>();
  value.forEach((item) => {
    if (typeof item !== "string") return;
    const label = item
      .trim()
      .replace(/^#+/, "")
      .replace(/[^\p{L}\p{N} ._-]+/gu, "")
      .replace(/\s+/g, " ")
      .slice(0, 40)
      .trim();
    const key = normalizeTagKey(label);
    if (key && label && !tags.has(key)) tags.set(key, label);
  });
  return [...tags.values()].slice(0, maximumItems);
}

export function normalizeStringList(
  value: unknown,
  maximumItems: number,
  maximumLength: number
) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().slice(0, maximumLength))
    .filter(Boolean)
    .slice(0, maximumItems);
}
