"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/app/components/SiteHeader";
import AssumptionsPanel from "@/app/components/AssumptionsPanel";
import RoiSummary from "@/app/components/RoiSummary";
import Field from "@/app/components/Field";
import { useBrand } from "@/app/brand/BrandProvider";
import { SECTOR_DATA } from "@/app/brand/brandTypes";
import {
  calcResaleRoi,
  type ResaleAssumptions,
} from "@/app/lib/roi/usecases/resale";

function defaultsForSector(sectorResaleValue: number): ResaleAssumptions {
  return {
    resaleParticipationRatePct: 12,
    brandCaptureRatePct: 25,
    resaleValuePct: sectorResaleValue || 60,
    endOfSeasonMarkdownPct: 18,
    avgMarkdownDepthPct: 30,
    markdownDiversionPct: 20,
    cacValuePctOfAvgPrice: 25,
  };
}

const MODELLED =
  "Three sources of value. (1) Own-channel resale revenue — items captured into the brand's own resale programme generate revenue at the resale price (a percentage of original retail). (2) Markdown avoidance — end-of-season stock that would have been discounted is instead routed to resale at a smaller discount. (3) New customer acquisition — second buyers are net-new customers at zero advertising spend.";

const NOT_INCLUDED = [
  "Brand-equity contribution of operating a credible resale programme.",
  "Carbon impact of extending product lifecycle — belongs in sustainability reporting.",
  "Peer-to-peer resale where the brand provides authentication but not the transaction.",
];

export default function Page() {
  const { brand } = useBrand();
  const sectorResaleValue =
    brand.sector && brand.sector in SECTOR_DATA
      ? SECTOR_DATA[brand.sector].resaleValuePct
      : 60;

  const [a, setA] = useState<ResaleAssumptions>(() =>
    defaultsForSector(sectorResaleValue)
  );

  const roi = useMemo(() => calcResaleRoi(brand, a), [brand, a]);

  const inputs = [
    {
      label: "Resale participation rate",
      display: `${a.resaleParticipationRatePct}%`,
      source:
        "Higher than fashion's 5–10%. Outdoor goods retain function and value across years.",
    },
    {
      label: "Brand capture rate",
      display: `${a.brandCaptureRatePct}%`,
      source:
        "Worn Wear and ReGEAR demonstrate brands can capture meaningful share when the offer is well-designed.",
    },
    {
      label: "Resale value (% of original retail)",
      display: `${a.resaleValuePct}%`,
      source: `Sector benchmark — ${
        brand.sector && brand.sector in SECTOR_DATA
          ? SECTOR_DATA[brand.sector].label
          : "outdoor"
      }.`,
    },
    {
      label: "End-of-season markdown share",
      display: `${a.endOfSeasonMarkdownPct}%`,
      source: "Lower than fashion's 25–30%. Outdoor goes to outlet, not deep clearance.",
    },
    {
      label: "Average markdown depth",
      display: `${a.avgMarkdownDepthPct}%`,
      source: "Typical first-mark on end-of-season outdoor.",
    },
    {
      label: "Markdown stock diverted to resale",
      display: `${a.markdownDiversionPct}%`,
      source: "Conservative. Some end-of-season stock is genuinely better routed to resale.",
    },
    {
      label: "CAC value for second buyers",
      display: `${a.cacValuePctOfAvgPrice}%`,
      source: "Same logic as registration use case.",
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
          <span className="uppercase tracking-[0.18em] text-warm">UC 3</span>
        </div>

        <h1 className="mt-4 text-4xl font-medium tracking-tight text-ink">
          Resale
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-mute">
          Capture the secondary market the brand built. Used outdoor is its
          own category — not a fringe behaviour.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-6">
            <h2 className="text-xs uppercase tracking-[0.18em] text-warm">
              Assumptions
            </h2>
            <Field
              label="Resale participation rate"
              hint="% of items that eventually enter the secondary market."
              value={a.resaleParticipationRatePct}
              suffix="%"
              onChange={(v) => setA({ ...a, resaleParticipationRatePct: v })}
            />
            <Field
              label="Brand capture rate"
              hint="% of resale items captured by the brand's own programme."
              value={a.brandCaptureRatePct}
              suffix="%"
              onChange={(v) => setA({ ...a, brandCaptureRatePct: v })}
            />
            <Field
              label="Resale value"
              hint="% of original retail price recovered on resale."
              value={a.resaleValuePct}
              suffix="%"
              onChange={(v) => setA({ ...a, resaleValuePct: v })}
            />
            <Field
              label="End-of-season markdown share"
              value={a.endOfSeasonMarkdownPct}
              suffix="%"
              onChange={(v) => setA({ ...a, endOfSeasonMarkdownPct: v })}
            />
            <Field
              label="Average markdown depth"
              value={a.avgMarkdownDepthPct}
              suffix="%"
              onChange={(v) => setA({ ...a, avgMarkdownDepthPct: v })}
            />
            <Field
              label="Markdown stock diverted to resale"
              value={a.markdownDiversionPct}
              suffix="%"
              onChange={(v) => setA({ ...a, markdownDiversionPct: v })}
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
