import assert from "node:assert/strict";
import test from "node:test";
import {
  authenticatedAccount,
  onboardingAccount,
} from "../src/features/auth/application/accountView.ts";
import { toSocialUser } from "../src/features/profiles/application/profileView.ts";
import { normalizePublicProfileDocument } from "../src/utils/firebaseProfileDocument.ts";
import type { AuthIdentity } from "../src/features/auth/domain/types.ts";

const profile = {
  uid: "owner",
  age: 25,
  bio: "Biografia sintética",
  city: "São Paulo",
  club: "",
  interestTags: [],
  name: "Pessoa Sintética",
  photoURL: "",
  identityVerified: false,
  plusActive: false,
  sport: "Futebol",
  position: "Atleta",
  profileCompleted: true as const,
  username: "pessoa.teste",
};
const identity: AuthIdentity = {
  uid: "owner",
  email: " OWNER@EXAMPLE.TEST ",
  emailVerified: true,
  provider: "google",
  displayName: "Nome do Auth",
  photoURL: "",
  acceptedTerms: true,
};

test("perfil social não inventa email, consentimento, provedor ou papel administrativo", () => {
  const normalized = normalizePublicProfileDocument("owner", {
    ...profile,
    role: "Admin",
    email: "private@example.test",
    acceptedTerms: true,
  });
  assert.ok(normalized);
  const social = toSocialUser(normalized);
  assert.equal(social.role, "Usuário");
  for (const field of ["email", "acceptedTerms", "authProvider", "googleUid"])
    assert.equal(field in social, false);
  assert.equal(social.id, "owner");
  assert.equal(social.username, "pessoa.teste");
  const tainted = { ...profile, email: "private@example.test", acceptedTerms: true, role: "Admin" };
  const direct = toSocialUser(tainted);
  assert.equal("email" in direct, false);
  assert.equal("acceptedTerms" in direct, false);
  assert.equal(direct.role, "Usuário");
});

test("somente identidade autenticada correspondente compõe a conta privada", () => {
  const social = toSocialUser(profile);
  const own = authenticatedAccount(social, identity);
  assert.equal(own.email, "owner@example.test");
  assert.equal(own.acceptedTerms, true);
  assert.equal(own.googleUid, "owner");
  assert.throws(() => authenticatedAccount(social, { ...identity, uid: "another" }));
  assert.equal("email" in social, false);
});

test("onboarding mantém perfil incompleto e fallback legado de username", () => {
  const provisional = onboardingAccount({ ...identity, email: "!!@example.test", displayName: "" });
  assert.equal(provisional.profileCompleted, false);
  assert.equal(provisional.age, null);
  assert.equal(provisional.username, "usuario.xolot");
  assert.equal(provisional.name, "Novo perfil");
  assert.equal(provisional.role, "Usuário");
  assert.equal(
    onboardingAccount({ ...identity, email: "pessoa.teste@example.test" }).username,
    "pessoa.teste",
  );
});
