"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/app/components/SiteHeader";
import AssumptionsPanel from "@/app/components/AssumptionsPanel";
import RoiSummary from "@/app/components/RoiSummary";
import Field from "@/app/components/Field";
import { useBrand } from "@/app/brand/BrandProvider";
import {
  calcAntiCounterfeitRoi,
  type AntiCounterfeitAssumptions,
} from "@/app/lib/roi/usecases/antiCounterfeit";

const DEFAULTS: AntiCounterfeitAssumptions = {
  counterfeitShareOfReturnsPct: 2.5,
  grossMarginPct: 55,
  warrantyClaimsPerYear: 8_000,
  warrantyFraudRatePct: 12,
  avgWarrantyCost: 200,
};

const MODELED =
  "Two sources of value. (1) Reduced fraudulent returns — counterfeit product or items never sold by the brand are flagged at the return desk before refund. Margin is protected on the prevented refund. (2) Reduced warranty fraud — counterfeit or out-of-warranty items presented as in-warranty are caught at the service counter, avoiding the replacement cost.";

const NOT_INCLUDED = [
  "Deterrent effect on counterfeiters of a public, credible authentication programme.",
  "Marketplace takedown leverage from Digital ID-backed verification.",
  "Brand equity protection from reduced counterfeit visibility on resale platforms.",
];

export default function Page() {
  const { brand } = useBrand();
  const [a, setA] = useState<AntiCounterfeitAssumptions>(DEFAULTS);

  const roi = useMemo(() => calcAntiCounterfeitRoi(brand, a), [brand, a]);

  const inputs = [
    {
      label: "Counterfeit share of returns",
      display: `${a.counterfeitShareOfReturnsPct}%`,
      source:
        "Higher than fashion's 0.5–1%. Premium outdoor is a top-three counterfeit-impacted segment. Gore to validate from own enforcement data.",
    },
    {
      label: "Gross margin",
      display: `${a.grossMarginPct}%`,
      source: "Technical apparel typical.",
    },
    {
      label: "Annual warranty claims",
      display: a.warrantyClaimsPerYear.toLocaleString("en-US"),
      source: "Brand-specific volume.",
    },
    {
      label: "Warranty fraud rate",
      display: `${a.warrantyFraudRatePct}%`,
      source:
        "Higher than fashion. Counterfeit warranty submissions are a known concentration in premium outdoor.",
    },
    {
      label: "Average warranty cost",
      display: `$${a.avgWarrantyCost}`,
      source: "Replacement + shipping + handling on a $300–$500 product.",
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
          <span className="uppercase tracking-[0.18em] text-warm">UC 4</span>
        </div>

        <h1 className="mt-4 text-4xl font-medium tracking-tight text-ink">
          Anti-Counterfeit
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-mute">
          Verify at sale, return, and warranty service. Premium outdoor is a
          top counterfeit category — fake Arc&apos;teryx, fake Patagonia, fake
          Gore-Tex membrane is a measured multi-billion-dollar problem.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-6">
            <h2 className="text-xs uppercase tracking-[0.18em] text-warm">
              Assumptions
            </h2>
            <Field
              label="Counterfeit share of returns"
              value={a.counterfeitShareOfReturnsPct}
              suffix="%"
              onChange={(v) =>
                setA({ ...a, counterfeitShareOfReturnsPct: v })
              }
            />
            <Field
              label="Gross margin"
              value={a.grossMarginPct}
              suffix="%"
              onChange={(v) => setA({ ...a, grossMarginPct: v })}
            />
            <Field
              label="Annual warranty claims"
              value={a.warrantyClaimsPerYear}
              onChange={(v) => setA({ ...a, warrantyClaimsPerYear: v })}
            />
            <Field
              label="Warranty fraud rate"
              value={a.warrantyFraudRatePct}
              suffix="%"
              onChange={(v) => setA({ ...a, warrantyFraudRatePct: v })}
            />
            <Field
              label="Average warranty cost"
              value={a.avgWarrantyCost}
              suffix="$"
              onChange={(v) => setA({ ...a, avgWarrantyCost: v })}
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
