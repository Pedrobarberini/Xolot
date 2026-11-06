import assert from "node:assert/strict";
import test from "node:test";
import { normalizePublicProfileDocument } from "../src/utils/firebaseProfileDocument.ts";

const profile = {
  age: 22,
  bio: "Criador de conteúdo esportivo e campanhas locais.",
  city: "São Paulo, SP",
  interestTags: ["Futebol", "Ponta"],
  identityVerified: false,
  club: "Projeto Xolot",
  name: "Pessoa Criadora",
  photoURL: "https://example.com/avatar.jpg",
  plusActive: false,
  position: "Criador",
  sport: "Futebol",
  profileCompleted: true,
  uid: "uid-seguro-1",
  username: "pessoa.criadora"
};

test("normaliza apenas os campos públicos permitidos", () => {
  const normalized = normalizePublicProfileDocument(profile.uid, {
    ...profile,
    email: "privado@example.com",
    role: "Admin",
    passwordHash: "não-deve-sair"
  });

  assert.deepEqual(normalized, profile);
  assert.equal("email" in (normalized ?? {}), false);
  assert.equal("role" in (normalized ?? {}), false);
  assert.equal(normalized?.plusActive, false);
  assert.equal(normalized?.identityVerified, false);
  assert.equal(
    normalizePublicProfileDocument(profile.uid, { ...profile, identityVerified: true })
      ?.identityVerified,
    true
  );
  assert.equal(
    normalizePublicProfileDocument(profile.uid, { ...profile, plusActive: true })
      ?.plusActive,
    true
  );

  assert.equal("passwordHash" in (normalized ?? {}), false);
});
test("área ausente ou vazia não recebe categoria artificial e preserva interesses", () => {
  const { sport: _sport, ...profileWithoutSport } = profile;
  assert.equal(
    normalizePublicProfileDocument(profile.uid, profileWithoutSport)?.sport,
    ""
  );
  const emptyArea = normalizePublicProfileDocument(profile.uid, { ...profile, sport: "  " });
  assert.equal(emptyArea?.sport, "");
  assert.deepEqual(emptyArea?.interestTags, profile.interestTags);
});


test("aceita perfil concluído sem equipe, clube ou projeto", () => {
  const normalized = normalizePublicProfileDocument(profile.uid, {
    ...profile,
    club: ""
  });

  assert.equal(normalized?.club, "");
});

test("mantém perfis antigos válidos e limita os interesses públicos", () => {
  const { interestTags: _interestTags, ...legacyProfile } = profile;
  const legacyNormalized = normalizePublicProfileDocument(profile.uid, legacyProfile);
  const limited = normalizePublicProfileDocument(profile.uid, {
    ...profile,
    interestTags: ["1", "2", "3", "4", "5", "6", "7"]
  });
  assert.deepEqual(legacyNormalized?.interestTags, []);
  assert.deepEqual(limited?.interestTags, ["1", "2", "3", "4", "5", "6"]);

});
test("recupera identidade publica de um perfil legado incompleto", () => {
  const recovered = normalizePublicProfileDocument(
    "uid-legado-12345678",
    {
      name: "Perfil Antigo",
      photoURL: "https://example.com/legado.jpg",
      username: "@perfil.antigo"
    },
    { allowLegacyFallback: true }
  );

  assert.equal(recovered?.name, "Perfil Antigo");
  assert.equal(recovered?.username, "perfil.antigo");
  assert.equal(recovered?.position, "Área não informada");
  assert.equal(recovered?.sport, "");
  assert.equal(recovered?.city, "Local não informado");
  assert.equal(recovered?.age, null);
  assert.equal(
    normalizePublicProfileDocument("uid-legado-12345678", {
      name: "Perfil Antigo",
      username: "perfil.antigo"
    }),
    null
  );
});

test("rejeita perfil com uid, username ou idade inválidos", () => {
  assert.equal(
    normalizePublicProfileDocument(profile.uid, { ...profile, uid: "outro" }),
    null
  );
  assert.equal(
    normalizePublicProfileDocument(profile.uid, { ...profile, username: "Inválido" }),
    null
  );
  assert.equal(
    normalizePublicProfileDocument(profile.uid, { ...profile, age: 4 }),
    null
  );
});
