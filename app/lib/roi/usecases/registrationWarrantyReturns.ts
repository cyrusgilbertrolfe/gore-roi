import type { BrandProfile } from "@/app/brand/brandTypes";

export type RegistrationWarrantyReturnsAssumptions = {
  registrationRatePct: number;
  includeOwnChannelPct: number;
  includeAwayChannelPct: number;
  repeatPurchaseUpliftPct: number;
  grossMarginPct: number;
  falseReturnReductionPct: number;
  cacValuePctOfAvgPrice: number;
  opsSavingPerReturn: number;
};

type LineItem = { key: string; label: string; value: number };

export function calcRegistrationWarrantyReturnsRoi(
  brand: BrandProfile,
  a: RegistrationWarrantyReturnsAssumptions
) {
  const avgPrice = safe(brand.avgItemPrice);
  const annualRevenue = safe(brand.annualRevenue);
  const unitsOwn = safe(brand.unitsSoldOwnStores);

  const totalUnitsEstimated =
    avgPrice > 0 && annualRevenue > 0 ? annualRevenue / avgPrice : 0;

  const ownPct = safe(brand.channelMix?.ownStoresPct);
  const sumPct =
    safe(brand.channelMix?.ownStoresPct) +
    safe(brand.channelMix?.ownEcomPct) +
    safe(brand.channelMix?.wholesalePct);

  let unitsAway = 0;
  if (sumPct > 0 && totalUnitsEstimated > 0) {
    const ownFromMix = (totalUnitsEstimated * ownPct) / 100;
    unitsAway = Math.max(totalUnitsEstimated - ownFromMix, 0);
  } else {
    unitsAway = Math.max(totalUnitsEstimated - unitsOwn, 0);
  }

  const regRate = pct(a.registrationRatePct);
  const ownEligible = pct(a.includeOwnChannelPct);
  const awayEligible = pct(a.includeAwayChannelPct);

  const registeredOwn = unitsOwn * regRate * ownEligible;
  const registeredAway = unitsAway * regRate * awayEligible;
  const registeredTotal = registeredOwn + registeredAway;

  const cacValue = avgPrice * pct(a.cacValuePctOfAvgPrice);
  const customerAcquisitionValue = registeredAway * cacValue;

  const repeatUplift = pct(a.repeatPurchaseUpliftPct);
  const grossMargin = pct(a.grossMarginPct);
  const repeatPurchaseMargin =
    registeredTotal * avgPrice * repeatUplift * grossMargin;

  const falseReturnReduction = pct(a.falseReturnReductionPct);
  const preventedFalseReturns =
    (unitsOwn + unitsAway) * falseReturnReduction;
  const preventedFalseReturnValue = preventedFalseReturns * avgPrice;
  const opsSaving = preventedFalseReturns * safe(a.opsSavingPerReturn);

  const lineItems: LineItem[] = [
    {
      key: "cac",
      label: "Customer capture from third-party sales (CAC proxy)",
      value: customerAcquisitionValue,
    },
    {
      key: "repeat",
      label: "Repeat purchase margin uplift on registered customers",
      value: repeatPurchaseMargin,
    },
    {
      key: "fraud",
      label: "Prevented false returns (product value)",
      value: preventedFalseReturnValue,
    },
  ];

  if (opsSaving !== 0) {
    lineItems.push({
      key: "ops",
      label: "Operational saving on prevented false returns",
      value: opsSaving,
    });
  }

  const totalAnnualBenefit = lineItems.reduce((s, x) => s + x.value, 0);
  return { totalAnnualBenefit, lineItems };
}

function safe(n: unknown): number {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

function pct(n: number): number {
  return safe(n) / 100;
}
