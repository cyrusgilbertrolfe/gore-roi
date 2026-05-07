import type { BrandProfile } from "@/app/brand/brandTypes";

export type InStoreTrainingAssumptions = {
  adoptionRatePct: number;
  minutesSavedPerStaffPerWeek: number;
  fullyLoadedHourlyCost: number;
  conversionUpliftPct: number;
  grossMarginPct: number;
  baselineAttritionRatePct: number;
  improvedAttritionRatePct: number;
  avgCostPerHire: number;
  returnsReductionPctPoints: number;
  pctResellableFullPrice: number;
  avgMarkdownOtherReturnsPct: number;
};

type LineItem = { key: string; label: string; value: number };

export function calcInStoreTrainingRoi(
  brand: BrandProfile,
  a: InStoreTrainingAssumptions
) {
  const ownStores = safe(brand.ownStores);
  const staffPerStore = safe(brand.storeStaffPerStore);
  const totalStoreStaff = ownStores * staffPerStore;

  const adoptionRate = clamp01(pct(a.adoptionRatePct));
  const staffAffected = totalStoreStaff * adoptionRate;

  const avgItemPrice = safe(brand.avgItemPrice);
  const unitsSoldOwnStores = safe(brand.unitsSoldOwnStores);
  const ownStoreRevenueTotal = unitsSoldOwnStores * avgItemPrice;
  const ownStoreRevenueAdopted = ownStoreRevenueTotal * adoptionRate;

  // 1) Labour saving
  const minutesSaved = safe(a.minutesSavedPerStaffPerWeek);
  const annualHoursSavedTotal = (staffAffected * minutesSaved * 52) / 60;
  const hourlyCost = safe(a.fullyLoadedHourlyCost);
  const labourTimeSaving = annualHoursSavedTotal * hourlyCost;

  // 2) Conversion uplift
  const conversionUplift = pct(a.conversionUpliftPct);
  const grossMargin = clamp01(pct(a.grossMarginPct));
  const incrementalRevenue = ownStoreRevenueAdopted * conversionUplift;
  const grossProfitUplift = incrementalRevenue * grossMargin;

  // 3) Retention saving
  const baselineAttrition = clamp01(pct(a.baselineAttritionRatePct));
  const improvedAttrition = clamp01(pct(a.improvedAttritionRatePct));
  const attritionDelta = Math.max(0, baselineAttrition - improvedAttrition);
  const avgCostPerHire = safe(a.avgCostPerHire);
  const staffRetentionSaving = staffAffected * attritionDelta * avgCostPerHire;

  // 4) Returns saving
  const baselineReturnRate = clamp01(pct(brand.baselineReturnRate));
  const reductionPts = pctPointsToRate(a.returnsReductionPctPoints);
  const returnRateAfterTraining = clamp01(baselineReturnRate - reductionPts);

  const returnedValueBaseline = ownStoreRevenueAdopted * baselineReturnRate;
  const returnedValueAfter = ownStoreRevenueAdopted * returnRateAfterTraining;
  const returnedValueDelta = Math.max(
    0,
    returnedValueBaseline - returnedValueAfter
  );

  const pctResellableFullPrice = clamp01(pct(a.pctResellableFullPrice));
  const markdownOtherReturns = clamp01(pct(a.avgMarkdownOtherReturnsPct));
  const returnsValueSaving =
    returnedValueDelta * (1 - pctResellableFullPrice) * markdownOtherReturns;

  const lineItems: LineItem[] = [
    { key: "labour", label: "Labour time saving", value: labourTimeSaving },
    {
      key: "conversion",
      label: "Gross profit uplift (conversion)",
      value: grossProfitUplift,
    },
    {
      key: "retention",
      label: "Staff retention saving",
      value: staffRetentionSaving,
    },
    { key: "returns", label: "Returns value saving", value: returnsValueSaving },
  ];

  const totalAnnualBenefit = lineItems.reduce(
    (sum, x) => sum + safe(x.value),
    0
  );
  return { totalAnnualBenefit, lineItems };
}

function safe(n: unknown): number {
  const x = typeof n === "number" ? n : Number(n);
  return Number.isFinite(x) ? x : 0;
}

function pct(p: unknown): number {
  return safe(p) / 100;
}

function pctPointsToRate(p: unknown): number {
  return safe(p) / 100;
}

function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0;
  return Math.min(1, Math.max(0, x));
}
