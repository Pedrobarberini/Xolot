import type {
  AppUser,
  AthleteFund,
  Investment,
  VideoSubmission
} from "../types";
import {
  claimUniqueUsername,
  createUsernameSlug
} from "../utils/userIdentity.ts";
import { migrateSubmissionToDirectPublication } from "../utils/publication.ts";

export const APP_STATE_SCHEMA_VERSION = 4;

export type LocalAppState = {
  activeUser: AppUser | null;
  athleteFunds: AthleteFund[];
  investments: Investment[];
  registeredUsers: AppUser[];
  submissions: VideoSubmission[];
  version: typeof APP_STATE_SCHEMA_VERSION;
  walletBalances: Record<string, number>;
};

export type LocalStateStorage = {
  getItem: (key: string) => Promise<string | null>;
  removeItem: (key: string) => Promise<void>;
  setItem: (key: string, value: string) => Promise<void>;
};

export function createDefaultLocalAppState(
  athleteFunds: AthleteFund[] = []
): LocalAppState {
  return {
    activeUser: null,
    athleteFunds,
    investments: [],
    registeredUsers: [],
    submissions: [],
    version: APP_STATE_SCHEMA_VERSION,
    walletBalances: {}
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeWalletBalances(value: unknown) {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      ([userId, balance]) =>
        userId.trim().length > 0 &&
        typeof balance === "number" &&
        Number.isFinite(balance) &&
        balance >= 0
    )
  ) as Record<string, number>;
}

function normalizeArray<T>(value: unknown, fallback: T[]) {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeAppUser(value: unknown): AppUser | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = normalizeString(value.id);
  const email = normalizeString(value.email).toLowerCase();
  const role = value.role === "Admin" ? "Admin" : "Usuário";

  if (!id || !email.includes("@")) {
    return null;
  }

  const age =
    typeof value.age === "number" &&
    Number.isInteger(value.age) &&
    value.age >= 5 &&
    value.age <= 100
      ? value.age
      : null;
  const passwordHash = normalizeString(value.passwordHash);
  const passwordSalt = normalizeString(value.passwordSalt);
  const googleUid = normalizeString(value.googleUid);
  const photoURL = normalizeString(value.photoURL);
  const authProvider =
    value.authProvider === "google" || value.authProvider === "password"
      ? value.authProvider
      : googleUid
        ? "google"
        : passwordHash && passwordSalt
          ? "password"
          : undefined;
  const bio = normalizeString(value.bio);
  const profileCompleted =
    role === "Admin" ||
    (value.profileCompleted === true &&
      normalizeString(value.name).length >= 3 &&
      age !== null &&
      bio.length >= 10 &&
      bio.length <= 240 &&
      normalizeString(value.position).length >= 2 &&
      normalizeString(value.city).length >= 2 &&
      normalizeString(value.club).length >= 2);

  return {
    acceptedTerms: value.acceptedTerms === true,
    age,
    ...(authProvider ? { authProvider } : {}),
    bio,
    city: normalizeString(value.city),
    club: normalizeString(value.club),
    email,
    ...(googleUid ? { googleUid } : {}),
    id,
    kycStatus:
      value.kycStatus === "Pendente" || value.kycStatus === "Aprovado"
        ? value.kycStatus
        : "Não iniciado",
    name:
      normalizeString(value.name) ||
      (role === "Admin" ? "Admin NextStar" : email.split("@")[0]),
    ...(passwordHash && passwordSalt
      ? { passwordHash, passwordSalt }
      : {}),
    ...(photoURL ? { photoURL } : {}),
    position: normalizeString(value.position),
    profileCompleted,
    role,
    username: createUsernameSlug(
      normalizeString(value.username) || email.split("@")[0],
      id
    )
  };
}

function normalizeAthleteFundStatus(value: unknown): AthleteFund["status"] {
  return value === "Concluída" || value === "Concluida"
    ? "Concluída"
    : "Captando";
}

function normalizeAthleteFunds(value: unknown, fallback: AthleteFund[]) {
  return normalizeArray(value, fallback).map((fund) => ({
    ...fund,
    status: normalizeAthleteFundStatus(fund.status)
  }));
}

function normalizeUsers(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(normalizeAppUser)
    .filter((account): account is AppUser => Boolean(account));
}

function assignUniqueUsernames(users: AppUser[]) {
  const takenUsernames = new Set<string>();

  return users.map((account) => ({
    ...account,
    username: claimUniqueUsername(
      account.username,
      takenUsernames,
      account.id
    )
  }));
}

export function migrateLocalAppState(
  value: unknown,
  fallback: LocalAppState
): LocalAppState {
  if (!isRecord(value)) {
    return fallback;
  }

  const normalizedActiveUser =
    value.activeUser === null
      ? null
      : normalizeAppUser(value.activeUser) ?? fallback.activeUser;
  const normalizedUsers = normalizeUsers(value.registeredUsers);
  const registeredUsers = assignUniqueUsernames(
    normalizedActiveUser
      ? [
          normalizedActiveUser,
          ...normalizedUsers.filter(
            (account) => account.id !== normalizedActiveUser.id
          )
        ]
      : normalizedUsers
  );
  const activeUser = normalizedActiveUser
    ? registeredUsers.find(
        (account) => account.id === normalizedActiveUser.id
      ) ?? normalizedActiveUser
    : null;

  return {
    activeUser,
    athleteFunds: normalizeAthleteFunds(value.athleteFunds, fallback.athleteFunds),
    investments: normalizeArray(value.investments, fallback.investments),
    registeredUsers:
      registeredUsers.length > 0 ? registeredUsers : fallback.registeredUsers,
    submissions: normalizeArray(
      value.submissions,
      fallback.submissions
    ).map(migrateSubmissionToDirectPublication),
    version: APP_STATE_SCHEMA_VERSION,
    walletBalances: normalizeWalletBalances(value.walletBalances)
  };
}

export function parseLocalAppState(
  serializedState: string | null,
  fallback: LocalAppState
) {
  if (!serializedState) {
    return fallback;
  }

  try {
    return migrateLocalAppState(JSON.parse(serializedState), fallback);
  } catch {
    return fallback;
  }
}

export function serializeLocalAppState(state: LocalAppState) {
  return JSON.stringify({
    ...state,
    version: APP_STATE_SCHEMA_VERSION
  });
}

export function createLocalAppStateRepository(
  storage: LocalStateStorage,
  storageKey: string
) {
  return {
    async clear() {
      await storage.removeItem(storageKey);
    },
    async load(fallback: LocalAppState) {
      const storedState = await storage.getItem(storageKey);
      return parseLocalAppState(storedState, fallback);
    },
    async save(state: LocalAppState) {
      await storage.setItem(storageKey, serializeLocalAppState(state));
    }
  };
}
