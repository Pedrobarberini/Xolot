import assert from "node:assert/strict";
import test from "node:test";
import {
  claimUniqueUsername,
  createUsernameSlug,
  getAccountIdentityConflict,
  isValidUsername,
  normalizeUsername
} from "../src/utils/userIdentity.ts";

test("normaliza username sem alterar o nome publico", () => {
  assert.equal(normalizeUsername("  @Pedro.Barberini  "), "pedro.barberini");
  assert.equal(createUsernameSlug("Pedro Barberini"), "pedro.barberini");
});

test("aceita apenas usernames de tres a trinta caracteres", () => {
  assert.equal(isValidUsername("pedro_barberini"), true);
  assert.equal(isValidUsername("PB"), false);
  assert.equal(isValidUsername("pedro barberini"), false);
  assert.equal(isValidUsername("pedro@barberini"), false);
});

test("gera usernames unicos sem bloquear nomes publicos iguais", () => {
  const taken = new Set<string>();

  assert.equal(claimUniqueUsername("pedro", taken, "conta-1"), "pedro");
  assert.equal(claimUniqueUsername("Pedro", taken, "conta-2"), "pedro_2");
  assert.equal(claimUniqueUsername("pedro", taken, "conta-3"), "pedro_3");
});

test("bloqueia email ou username duplicado sem comparar nome publico", () => {
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
