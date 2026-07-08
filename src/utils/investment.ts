export function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatPercent(value: number) {
  return `${value.toFixed(2).replace(".", ",")}%`;
}

export function calculatePoolShare(
  amount: number,
  currentPool: number,
  distributionPercent: number
) {
  if (amount <= 0) {
    return 0;
  }

  const poolAfterInvestment = currentPool + amount;

  if (poolAfterInvestment <= 0) {
    return 0;
  }

  return (amount / poolAfterInvestment) * distributionPercent;
}

export function calculateProjectedDistribution(
  amount: number,
  currentPool: number,
  distributionPercent: number,
  projectedMonthlyEarnings: number
) {
  const investorDistributionPercent = calculatePoolShare(
    amount,
    currentPool,
    distributionPercent
  );

  return projectedMonthlyEarnings * (investorDistributionPercent / 100);
}
