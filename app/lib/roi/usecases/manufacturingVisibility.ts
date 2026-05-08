import type { BrandProfile } from "@/app/brand/brandTypes";

type LineItem = { key: string; label: string; value: number };

export type ManufacturingVisibilityAssumptions = {
  lateShipmentRatePct: number;
  airFreightPremiumPct: number;
  cogsPct: number;
  opsHoursSavedPerPO: number;
  fullyLoadedHourlyCost: number;
  avgUnitsPerPO: number;
  orderShortfallRatePct: number;
};

function safe(n: unknown): number {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

function pct(v: number): number {
  return safe(v) / 100;
}

export function calcManufacturingVisibilityRoi(
  brand: BrandProfile,
  a: ManufacturingVisibilityAssumptions
) {
  const annualRevenue = safe(brand.annualRevenue);
  const avgPrice = safe(brand.avgItemPrice);

  let totalUnits =
    annualRevenue > 0 && avgPrice > 0 ? annualRevenue / avgPrice : 0;

  if (totalUnits <= 0) {
    const ownUnits = safe(brand.unitsSoldOwnStores);
    const ownStoresPct = safe(brand.channelMix?.ownStoresPct);
    if (ownUnits > 0 && ownStoresPct > 0) {
      totalUnits = ownUnits / pct(ownStoresPct);
    }
  }

  const cogsPct = pct(a.cogsPct);
  const lateShipmentRate = pct(a.lateShipmentRatePct);
  const airFreightPremium = pct(a.airFreightPremiumPct);
  const opsHoursSavedPerPO = safe(a.opsHoursSavedPerPO);
  const hourlyCost = safe(a.fullyLoadedHourlyCost);
  const avgUnitsPerPO = Math.max(safe(a.avgUnitsPerPO), 0);
  const shortfallRate = pct(a.orderShortfallRatePct);

  const annualCogs = annualRevenue * cogsPct;
  const unitCogs = totalUnits > 0 ? annualCogs / totalUnits : 0;
  const poCount =
    totalUnits > 0 && avgUnitsPerPO > 0 ? totalUnits / avgUnitsPerPO : 0;

  // 1) Early delay detection — air freight avoided
  const lateUnits = totalUnits * lateShipmentRate;
  const expeditedFreightSaving = lateUnits * unitCogs * airFreightPremium;

  // 2) Production visibility — ops chasing eliminated
  const annualHoursSaved = poCount * opsHoursSavedPerPO;
  const opsSaving = annualHoursSaved * hourlyCost;

  // 3) Invoicing accuracy — pay for IDs commissioned, not units ordered
  const shortfallUnits = totalUnits * shortfallRate;
  const overpaymentSaving = shortfallUnits * unitCogs;

  const lineItems: LineItem[] = [
    {
      key: "expedite",
      label: "Reduced air freight on late or missing deliveries",
      value: expeditedFreightSaving,
    },
    {
      key: "ops",
      label: "Reduced production follow-up (ops time)",
      value: opsSaving,
    },
    {
      key: "overpayment",
      label: "Prevented overpayment — invoiced only for serialised units",
      value: overpaymentSaving,
    },
  ];

  const totalAnnualBenefit = lineItems.reduce((s, x) => s + x.value, 0);
  return { totalAnnualBenefit, lineItems };
}
