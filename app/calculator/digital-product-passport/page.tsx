"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/app/components/SiteHeader";
import AssumptionsPanel from "@/app/components/AssumptionsPanel";
import RoiSummary from "@/app/components/RoiSummary";
import Field from "@/app/components/Field";
import { useBrand } from "@/app/brand/BrandProvider";
import {
  calcDigitalProductPassportRoi,
  type DigitalProductPassportAssumptions,
} from "@/app/lib/roi/usecases/digitalProductPassport";

// Defaults are outdoor-tuned (June 2026). Technical outdoor product carries a
// richer material story than general apparel — membranes, insulation, DWR
// chemistry, recycled content — so the DPP data burden, and the saving from
// building the spine once, runs higher than a fast-fashion baseline.
const DEFAULTS: DigitalProductPassportAssumptions = {
  complianceHoursSavedPerYear: 600,
  fullyLoadedHourlyCost: 90,

  suppliersInScope: 250,
  hoursSavedPerSupplierPerYear: 3,

  annualisedRebuildCostAvoidedUsd: 300_000,

  auditHoursSavedPerYear: 200,

  workingCapitalDaysImprovement: 1,
  costOfCapitalPct: 8,
};

const MODELLED =
  "Five benefit levers, all on the saving side — programme cost is excluded. Compliance programme efficiency values the time saved assembling regulatory evidence from a central Smart Label data platform rather than rebuilding it by hand for each regulation. Supplier data collection values the reduced follow-up effort when suppliers contribute to one shared system rather than answering ad hoc requests. Audit readiness values the time saved responding to audits, recalls, and data requests when traceability data is structured and queryable. Working capital models the cost-of-capital saving from reducing inventory days through better production documentation, taken as (annual revenue / 365) x days improved x cost of capital. Avoided rebuild captures the annualised cost of not re-engineering bespoke integrations every time a regulation changes. The case is not the mandate — it is not building the same thing twice.";

const NOT_INCLUDED = [
  "Programme implementation cost. This models the benefit side only; the build and licence cost is a separate line.",
  "Penalties and market-access loss from missing a DPP deadline. Real and additive, but not modelled numerically.",
  "Consumer-facing value of the passport itself (provenance, repair, resale). Captured in the Smart Label Experience and Resale use cases.",
  "Gore-side DPP-as-a-service for Gore-Tex licensees — membrane provenance and materials claims delivered on the same infrastructure. A parallel Gore-side calculation.",
];

export default function Page() {
  const { brand } = useBrand();
  const [a, setA] = useState<DigitalProductPassportAssumptions>(DEFAULTS);
  const roi = useMemo(() => calcDigitalProductPassportRoi(brand, a), [brand, a]);

  const inputs = [
    {
      label: "Compliance hours saved / year",
      display: `${a.complianceHoursSavedPerYear.toLocaleString("en-US")} hrs`,
      source:
        "Outdoor-tuned estimate, Kezzler June 2026. Technical product carries more declarable attributes (membrane, insulation, DWR, recycled content) than general apparel.",
    },
    {
      label: "Fully loaded hourly cost",
      display: `$${a.fullyLoadedHourlyCost}/hr`,
      source: "Sustainability / compliance specialist, loaded. Editable per brand.",
    },
    {
      label: "Suppliers in scope",
      display: a.suppliersInScope.toLocaleString("en-US"),
      source:
        "Outdoor supply chains run deep — mills, membrane and insulation processors, down suppliers, hardware and trims. Editable per brand.",
    },
    {
      label: "Hours saved per supplier / year",
      display: `${a.hoursSavedPerSupplierPerYear} hrs`,
      source:
        "Follow-ups, exceptions, and reconciliation avoided when suppliers feed one shared system. Outdoor-tuned, Kezzler June 2026.",
    },
    {
      label: "Audit hours saved / year",
      display: `${a.auditHoursSavedPerYear.toLocaleString("en-US")} hrs`,
      source: "Time reduced responding to audits, recalls, and data requests.",
    },
    {
      label: "Working capital days improvement",
      display: `${a.workingCapitalDaysImprovement} day`,
      source:
        "Inventory days reduced through better production documentation. One day is material on a large balance sheet and credible to a CFO.",
    },
    {
      label: "Cost of capital",
      display: `${a.costOfCapitalPct}%`,
      source: "Applied to the working-capital release. Editable per brand.",
    },
    {
      label: "Annualised rebuild cost avoided",
      display: `$${a.annualisedRebuildCostAvoidedUsd.toLocaleString("en-US")}`,
      source:
        "Custom scripts, point integrations, and repeated remapping not rebuilt as rules change.",
    },
    {
      label: "Annual revenue (Brand Profile)",
      display: `$${(brand.annualRevenue / 1_000_000).toFixed(0)}M`,
      source: "From the Brand Profile. Drives the working-capital lever only.",
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
          <span className="uppercase tracking-[0.18em] text-warm">UC 10</span>
        </div>

        <h1 className="mt-4 text-4xl font-medium tracking-tight text-ink">
          Digital Product Passport
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-mute">
          The EU&apos;s Digital Product Passport mandate under ESPR reaches
          textiles — and technical outdoor product sits squarely in scope. The
          brands building the DPP data spine now are doing more than staying
          compliant: a Smart Label platform becomes a shared data asset that
          cuts supplier data-collection cost, compresses audit preparation, and
          pays back before the first deadline. The case is not the mandate. It
          is not building it twice.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-10">
            {/* Compliance programme */}
            <div className="space-y-6">
              <h2 className="text-xs uppercase tracking-[0.18em] text-warm">
                Compliance programme
              </h2>
              <Field
                label="Compliance hours saved / year"
                hint="Time saved assembling data for regulatory submissions — fewer one-off mappings and less manual evidence preparation each time a regulation comes into scope."
                value={a.complianceHoursSavedPerYear}
                suffix="hrs"
                onChange={(v) => setA({ ...a, complianceHoursSavedPerYear: v })}
              />
              <Field
                label="Fully loaded hourly cost"
                value={a.fullyLoadedHourlyCost}
                suffix="$/hr"
                onChange={(v) => setA({ ...a, fullyLoadedHourlyCost: v })}
              />
            </div>

            {/* Supplier data collection */}
            <div className="space-y-6 border-t border-line pt-8">
              <h2 className="text-xs uppercase tracking-[0.18em] text-warm">
                Supplier data collection
              </h2>
              <Field
                label="Suppliers in scope"
                hint="Mills, membrane and insulation processors, assemblers, logistics partners, hardware and trims."
                value={a.suppliersInScope}
                onChange={(v) => setA({ ...a, suppliersInScope: v })}
              />
              <Field
                label="Hours saved per supplier / year"
                hint="Follow-ups, exceptions, and reconciliation avoided when suppliers contribute to a structured shared system. Three hours across 250 suppliers is 750 hours reclaimed."
                value={a.hoursSavedPerSupplierPerYear}
                suffix="hrs"
                onChange={(v) =>
                  setA({ ...a, hoursSavedPerSupplierPerYear: v })
                }
              />
            </div>

            {/* Audit readiness */}
            <div className="space-y-6 border-t border-line pt-8">
              <h2 className="text-xs uppercase tracking-[0.18em] text-warm">
                Audit readiness
              </h2>
              <Field
                label="Audit hours saved / year"
                hint="Time reduced to respond to audits, recalls, disputes, and data requests."
                value={a.auditHoursSavedPerYear}
                suffix="hrs"
                onChange={(v) => setA({ ...a, auditHoursSavedPerYear: v })}
              />
            </div>

            {/* Working capital */}
            <div className="space-y-6 border-t border-line pt-8">
              <h2 className="text-xs uppercase tracking-[0.18em] text-warm">
                Working capital
              </h2>
              <Field
                label="Working capital days improvement"
                hint="Days of inventory reduced through better production documentation and fewer reconciliation delays at goods receipt. Even one day is material on a large balance sheet."
                value={a.workingCapitalDaysImprovement}
                suffix="days"
                onChange={(v) =>
                  setA({ ...a, workingCapitalDaysImprovement: v })
                }
              />
              <Field
                label="Cost of capital"
                value={a.costOfCapitalPct}
                suffix="%"
                onChange={(v) => setA({ ...a, costOfCapitalPct: v })}
              />
            </div>

            {/* Avoided rework */}
            <div className="space-y-6 border-t border-line pt-8">
              <h2 className="text-xs uppercase tracking-[0.18em] text-warm">
                Avoided rework & rebuilds
              </h2>
              <Field
                label="Annualised rebuild cost avoided"
                hint="Avoided rework: custom scripts, point integrations, repeated remapping as rules change."
                value={a.annualisedRebuildCostAvoidedUsd}
                suffix="$"
                onChange={(v) =>
                  setA({ ...a, annualisedRebuildCostAvoidedUsd: v })
                }
              />
            </div>
          </div>

          <div className="lg:sticky lg:top-6 lg:self-start">
            <RoiSummary
              total={roi.totalAnnualBenefit}
              lineItems={roi.lineItems}
              currency={brand.reportingCurrency}
            />
            <p className="mt-3 px-1 text-xs text-subtle">
              Uses one Brand Profile input: annual revenue, for the
              working-capital lever.
            </p>
          </div>
        </div>

        <AssumptionsPanel
          inputs={inputs}
          modelled={MODELLED}
          notIncluded={NOT_INCLUDED}
          lastReviewed="June 2026, outdoor-tuned. Values to be validated with the Gore team."
        />
      </main>
    </>
  );
}
