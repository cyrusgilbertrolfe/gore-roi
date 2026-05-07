"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/app/components/SiteHeader";
import AssumptionsPanel from "@/app/components/AssumptionsPanel";
import RoiSummary from "@/app/components/RoiSummary";
import Field from "@/app/components/Field";
import { useBrand } from "@/app/brand/BrandProvider";
import {
  calcDigitalProductExperienceRoi,
  type DigitalProductExperienceAssumptions,
} from "@/app/lib/roi/usecases/digitalProductExperience";

function defaultsForBrand(
  annualRevenue: number,
  ownChannelPct: number,
  avgItemPrice: number
): DigitalProductExperienceAssumptions {
  const ownChannelRevenue = (annualRevenue || 800_000_000) * (ownChannelPct / 100 || 0.5);
  const avgOrderValue = (avgItemPrice || 320) * 1.5;
  const orders = Math.max(0, Math.round(ownChannelRevenue / avgOrderValue));
  return {
    annualOwnChannelOrders: orders || 800_000,
    scanEngagementRatePct: 40,
    repeatPurchaseUpliftPct: 8,
    avgRepeatOrderValueUsd: 280,
    grossMarginPct: 55,
    returnRateReductionPct: 6,
    returnProcessingCostUsd: 25,
    transparencyRevenueBasisPoints: 75,
  };
}

const MODELED =
  "Three sources of value. (1) Repeat purchase uplift — customers who scan and engage with the Digital ID experience show measurably higher loyalty and repeat purchase, valued at gross margin on incremental orders. (2) Return rate reduction — item-level structured feedback (this product, this size, this colourway) is more actionable for product development than aggregate reviews. (3) Transparency premium — consumers who engage with credible sourcing and material information show higher willingness-to-pay. Modeled conservatively in basis points on own-channel revenue.";

const NOT_INCLUDED = [
  "Brand-equity value of being seen as transparent and credibly sourced.",
  "New customer acquisition driven by content marketing built from engagement signals.",
  "Compliance value for the EU Digital Product Passport — separate Compliance use case in v2.",
];

export default function Page() {
  const { brand } = useBrand();
  const ownChannelPct =
    brand.channelMix.ownStoresPct + brand.channelMix.ownEcomPct;

  const [a, setA] = useState<DigitalProductExperienceAssumptions>(() =>
    defaultsForBrand(brand.annualRevenue, ownChannelPct, brand.avgItemPrice)
  );

  const roi = useMemo(
    () => calcDigitalProductExperienceRoi(brand, a),
    [brand, a]
  );

  const inputs = [
    {
      label: "Annual own-channel orders",
      display: a.annualOwnChannelOrders.toLocaleString("en-US"),
      source: "Derived from Brand Profile — own ecom + stores ÷ avg order value.",
    },
    {
      label: "Scan engagement rate",
      display: `${a.scanEngagementRatePct}%`,
      source: "High for outdoor — product-literate customer scans for content.",
    },
    {
      label: "Repeat purchase uplift",
      display: `${a.repeatPurchaseUpliftPct}%`,
      source: "Engaged outdoor customers repeat materially more.",
    },
    {
      label: "Avg repeat order value",
      display: `$${a.avgRepeatOrderValueUsd}`,
      source: "Typical outdoor follow-on purchase.",
    },
    {
      label: "Gross margin",
      display: `${a.grossMarginPct}%`,
      source: "Technical apparel typical.",
    },
    {
      label: "Return rate reduction (from feedback)",
      display: `${a.returnRateReductionPct}%`,
      source: "Item-level feedback narrows fit, sizing, and material expectation issues.",
    },
    {
      label: "Return processing cost",
      display: `$${a.returnProcessingCostUsd}`,
      source: "Fully loaded.",
    },
    {
      label: "Transparency revenue (basis points)",
      display: `${a.transparencyRevenueBasisPoints} bp`,
      source: "On own-channel revenue. Outdoor customer values transparency more than fashion buyer.",
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
          <span className="uppercase tracking-[0.18em] text-warm">UC 7</span>
        </div>

        <h1 className="mt-4 text-4xl font-medium tracking-tight text-ink">
          Digital Product Experience
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-mute">
          Provenance, transparency, and engagement, on the product itself.
          The outdoor customer is product-literate and expects depth — bluesign,
          B Corp, Fair Trade, Gore-Tex membrane data are brand-defining.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-6">
            <h2 className="text-xs uppercase tracking-[0.18em] text-warm">
              Assumptions
            </h2>
            <Field
              label="Annual own-channel orders"
              value={a.annualOwnChannelOrders}
              onChange={(v) => setA({ ...a, annualOwnChannelOrders: v })}
            />
            <Field
              label="Scan engagement rate"
              value={a.scanEngagementRatePct}
              suffix="%"
              onChange={(v) => setA({ ...a, scanEngagementRatePct: v })}
            />
            <Field
              label="Repeat purchase uplift"
              value={a.repeatPurchaseUpliftPct}
              suffix="%"
              onChange={(v) => setA({ ...a, repeatPurchaseUpliftPct: v })}
            />
            <Field
              label="Avg repeat order value"
              value={a.avgRepeatOrderValueUsd}
              suffix="$"
              onChange={(v) => setA({ ...a, avgRepeatOrderValueUsd: v })}
            />
            <Field
              label="Gross margin"
              value={a.grossMarginPct}
              suffix="%"
              onChange={(v) => setA({ ...a, grossMarginPct: v })}
            />
            <Field
              label="Return rate reduction"
              hint="From item-level feedback loops."
              value={a.returnRateReductionPct}
              suffix="%"
              onChange={(v) => setA({ ...a, returnRateReductionPct: v })}
            />
            <Field
              label="Return processing cost"
              value={a.returnProcessingCostUsd}
              suffix="$"
              onChange={(v) => setA({ ...a, returnProcessingCostUsd: v })}
            />
            <Field
              label="Transparency revenue uplift"
              hint="In basis points on own-channel revenue."
              value={a.transparencyRevenueBasisPoints}
              suffix="bp"
              onChange={(v) =>
                setA({ ...a, transparencyRevenueBasisPoints: v })
              }
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
