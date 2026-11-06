import assert from "node:assert/strict";
import test from "node:test";
import { getProfilePresentationSuggestions } from "../src/features/profiles/domain/presentationCatalog.ts";

test("cadastro sugere apresentações gerais com busca em português e limite", () => {
  assert.deepEqual(getProfilePresentationSuggestions("conteudo"), ["Criador de conteúdo"]);
  assert.deepEqual(getProfilePresentationSuggestions("  NEGÓCIO  "), ["Negócio ou marca"]);
  assert.deepEqual(getProfilePresentationSuggestions("", 1), ["Perfil pessoal"]);
  assert.deepEqual(getProfilePresentationSuggestions("", 0), []);
  assert.ok(getProfilePresentationSuggestions().includes("Perfil pessoal"));
});
