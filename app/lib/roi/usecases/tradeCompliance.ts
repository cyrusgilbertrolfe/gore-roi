import type { BrandProfile } from "@/app/brand/brandTypes";

type LineItem = { key: string; label: string; value: number };

export type MarketRiskTier = "high" | "medium" | "low";

export type MarketDefinition = {
  key: string;
  label: string;
  flag: string;
  riskTier: MarketRiskTier;
  /** Baseline % of shipments facing holds, enhanced scrutiny, or delays under current compliance approaches */
  baselineImpoundmentPct: number;
  /** Key active or imminent regulations for this market */
  regulatoryHighlights: string;
  /** Default annual import value for a mid-sized outdoor brand */
  defaultAnnualImportValueUsd: number;
};

// Regulatory highlights are outdoor-tuned (June 2026): PFAS restrictions on
// membranes and DWR finishes, and forced-labour origin rules on cotton, down
// and wool, are the regulations that bite hardest for technical outdoor brands.
export const MARKETS: MarketDefinition[] = [
  {
    key: "us",
    label: "United States",
    flag: "🇺🇸",
    riskTier: "high",
    baselineImpoundmentPct: 18,
    regulatoryHighlights: "UFLPA (Uyghur Forced Labor Prevention Act) · State PFAS bans on apparel (CA AB-1817, Maine) · Tariff classification enforcement on technical outerwear",
    defaultAnnualImportValueUsd: 50_000_000,
  },
  {
    key: "eu",
    label: "European Union",
    flag: "🇪🇺",
    riskTier: "medium",
    baselineImpoundmentPct: 5,
    regulatoryHighlights: "ESPR / Digital Product Passport (textiles) · REACH universal PFAS restriction · CSRD · Corporate Sustainability Due Diligence Directive · AGEC (France)",
    defaultAnnualImportValueUsd: 40_000_000,
  },
  {
    key: "uk",
    label: "United Kingdom",
    flag: "🇬🇧",
    riskTier: "low",
    baselineImpoundmentPct: 3,
    regulatoryHighlights: "Modern Slavery Act · Extended Producer Responsibility · UK REACH (chemicals & PFAS)",
    defaultAnnualImportValueUsd: 20_000_000,
  },
  {
    key: "cn",
    label: "China",
    flag: "🇨🇳",
    riskTier: "medium",
    baselineImpoundmentPct: 8,
    regulatoryHighlights: "Customs documentation requirements · Recycling & circularity regulations · Labelling requirements",
    defaultAnnualImportValueUsd: 25_000_000,
  },
  {
    key: "ca",
    label: "Canada",
    flag: "🇨🇦",
    riskTier: "medium",
    baselineImpoundmentPct: 4,
    regulatoryHighlights: "Fighting Against Forced Labour and Child Labour in Supply Chains Act (S-211) · Import controls",
    defaultAnnualImportValueUsd: 10_000_000,
  },
  {
    key: "jp",
    label: "Japan",
    flag: "🇯🇵",
    riskTier: "low",
    baselineImpoundmentPct: 2,
    regulatoryHighlights: "Supply chain transparency guidelines · Product labelling regulations",
    defaultAnnualImportValueUsd: 10_000_000,
  },
  {
    key: "au",
    label: "Australia & NZ",
    flag: "🇦🇺",
    riskTier: "low",
    baselineImpoundmentPct: 2,
    regulatoryHighlights: "Modern Slavery Act 2018 · Product safety regulations",
    defaultAnnualImportValueUsd: 8_000_000,
  },
  {
    key: "me",
    label: "Middle East",
    flag: "🇦🇪",
    riskTier: "low",
    baselineImpoundmentPct: 4,
    regulatoryHighlights: "Customs documentation requirements · Origin labelling",
    defaultAnnualImportValueUsd: 7_000_000,
  },
  {
    key: "row",
    label: "Rest of World",
    flag: "🌍",
    riskTier: "low",
    baselineImpoundmentPct: 3,
    regulatoryHighlights: "Various national import, labelling, and sustainability requirements",
    defaultAnnualImportValueUsd: 10_000_000,
  },
];

export type TradeComplianceAssumptions = {
  /** Computed from active markets: value-weighted average baseline impoundment rate */
  weightedImpoundmentRatePct: number;
  /** Total annual import value across all active markets */
  totalImportValueUsd: number;

  /** Cost of a compliance hold as % of impounded shipment value:
   *  demurrage, storage, legal fees, customs bond, potential re-routing or destruction */
  impoundmentCostSharePct: number;
  /** % reduction in impoundment/hold rate from Smart Label traceability */
  impoundmentReductionPct: number;

  /** Annual number of shipment legs requiring compliance documentation */
  annualShipmentCount: number;
  /** Hours spent per shipment assembling compliance docs today */
  docHoursPerShipmentBefore: number;
  /** Hours per shipment with structured EPCIS event data and DPP attributes */
  docHoursPerShipmentAfter: number;
  /** Fully loaded hourly cost for customs / trade compliance staff */
  fullyLoadedHourlyCost: number;

  /** Average effective duty rate across active markets */
  avgEffectiveDutyRatePct: number;
  /** % improvement in duty outcome from better classification and FTA utilisation */
  dutyOptimisationPct: number;
};

function safe(n: unknown) {
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
}

function pct(v: number) {
  return safe(v) / 100;
}

export function computeWeightedImpoundmentRate(
  activeMarkets: { key: string; annualImportValueUsd: number }[]
): number {
  const totalValue = activeMarkets.reduce(
    (s, m) => s + safe(m.annualImportValueUsd),
    0
  );
  if (totalValue === 0) return 0;

  return activeMarkets.reduce((weighted, m) => {
    const def = MARKETS.find((d) => d.key === m.key);
    if (!def) return weighted;
    return (
      weighted +
      (safe(m.annualImportValueUsd) / totalValue) * def.baselineImpoundmentPct
    );
  }, 0);
}

export function calcTradeComplianceRoi(
  _brand: BrandProfile,
  a: TradeComplianceAssumptions
) {
  const totalImportValue = safe(a.totalImportValueUsd);
  const weightedImpoundmentRate = pct(a.weightedImpoundmentRatePct);

  // --- Lever 1: Impoundment & compliance hold cost reduction ---
  // Value of shipments subject to holds; costs modelled as a share of that value
  const impoundedValue = totalImportValue * weightedImpoundmentRate;
  const impoundmentCostBase = impoundedValue * pct(a.impoundmentCostSharePct);
  const impoundmentSaving = impoundmentCostBase * pct(a.impoundmentReductionPct);

  // --- Lever 2: Documentation overhead ---
  const hoursSavedPerShipment = Math.max(
    safe(a.docHoursPerShipmentBefore) - safe(a.docHoursPerShipmentAfter),
    0
  );
  const documentationSaving =
    safe(a.annualShipmentCount) *
    hoursSavedPerShipment *
    safe(a.fullyLoadedHourlyCost);

  // --- Lever 3: Duty & tariff optimisation ---
  const dutySaving =
    totalImportValue *
    pct(a.avgEffectiveDutyRatePct) *
    pct(a.dutyOptimisationPct);

  const lineItems: LineItem[] = [
    {
      key: "impoundment",
      label: "Reduced compliance holds, delays & impoundment costs",
      value: impoundmentSaving,
    },
    {
      key: "documentation",
      label: "Reduced customs documentation & compliance overhead",
      value: documentationSaving,
    },
    {
      key: "duty",
      label: "Duty & tariff optimisation from accurate classification",
      value: dutySaving,
    },
  ];

  const totalAnnualBenefit = lineItems.reduce((s, x) => s + x.value, 0);

  return {
    totalAnnualBenefit,
    lineItems,
    debug: {
      totalImportValue,
      weightedImpoundmentRatePct: a.weightedImpoundmentRatePct,
      impoundedValue,
      impoundmentCostBase,
      impoundmentSaving,
      documentationSaving,
      dutySaving,
    },
  };
}
