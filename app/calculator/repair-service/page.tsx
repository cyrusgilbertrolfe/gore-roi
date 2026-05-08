"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/app/components/SiteHeader";
import AssumptionsPanel from "@/app/components/AssumptionsPanel";
import RoiSummary from "@/app/components/RoiSummary";
import Field from "@/app/components/Field";
import { useBrand } from "@/app/brand/BrandProvider";
import {
  calcRepairServiceRoi,
  type RepairServiceAssumptions,
} from "@/app/lib/roi/usecases/repairService";

const DEFAULTS: RepairServiceAssumptions = {
  annualWarrantyClaims: 12_000,
  invalidClaimRatePct: 12,
  costPerInvalidClaimUsd: 180,
  validationCatchRatePct: 75,
  repairableReturnSharePct: 25,
  conversionRatePct: 35,
  netSavingPerDivertedReturnUsd: 45,
  serviceEventRatePct: 1.5,
  avgServiceRevenueUsd: 65,
  serviceMarginPct: 55,
  throughputUpliftPct: 15,
};

const MODELLED =
  "Three sources of value. (1) Warranty claim validation — Digital ID catches invalid claims (out-of-warranty, counterfeit, customer-damage) at the service counter. (2) Return-to-repair conversion — repairable failures (broken zip, seam, delamination) divert from refund to repair, saving the return cost. (3) Service revenue uplift — paid service events run at higher throughput when technicians have instant access to spec, materials, and warranty status.";

const NOT_INCLUDED = [
  "Strategic value of the repair narrative for brand differentiation.",
  "Cross-sell from repair touchpoints (customer comes in for a zip, leaves with a midlayer).",
  "Sustainability reporting credit for repair volume — captured in any Compliance use case instead.",
];

export default function Page() {
  const { brand } = useBrand();
  const [a, setA] = useState<RepairServiceAssumptions>(DEFAULTS);

  const roi = useMemo(() => calcRepairServiceRoi(brand, a), [brand, a]);

  const inputs = [
    {
      label: "Annual warranty claims",
      display: a.annualWarrantyClaims.toLocaleString("en-US"),
      source: "Brand-specific. Gore to provide own programme volume.",
    },
    {
      label: "Invalid claim rate",
      display: `${a.invalidClaimRatePct}%`,
      source:
        "Higher than fashion. Counterfeit warranty submissions are a real problem in premium outdoor.",
    },
    {
      label: "Cost per invalid claim",
      display: `$${a.costPerInvalidClaimUsd}`,
      source: "Replacement + shipping + handling on a $300–$500 product.",
    },
    {
      label: "Validation catch rate",
      display: `${a.validationCatchRatePct}%`,
      source: "Digital ID is high-confidence for membrane-based authentication.",
    },
    {
      label: "Repairable share of returns",
      display: `${a.repairableReturnSharePct}%`,
      source: "Outdoor failure modes (zip, seam, delam) are heavily repairable.",
    },
    {
      label: "Conversion rate to repair",
      display: `${a.conversionRatePct}%`,
      source: "Outdoor customer culture is repair-friendly. Worn Wear data points support this range.",
    },
    {
      label: "Net saving per diverted return",
      display: `$${a.netSavingPerDivertedReturnUsd}`,
      source: "Return processing cost less the cost of the repair performed instead.",
    },
    {
      label: "Service event rate (% of annual units)",
      display: `${a.serviceEventRatePct}%`,
      source: "Conservative. Patagonia repair volume in the high-six-figures supports this.",
    },
    {
      label: "Avg service revenue per event",
      display: `$${a.avgServiceRevenueUsd}`,
      source: "Zipper replacement, re-DWR, seam tape — typical pricing.",
    },
    {
      label: "Service margin",
      display: `${a.serviceMarginPct}%`,
      source: "Labour-heavy with known materials.",
    },
    {
      label: "Throughput uplift",
      display: `${a.throughputUpliftPct}%`,
      source: "Time saved hunting documentation, identifying parts, validating warranty.",
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
          <span className="uppercase tracking-[0.18em] text-warm">UC 2</span>
        </div>

        <h1 className="mt-4 text-4xl font-medium tracking-tight text-ink">
          Repair Service
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-mute">
          Validate every claim. Divert returns to repair. Run service
          profitably. Repair is brand identity in outdoor.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-6">
            <h2 className="text-xs uppercase tracking-[0.18em] text-warm">
              Assumptions
            </h2>
            <Field
              label="Annual warranty claims"
              value={a.annualWarrantyClaims}
              onChange={(v) => setA({ ...a, annualWarrantyClaims: v })}
            />
            <Field
              label="Invalid claim rate"
              value={a.invalidClaimRatePct}
              suffix="%"
              onChange={(v) => setA({ ...a, invalidClaimRatePct: v })}
            />
            <Field
              label="Cost per invalid claim"
              value={a.costPerInvalidClaimUsd}
              suffix="$"
              onChange={(v) => setA({ ...a, costPerInvalidClaimUsd: v })}
            />
            <Field
              label="Validation catch rate"
              value={a.validationCatchRatePct}
              suffix="%"
              onChange={(v) => setA({ ...a, validationCatchRatePct: v })}
            />
            <Field
              label="Repairable share of returns"
              value={a.repairableReturnSharePct}
              suffix="%"
              onChange={(v) => setA({ ...a, repairableReturnSharePct: v })}
            />
            <Field
              label="Conversion rate to repair"
              value={a.conversionRatePct}
              suffix="%"
              onChange={(v) => setA({ ...a, conversionRatePct: v })}
            />
            <Field
              label="Net saving per diverted return"
              value={a.netSavingPerDivertedReturnUsd}
              suffix="$"
              onChange={(v) =>
                setA({ ...a, netSavingPerDivertedReturnUsd: v })
              }
            />
            <Field
              label="Service event rate"
              hint="% of annual units that produce a paid service event."
              value={a.serviceEventRatePct}
              suffix="%"
              onChange={(v) => setA({ ...a, serviceEventRatePct: v })}
            />
            <Field
              label="Avg service revenue per event"
              value={a.avgServiceRevenueUsd}
              suffix="$"
              onChange={(v) => setA({ ...a, avgServiceRevenueUsd: v })}
            />
            <Field
              label="Service margin"
              value={a.serviceMarginPct}
              suffix="%"
              onChange={(v) => setA({ ...a, serviceMarginPct: v })}
            />
            <Field
              label="Throughput uplift"
              value={a.throughputUpliftPct}
              suffix="%"
              onChange={(v) => setA({ ...a, throughputUpliftPct: v })}
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
