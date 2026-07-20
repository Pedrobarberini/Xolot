import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateBalanceAfterWithdrawal,
  isValidDepositAmount,
  isValidWithdrawalAmount
} from "../src/utils/wallet.ts";

test("aceita deposito dentro dos limites da carteira", () => {
  assert.equal(isValidDepositAmount(10), true);
  assert.equal(isValidDepositAmount(100000), true);
  assert.equal(isValidDepositAmount(9), false);
  assert.equal(isValidDepositAmount(100001), false);
});

test("permite sacar somente o saldo disponivel", () => {
  assert.equal(isValidWithdrawalAmount(500, 10), true);
  assert.equal(isValidWithdrawalAmount(500, 500), true);
  assert.equal(isValidWithdrawalAmount(500, 501), false);
  assert.equal(isValidWithdrawalAmount(500, 9), false);
});

test("saque valido reduz o saldo sem permitir valor negativo", () => {
  assert.equal(calculateBalanceAfterWithdrawal(500, 125), 375);
  assert.equal(calculateBalanceAfterWithdrawal(500, 600), 500);
});
