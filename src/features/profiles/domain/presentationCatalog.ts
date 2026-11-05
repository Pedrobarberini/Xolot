// Sugestões de apresentação, não categorias obrigatórias nem permissões de conta.
export const PROFILE_AREAS = [
  "Arte e cultura",
  "Música",
  "Humor",
  "Tecnologia",
  "Moda e beleza",
  "Gastronomia",
  "Educação",
  "Games",
  "Negócios e serviços",
  "Estilo de vida",
  "Viagens",
  "Esportes",
] as const;

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

export function getProfileAreaSuggestions(query: string, maximum = 6) {
  if (query.trim() && PROFILE_AREAS.some((area) => normalize(area) === normalize(query))) return [];
  return suggestions(PROFILE_AREAS, query, maximum);
}

export function getProfilePresentationSuggestions(query = "", maximum = 6) {
  return suggestions(PROFILE_PRESENTATIONS, query, maximum);
}
