export const MIN_WALLET_OPERATION_AMOUNT = 10;
export const MAX_WALLET_DEPOSIT_AMOUNT = 100000;

export function isValidDepositAmount(amount: number) {
  return (
    Number.isFinite(amount) &&
    amount >= MIN_WALLET_OPERATION_AMOUNT &&
    amount <= MAX_WALLET_DEPOSIT_AMOUNT
  );
}

export function isValidWithdrawalAmount(balance: number, amount: number) {
  return (
    Number.isFinite(balance) &&
    Number.isFinite(amount) &&
    balance >= 0 &&
    amount >= MIN_WALLET_OPERATION_AMOUNT &&
    amount <= balance
  );
}

export function calculateBalanceAfterWithdrawal(
  balance: number,
  amount: number
) {
  return isValidWithdrawalAmount(balance, amount) ? balance - amount : balance;
}
