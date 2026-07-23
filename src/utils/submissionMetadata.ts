export function parseSubmissionTokens(
  value: string,
  marker: "#" | "@",
  limit = 8
) {
  const uniqueTokens = new Map<string, string>();

  value
    .split(/[\s,;]+/)
    .map((token) => token.trim().replace(new RegExp(`^\\${marker}+`), ""))
    .map((token) => token.replace(/[^\p{L}\p{N}._-]/gu, ""))
    .filter(Boolean)
    .forEach((token) => {
      const key = token.toLocaleLowerCase("pt-BR");

      if (!uniqueTokens.has(key) && uniqueTokens.size < limit) {
        uniqueTokens.set(key, token);
      }
    });

  return [...uniqueTokens.values()];
}

export type MentionableUser = {
  city: string;
  id: string;
  name: string;
  position: string;
  role: "Usuário" | "Admin";
  username: string;
};

function normalizeMentionSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/^@+/, "")
    .trim()
    .toLocaleLowerCase("pt-BR");
}

export function selectMentionCandidates(
  users: MentionableUser[],
  currentUserId: string,
  query: string,
  limit = 5
) {
  const normalizedQuery = normalizeMentionSearch(query);

  if (!normalizedQuery) {
    return [];
  }

  return users
    .filter(
      (user) =>
        user.id !== currentUserId &&
        user.role !== "Admin" &&
        (normalizeMentionSearch(user.username).includes(normalizedQuery) ||
          normalizeMentionSearch(user.name).includes(normalizedQuery))
    )
    .sort((left, right) =>
      left.username.localeCompare(right.username, "pt-BR")
    )
    .slice(0, limit);
}

export function toggleSubmissionMention(
  current: string[],
  username: string,
  limit = 8
) {
  const normalizedUsername = normalizeMentionSearch(username);
  const existingIndex = current.findIndex(
    (item) => normalizeMentionSearch(item) === normalizedUsername
  );

  if (existingIndex >= 0) {
    return current.filter((_, index) => index !== existingIndex);
  }

  if (!normalizedUsername || current.length >= limit) {
    return current;
  }

  return [...current, username];
}
