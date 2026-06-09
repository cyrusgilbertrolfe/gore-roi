"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/app/components/SiteHeader";
import AssumptionsPanel from "@/app/components/AssumptionsPanel";
import RoiSummary from "@/app/components/RoiSummary";
import Field from "@/app/components/Field";
import { formatCurrency } from "@/app/lib/roi/finance";
import { useBrand } from "@/app/brand/BrandProvider";
import {
  MARKETS,
  calcTradeComplianceRoi,
  computeWeightedImpoundmentRate,
  type TradeComplianceAssumptions,
} from "@/app/lib/roi/usecases/tradeCompliance";

type MarketState = {
  key: string;
  enabled: boolean;
  annualImportValueUsd: number;
};

// Defaults are outdoor-tuned (June 2026). The standout adjustment is the
// effective duty rate: technical waterproof/coated outerwear (USITC HTS 62xx)
// carries materially higher US duties than general apparel, so the blended
// rate sits above a fast-fashion baseline.
const DEFAULT_ASSUMPTIONS = {
  impoundmentCostSharePct: 12,
  impoundmentReductionPct: 60,
  annualShipmentCount: 500,
  docHoursPerShipmentBefore: 6,
  docHoursPerShipmentAfter: 1.5,
  fullyLoadedHourlyCost: 60,
  avgEffectiveDutyRatePct: 18,
  dutyOptimisationPct: 8,
};

const DEFAULT_MARKET_STATES: MarketState[] = MARKETS.map((m) => ({
  key: m.key,
  enabled: ["us", "eu", "uk"].includes(m.key),
  annualImportValueUsd: m.defaultAnnualImportValueUsd,
}));

const RISK_STYLES: Record<string, string> = {
  high: "text-red-400 bg-red-400/10 border-red-400/20",
  medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  low: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
};

const RISK_LABELS: Record<string, string> = {
  high: "HIGH",
  medium: "MED",
  low: "LOW",
};

const MODELLED =
  "Three levers, all flowing from one verifiable provenance record. The regulatory map is not a set of separate problems — forced-labour prevention, product passport, chemicals transparency, modern-slavery reporting all ask the same question: can you prove this product's provenance? A Smart Label supply chain answers them from a single EPCIS event chain. Impoundment cost reduction: the weighted impoundment rate is a value-weighted average of each active market's baseline risk, applied to total import value at risk, then to the all-in hold cost as a share of shipment value, then to the reduction a complete chain-of-custody record delivers at the point of customs inquiry. Documentation overhead: compliance documents assembled manually per shipment become a query against structured EPCIS and DPP attributes — shipments per year x hours saved x loaded hourly cost. Duty optimisation: item-level attribute data sharpens tariff classification and FTA utilisation — total import value x effective duty rate x improvement.";

const NOT_INCLUDED = [
  "Reputational damage from a public customs enforcement action, and the secondary-market consequences of an impoundment. Real and additive, not modelled numerically.",
  "The cost of a brand-level regulatory investigation once a shipment is flagged.",
  "PFAS reformulation and DWR chemistry change costs — a product and materials programme in their own right, not a traceability saving.",
  "Gore-side membrane provenance for Gore-Tex licensees, which makes diversion and counterfeit membrane newly detectable. A parallel Gore-side calculation.",
];

/** Inline import-value input used inside market cards, in millions. */
function ImportValueInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [draft, setDraft] = useState(() => String(Math.round(value / 1_000_000)));

  return (
    <div
      className="flex items-center gap-1 rounded-md border border-line bg-canvas/60 px-2 py-1"
      onClick={(e) => e.stopPropagation()}
    >
      <input
        className="w-12 bg-transparent text-right text-xs text-ink outline-none"
        value={draft}
        inputMode="decimal"
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          const n = Number(draft);
          if (Number.isFinite(n) && n >= 0) onChange(n * 1_000_000);
          else setDraft(String(Math.round(value / 1_000_000)));
        }}
      />
      <span className="text-xs text-subtle">$M</span>
    </div>
  );
}

function MarketCard({
  marketDef,
  state,
  onToggle,
  onValueChange,
}: {
  marketDef: (typeof MARKETS)[number];
  state: MarketState;
  onToggle: () => void;
  onValueChange: (v: number) => void;
}) {
  return (
    <div
      onClick={onToggle}
      className={[
        "cursor-pointer select-none rounded-md border p-3 transition",
        state.enabled
          ? "border-line-strong bg-paper/60"
          : "border-line bg-paper/20 opacity-50 hover:opacity-80",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">{marketDef.flag}</span>
          <span className="text-xs font-medium text-ink">{marketDef.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={[
              "rounded border px-1.5 py-0.5 text-[10px] font-semibold leading-none",
              RISK_STYLES[marketDef.riskTier],
            ].join(" ")}
          >
            {RISK_LABELS[marketDef.riskTier]}
          </span>
          <div
            className={[
              "flex h-4 w-4 items-center justify-center rounded-full border transition-colors",
              state.enabled
                ? "border-warm bg-warm/30"
                : "border-line-strong bg-transparent",
            ].join(" ")}
          >
            {state.enabled && <div className="h-2 w-2 rounded-full bg-warm" />}
          </div>
        </div>
      </div>

      <div className="mt-1.5 text-[10px] leading-relaxed text-subtle">
        {marketDef.regulatoryHighlights}
      </div>

      {state.enabled && (
        <div className="mt-2 flex items-center gap-2 text-[10px] text-mute">
          <span>Annual imports:</span>
          <ImportValueInput
            value={state.annualImportValueUsd}
            onChange={onValueChange}
          />
        </div>
      )}
    </div>
  );
}

export default function Page() {
  const { brand } = useBrand();
  const [a, setA] = useState(DEFAULT_ASSUMPTIONS);
  const [marketStates, setMarketStates] = useState<MarketState[]>(
    DEFAULT_MARKET_STATES
  );

  const toggleMarket = (key: string) =>
    setMarketStates((prev) =>
      prev.map((m) => (m.key === key ? { ...m, enabled: !m.enabled } : m))
    );

  const setMarketValue = (key: string, value: number) =>
    setMarketStates((prev) =>
      prev.map((m) =>
        m.key === key ? { ...m, annualImportValueUsd: value } : m
      )
    );

  const activeMarkets = useMemo(
    () => marketStates.filter((m) => m.enabled),
    [marketStates]
  );

  const totalImportValueUsd = useMemo(
    () => activeMarkets.reduce((s, m) => s + m.annualImportValueUsd, 0),
    [activeMarkets]
  );

  const weightedImpoundmentRatePct = useMemo(
    () => computeWeightedImpoundmentRate(activeMarkets),
    [activeMarkets]
  );

  const assumptions: TradeComplianceAssumptions = useMemo(
    () => ({ ...a, totalImportValueUsd, weightedImpoundmentRatePct }),
    [a, totalImportValueUsd, weightedImpoundmentRatePct]
  );

  const roi = useMemo(
    () => calcTradeComplianceRoi(brand, assumptions),
    [brand, assumptions]
  );

  const currency = brand.reportingCurrency;

  const inputs = [
    {
      label: "Active markets",
      display: String(activeMarkets.length),
      source: "Toggle the markets your brand sells into. US, EU and UK on by default.",
    },
    {
      label: "Total import value (active markets)",
      display: formatCurrency(totalImportValueUsd, currency),
      source: "Sum of annual imports across active markets. Editable per market.",
    },
    {
      label: "Weighted baseline impoundment rate",
      display: `${weightedImpoundmentRatePct.toFixed(1)}%`,
      source:
        "Value-weighted average of each active market's baseline hold rate. US carries the highest weight under UFLPA.",
    },
    {
      label: "Hold cost as % of impounded shipment value",
      display: `${a.impoundmentCostSharePct}%`,
      source:
        "Demurrage, storage, customs bond, legal correspondence, and emergency re-routing. 10–15% is realistic for a multi-week UFLPA hold.",
    },
    {
      label: "Impoundment reduction from Smart Label traceability",
      display: `${a.impoundmentReductionPct}%`,
      source:
        "Improved clearance rate when a complete, verifiable EPCIS event chain is available at customs inquiry. Kezzler estimate.",
    },
    {
      label: "Annual shipment legs requiring documentation",
      display: `${a.annualShipmentCount.toLocaleString("en-US")} / yr`,
      source: "Border-crossing legs where compliance documents are prepared. Editable per brand.",
    },
    {
      label: "Documentation hours per shipment — today",
      display: `${a.docHoursPerShipmentBefore} hrs`,
      source: "Manual assembly across disparate systems. Multi-origin UFLPA shipments run longer.",
    },
    {
      label: "Documentation hours per shipment — with Smart Label",
      display: `${a.docHoursPerShipmentAfter} hrs`,
      source: "Most declarations become automated exports; residual time is exception handling.",
    },
    {
      label: "Fully loaded hourly cost",
      display: `$${a.fullyLoadedHourlyCost}/hr`,
      source: "Customs / trade compliance staff, loaded. Outdoor-tuned, Kezzler June 2026.",
    },
    {
      label: "Average effective duty rate",
      display: `${a.avgEffectiveDutyRatePct}%`,
      source:
        "Outdoor-tuned: technical waterproof/coated outerwear (USITC HTS 62xx) carries higher duties than general apparel. Blended estimate, Kezzler June 2026.",
    },
    {
      label: "Duty outcome improvement",
      display: `${a.dutyOptimisationPct}%`,
      source:
        "Better classification accuracy and FTA utilisation. 5–10% is realistic for complex multi-origin sourcing.",
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
          <span className="uppercase tracking-[0.18em] text-warm">UC 9</span>
        </div>

        <h1 className="mt-4 text-4xl font-medium tracking-tight text-ink">
          Trade &amp; Customs Compliance
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-mute">
          US Customs is impounding shipments at an unprecedented rate under
          UFLPA — the Uyghur Forced Labor Prevention Act — and the burden of
          proof is inverted: brands must affirmatively demonstrate clean origin.
          Documents can be fabricated. A serialised item with a verified EPCIS
          event chain from factory to port cannot. UFLPA is the sharpest
          pressure, but it sits inside a wider map — forced-labour rules, PFAS
          restrictions on membranes and DWR, the Digital Product Passport — all
          asking the same question. One Smart Label provenance record answers
          them from a single source.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-10">
            {/* Market selector */}
            <div className="space-y-4">
              <h2 className="text-xs uppercase tracking-[0.18em] text-warm">
                Active markets
              </h2>
              <p className="text-xs text-subtle">
                Select the markets your brand sells into. Each carries its own
                regulatory risk profile — the weighted impoundment rate updates
                as you toggle markets on or off.
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {MARKETS.map((def) => {
                  const state = marketStates.find((m) => m.key === def.key)!;
                  return (
                    <MarketCard
                      key={def.key}
                      marketDef={def}
                      state={state}
                      onToggle={() => toggleMarket(def.key)}
                      onValueChange={(v) => setMarketValue(def.key, v)}
                    />
                  );
                })}
              </div>
              <div className="flex items-center justify-between rounded-md border border-line bg-paper/30 px-4 py-3">
                <span className="text-xs text-subtle">
                  Weighted baseline impoundment rate
                  <span className="ml-1 text-subtle/70">
                    (value-weighted avg across active markets)
                  </span>
                </span>
                <span className="text-sm font-medium text-warm tabular">
                  {weightedImpoundmentRatePct.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Impoundment & compliance holds */}
            <div className="space-y-6 border-t border-line pt-8">
              <div>
                <h2 className="text-xs uppercase tracking-[0.18em] text-warm">
                  Impoundment &amp; compliance holds
                </h2>
                <p className="mt-2 text-xs text-subtle">
                  When a shipment is held at the border the clock starts:
                  demurrage, storage, bond costs, legal fees, and the airfreight
                  bought to compensate for delayed inventory. A verified digital
                  chain of custody resolves most holds before they escalate.
                </p>
              </div>
              <Field
                label="Hold cost as % of impounded shipment value"
                hint="All-in cost of a hold as a share of shipment value: demurrage, storage, customs bond, legal, and emergency re-routing. 10–15% is realistic for a multi-week UFLPA hold."
                value={a.impoundmentCostSharePct}
                suffix="%"
                onChange={(v) => setA({ ...a, impoundmentCostSharePct: v })}
              />
              <Field
                label="Impoundment reduction from Smart Label traceability"
                hint="Reduction in holds and enhanced-scrutiny events from a verified EPCIS event chain available at the point of customs inquiry."
                value={a.impoundmentReductionPct}
                suffix="%"
                onChange={(v) => setA({ ...a, impoundmentReductionPct: v })}
              />
            </div>

            {/* Documentation overhead */}
            <div className="space-y-6 border-t border-line pt-8">
              <div>
                <h2 className="text-xs uppercase tracking-[0.18em] text-warm">
                  Documentation overhead
                </h2>
                <p className="mt-2 text-xs text-subtle">
                  Certificates of origin, forced-labour due-diligence
                  submissions, composition declarations — assembled manually per
                  shipment today. Structured EPCIS history and DPP attributes
                  make this a query, not a document chase.
                </p>
              </div>
              <Field
                label="Annual shipment legs requiring documentation"
                hint="Border-crossing legs where compliance documentation is prepared. Scale with the complexity of your distribution network."
                value={a.annualShipmentCount}
                suffix="/ yr"
                onChange={(v) => setA({ ...a, annualShipmentCount: v })}
              />
              <Field
                label="Documentation hours per shipment — today"
                hint="Hours assembling compliance documents across multiple systems. Complex multi-origin shipments with UFLPA exposure take longer."
                value={a.docHoursPerShipmentBefore}
                suffix="hrs"
                onChange={(v) => setA({ ...a, docHoursPerShipmentBefore: v })}
              />
              <Field
                label="Documentation hours per shipment — with Smart Label"
                hint="With EPCIS event data and DPP attributes queryable at shipment level, most declarations become automated exports."
                value={a.docHoursPerShipmentAfter}
                suffix="hrs"
                onChange={(v) => setA({ ...a, docHoursPerShipmentAfter: v })}
              />
              <Field
                label="Fully loaded hourly cost"
                hint="Customs compliance, trade operations, or logistics analyst staff, loaded."
                value={a.fullyLoadedHourlyCost}
                suffix="$/hr"
                onChange={(v) => setA({ ...a, fullyLoadedHourlyCost: v })}
              />
            </div>

            {/* Duty & tariff optimisation */}
            <div className="space-y-6 border-t border-line pt-8">
              <div>
                <h2 className="text-xs uppercase tracking-[0.18em] text-warm">
                  Duty &amp; tariff optimisation
                </h2>
                <p className="mt-2 text-xs text-subtle">
                  Item-level attribute data enables more precise tariff
                  classification and better FTA utilisation. Misclassification —
                  often from incomplete product data — leads to overpaid duties
                  and audit exposure, and technical outerwear sits in the
                  high-duty brackets.
                </p>
              </div>
              <Field
                label="Average effective duty rate"
                hint="Blended rate across active markets and categories. Technical waterproof/coated outerwear carries materially higher duties than general apparel."
                value={a.avgEffectiveDutyRatePct}
                suffix="%"
                onChange={(v) => setA({ ...a, avgEffectiveDutyRatePct: v })}
              />
              <Field
                label="Duty outcome improvement"
                hint="Improvement in duty paid through better classification accuracy and FTA utilisation. 5–10% is realistic for complex multi-origin sourcing."
                value={a.dutyOptimisationPct}
                suffix="%"
                onChange={(v) => setA({ ...a, dutyOptimisationPct: v })}
              />
            </div>
          </div>

          <div className="lg:sticky lg:top-6 lg:self-start">
            <RoiSummary
              total={roi.totalAnnualBenefit}
              lineItems={roi.lineItems}
              currency={currency}
            />
            <div className="mt-3 rounded-md border border-line bg-paper/30 p-4 text-xs">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-subtle">Active markets</span>
                <span className="text-ink tabular">{activeMarkets.length}</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between gap-3">
                <span className="text-subtle">Total import value</span>
                <span className="text-ink tabular">
                  {formatCurrency(totalImportValueUsd, currency)}
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between gap-3">
                <span className="text-subtle">Weighted impoundment rate</span>
                <span className="text-ink tabular">
                  {weightedImpoundmentRatePct.toFixed(1)}%
                </span>
              </div>
            </div>
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
