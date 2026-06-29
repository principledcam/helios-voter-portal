import { TrendResult } from "./analyticsTypes";

export function calculateRate(
  numerator: number,
  denominator: number
): number {
  if (denominator === 0) return 0;

  return (numerator / denominator) * 100;
}

export function calculateTrend(
  current: number,
  previous: number
): TrendResult {

  const difference = current - previous;

  let percentChange = 0;

  if (previous !== 0) {
    percentChange =
      (difference / previous) * 100;
  }

  return {
    current,
    previous,
    difference,
    percentChange,
  };
}

export function safePercent(
  value: number
): string {
  return `${value.toFixed(1)}%`;
}