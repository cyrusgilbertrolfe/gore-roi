import type { BrandProfile } from "@/app/brand/brandTypes";

type LineItem = { key: string; label: string; value: number };

export type DigitalProductExperienceAssumptions = {
  annualOwnChannelOrders: number;
  scanEngagementRatePct: number;
  repeatPurchaseUpliftPct: number;
  avgRepeatOrderValueUsd: number;
  grossMarginPct: number;
  returnRateReductionPct: number;
  returnProcessingCostUsd: number;
  transparencyRevenueBasisPoints: number;
};

function safe(n: unknown): number {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

function pct(v: number): number {
  return safe(v) / 100;
}

export function calcDigitalProductExperienceRoi(
  brand: BrandProfile,
  a: DigitalProductExperienceAssumptions
) {
  const annualRevenue = safe(brand.annualRevenue);
  const avgItemPrice = safe(brand.avgItemPrice);
  const baselineReturnRate = safe(brand.baselineReturnRate);

  const estimatedAnnualUnits =
    avgItemPrice > 0 ? annualRevenue / avgItemPrice : 0;
  const totalAnnualReturns = estimatedAnnualUnits * pct(baselineReturnRate);

  const ownChannelPct =
    safe(brand.channelMix?.ownStoresPct) + safe(brand.channelMix?.ownEcomPct);
  const ownChannelRevenue = annualRevenue * pct(ownChannelPct);

  const engagedCustomers =
    safe(a.annualOwnChannelOrders) * pct(a.scanEngagementRatePct);
  const incrementalRepeatOrders =
    engagedCustomers * pct(a.repeatPurchaseUpliftPct);
  const repeatPurchaseSaving =
    incrementalRepeatOrders *
    safe(a.avgRepeatOrderValueUsd) *
    pct(a.grossMarginPct);

  const returnsAvoided = totalAnnualReturns * pct(a.returnRateReductionPct);
  const feedbackSaving = returnsAvoided * safe(a.returnProcessingCostUsd);

  const transparencySaving =
    ownChannelRevenue *
    (safe(a.transparencyRevenueBasisPoints) / 10_000) *
    pct(a.grossMarginPct);

  const lineItems: LineItem[] = [
    {
      key: "repeat",
      label: "Incremental margin from engagement-driven repeat purchase",
      value: repeatPurchaseSaving,
    },
    {
      key: "feedback",
      label: "Return cost reduction from item-level feedback loops",
      value: feedbackSaving,
    },
    {
      key: "transparency",
      label: "Own-channel margin uplift from transparency engagement",
      value: transparencySaving,
    },
  ];

  const totalAnnualBenefit = lineItems.reduce((s, x) => s + x.value, 0);
  return { totalAnnualBenefit, lineItems };
}
