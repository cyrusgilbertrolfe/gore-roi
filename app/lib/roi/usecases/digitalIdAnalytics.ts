import type { BrandProfile } from "@/app/brand/brandTypes";

type LineItem = { key: string; label: string; value: number };

export type DigitalIdAnalyticsAssumptions = {
  annualMarkdownRevenueUsd: number;
  markdownDepthPct: number;
  buyingAccuracyImprovementPct: number;
  grossMarginPct: number;
  annualMarketingSpendUsd: number;
  roasImprovementPct: number;
  newSkusPerSeason: number;
  seasonsPerYear: number;
  currentMissRatePct: number;
  missRateReductionPct: number;
  avgUnitsPerSku: number;
  avgSellingPriceUsd: number;
  missMarkdownDepthPct: number;
};

function safe(n: unknown): number {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

function pct(v: number): number {
  return safe(v) / 100;
}

export function calcDigitalIdAnalyticsRoi(
  _brand: BrandProfile,
  a: DigitalIdAnalyticsAssumptions
) {
  const markdownCostBase =
    safe(a.annualMarkdownRevenueUsd) *
    pct(a.markdownDepthPct) *
    pct(a.grossMarginPct);
  const markdownSaving =
    markdownCostBase * pct(a.buyingAccuracyImprovementPct);

  const marketingSaving =
    safe(a.annualMarketingSpendUsd) * pct(a.roasImprovementPct);

  const annualNewSkus = safe(a.newSkusPerSeason) * safe(a.seasonsPerYear);
  const currentMisses = annualNewSkus * pct(a.currentMissRatePct);
  const missesAvoided = currentMisses * pct(a.missRateReductionPct);
  const rangeHitRateSaving =
    missesAvoided *
    safe(a.avgUnitsPerSku) *
    safe(a.avgSellingPriceUsd) *
    pct(a.missMarkdownDepthPct) *
    pct(a.grossMarginPct);

  const lineItems: LineItem[] = [
    {
      key: "markdown",
      label: "Markdown cost reduction from scan-velocity demand signals",
      value: markdownSaving,
    },
    {
      key: "marketing",
      label: "Marketing efficiency from product engagement intelligence",
      value: marketingSaving,
    },
    {
      key: "range",
      label: "Avoided markdown on miss SKUs from item-level intelligence",
      value: rangeHitRateSaving,
    },
  ];

  const totalAnnualBenefit = lineItems.reduce((s, x) => s + x.value, 0);
  return { totalAnnualBenefit, lineItems };
}
