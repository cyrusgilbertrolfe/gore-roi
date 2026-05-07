"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/app/components/SiteHeader";
import AssumptionsPanel from "@/app/components/AssumptionsPanel";
import RoiSummary from "@/app/components/RoiSummary";
import Field from "@/app/components/Field";
import { useBrand } from "@/app/brand/BrandProvider";
import {
  calcInStoreTrainingRoi,
  type InStoreTrainingAssumptions,
} from "@/app/lib/roi/usecases/inStoreTraining";

const DEFAULTS: InStoreTrainingAssumptions = {
  adoptionRatePct: 70,
  minutesSavedPerStaffPerWeek: 40,
  fullyLoadedHourlyCost: 32,
  conversionUpliftPct: 0.4,
  grossMarginPct: 55,
  baselineAttritionRatePct: 65,
  improvedAttritionRatePct: 60,
  avgCostPerHire: 2_500,
  returnsReductionPctPoints: 0.5,
  pctResellableFullPrice: 60,
  avgMarkdownOtherReturnsPct: 30,
};

const MODELED =
  "Four sources of value. (1) Labour time saving — staff time spent hunting documentation is eliminated by instant scan-to-info access. (2) Conversion uplift — better-informed associates close more sales, valued at gross margin. (3) Staff retention — confident, well-supported staff stay longer; saving is the avoided cost-per-hire on the attrition delta. (4) Returns reduction — better-informed point-of-sale conversations reduce returns; saving is the markdown loss on returns that would otherwise occur.";

const NOT_INCLUDED = [
  "Customer satisfaction and loyalty effects from better-informed conversations.",
  "Cross-sell and upsell from system selling (jacket + shell + midlayer).",
  "Wholesale account training (REI Outdoor School, dealer staff) — adjacent opportunity, out of scope for v1.",
];

export default function Page() {
  const { brand } = useBrand();
  const [a, setA] = useState<InStoreTrainingAssumptions>(DEFAULTS);

  const roi = useMemo(() => calcInStoreTrainingRoi(brand, a), [brand, a]);

  const inputs = [
    {
      label: "Adoption rate (own stores)",
      display: `${a.adoptionRatePct}%`,
      source: "Outdoor specialty staff are unusually receptive to product-knowledge tools.",
    },
    {
      label: "Minutes saved per staff per week",
      display: `${a.minutesSavedPerStaffPerWeek} min`,
      source: "Typical session of 5–10 product lookups avoided.",
    },
    {
      label: "Fully loaded hourly cost",
      display: `$${a.fullyLoadedHourlyCost}`,
      source: "US/EU specialty retail typical.",
    },
    {
      label: "Conversion uplift",
      display: `${a.conversionUpliftPct}%`,
      source: "Higher than the multi-segment 0.2% default. Outdoor product complexity makes associate knowledge unusually valuable.",
    },
    {
      label: "Gross margin",
      display: `${a.grossMarginPct}%`,
      source: "Technical apparel typical.",
    },
    {
      label: "Baseline staff attrition",
      display: `${a.baselineAttritionRatePct}%`,
      source: "Specialty retail attrition is high.",
    },
    {
      label: "Improved attrition",
      display: `${a.improvedAttritionRatePct}%`,
      source: "Modest 5pp reduction. Conservative.",
    },
    {
      label: "Average cost per hire",
      display: `$${a.avgCostPerHire.toLocaleString("en-US")}`,
      source: "Recruit, onboard, train.",
    },
    {
      label: "Return rate reduction",
      display: `${a.returnsReductionPctPoints} pp`,
      source: "Better-informed buyer = lower returns. ~4% relative reduction on a 12% baseline.",
    },
    {
      label: "% of returns resellable at full price",
      display: `${a.pctResellableFullPrice}%`,
      source: "Outdoor returns are often resellable; remainder takes a markdown.",
    },
    {
      label: "Markdown on non-resellable returns",
      display: `${a.avgMarkdownOtherReturnsPct}%`,
      source: "Typical.",
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
          <span className="uppercase tracking-[0.18em] text-warm">UC 5</span>
        </div>

        <h1 className="mt-4 text-4xl font-medium tracking-tight text-ink">
          In-Store Training
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-mute">
          Every associate, product-literate from day one. Outdoor specialty
          retail is the gold standard for product-literate staff — and product
          complexity in this segment is the highest in apparel.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-6">
            <h2 className="text-xs uppercase tracking-[0.18em] text-warm">
              Assumptions
            </h2>
            <Field
              label="Adoption rate"
              hint="% of own stores actively using."
              value={a.adoptionRatePct}
              suffix="%"
              onChange={(v) => setA({ ...a, adoptionRatePct: v })}
            />
            <Field
              label="Minutes saved per staff per week"
              value={a.minutesSavedPerStaffPerWeek}
              suffix="min"
              onChange={(v) =>
                setA({ ...a, minutesSavedPerStaffPerWeek: v })
              }
            />
            <Field
              label="Fully loaded hourly cost"
              value={a.fullyLoadedHourlyCost}
              suffix="$"
              onChange={(v) => setA({ ...a, fullyLoadedHourlyCost: v })}
            />
            <Field
              label="Conversion uplift"
              value={a.conversionUpliftPct}
              suffix="%"
              onChange={(v) => setA({ ...a, conversionUpliftPct: v })}
            />
            <Field
              label="Gross margin"
              value={a.grossMarginPct}
              suffix="%"
              onChange={(v) => setA({ ...a, grossMarginPct: v })}
            />
            <Field
              label="Baseline staff attrition"
              value={a.baselineAttritionRatePct}
              suffix="%"
              onChange={(v) => setA({ ...a, baselineAttritionRatePct: v })}
            />
            <Field
              label="Improved attrition"
              value={a.improvedAttritionRatePct}
              suffix="%"
              onChange={(v) => setA({ ...a, improvedAttritionRatePct: v })}
            />
            <Field
              label="Avg cost per hire"
              value={a.avgCostPerHire}
              suffix="$"
              onChange={(v) => setA({ ...a, avgCostPerHire: v })}
            />
            <Field
              label="Return rate reduction"
              hint="Absolute, in percentage points."
              value={a.returnsReductionPctPoints}
              suffix="pp"
              onChange={(v) => setA({ ...a, returnsReductionPctPoints: v })}
            />
            <Field
              label="% of returns resellable at full price"
              value={a.pctResellableFullPrice}
              suffix="%"
              onChange={(v) => setA({ ...a, pctResellableFullPrice: v })}
            />
            <Field
              label="Markdown on non-resellable returns"
              value={a.avgMarkdownOtherReturnsPct}
              suffix="%"
              onChange={(v) => setA({ ...a, avgMarkdownOtherReturnsPct: v })}
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
