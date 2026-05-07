"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/app/components/SiteHeader";
import AssumptionsPanel from "@/app/components/AssumptionsPanel";
import RoiSummary from "@/app/components/RoiSummary";
import Field from "@/app/components/Field";
import { useBrand } from "@/app/brand/BrandProvider";
import {
  calcDigitalIdAnalyticsRoi,
  type DigitalIdAnalyticsAssumptions,
} from "@/app/lib/roi/usecases/digitalIdAnalytics";

function defaultsForBrand(annualRevenue: number): DigitalIdAnalyticsAssumptions {
  const r = annualRevenue || 800_000_000;
  return {
    annualMarkdownRevenueUsd: Math.round(r * 0.1),
    markdownDepthPct: 30,
    buyingAccuracyImprovementPct: 8,
    grossMarginPct: 55,
    annualMarketingSpendUsd: Math.round(r * 0.07),
    roasImprovementPct: 5,
    newSkusPerSeason: 250,
    seasonsPerYear: 2,
    currentMissRatePct: 18,
    missRateReductionPct: 20,
    avgUnitsPerSku: 1_500,
    avgSellingPriceUsd: 280,
    missMarkdownDepthPct: 50,
  };
}

const MODELED =
  "Three sources of value. (1) Markdown reduction — post-purchase scan velocity is a leading indicator of product resonance no other data captures. Incorporated into demand planning, it reduces over-ordering on lines that will need markdown. (2) Marketing efficiency — knowing which products and channels drive authenticated post-purchase engagement allows precise spend allocation. (3) Range hit rate — item-level performance data (scan engagement, repair frequency, resale velocity) gives product teams a signal they have never had, reducing miss SKUs.";

const NOT_INCLUDED = [
  "Compounding strategic value of the signal over time — multi-year NPV is not the right framing for a single-year ROI.",
  "Insights into wholesale partner performance from item-level scan data.",
  "Product development process improvements — captured in the Digital Product Experience use case instead.",
];

export default function Page() {
  const { brand } = useBrand();
  const [a, setA] = useState<DigitalIdAnalyticsAssumptions>(() =>
    defaultsForBrand(brand.annualRevenue)
  );

  const roi = useMemo(() => calcDigitalIdAnalyticsRoi(brand, a), [brand, a]);

  const inputs = [
    {
      label: "Annual revenue subject to markdown",
      display: `$${a.annualMarkdownRevenueUsd.toLocaleString("en-US")}`,
      source: "~10% of brand revenue. Lower than fashion's 15–20%.",
    },
    {
      label: "Average markdown depth",
      display: `${a.markdownDepthPct}%`,
      source: "Outdoor first-mark typical.",
    },
    {
      label: "Buying accuracy improvement from scan signals",
      display: `${a.buyingAccuracyImprovementPct}%`,
      source: "Outdoor's long product life makes the signal richer than fashion. Conservative.",
    },
    {
      label: "Gross margin",
      display: `${a.grossMarginPct}%`,
      source: "Technical apparel.",
    },
    {
      label: "Annual marketing spend",
      display: `$${a.annualMarketingSpendUsd.toLocaleString("en-US")}`,
      source: "Brand-specific. Typically 6–10% of revenue.",
    },
    {
      label: "ROAS improvement",
      display: `${a.roasImprovementPct}%`,
      source: "Modest. Most valuable for high-consideration product launches.",
    },
    {
      label: "New SKUs per season",
      display: a.newSkusPerSeason.toLocaleString("en-US"),
      source: "Brand-specific.",
    },
    {
      label: "Seasons per year",
      display: `${a.seasonsPerYear}`,
      source: "Outdoor design changes slower than fashion.",
    },
    {
      label: "Current miss rate",
      display: `${a.currentMissRatePct}%`,
      source: "Lower than fashion's 25%. Outdoor design lifecycles are longer.",
    },
    {
      label: "Miss rate reduction",
      display: `${a.missRateReductionPct}%`,
      source: "Of the current miss rate. Item-level intelligence is meaningful.",
    },
    {
      label: "Average units per SKU",
      display: a.avgUnitsPerSku.toLocaleString("en-US"),
      source: "Brand-specific.",
    },
    {
      label: "Avg selling price for a miss SKU",
      display: `$${a.avgSellingPriceUsd}`,
      source: "Brand-specific.",
    },
    {
      label: "Avg markdown depth on a miss SKU",
      display: `${a.missMarkdownDepthPct}%`,
      source: "Deeper than first-mark — these are SKUs being cleared.",
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
          <span className="uppercase tracking-[0.18em] text-warm">UC 6</span>
        </div>

        <h1 className="mt-4 text-4xl font-medium tracking-tight text-ink">
          Digital ID Analytics
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-mute">
          Every scan is a signal demand forecasts don&apos;t capture. Outdoor
          gear is used for years — multi-season post-purchase data is uniquely
          rich here.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-6">
            <h2 className="text-xs uppercase tracking-[0.18em] text-warm">
              Assumptions
            </h2>
            <Field
              label="Annual markdown revenue"
              value={a.annualMarkdownRevenueUsd}
              suffix="$"
              onChange={(v) => setA({ ...a, annualMarkdownRevenueUsd: v })}
            />
            <Field
              label="Markdown depth"
              value={a.markdownDepthPct}
              suffix="%"
              onChange={(v) => setA({ ...a, markdownDepthPct: v })}
            />
            <Field
              label="Buying accuracy improvement"
              value={a.buyingAccuracyImprovementPct}
              suffix="%"
              onChange={(v) =>
                setA({ ...a, buyingAccuracyImprovementPct: v })
              }
            />
            <Field
              label="Gross margin"
              value={a.grossMarginPct}
              suffix="%"
              onChange={(v) => setA({ ...a, grossMarginPct: v })}
            />
            <Field
              label="Annual marketing spend"
              value={a.annualMarketingSpendUsd}
              suffix="$"
              onChange={(v) => setA({ ...a, annualMarketingSpendUsd: v })}
            />
            <Field
              label="ROAS improvement"
              value={a.roasImprovementPct}
              suffix="%"
              onChange={(v) => setA({ ...a, roasImprovementPct: v })}
            />
            <Field
              label="New SKUs per season"
              value={a.newSkusPerSeason}
              onChange={(v) => setA({ ...a, newSkusPerSeason: v })}
            />
            <Field
              label="Seasons per year"
              value={a.seasonsPerYear}
              onChange={(v) => setA({ ...a, seasonsPerYear: v })}
            />
            <Field
              label="Current miss rate"
              value={a.currentMissRatePct}
              suffix="%"
              onChange={(v) => setA({ ...a, currentMissRatePct: v })}
            />
            <Field
              label="Miss rate reduction"
              value={a.missRateReductionPct}
              suffix="%"
              onChange={(v) => setA({ ...a, missRateReductionPct: v })}
            />
            <Field
              label="Avg units per SKU"
              value={a.avgUnitsPerSku}
              onChange={(v) => setA({ ...a, avgUnitsPerSku: v })}
            />
            <Field
              label="Avg selling price (miss SKU)"
              value={a.avgSellingPriceUsd}
              suffix="$"
              onChange={(v) => setA({ ...a, avgSellingPriceUsd: v })}
            />
            <Field
              label="Markdown depth (miss SKU)"
              value={a.missMarkdownDepthPct}
              suffix="%"
              onChange={(v) => setA({ ...a, missMarkdownDepthPct: v })}
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
