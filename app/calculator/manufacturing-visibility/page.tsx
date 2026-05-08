"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/app/components/SiteHeader";
import AssumptionsPanel from "@/app/components/AssumptionsPanel";
import RoiSummary from "@/app/components/RoiSummary";
import Field from "@/app/components/Field";
import { useBrand } from "@/app/brand/BrandProvider";
import {
  calcManufacturingVisibilityRoi,
  type ManufacturingVisibilityAssumptions,
} from "@/app/lib/roi/usecases/manufacturingVisibility";

const DEFAULTS: ManufacturingVisibilityAssumptions = {
  // Outdoor-tuned: longer planning horizons mean fewer late shipments than fashion.
  lateShipmentRatePct: 3,
  airFreightPremiumPct: 14,
  // Outdoor COGS share is higher than fashion — better materials, more skilled labour.
  cogsPct: 50,
  opsHoursSavedPerPO: 2,
  fullyLoadedHourlyCost: 45,
  // Outdoor PO sizes run smaller — more SKU + colourway complexity than fast fashion.
  avgUnitsPerPO: 5_000,
  orderShortfallRatePct: 2,
};

const MODELED =
  "Three sources of value, all flowing from a single shared source of truth: the factory commissions a Digital ID at the point of production for every garment, and the brand sees that data live. (1) Early delay detection — visibility catches lateness days or weeks earlier, leaving time to re-route by sea instead of airlifting. Saving = late units × unit COGS × air-freight premium. (2) Production visibility — a shared dashboard replaces weekly status calls and chasing emails. Saving = production orders × hours saved per PO × loaded hourly cost. (3) Invoicing accuracy — the brand pays for the Digital IDs actually commissioned, not the units ordered. On a chronic 2% shortfall, this is material and ongoing — the primary payback mechanism in the Ralph Lauren Digital ID deployment.";

const NOT_INCLUDED = [
  "Gore-direct savings on factory audit costs from continuous Digital ID data replacing point-in-time inspections.",
  "Counterfeit Gore-Tex membrane detection — fake membrane currently enters the legitimate supply chain via factory third-shift / diversion. A Gore-orchestrated programme makes this newly detectable. Worth a dedicated Gore-side calculation.",
  "EU Digital Product Passport compliance margin — the same infrastructure that delivers Manufacturing Visibility delivers DPP readiness, which arrives as a regulatory requirement in 2027–28.",
  "Supplier financing improvements from verifiable production data (factories with credible delivery records access better trade-finance terms).",
];

export default function Page() {
  const { brand } = useBrand();
  const [a, setA] = useState<ManufacturingVisibilityAssumptions>(DEFAULTS);

  const roi = useMemo(
    () => calcManufacturingVisibilityRoi(brand, a),
    [brand, a]
  );

  const inputs = [
    {
      label: "Late shipment rate",
      display: `${a.lateShipmentRatePct}%`,
      source:
        "Lower than fashion's 4–5%. Outdoor brands plan further ahead; campaign launches still create the same airfreight pressure when delays do happen.",
    },
    {
      label: "Air freight premium",
      display: `${a.airFreightPremiumPct}%`,
      source:
        "Slightly higher than fashion default — outdoor SKUs are heavier (down, hardshells) so airfreight uplift is more painful per unit.",
    },
    {
      label: "COGS as % of revenue",
      display: `${a.cogsPct}%`,
      source:
        "Outdoor runs ~50% COGS — better materials, more skilled labour. Fashion sits closer to 35–40%.",
    },
    {
      label: "Hours saved per production order",
      display: `${a.opsHoursSavedPerPO} hrs`,
      source:
        "Eliminates weekly status calls and dispute resolution. Conservative.",
    },
    {
      label: "Fully loaded hourly cost",
      display: `$${a.fullyLoadedHourlyCost}`,
      source: "Production-side ops typical.",
    },
    {
      label: "Average units per production order",
      display: a.avgUnitsPerPO.toLocaleString("en-US"),
      source:
        "Outdoor PO sizes run smaller than fashion (more SKU + colourway complexity).",
    },
    {
      label: "Order shortfall rate",
      display: `${a.orderShortfallRatePct}%`,
      source:
        "Universal pattern in apparel — Ralph Lauren deployment validated 2% as the conservative real-world benchmark. Same dynamic applies to outdoor.",
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
          Manufacturing Visibility
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-mute">
          Serialised commissioning at the factory gives both sides a shared
          source of truth. Live production progress in a dashboard, not a weekly
          email. Disputes resolve before they happen.
        </p>

        {/* Strategic context — Gore-specific framing */}
        <section className="mt-10 rounded-md border border-warm/30 bg-warm/5 p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.18em] text-warm">
            Where Gore is different
          </p>
          <p className="mt-3 text-base leading-relaxed text-ink">
            Most Manufacturing Visibility programmes are brand-led. Gore&apos;s
            position is structurally different.
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-mute">
            <li>
              <span className="text-ink">Two-tier authority.</span> A brand
              request is preferred; a Gore mandate for Gore-Tex licensees is
              required. Adoption rates and timelines move accordingly.
            </li>
            <li>
              <span className="text-ink">Membrane-to-garment provenance.</span>{" "}
              Today, Gore knows which factory took which membrane batch; the
              brand knows which factory sent which garments. The two records
              aren&apos;t joined at item level. A Gore-orchestrated programme
              closes that gap — and unlocks membrane-level recalls,
              materials-level sustainability claims backed by data, and
              counterfeit-membrane detection that is currently impossible.
            </li>
            <li>
              <span className="text-ink">Audit infrastructure already in place.</span>{" "}
              Gore already inspects licensee factories. Digital ID is a
              marginal cost on top of an existing inspection regime — and
              continuous data reduces the frequency and cost of those audits.
            </li>
          </ul>
          <p className="mt-4 text-xs text-subtle">
            The numbers below are the brand-side ROI — what Gore-Tex licensees
            evaluate when deciding to participate. Gore-direct value (audit
            cost reduction, counterfeit-membrane detection, DPP-as-a-service)
            is a separate calculation we should build out together.
          </p>
        </section>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-6">
            <h2 className="text-xs uppercase tracking-[0.18em] text-warm">
              Assumptions
            </h2>
            <Field
              label="Late shipment rate"
              hint="% of units discovered late enough to trigger air freight."
              value={a.lateShipmentRatePct}
              suffix="%"
              onChange={(v) => setA({ ...a, lateShipmentRatePct: v })}
            />
            <Field
              label="Air freight premium"
              hint="Incremental cost vs sea freight on the COGS value of at-risk units."
              value={a.airFreightPremiumPct}
              suffix="%"
              onChange={(v) => setA({ ...a, airFreightPremiumPct: v })}
            />
            <Field
              label="COGS"
              hint="As % of revenue. Used to estimate unit cost across all three levers."
              value={a.cogsPct}
              suffix="%"
              onChange={(v) => setA({ ...a, cogsPct: v })}
            />
            <Field
              label="Hours saved per production order"
              value={a.opsHoursSavedPerPO}
              suffix="hrs"
              onChange={(v) => setA({ ...a, opsHoursSavedPerPO: v })}
            />
            <Field
              label="Fully loaded hourly cost"
              value={a.fullyLoadedHourlyCost}
              suffix="$"
              onChange={(v) => setA({ ...a, fullyLoadedHourlyCost: v })}
            />
            <Field
              label="Average units per production order"
              hint="Total units ÷ this = production orders in scope."
              value={a.avgUnitsPerPO}
              onChange={(v) => setA({ ...a, avgUnitsPerPO: v })}
            />
            <Field
              label="Order shortfall rate"
              hint="% under-produced but historically invoiced in full. 2% is conservative."
              value={a.orderShortfallRatePct}
              suffix="%"
              onChange={(v) => setA({ ...a, orderShortfallRatePct: v })}
            />
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
          modeled={MODELED}
          notIncluded={NOT_INCLUDED}
          lastReviewed="May 2026 — pending validation with Gore product team"
        />
      </main>
    </>
  );
}
