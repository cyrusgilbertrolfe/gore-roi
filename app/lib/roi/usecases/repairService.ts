import type { BrandProfile } from "@/app/brand/brandTypes";

type LineItem = { key: string; label: string; value: number };

export type RepairServiceAssumptions = {
  annualWarrantyClaims: number;
  invalidClaimRatePct: number;
  costPerInvalidClaimUsd: number;
  validationCatchRatePct: number;

  repairableReturnSharePct: number;
  conversionRatePct: number;
  netSavingPerDivertedReturnUsd: number;

  serviceEventRatePct: number;
  avgServiceRevenueUsd: number;
  serviceMarginPct: number;
  throughputUpliftPct: number;
};

function safe(n: unknown): number {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

function pct(v: number): number {
  return safe(v) / 100;
}

export function calcRepairServiceRoi(
  brand: BrandProfile,
  a: RepairServiceAssumptions
) {
  const annualRevenue = safe(brand.annualRevenue);
  const avgItemPrice = safe(brand.avgItemPrice);
  const baselineReturnRate = safe(brand.baselineReturnRate);

  const estimatedAnnualUnits =
    avgItemPrice > 0 ? annualRevenue / avgItemPrice : 0;
  const totalAnnualReturns = estimatedAnnualUnits * pct(baselineReturnRate);

  const invalidClaims =
    safe(a.annualWarrantyClaims) * pct(a.invalidClaimRatePct);
  const claimsCaught = invalidClaims * pct(a.validationCatchRatePct);
  const warrantyValidationSaving =
    claimsCaught * safe(a.costPerInvalidClaimUsd);

  const repairableReturns = totalAnnualReturns * pct(a.repairableReturnSharePct);
  const divertedReturns = repairableReturns * pct(a.conversionRatePct);
  const returnDiversionSaving =
    divertedReturns * safe(a.netSavingPerDivertedReturnUsd);

  const baseServiceEvents = estimatedAnnualUnits * pct(a.serviceEventRatePct);
  const baseServiceRevenue =
    baseServiceEvents * safe(a.avgServiceRevenueUsd) * pct(a.serviceMarginPct);
  const serviceRevenueSaving = baseServiceRevenue * pct(a.throughputUpliftPct);

  const lineItems: LineItem[] = [
    {
      key: "warranty",
      label: "Warranty fraud and invalid claim costs avoided",
      value: warrantyValidationSaving,
    },
    {
      key: "returns",
      label: "Return processing costs avoided by repair diversion",
      value: returnDiversionSaving,
    },
    {
      key: "service",
      label: "Service margin uplift from faster technician throughput",
      value: serviceRevenueSaving,
    },
  ];

  const totalAnnualBenefit = lineItems.reduce((s, x) => s + x.value, 0);
  return { totalAnnualBenefit, lineItems };
}
