export const COMMISSION_RATE = 0.01
export const MIN_COMMISSION = 0.50

export function calculateCommission(sellAmount: number, rate: number = COMMISSION_RATE): number {
  const commission = sellAmount * rate
  return Math.max(commission, sellAmount > 0 ? MIN_COMMISSION : 0)
}
