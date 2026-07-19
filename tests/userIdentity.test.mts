import assert from "node:assert/strict";
import test from "node:test";
import {
  claimUniqueUsername,
  createUsernameSlug,
  getAccountIdentityConflict,
  isUsernameAvailable,
  isValidUsername,
  normalizeUsername
} from "../src/utils/userIdentity.ts";

test("normaliza username sem alterar o nome público", () => {
  assert.equal(normalizeUsername("  @Pedro.Barberini  "), "pedro.barberini");
  assert.equal(createUsernameSlug("Pedro Barberini"), "pedro.barberini");
});

test("aceita apenas usernames de três a trinta caracteres", () => {
  assert.equal(isValidUsername("pedro_barberini"), true);
  assert.equal(isValidUsername("PB"), false);
  assert.equal(isValidUsername("pedro barberini"), false);
  assert.equal(isValidUsername("pedro@barberini"), false);
});

test("gera usernames únicos sem bloquear nomes públicos iguais", () => {
  const taken = new Set<string>();

  assert.equal(claimUniqueUsername("pedro", taken, "conta-1"), "pedro");
  assert.equal(claimUniqueUsername("Pedro", taken, "conta-2"), "pedro_2");
  assert.equal(claimUniqueUsername("pedro", taken, "conta-3"), "pedro_3");
});

test("bloqueia email ou username duplicado sem comparar nome público", () => {
  const accounts = [
    { email: "pedro@nextstar.com", username: "pedrobarberini" }
  ];

  assert.equal(
    getAccountIdentityConflict(accounts, "PEDRO@nextstar.com", "outro.user"),
    "email"
  );
  assert.equal(
    getAccountIdentityConflict(accounts, "outro@nextstar.com", "PedroBarberini"),
    "username"
  );
  assert.equal(
    getAccountIdentityConflict(accounts, "outro@nextstar.com", "outro.user"),
    null
  );
});

test("valida disponibilidade do username ao configurar o perfil", () => {
  const accounts = [
    { id: "user-1", email: "um@nextstar.com", username: "jogador.um" },
    { id: "user-2", email: "dois@nextstar.com", username: "jogador.dois" }
  ];

  assert.equal(
    isUsernameAvailable(accounts, "jogador.um", "user-1"),
    true
  );
  assert.equal(
    isUsernameAvailable(accounts, "JOGADOR.DOIS", "user-1"),
    false
  );
  assert.equal(isUsernameAvailable(accounts, "nome inválido", "user-1"), false);
});
