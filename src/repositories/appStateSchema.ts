import type {
  AppUser,
  AthleteFund,
  Investment,
  VideoSubmission
} from "../types";

export const APP_STATE_SCHEMA_VERSION = 2;

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
  const role = value.role === "Admin" ? "Admin" : "Usuario";

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
    bio,
    city: normalizeString(value.city),
    club: normalizeString(value.club),
    email,
    id,
    kycStatus:
      value.kycStatus === "Pendente" || value.kycStatus === "Aprovado"
        ? value.kycStatus
        : "Nao iniciado",
    name:
      normalizeString(value.name) ||
      (role === "Admin" ? "Admin NextStar" : email.split("@")[0]),
    ...(passwordHash && passwordSalt
      ? { passwordHash, passwordSalt }
      : {}),
    position: normalizeString(value.position),
    profileCompleted,
    role
  };
}

function normalizeUsers(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(normalizeAppUser)
    .filter((account): account is AppUser => Boolean(account));
}

export function migrateLocalAppState(
  value: unknown,
  fallback: LocalAppState
): LocalAppState {
  if (!isRecord(value)) {
    return fallback;
  }

  const activeUser =
    value.activeUser === null
      ? null
      : normalizeAppUser(value.activeUser) ?? fallback.activeUser;
  const normalizedUsers = normalizeUsers(value.registeredUsers);
  const registeredUsers = activeUser
    ? [
        activeUser,
        ...normalizedUsers.filter((account) => account.id !== activeUser.id)
      ]
    : normalizedUsers;

  return {
    activeUser,
    athleteFunds: normalizeArray(value.athleteFunds, fallback.athleteFunds),
    investments: normalizeArray(value.investments, fallback.investments),
    registeredUsers:
      registeredUsers.length > 0 ? registeredUsers : fallback.registeredUsers,
    submissions: normalizeArray(value.submissions, fallback.submissions),
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
