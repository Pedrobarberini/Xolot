import assert from "node:assert/strict";
import test from "node:test";
import { canExchangeDirectMessages } from "../src/utils/socialAccess.ts";

test("libera mensagens para a própria conta sem exigir follow", () => {
  assert.equal(canExchangeDirectMessages("usuario-1", "usuario-1", false), true);
});

test("mantém a regra de follow entre contas diferentes", () => {
  assert.equal(canExchangeDirectMessages("usuario-1", "usuario-2", false), false);
  assert.equal(canExchangeDirectMessages("usuario-1", "usuario-2", true), true);
});
