import { BRAND } from "../config/brand.ts";
import {
  createUsernameSlug,
  isValidUsername,
  normalizeUsername
} from "./userIdentity.ts";

import type { PublicProfileDocument } from "../features/profiles";
export type { PublicProfileDocument } from "../features/profiles";

function normalizeText(value: unknown, maximumLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maximumLength) : "";
}

type PublicProfileNormalizationOptions = {
  allowLegacyFallback?: boolean;
};

function normalizeInterestTags(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim().replace(/^#+/, "").slice(0, 40))
        .filter(Boolean)
    )
  ).slice(0, 6);
}

function createLegacyUsername(name: string, uid: string) {
  const suffix =
    uid.toLowerCase().replace(/[^a-z0-9]/g, "").slice(-8) || "perfil";
  const base = createUsernameSlug(name, "usuario").slice(
    0,
    Math.max(3, 29 - suffix.length)
  );
  return createUsernameSlug(`${base}.${suffix}`, "usuario.xolot");
}

export function normalizePublicProfileDocument(
  uid: string,
  value: unknown,
  options: PublicProfileNormalizationOptions = {}
): PublicProfileDocument | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const data = value as Record<string, unknown>;
  const allowLegacyFallback = options.allowLegacyFallback === true;
  const rawName = normalizeText(data.name, 80);
  const name =
    rawName.length >= 3
      ? rawName
      : allowLegacyFallback
        ? `Perfil ${BRAND.name}`
        : rawName;
  const rawUsername = normalizeUsername(normalizeText(data.username, 30));
  const username = isValidUsername(rawUsername)
    ? rawUsername
    : allowLegacyFallback
      ? createLegacyUsername(name, uid)
      : rawUsername;
  const rawAge = typeof data.age === "number" ? data.age : null;
  const age =
    Number.isInteger(rawAge) && rawAge !== null && rawAge >= 5 && rawAge <= 100
      ? rawAge
      : null;
  const normalized: PublicProfileDocument = {
    age,
    bio: normalizeText(data.bio, 240),
    city:
      normalizeText(data.city, 80) ||
      (allowLegacyFallback ? "Local não informado" : ""),
    club: normalizeText(data.club, 80),
    name,
    interestTags: normalizeInterestTags(data.interestTags),
    identityVerified: data.identityVerified === true,
    photoURL: normalizeText(data.photoURL, 2048),
    plusActive: data.plusActive === true,
    position:
      normalizeText(data.position, 40) ||
      (allowLegacyFallback ? "Área não informada" : ""),
    profileCompleted: true,
    sport: normalizeText(data.sport, 40) || "Modalidade não informada",
    uid,
    username
  };

  if (
    (data.uid !== undefined && data.uid !== uid) ||
    (data.profileCompleted !== undefined && data.profileCompleted !== true) ||
    !isValidUsername(username) ||
    normalized.name.length < 3
  ) {
    return null;
  }

  if (
    !allowLegacyFallback &&
    (data.uid !== uid ||
      data.profileCompleted !== true ||
      age === null ||
      normalized.bio.length < 10 ||
      normalized.position.length < 2 ||
      normalized.city.length < 2 ||
      (normalized.club.length > 0 && normalized.club.length < 2))
  ) {
    return null;
  }

  return normalized;
}
