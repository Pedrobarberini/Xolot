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

test("retorna o estado inicial quando nao existe valor persistido", () => {
  const fallback = createDefaultLocalAppState([demoFund]);

  assert.deepEqual(parseLocalAppState(null, fallback), fallback);
  assert.deepEqual(parseLocalAppState("json-invalido", fallback), fallback);
});

test("migra estado sem versao e preserva dados validos", () => {
  const fallback = createDefaultLocalAppState([demoFund]);
  const migrated = migrateLocalAppState(
    {
      activeUser: {
        acceptedTerms: true,
        email: "teste@nextstar.local",
        id: "usuario-teste",
        kycStatus: "Nao iniciado",
        name: "Teste",
        role: "Usuario"
      },
      registeredUsers: [],
      submissions: [],
      walletBalances: {
        "usuario-teste": 350,
        invalido: -10
      }
    },
    fallback
  );

  assert.equal(migrated.version, APP_STATE_SCHEMA_VERSION);
  assert.equal(migrated.activeUser?.id, "usuario-teste");
  assert.deepEqual(migrated.athleteFunds, [demoFund]);
  assert.deepEqual(migrated.walletBalances, { "usuario-teste": 350 });
});

test("serializacao e leitura preservam o estado completo", () => {
  const state = {
    ...createDefaultLocalAppState([demoFund]),
    walletBalances: { "usuario-teste": 1200 }
  };
  const serialized = serializeLocalAppState(state);
  const restored = parseLocalAppState(
    serialized,
    createDefaultLocalAppState()
  );

  assert.deepEqual(restored, state);
});

test("repositorio salva, carrega e limpa o estado", async () => {
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
    "app-state-test"
  );
  const fallback = createDefaultLocalAppState([demoFund]);
  const state = {
    ...fallback,
    walletBalances: { "usuario-teste": 900 }
  };

  await repository.save(state);
  assert.deepEqual(await repository.load(fallback), state);

  await repository.clear();
  assert.deepEqual(await repository.load(fallback), fallback);
});
