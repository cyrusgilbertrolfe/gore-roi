import type { BrandProfile } from "@/app/brand/brandTypes";

type LineItem = { key: string; label: string; value: number };

/**
 * Supply Chain Impact — model authored by Ralf McCulkey, Gore (May 2026).
 *
 * Five sources of value flowing from Smart Label production visibility:
 *   1. Avoided customer penalties / late-delivery discounts (new — Ralf)
 *   2. Incremental gross margin from immediate-business conversion (new — Ralf)
 *   3. Airfreight savings on avoided late deliveries
 *   4. Reduced PO tracing workload
 *   5. Prevented overpayment — invoiced only for Smart Labels commissioned
 *      (carried over from previous Manufacturing Visibility model; the
 *      Ralph Lauren payback mechanism. Kept as a 5th lever per
 *      decision 2026-05-22.)
 *
 * All inputs are editable in the use case. None are derived from the
 * Brand Profile. Defaults are Ralf's base scenario unless noted as
 * carry-overs from the previous outdoor-tuned UC8.
 */
export type SupplyChainImpactAssumptions = {
  // ----- Brand baseline (use-case state, Ralf's defaults) -----
  annualGoodsPurchasedUsd: number;
  b2bSharePct: number;
  b2bProductMarginPct: number;
  d2cMarkupVsB2b: number;
  vatPct: number;

  // ----- Smart Label effectiveness (use-case state, Ralf's defaults) -----
  currentVendorOtdPct: number;
  addressableShareOfLatePct: number;
  effectivenessOnAddressablePct: number;
  /** Pass-through factor from vendor OTD to customer OTD.
   *  UI exposes quick-pick chips: 40 (conservative) / 60 (base) / 75 (upside). */
  passThroughPct: number;

  // ----- Customer-facing impact (use-case state, Ralf's defaults) -----
  immediateBusinessSharePct: number;
  penaltyContributionRatePct: number;
  conversionToIncrementalSalesPct: number;

  // ----- Operational levers (direct annual figures, Ralf's base outputs) -----
  airfreightSavingsUsd: number;
  poTracingSavingsUsd: number;

  // ----- Invoicing accuracy (5th lever, carried over) -----
  orderShortfallRatePct: number;
};

function safe(n: unknown): number {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

function pct(v: number): number {
  return safe(v) / 100;
}

export function calcSupplyChainImpactRoi(
  _brand: BrandProfile,
  a: SupplyChainImpactAssumptions
) {
  // ---- Derive D2C net markup (Ralf: 2.1 / 1.19 = 1.76) ----
  const d2cNetMarkup = safe(a.d2cMarkupVsB2b) / (1 + pct(a.vatPct));

  // ---- Net revenue, by channel ----
  const goods = safe(a.annualGoodsPurchasedUsd);
  const b2bShare = pct(a.b2bSharePct);
  const d2cShare = Math.max(0, 1 - b2bShare);
  const b2bGoods = goods * b2bShare;
  const d2cGoods = goods * d2cShare;

  const b2bMargin = pct(a.b2bProductMarginPct);
  // Revenue from B2B goods: goods / (1 - margin)
  const b2bNetRevenue = b2bMargin < 1 ? b2bGoods / (1 - b2bMargin) : 0;
  // D2C revenue: B2B-equivalent price × D2C net markup
  const d2cBaselineAtB2bPrice = b2bMargin < 1 ? d2cGoods / (1 - b2bMargin) : 0;
  const d2cNetRevenue = d2cBaselineAtB2bPrice * d2cNetMarkup;
  const totalNetRevenue = b2bNetRevenue + d2cNetRevenue;

  // ---- Blended product margin ----
  // (totalNetRevenue - goods) / totalNetRevenue
  const blendedMargin =
    totalNetRevenue > 0 ? (totalNetRevenue - goods) / totalNetRevenue : 0;

  // ---- Vendor OTD improvement → customer OTD improvement ----
  const lateRate = Math.max(0, 1 - pct(a.currentVendorOtdPct));
  const vendorOtdImprovementDecimal =
    lateRate * pct(a.addressableShareOfLatePct) * pct(a.effectivenessOnAddressablePct);
  const customerOtdImprovementDecimal =
    vendorOtdImprovementDecimal * pct(a.passThroughPct);

  // ---- Customer-facing exposure improved ----
  const immediateBusinessRevenue =
    totalNetRevenue * pct(a.immediateBusinessSharePct);
  const revenueExposureImproved =
    immediateBusinessRevenue * customerOtdImprovementDecimal;

  // ---- Lever 1: Avoided customer penalties / late-delivery discounts ----
  const avoidedPenalties =
    revenueExposureImproved * pct(a.penaltyContributionRatePct);

  // ---- Lever 2: Incremental gross margin from immediate-business conversion ----
  const incrementalNetSales =
    revenueExposureImproved * pct(a.conversionToIncrementalSalesPct);
  const incrementalGrossMargin = incrementalNetSales * blendedMargin;

  // ---- Lever 3: Airfreight savings (direct input, Ralf base $101K) ----
  const airfreightSavings = safe(a.airfreightSavingsUsd);

  // ---- Lever 4: Reduced PO tracing workload (direct input, Ralf base $55K) ----
  const poTracingSavings = safe(a.poTracingSavingsUsd);

  // ---- Lever 5: Prevented overpayment (invoicing accuracy, carried over) ----
  const invoicingAccuracySaving = goods * pct(a.orderShortfallRatePct);

  const lineItems: LineItem[] = [
    {
      key: "penalties",
      label: "Avoided customer penalties / late-delivery discounts",
      value: avoidedPenalties,
    },
    {
      key: "incremental-margin",
      label: "Incremental gross margin from immediate-business conversion",
      value: incrementalGrossMargin,
    },
    {
      key: "airfreight",
      label: "Airfreight savings on avoided late deliveries",
      value: airfreightSavings,
    },
    {
      key: "po-tracing",
      label: "Reduced PO tracing workload",
      value: poTracingSavings,
    },
    {
      key: "invoicing-accuracy",
      label:
        "Prevented overpayment, invoiced only for Smart Labels commissioned",
      value: invoicingAccuracySaving,
    },
  ];

  const totalAnnualBenefit = lineItems.reduce((s, x) => s + x.value, 0);

  return {
    totalAnnualBenefit,
    lineItems,
    // Computed intermediates exposed for the assumptions panel display.
    debug: {
      b2bNetRevenue,
      d2cNetRevenue,
      totalNetRevenue,
      blendedMargin,
      d2cNetMarkup,
      vendorOtdImprovementDecimal,
      customerOtdImprovementDecimal,
      immediateBusinessRevenue,
      revenueExposureImproved,
    },
  };
}
