const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._]{1,28}[a-z0-9]$/;

type AccountIdentity = {
  email: string;
  id?: string;
  username: string;
};

export function normalizeUsername(value: string) {
  return value.trim().replace(/^@+/, "").toLowerCase();
}

export function isValidUsername(value: string) {
  return USERNAME_PATTERN.test(normalizeUsername(value));
}

export function isUsernameAvailable(
  accounts: AccountIdentity[],
  username: string,
  ignoredAccountId?: string
) {
  const normalizedUsername = normalizeUsername(username);

  return (
    isValidUsername(normalizedUsername) &&
    !accounts.some(
      (account) =>
        account.id !== ignoredAccountId &&
        normalizeUsername(account.username) === normalizedUsername
    )
  );
}

export function getAccountIdentityConflict(
  accounts: AccountIdentity[],
  email: string,
  username: string
) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = normalizeUsername(username);

  if (
    accounts.some(
      (account) => account.email.trim().toLowerCase() === normalizedEmail
    )
  ) {
    return "email" as const;
  }

  if (
    accounts.some(
      (account) => normalizeUsername(account.username) === normalizedUsername
    )
  ) {
    return "username" as const;
  }

  return null;
}

export function createUsernameSlug(value: string, fallback = "usuario") {
  const normalizedValue = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9._]+/g, ".")
    .replace(/[._]{2,}/g, ".")
    .replace(/^[._]+|[._]+$/g, "")
    .slice(0, 30)
    .replace(/[._]+$/g, "");
  const fallbackSlug = fallback
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24);
  const candidate = normalizedValue || fallbackSlug || "usuario";

  return candidate.length >= 3
    ? candidate
    : `${candidate}${fallbackSlug || "user"}`.slice(0, 30);
}

export function claimUniqueUsername(
  preferredValue: string,
  takenUsernames: Set<string>,
  fallback: string
) {
  const base = createUsernameSlug(preferredValue, fallback);
  let candidate = base;
  let suffixNumber = 2;

  while (takenUsernames.has(candidate)) {
    const suffix = `_${suffixNumber}`;
    candidate = `${base.slice(0, 30 - suffix.length)}${suffix}`;
    suffixNumber += 1;
  }

  takenUsernames.add(candidate);
  return candidate;
}
