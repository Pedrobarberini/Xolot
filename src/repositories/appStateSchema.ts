import type {
  AppUser,
  AthleteFund,
  Investment,
  VideoSubmission
} from "../types";

export const APP_STATE_SCHEMA_VERSION = 1;

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

export function migrateLocalAppState(
  value: unknown,
  fallback: LocalAppState
): LocalAppState {
  if (!isRecord(value)) {
    return fallback;
  }

  const activeUser =
    value.activeUser === null || isRecord(value.activeUser)
      ? (value.activeUser as AppUser | null)
      : fallback.activeUser;

  return {
    activeUser,
    athleteFunds: normalizeArray(value.athleteFunds, fallback.athleteFunds),
    investments: normalizeArray(value.investments, fallback.investments),
    registeredUsers: normalizeArray(
      value.registeredUsers,
      fallback.registeredUsers
    ),
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
