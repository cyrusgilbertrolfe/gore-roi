"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/app/components/SiteHeader";
import AssumptionsPanel from "@/app/components/AssumptionsPanel";
import RoiSummary from "@/app/components/RoiSummary";
import Field from "@/app/components/Field";
import { useBrand } from "@/app/brand/BrandProvider";
import {
  calcSupplyChainImpactRoi,
  type SupplyChainImpactAssumptions,
} from "@/app/lib/roi/usecases/manufacturingVisibility";

// All inputs editable in the use case. Defaults are Ralf McCulkey's base
// scenario (Gore, May 2026) unless flagged as carry-overs.
const DEFAULTS: SupplyChainImpactAssumptions = {
  // Brand baseline
  annualGoodsPurchasedUsd: 100_000_000,
  b2bSharePct: 75,
  b2bProductMarginPct: 50,
  d2cMarkupVsB2b: 2.1,
  vatPct: 19,

  // Smart Label effectiveness
  currentVendorOtdPct: 85,
  addressableShareOfLatePct: 50,
  effectivenessOnAddressablePct: 35,
  passThroughPct: 60,

  // Customer-facing impact
  immediateBusinessSharePct: 40,
  penaltyContributionRatePct: 3,
  conversionToIncrementalSalesPct: 15,

  // Operational levers (direct, Ralf base outputs)
  airfreightSavingsUsd: 101_000,
  poTracingSavingsUsd: 55_000,

  // Invoicing accuracy (carry-over)
  orderShortfallRatePct: 2,
};

const PASS_THROUGH_CHIPS = [
  { label: "Conservative", value: 40 },
  { label: "Base", value: 60 },
  { label: "Upside", value: 75 },
];

const MODELLED =
  "Five sources of value, modelled from Ralf McCulkey's (Gore) chain. Smart Label production visibility improves vendor on-time delivery by reducing the addressable share of late deliveries. A share of that vendor improvement passes through to customer on-time delivery. The improved customer delivery exposure unlocks two new value lines: avoided penalties and discount contributions on the improved revenue, and incremental gross margin where better delivery converts backorders into immediate-business sales. Operationally, the same visibility reduces airfreight on avoided late deliveries and eliminates PO tracing workload, both modelled as direct annual figures sized per brand. The fifth lever, retained from the previous Manufacturing Visibility model, is invoicing accuracy: the brand pays only for the Smart Labels actually commissioned, not the units ordered.";

const NOT_INCLUDED = [
  "Gore-direct savings on factory audit costs (relevant for Gore-Tex licensees only). Continuous Smart Label data replacing point-in-time inspections is a parallel Gore-side calculation.",
  "Counterfeit-membrane detection at scale (relevant for Gore-Tex licensees only). A jointly-orchestrated programme makes diversion newly detectable; worth its own Gore-side calculation.",
  "EU Digital Product Passport compliance margin. The same infrastructure delivers DPP readiness. Captured in the dedicated DPP use case.",
  "Supplier financing improvements from verifiable production data (factories with credible delivery records access better trade-finance terms).",
];

export default function Page() {
  const { brand } = useBrand();
  const [a, setA] = useState<SupplyChainImpactAssumptions>(DEFAULTS);
  const roi = useMemo(() => calcSupplyChainImpactRoi(brand, a), [brand, a]);

  // Derived intermediates for the assumptions panel display.
  const debug = roi.debug;
  const vendorOtdImprovementPp = debug.vendorOtdImprovementDecimal * 100;
  const customerOtdImprovementPp = debug.customerOtdImprovementDecimal * 100;
  const blendedMarginPct = debug.blendedMargin * 100;

  const inputs = [
    // Brand baseline
    {
      label: "Annual goods purchased",
      display: `$${(a.annualGoodsPurchasedUsd / 1_000_000).toFixed(1)}M`,
      source: "Brand-specific. Editable per brand for the session.",
    },
    {
      label: "B2B share of goods",
      display: `${a.b2bSharePct}%`,
      source:
        "Outdoor typical. Ralf McCulkey's base sits at 75% on wholesale and dealer. Editable per brand.",
    },
    {
      label: "B2B product margin",
      display: `${a.b2bProductMarginPct}%`,
      source: "Ralf McCulkey, Gore, May 2026 base.",
    },
    {
      label: "D2C markup vs B2B price",
      display: `${a.d2cMarkupVsB2b}x`,
      source: "Ralf McCulkey, Gore, May 2026 base.",
    },
    {
      label: "VAT / sales tax included in D2C markup",
      display: `${a.vatPct}%`,
      source: "Ralf McCulkey, Gore, May 2026 base (EU).",
    },
    // Smart Label effectiveness
    {
      label: "Current vendor OTD",
      display: `${a.currentVendorOtdPct}%`,
      source: "Ralf McCulkey, Gore, May 2026 base.",
    },
    {
      label: "Addressable share of late deliveries",
      display: `${a.addressableShareOfLatePct}%`,
      source:
        "Visibility, escalation and quantity-accuracy issues. Ralf McCulkey, Gore.",
    },
    {
      label: "Effectiveness on addressable delays",
      display: `${a.effectivenessOnAddressablePct}%`,
      source: "Ralf McCulkey, Gore, May 2026 base.",
    },
    {
      label: "Pass-through factor (vendor OTD to customer OTD)",
      display: `${a.passThroughPct}%`,
      source:
        "Ralf McCulkey, Gore. Three scenarios: Conservative 40, Base 60, Upside 75.",
    },
    // Customer-facing
    {
      label: "Immediate business share of total net revenue",
      display: `${a.immediateBusinessSharePct}%`,
      source: "Ralf McCulkey, Gore, May 2026 base.",
    },
    {
      label: "Penalty / discount contribution rate",
      display: `${a.penaltyContributionRatePct}%`,
      source: "Ralf McCulkey, Gore, May 2026 base.",
    },
    {
      label: "Conversion of improved exposure to incremental sales",
      display: `${a.conversionToIncrementalSalesPct}%`,
      source: "Ralf McCulkey, Gore, May 2026 base.",
    },
    // Operational
    {
      label: "Airfreight savings (annual)",
      display: `$${a.airfreightSavingsUsd.toLocaleString("en-US")}`,
      source:
        "Ralf McCulkey, Gore. Base $101K on $100M goods. Editable per brand.",
    },
    {
      label: "PO tracing workload reduction (annual)",
      display: `$${a.poTracingSavingsUsd.toLocaleString("en-US")}`,
      source:
        "Ralf McCulkey, Gore. Base $55K on $100M goods. Editable per brand.",
    },
    // Invoicing accuracy
    {
      label: "Order shortfall rate (invoicing accuracy)",
      display: `${a.orderShortfallRatePct}%`,
      source:
        "Carried over from previous Manufacturing Visibility model. 2% is the Ralph Lauren deployment benchmark.",
    },
    // Derived / informational
    {
      label: "Vendor OTD improvement (derived)",
      display: `+${vendorOtdImprovementPp.toFixed(2)} pp`,
      source: "Computed from late share, addressable share, and effectiveness.",
    },
    {
      label: "Customer OTD improvement (derived)",
      display: `+${customerOtdImprovementPp.toFixed(2)} pp`,
      source: "Vendor OTD improvement times pass-through.",
    },
    {
      label: "Blended product margin (derived)",
      display: `${blendedMarginPct.toFixed(1)}%`,
      source:
        "Weighted across B2B and D2C net revenue. Ralf McCulkey base: 58%.",
    },
  ];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <div className="flex items-center gap-4 text-xs text-subtle">
          <Link
            href="/calculator"
            className="underline-offset-4 hover:text-mute hover:underline"
          >
            ← All use cases
          </Link>
          <span aria-hidden>·</span>
          <span className="uppercase tracking-[0.18em] text-warm">UC 8</span>
        </div>

        <h1 className="mt-4 text-4xl font-medium tracking-tight text-ink">
          Supply Chain Impact
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-mute">
          Smart Label creates item-level production visibility, improving
          vendor on-time delivery. Part of that improvement passes through to
          the customer side, where it unlocks penalty avoidance and
          immediate-business conversion alongside the operational levers.
          Model authored by Ralf McCulkey, Gore.
        </p>

        {/* Additive layer for Gore-Tex licensees */}
        <section className="mt-10 rounded-md border border-warm/30 bg-warm/5 p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.18em] text-warm">
            For brands using Gore-Tex
          </p>
          <p className="mt-3 text-base leading-relaxed text-ink">
            The Supply Chain Impact model below applies to any outdoor brand.
            For brands using Gore-Tex on some product lines, three further
            capabilities become available, additive to the brand-side ROI, not
            a replacement for it.
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-mute">
            <li>
              <span className="text-ink">
                A second tier of authority over the factory.
              </span>{" "}
              Most brands already have leverage with their factories. They
              pay the bills. Gore-Tex licensees gain a second tier: licensing
              terms also depend on factory compliance. Adoption timelines
              move faster when both pressures align.
            </li>
            <li>
              <span className="text-ink">
                Membrane-to-garment provenance.
              </span>{" "}
              Today Gore knows which factory took which membrane batch. The
              brand knows which factory sent which garments. The two records
              aren&apos;t joined at item level. A jointly-orchestrated Smart
              Label programme closes that gap, unlocking membrane-level
              recalls, materials-level sustainability claims (PFAS-free,
              recycled content) backed by data, and counterfeit-membrane
              detection that is currently impossible.
            </li>
            <li>
              <span className="text-ink">
                Existing audit infrastructure on the supplier side.
              </span>{" "}
              Gore already inspects licensee factories. Smart Label is a
              marginal cost on top of an existing inspection regime, and
              continuous data reduces the frequency and cost of those audits.
            </li>
          </ul>
          <p className="mt-4 text-xs text-subtle">
            The numbers in the calculator below are the universal brand-side
            ROI, applicable to any participating brand. Gore-direct value
            (audit cost reduction, counterfeit-membrane detection,
            DPP-as-a-service) is a parallel calculation we should build
            separately, with Gore.
          </p>
        </section>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-10">
            {/* Brand baseline */}
            <div className="space-y-6">
              <h2 className="text-xs uppercase tracking-[0.18em] text-warm">
                Brand baseline
              </h2>
              <Field
                label="Annual goods purchased"
                hint="Total goods purchased annually, in USD."
                value={a.annualGoodsPurchasedUsd}
                suffix="$"
                onChange={(v) => setA({ ...a, annualGoodsPurchasedUsd: v })}
              />
              <Field
                label="B2B share of goods"
                hint="Wholesale and dealer channels. D2C is the remainder."
                value={a.b2bSharePct}
                suffix="%"
                onChange={(v) => setA({ ...a, b2bSharePct: v })}
              />
              <Field
                label="B2B product margin"
                value={a.b2bProductMarginPct}
                suffix="%"
                onChange={(v) => setA({ ...a, b2bProductMarginPct: v })}
              />
              <Field
                label="D2C markup vs B2B price"
                value={a.d2cMarkupVsB2b}
                suffix="x"
                onChange={(v) => setA({ ...a, d2cMarkupVsB2b: v })}
              />
              <Field
                label="VAT / sales tax included in D2C markup"
                value={a.vatPct}
                suffix="%"
                onChange={(v) => setA({ ...a, vatPct: v })}
              />
            </div>

            {/* Smart Label effectiveness */}
            <div className="space-y-6 border-t border-line pt-8">
              <h2 className="text-xs uppercase tracking-[0.18em] text-warm">
                Smart Label effectiveness
              </h2>
              <Field
                label="Current vendor OTD"
                hint="Baseline on-time delivery rate from vendors."
                value={a.currentVendorOtdPct}
                suffix="%"
                onChange={(v) => setA({ ...a, currentVendorOtdPct: v })}
              />
              <Field
                label="Addressable share of late deliveries"
                hint="Share of late deliveries Smart Label can influence."
                value={a.addressableShareOfLatePct}
                suffix="%"
                onChange={(v) =>
                  setA({ ...a, addressableShareOfLatePct: v })
                }
              />
              <Field
                label="Effectiveness on addressable delays"
                value={a.effectivenessOnAddressablePct}
                suffix="%"
                onChange={(v) =>
                  setA({ ...a, effectivenessOnAddressablePct: v })
                }
              />

              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <label className="text-sm text-mute">
                    Pass-through factor (vendor to customer OTD)
                  </label>
                  <div className="flex items-center gap-1.5">
                    {PASS_THROUGH_CHIPS.map((chip) => {
                      const active = a.passThroughPct === chip.value;
                      return (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() =>
                            setA({ ...a, passThroughPct: chip.value })
                          }
                          className={`rounded-md border px-2.5 py-1 text-xs transition ${
                            active
                              ? "border-warm bg-warm/10 text-ink"
                              : "border-line text-mute hover:border-line-strong hover:text-ink"
                          }`}
                        >
                          {chip.label} {chip.value}%
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-2">
                  <Field
                    label=""
                    value={a.passThroughPct}
                    suffix="%"
                    onChange={(v) => setA({ ...a, passThroughPct: v })}
                  />
                </div>
              </div>
            </div>

            {/* Customer-facing impact */}
            <div className="space-y-6 border-t border-line pt-8">
              <h2 className="text-xs uppercase tracking-[0.18em] text-warm">
                Customer-facing impact
              </h2>
              <Field
                label="Immediate business share of total net revenue"
                value={a.immediateBusinessSharePct}
                suffix="%"
                onChange={(v) =>
                  setA({ ...a, immediateBusinessSharePct: v })
                }
              />
              <Field
                label="Penalty / discount contribution rate"
                hint="Average penalty or discount cost on improved revenue exposure."
                value={a.penaltyContributionRatePct}
                suffix="%"
                onChange={(v) =>
                  setA({ ...a, penaltyContributionRatePct: v })
                }
              />
              <Field
                label="Conversion of improved exposure to incremental sales"
                value={a.conversionToIncrementalSalesPct}
                suffix="%"
                onChange={(v) =>
                  setA({ ...a, conversionToIncrementalSalesPct: v })
                }
              />
            </div>

            {/* Operational levers */}
            <div className="space-y-6 border-t border-line pt-8">
              <h2 className="text-xs uppercase tracking-[0.18em] text-warm">
                Operational levers (direct inputs)
              </h2>
              <Field
                label="Airfreight savings (annual)"
                hint="On avoided late deliveries. Editable per brand."
                value={a.airfreightSavingsUsd}
                suffix="$"
                onChange={(v) => setA({ ...a, airfreightSavingsUsd: v })}
              />
              <Field
                label="PO tracing workload reduction (annual)"
                hint="Ops time saved by shared production visibility. Editable per brand."
                value={a.poTracingSavingsUsd}
                suffix="$"
                onChange={(v) => setA({ ...a, poTracingSavingsUsd: v })}
              />
            </div>

            {/* Invoicing accuracy (5th lever) */}
            <div className="space-y-6 border-t border-line pt-8">
              <h2 className="text-xs uppercase tracking-[0.18em] text-warm">
                Invoicing accuracy
              </h2>
              <Field
                label="Order shortfall rate"
                hint="Share of ordered units historically under-produced but invoiced in full. Smart Label means the brand pays only for IDs commissioned."
                value={a.orderShortfallRatePct}
                suffix="%"
                onChange={(v) => setA({ ...a, orderShortfallRatePct: v })}
              />
            </div>
          </div>

          <div className="lg:sticky lg:top-6 lg:self-start">
            <RoiSummary
              total={roi.totalAnnualBenefit}
              lineItems={roi.lineItems}
              currency={brand.reportingCurrency}
            />
          </div>
        </div>

        <AssumptionsPanel
          inputs={inputs}
          modelled={MODELLED}
          notIncluded={NOT_INCLUDED}
          lastReviewed="May 2026, model authored by Ralf McCulkey, Gore"
        />
      </main>
    </>
  );
}
