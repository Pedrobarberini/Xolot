import assert from "node:assert/strict";
import test from "node:test";
import {
  createProfileCommands,
  normalizeProfileWrite,
} from "../src/features/profiles/application/saveProfile.ts";
import {
  InvalidPublicProfileError,
  UsernameAlreadyInUseError,
} from "../src/features/profiles/domain/errors.ts";
import type { AccountProfile } from "../src/features/profiles/domain/types.ts";
import type { ProfileWrite } from "../src/features/profiles/application/profileRepository.ts";

const profile: AccountProfile = {
  age: 25,
  bio: "Biografia válida de teste",
  city: "São Paulo",
  club: "",
  interestTags: ["Treino"],
  name: "Pessoa Sintética",
  position: "Atleta",
  sport: "Futebol",
  username: "pessoa.sintetica",
};

test("caso de uso normaliza uma projeção permitida e injeta o repositório sem SDK", async () => {
  const saved: ProfileWrite[] = [];
  const service = createProfileCommands({
    repository: {
      saveWithUsername: async (value) => {
        saved.push(value);
      },
    },
    currentIdentity: () => ({ uid: "Owner", emailVerified: true }),
  });
  const result = await service.save(
    "Owner",
    {
      ...profile,
      name: "  Pessoa Sintética  ",
      username: " @Pessoa.Nova ",
      club: "  ",
      interestTags: ["treino", "treino"],
    },
    " https://example.test/photo.png ",
  );
  assert.equal(result.uid, "Owner");
  assert.equal(result.username, "pessoa.nova");
  assert.equal(result.photoURL, "https://example.test/photo.png");
  assert.equal(result.name, "Pessoa Sintética");
  assert.equal(result.club, "");
  assert.deepEqual(result.interestTags, ["treino"]);
  assert.equal(saved[0], result);
  const injected = normalizeProfileWrite("Owner", {
    ...profile,
    role: "Admin",
    plusActive: true,
    identityVerified: true,
    email: "privado",
  } as AccountProfile);
  for (const field of ["role", "plusActive", "identityVerified", "email"])
    assert.equal(field in injected, false);
});

test("perfil sem área usa somente hashtags e conserva valores legados quando presentes", () => {
  const current = normalizeProfileWrite("Owner", {
    ...profile,
    sport: "  ",
    interestTags: ["arte", "tecnologia"],
  });
  assert.equal(current.sport, "");
  assert.deepEqual(current.interestTags, ["arte", "tecnologia"]);
  assert.equal(normalizeProfileWrite("Owner", profile).sport, "Futebol");
});

test("sessão ausente, email não confirmado ou UID diferente não alcançam escrita", async () => {
  for (const currentIdentity of [
    () => null,
    () => ({ uid: "Owner", emailVerified: false }),
    () => ({ uid: "Other", emailVerified: true }),
  ]) {
    let writes = 0;
    const service = createProfileCommands({
      repository: {
        saveWithUsername: async () => {
          writes += 1;
        },
      },
      currentIdentity,
    });
    await assert.rejects(service.save("Owner", profile), InvalidPublicProfileError);
    assert.equal(writes, 0);
  }
});

test("limites de campos e idades inválidas são rejeitados antes de acessar o banco", () => {
  const invalid: Partial<AccountProfile>[] = [
    ...[null, NaN, Infinity, 4, 101, 25.5].map((age) => ({ age })),
    { name: "ab" },
    { name: "n".repeat(81) },
    { username: "a/b" },
    { bio: "curta" },
    { bio: "b".repeat(241) },
    { position: "a" },
    { position: "p".repeat(41) },
    { sport: "a" },
    { sport: "s".repeat(41) },
    { city: "a" },
    { city: "c".repeat(81) },
    { club: "a" },
    { club: "c".repeat(81) },
  ];
  for (const input of invalid)
    assert.throws(
      () => normalizeProfileWrite("Owner", { ...profile, ...input }),
      InvalidPublicProfileError,
    );
  assert.throws(
    () => normalizeProfileWrite("Owner", profile, "p".repeat(2049)),
    InvalidPublicProfileError,
  );
  assert.equal(normalizeProfileWrite("Owner", { ...profile, age: 5 }).age, 5);
  assert.equal(normalizeProfileWrite("Owner", { ...profile, age: 100 }).age, 100);
});

test("conflito de username e falha de infraestrutura preservam erro original", async () => {
  for (const error of [new UsernameAlreadyInUseError(), new Error("indisponível")]) {
    const service = createProfileCommands({
      repository: {
        saveWithUsername: async () => {
          throw error;
        },
      },
      currentIdentity: () => ({ uid: "Owner", emailVerified: true }),
    });
    await assert.rejects(service.save("Owner", profile), (result) => result === error);
  }
});
