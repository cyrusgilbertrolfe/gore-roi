"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/app/components/SiteHeader";
import AssumptionsPanel from "@/app/components/AssumptionsPanel";
import RoiSummary from "@/app/components/RoiSummary";
import Field from "@/app/components/Field";
import { useBrand } from "@/app/brand/BrandProvider";
import {
  calcRegistrationWarrantyReturnsRoi,
  type RegistrationWarrantyReturnsAssumptions,
} from "@/app/lib/roi/usecases/registrationWarrantyReturns";

const DEFAULTS: RegistrationWarrantyReturnsAssumptions = {
  registrationRatePct: 35,
  includeOwnChannelPct: 100,
  includeAwayChannelPct: 80,
  repeatPurchaseUpliftPct: 0.5,
  grossMarginPct: 55,
  falseReturnReductionPct: 0.8,
  cacValuePctOfAvgPrice: 25,
  opsSavingPerReturn: 0,
};

const MODELLED =
  "Three sources of value. (1) Customer capture from third-party sales — registered away-channel buyers become known, contactable customers, valued at a CAC proxy on each newly-known customer. (2) Repeat purchase uplift on the registered population, valued at gross margin. (3) Prevention of false returns by verifying every return against a real purchase record at the desk before refund.";

const NOT_INCLUDED = [
  "Brand-equity uplift from a more visible warranty programme.",
  "Lifetime value extension from being able to reach registered owners for sustainability and circularity programmes (Worn Wear, Close The Loop).",
  "Wholesale partner co-marketing benefit from registration data.",
];

export default function Page() {
  const { brand } = useBrand();
  const [a, setA] =
    useState<RegistrationWarrantyReturnsAssumptions>(DEFAULTS);

  const roi = useMemo(
    () => calcRegistrationWarrantyReturnsRoi(brand, a),
    [brand, a]
  );

  const inputs = [
    {
      label: "Registration rate",
      display: `${a.registrationRatePct}%`,
      source:
        "Industry benchmark — Patagonia / Arc'teryx programmes. Gore to validate against own programme data.",
    },
    {
      label: "Own-channel registration eligibility",
      display: `${a.includeOwnChannelPct}%`,
      source: "All own-channel buyers reachable at receipt or order confirmation.",
    },
    {
      label: "Away-channel registration eligibility",
      display: `${a.includeAwayChannelPct}%`,
      source: "Wholesale buyers reachable via the QR on the product itself.",
    },
    {
      label: "Repeat purchase uplift",
      display: `${a.repeatPurchaseUpliftPct}%`,
      source: "Industry benchmark — to confirm with Gore CRM data.",
    },
    {
      label: "Gross margin on repeat",
      display: `${a.grossMarginPct}%`,
      source: "Technical apparel typical.",
    },
    {
      label: "False return reduction",
      display: `${a.falseReturnReductionPct} pp`,
      source:
        "Lower than fashion's 1.5pp — outdoor return fraud concentrates in counterfeit warranty claims (Anti-Counterfeit use case).",
    },
    {
      label: "CAC value as % of avg item price",
      display: `${a.cacValuePctOfAvgPrice}%`,
      source: "Outdoor customer LTV is high; CAC value correspondingly higher.",
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
          <span className="uppercase tracking-[0.18em] text-warm">UC 1</span>
        </div>

        <h1 className="mt-4 text-4xl font-medium tracking-tight text-ink">
          Registration, Warranty &amp; Returns
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-mute">
          One scan registers the product and opens a direct channel. Warranty is
          the brand promise — registration converts that promise into a
          customer relationship.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-6">
            <h2 className="text-xs uppercase tracking-[0.18em] text-warm">
              Assumptions
            </h2>
            <Field
              label="Registration rate"
              hint="% of customers who register their product."
              value={a.registrationRatePct}
              suffix="%"
              onChange={(v) => setA({ ...a, registrationRatePct: v })}
            />
            <Field
              label="Own-channel eligibility"
              value={a.includeOwnChannelPct}
              suffix="%"
              onChange={(v) => setA({ ...a, includeOwnChannelPct: v })}
            />
            <Field
              label="Away-channel eligibility"
              hint="Wholesale buyers we can reach via the product."
              value={a.includeAwayChannelPct}
              suffix="%"
              onChange={(v) => setA({ ...a, includeAwayChannelPct: v })}
            />
            <Field
              label="Repeat purchase uplift"
              hint="Modest uplift on the registered population."
              value={a.repeatPurchaseUpliftPct}
              suffix="%"
              onChange={(v) => setA({ ...a, repeatPurchaseUpliftPct: v })}
            />
            <Field
              label="Gross margin"
              value={a.grossMarginPct}
              suffix="%"
              onChange={(v) => setA({ ...a, grossMarginPct: v })}
            />
            <Field
              label="False return reduction"
              hint="Absolute, in percentage points."
              value={a.falseReturnReductionPct}
              suffix="pp"
              onChange={(v) => setA({ ...a, falseReturnReductionPct: v })}
            />
            <Field
              label="CAC value as % of avg item price"
              value={a.cacValuePctOfAvgPrice}
              suffix="%"
              onChange={(v) => setA({ ...a, cacValuePctOfAvgPrice: v })}
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
          modelled={MODELLED}
          notIncluded={NOT_INCLUDED}
          lastReviewed="May 2026 — pending validation with Gore product team"
        />
      </main>
    </>
  );
}
