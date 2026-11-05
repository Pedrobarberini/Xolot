import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const {
  requireRegisteredAccount,
} = require("../../functions/lib/modules/accounts/application/requireRegisteredAccount.js");
const { OperationError } = require("../../functions/lib/domain/OperationError.js");
const { toCallableError } = require("../../functions/lib/platform/callableErrors.js");

test("cadastro aceita conta existente ou perfil legado completo sem conhecer SDK", async () => {
  for (const state of [
    { accountExists: true, profileCompleted: false },
    { accountExists: false, profileCompleted: true },
    { accountExists: true, profileCompleted: true },
  ]) {
    const reads = [];
    await requireRegisteredAccount("CaseUID", {
      read: async (uid) => {
        reads.push(uid);
        return state;
      },
    });
    assert.deepEqual(reads, ["CaseUID"]);
  }
});

test("cadastro incompleto conserva o código/mensagem externo e falha de infraestrutura não vira autorização", async () => {
  let denied;
  try {
    await requireRegisteredAccount("owner", {
      read: async () => ({ accountExists: false, profileCompleted: false }),
    });
  } catch (error) {
    denied = error;
  }
  assert.ok(denied instanceof OperationError);
  const rpc = toCallableError(denied);
  assert.equal(rpc.code, "permission-denied");
  assert.equal(rpc.message, "Complete o cadastro da sua conta antes de publicar.");
  const failure = new Error("SDK indisponível");
  await assert.rejects(
    requireRegisteredAccount("owner", {
      read: async () => {
        throw failure;
      },
    }),
    (error) => error === failure,
  );
  assert.equal(toCallableError(failure), failure);
});
