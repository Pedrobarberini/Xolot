import assert from "node:assert/strict";
import test from "node:test";
import {
  getProfileAreaSuggestions,
  getProfilePresentationSuggestions,
} from "../src/features/profiles/domain/presentationCatalog.ts";

test("cadastro sugere temas diversos com busca em português e limite", () => {
  assert.deepEqual(getProfileAreaSuggestions("", 3), ["Arte e cultura", "Música", "Humor"]);
  assert.deepEqual(getProfileAreaSuggestions("mus"), ["Música"]);
  assert.deepEqual(getProfileAreaSuggestions("  MÚSICA  "), []);
  assert.deepEqual(getProfileAreaSuggestions("area livre"), []);
  assert.deepEqual(getProfileAreaSuggestions("", 0), []);
  assert.deepEqual(getProfilePresentationSuggestions("conteudo"), ["Criador de conteúdo"]);
  assert.ok(getProfilePresentationSuggestions().includes("Perfil pessoal"));
});
