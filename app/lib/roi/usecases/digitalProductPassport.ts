import type { BrandProfile } from "@/app/brand/brandTypes";

type LineItem = {
  key: string;
  label: string;
  value: number;
};

const safe = (n: number | undefined | null) =>
  Number.isFinite(n as number) ? Number(n) : 0;

const pct = (n: number | undefined | null) => safe(n) / 100;

export type DigitalProductPassportAssumptions = {
  // Core reuse + compliance efficiency
  complianceHoursSavedPerYear: number;
  fullyLoadedHourlyCost: number;

  // Supplier data efficiency
  suppliersInScope: number;
  hoursSavedPerSupplierPerYear: number;

  // Avoided rebuild / reimplementation
  annualisedRebuildCostAvoidedUsd: number;

  // Audit readiness
  auditHoursSavedPerYear: number;

  // Working capital impact
  workingCapitalDaysImprovement: number;
  costOfCapitalPct: number;
};

export function calcDigitalProductPassportRoi(
  brand: BrandProfile,
  a: DigitalProductPassportAssumptions
) {
  const annualRevenue = safe(brand.annualRevenue);
  const hourlyCost = safe(a.fullyLoadedHourlyCost);

  // 1. Compliance programme efficiency
  const complianceSaving = safe(a.complianceHoursSavedPerYear) * hourlyCost;

  // 2. Supplier data collection efficiency
  const supplierSaving =
    safe(a.suppliersInScope) *
    safe(a.hoursSavedPerSupplierPerYear) *
    hourlyCost;

  // 3. Audit & recall readiness
  const auditSaving = safe(a.auditHoursSavedPerYear) * hourlyCost;

  // 4. Working capital improvement
  // (Revenue / 365) x days improvement x cost of capital
  const capitalSaving =
    annualRevenue > 0
      ? (annualRevenue / 365) *
        safe(a.workingCapitalDaysImprovement) *
        pct(a.costOfCapitalPct)
      : 0;

  // 5. Avoided rebuild cost (annualised)
  const rebuildSaving = safe(a.annualisedRebuildCostAvoidedUsd);

  const lineItems: LineItem[] = [
    {
      key: "compliance",
      label: "Compliance programme efficiency",
      value: complianceSaving,
    },
    {
      key: "supplier",
      label: "Supplier data collection efficiency",
      value: supplierSaving,
    },
    {
      key: "audit",
      label: "Audit & recall readiness efficiency",
      value: auditSaving,
    },
    {
      key: "capital",
      label: "Working capital improvement",
      value: capitalSaving,
    },
    {
      key: "rebuild",
      label: "Avoided rebuild / reimplementation cost",
      value: rebuildSaving,
    },
  ];

  const totalAnnualBenefit =
    complianceSaving +
    supplierSaving +
    auditSaving +
    capitalSaving +
    rebuildSaving;

  return {
    totalAnnualBenefit,
    lineItems,
    debug: {
      annualRevenue,
      complianceSaving,
      supplierSaving,
      auditSaving,
      capitalSaving,
      rebuildSaving,
    },
  };
}
