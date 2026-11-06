// Sugestões de apresentação, não categorias obrigatórias nem permissões de conta.
export const PROFILE_PRESENTATIONS = [
  "Perfil pessoal",
  "Criador de conteúdo",
  "Artista",
  "Negócio ou marca",
  "Prestador de serviço",
  "Projeto ou comunidade",
] as const;

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("pt-BR")
    .replace(/\s+/g, " ");
}

function suggestions(options: readonly string[], query: string, maximum: number) {
  const term = normalize(query);
  return options
    .filter((option) => normalize(option).includes(term))
    .sort(
      (left, right) =>
        Number(normalize(right).startsWith(term)) - Number(normalize(left).startsWith(term)),
    )
    .slice(0, Math.max(0, maximum));
}

export function getProfilePresentationSuggestions(query = "", maximum = 6) {
  return suggestions(PROFILE_PRESENTATIONS, query, maximum);
}
