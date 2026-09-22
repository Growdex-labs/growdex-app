"use client";

/** Shared number and money formatting for the analytics surfaces. */

export const formatNumber = (value: number) =>
  Math.trunc(Number.isFinite(value) ? value : 0).toLocaleString("en-US");

export const formatCurrency = (value: number, currency = "NGN") => {
  const code = currency && currency.length === 3 ? currency : "NGN";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number.isFinite(value) ? value : 0);
  } catch {
    return `${code} ${(Number.isFinite(value) ? value : 0).toFixed(2)}`;
  }
};

export const formatMetricValue = (
  value: number | null | undefined,
  unit: string,
  currency?: string,
): string => {
  const safe = Number.isFinite(Number(value)) ? Number(value) : 0;
  switch (unit) {
    case "currency":
      return formatCurrency(safe, currency);
    case "percent":
      return `${safe.toFixed(2)}%`;
    case "ratio":
      return safe.toFixed(2);
    case "multiple":
      return `${safe.toFixed(2)}x`;
    case "seconds":
      return `${safe.toFixed(1)}s`;
    default:
      return formatNumber(safe);
  }
};
