import assert from "node:assert/strict";
import test from "node:test";
import {
  APP_STATE_SCHEMA_VERSION,
  createLocalAppStateRepository,
  createDefaultLocalAppState,
  migrateLocalAppState,
  parseLocalAppState,
  serializeLocalAppState
} from "../src/repositories/appStateSchema.ts";

const demoFund = {
  athleteName: "Perfil demonstrativo",
  createdAt: "2026-07-01T00:00:00.000Z",
  fundedAmount: 0,
  goalAmount: 5000,
  id: "demo-athlete-fund",
  minimumContribution: 50,
  ownerUserId: "demo-athlete",
  profileId: "nextstar-demo-profile",
  status: "Captando" as const
};

test("retorna o estado inicial quando não existe valor persistido", () => {
  const fallback = createDefaultLocalAppState([demoFund]);

  assert.deepEqual(parseLocalAppState(null, fallback), fallback);
  assert.deepEqual(parseLocalAppState("json-inválido", fallback), fallback);
});

test("migra estado sem versão e preserva dados válidos", () => {
  const fallback = createDefaultLocalAppState([demoFund]);
  const migrated = migrateLocalAppState(
    {
      activeUser: {
        acceptedTerms: true,
        email: "teste@nextstar.local",
        id: "usuario-teste",
        kycStatus: "Não iniciado",
        name: "Teste",
        role: "Usuário"
      },
      registeredUsers: [],
      submissions: [],
      walletBalances: {
        "usuario-teste": 350,
        inválido: -10
      }
    },
    fallback
  );

  assert.equal(migrated.version, APP_STATE_SCHEMA_VERSION);
  assert.equal(migrated.activeUser?.id, "usuario-teste");
  assert.equal(migrated.activeUser?.profileCompleted, false);
  assert.equal(migrated.activeUser?.age, null);
  assert.equal(migrated.activeUser?.bio, "");
  assert.equal(migrated.activeUser?.username, "teste");
  assert.equal(migrated.registeredUsers[0]?.id, "usuario-teste");
  assert.deepEqual(migrated.athleteFunds, [demoFund]);
  assert.deepEqual(migrated.walletBalances, { "usuario-teste": 350 });
});

test("preserva perfil completo e credencial sem expor senha em texto", () => {
  const fallback = createDefaultLocalAppState();
  const migrated = migrateLocalAppState(
    {
      activeUser: null,
      registeredUsers: [
        {
          acceptedTerms: true,
          age: 17,
          bio: "Atleta focado em evolução e oportunidades no futebol.",
          city: "São Paulo, SP",
          club: "Projeto NextStar",
          email: "atleta@nextstar.local",
          id: "usuario-atleta@nextstar.local",
          kycStatus: "Não iniciado",
          name: "Atleta NextStar",
          passwordHash: "hash-seguro",
          passwordSalt: "salt-aleatório",
          position: "Ponta",
          profileCompleted: true,
          role: "Usuário"
        }
      ]
    },
    fallback
  );

  assert.equal(migrated.registeredUsers[0]?.profileCompleted, true);
  assert.equal(migrated.registeredUsers[0]?.bio, "Atleta focado em evolução e oportunidades no futebol.");
  assert.equal(migrated.registeredUsers[0]?.passwordHash, "hash-seguro");
  assert.equal(migrated.registeredUsers[0]?.username, "atleta");
  assert.equal("password" in migrated.registeredUsers[0], false);
});

test("migra usernames repetidos para identificadores únicos", () => {
  const migrated = migrateLocalAppState(
    {
      activeUser: null,
      registeredUsers: [
        {
          acceptedTerms: true,
          email: "primeiro@nextstar.local",
          id: "usuario-primeiro",
          kycStatus: "Não iniciado",
          name: "Pedro Barberini",
          role: "Usuário",
          username: "pedro"
        },
        {
          acceptedTerms: true,
          email: "segundo@nextstar.local",
          id: "usuario-segundo",
          kycStatus: "Não iniciado",
          name: "Pedro Barberini",
          role: "Usuário",
          username: "Pedro"
        }
      ]
    },
    createDefaultLocalAppState()
  );

  assert.deepEqual(
    migrated.registeredUsers.map((account) => account.username),
    ["pedro", "pedro_2"]
  );
  assert.equal(migrated.registeredUsers[0]?.name, "Pedro Barberini");
  assert.equal(migrated.registeredUsers[1]?.name, "Pedro Barberini");
});

test("serialização e leitura preservam o estado completo", () => {
  const staté = {
    ...createDefaultLocalAppState([demoFund]),
    walletBalances: { "usuario-teste": 1200 }
  };
  const serialized = serializeLocalAppState(staté);
  const restored = parseLocalAppState(
    serialized,
    createDefaultLocalAppState()
  );

  assert.deepEqual(restored, staté);
});

test("repositório salva, carrega e limpa o estado", async () => {
  const memory = new Map<string, string>();
  const repository = createLocalAppStateRepository(
    {
      async getItem(key) {
        return memory.get(key) ?? null;
      },
      async removeItem(key) {
        memory.delete(key);
      },
      async setItem(key, value) {
        memory.set(key, value);
      }
    },
    "app-staté-test"
  );
  const fallback = createDefaultLocalAppState([demoFund]);
  const staté = {
    ...fallback,
    walletBalances: { "usuario-teste": 900 }
  };

  await repository.save(staté);
  assert.deepEqual(await repository.load(fallback), staté);

  await repository.clear();
  assert.deepEqual(await repository.load(fallback), fallback);
});
