import type { CurrencyCode } from "@/app/brand/brandTypes";

const CURRENCY_SYMBOL: Record<CurrencyCode, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export function formatCurrency(value: number, currency: CurrencyCode): string {
  if (!Number.isFinite(value)) return `${CURRENCY_SYMBOL[currency]}0`;
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);

  if (abs >= 1_000_000_000) {
    return `${sign}${CURRENCY_SYMBOL[currency]}${(abs / 1_000_000_000).toFixed(2)}B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}${CURRENCY_SYMBOL[currency]}${(abs / 1_000_000).toFixed(2)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}${CURRENCY_SYMBOL[currency]}${(abs / 1_000).toFixed(1)}K`;
  }
  return `${sign}${CURRENCY_SYMBOL[currency]}${Math.round(abs).toLocaleString("en-US")}`;
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return Math.round(value).toLocaleString("en-US");
}
