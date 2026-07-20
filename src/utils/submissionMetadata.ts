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
