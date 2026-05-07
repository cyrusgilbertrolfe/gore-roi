"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/app/components/SiteHeader";
import { useBrand } from "./BrandProvider";
import {
  SECTOR_DATA,
  isNonOutdoorBrand,
  type CurrencyCode,
  type OutdoorSector,
} from "./brandTypes";

type LookupSource = { label: string; url: string; year?: number };

type LookupSuccess = {
  brandName: string;
  sector: OutdoorSector;
  annualRevenue: number;
  avgItemPrice: number;
  baselineReturnRate: number;
  channelMix: { ownStoresPct: number; ownEcomPct: number; wholesalePct: number };
  ownStores: number;
  storeStaffPerStore: number;
  sources?: LookupSource[];
  notes?: string;
};

type LookupNotOutdoor = {
  error: "not-outdoor";
  brandName?: string;
  explanation?: string;
};

type LookupResponse = LookupSuccess | LookupNotOutdoor | { error: string };

export default function BrandProfilePage() {
  const router = useRouter();
  const { brand, setBrand, resetBrand } = useBrand();

  const [brandName, setBrandName] = useState(brand.brandName);
  const [sector, setSector] = useState<OutdoorSector | "">(brand.sector);
  const [reportingCurrency, setReportingCurrency] = useState<CurrencyCode>(
    brand.reportingCurrency
  );
  const [annualRevenue, setAnnualRevenue] = useState(brand.annualRevenue);
  const [avgItemPrice, setAvgItemPrice] = useState(brand.avgItemPrice);
  const [unitsSoldOwnStores, setUnitsSoldOwnStores] = useState(
    brand.unitsSoldOwnStores
  );
  const [baselineReturnRate, setBaselineReturnRate] = useState(
    brand.baselineReturnRate
  );
  const [ownStores, setOwnStores] = useState(brand.ownStores);
  const [storeStaffPerStore, setStoreStaffPerStore] = useState(
    brand.storeStaffPerStore
  );
  const [ownStoresPct, setOwnStoresPct] = useState(brand.channelMix.ownStoresPct);
  const [ownEcomPct, setOwnEcomPct] = useState(brand.channelMix.ownEcomPct);
  const [wholesalePct, setWholesalePct] = useState(brand.channelMix.wholesalePct);

  // Lookup state
  const [lookupQuery, setLookupQuery] = useState("");
  const [isLooking, setIsLooking] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupSources, setLookupSources] = useState<LookupSource[] | null>(null);
  const [lookupNotes, setLookupNotes] = useState<string | null>(null);
  const [apiNotOutdoorMessage, setApiNotOutdoorMessage] = useState<string | null>(
    null
  );

  const nonOutdoorLocal = useMemo(
    () => isNonOutdoorBrand(brandName),
    [brandName]
  );
  const nonOutdoor = nonOutdoorLocal || apiNotOutdoorMessage !== null;
  const channelSum = ownStoresPct + ownEcomPct + wholesalePct;
  const channelOk = Math.abs(channelSum - 100) < 0.5;
  const canContinue =
    !nonOutdoor &&
    brandName.trim().length > 0 &&
    sector !== "" &&
    channelOk;

  const sectorMeta = sector ? SECTOR_DATA[sector] : null;

  const handleLookup = async () => {
    const q = lookupQuery.trim();
    if (q.length < 2 || isLooking) return;
    setIsLooking(true);
    setLookupError(null);
    setApiNotOutdoorMessage(null);

    try {
      const res = await fetch("/api/brand-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName: q }),
      });
      const data = (await res.json()) as LookupResponse;

      if (!res.ok || (data as { error?: string }).error) {
        if ("error" in data && data.error === "not-outdoor") {
          const not = data as LookupNotOutdoor;
          setBrandName(not.brandName ?? q);
          setApiNotOutdoorMessage(
            not.explanation ??
              "This brand isn't a fit for the Sports & Outdoor calculator."
          );
          setLookupSources(null);
          setLookupNotes(null);
          return;
        }
        setLookupError(
          (data as { error?: string }).error ?? "Lookup failed."
        );
        return;
      }

      const ok = data as LookupSuccess;
      setBrandName(ok.brandName ?? q);
      if (ok.sector && ok.sector in SECTOR_DATA) setSector(ok.sector);
      if (typeof ok.annualRevenue === "number") setAnnualRevenue(ok.annualRevenue);
      if (typeof ok.avgItemPrice === "number") setAvgItemPrice(ok.avgItemPrice);
      if (typeof ok.baselineReturnRate === "number")
        setBaselineReturnRate(ok.baselineReturnRate);
      if (ok.channelMix) {
        if (typeof ok.channelMix.ownStoresPct === "number")
          setOwnStoresPct(ok.channelMix.ownStoresPct);
        if (typeof ok.channelMix.ownEcomPct === "number")
          setOwnEcomPct(ok.channelMix.ownEcomPct);
        if (typeof ok.channelMix.wholesalePct === "number")
          setWholesalePct(ok.channelMix.wholesalePct);
      }
      if (typeof ok.ownStores === "number") setOwnStores(ok.ownStores);
      if (typeof ok.storeStaffPerStore === "number")
        setStoreStaffPerStore(ok.storeStaffPerStore);
      setLookupSources(ok.sources ?? null);
      setLookupNotes(ok.notes ?? null);
    } catch (e) {
      setLookupError("Network error — check your connection and retry.");
    } finally {
      setIsLooking(false);
    }
  };

  const handleSave = () => {
    if (!canContinue) return;
    setBrand({
      brandName: brandName.trim(),
      sector,
      reportingCurrency,
      annualRevenue,
      ownStores,
      storeStaffPerStore,
      avgItemPrice,
      unitsSoldOwnStores,
      baselineReturnRate,
      channelMix: { ownStoresPct, ownEcomPct, wholesalePct },
    });
    router.push("/calculator");
  };

  const handleReset = () => {
    resetBrand();
    setBrandName("");
    setSector("");
    setReportingCurrency("USD");
    setAnnualRevenue(800_000_000);
    setAvgItemPrice(320);
    setUnitsSoldOwnStores(450_000);
    setBaselineReturnRate(12);
    setOwnStores(25);
    setStoreStaffPerStore(8);
    setOwnStoresPct(18);
    setOwnEcomPct(32);
    setWholesalePct(50);
    setLookupSources(null);
    setLookupNotes(null);
    setLookupError(null);
    setApiNotOutdoorMessage(null);
    setLookupQuery("");
  };

  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-warm">
            Stage 1 of 2
          </p>
          <h1 className="mt-4 text-4xl font-medium tracking-tight text-ink">
            Brand profile
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-mute">
            The financial baseline that every use case calculates against. Each
            field is editable; defaults are tuned for a $200M–$2B outdoor
            brand and are starting points only.
          </p>
        </div>

        {/* Lookup */}
        <section className="mt-10 rounded-md border border-line bg-paper/40 p-5">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-xs uppercase tracking-[0.18em] text-warm">
              Look up a brand
            </h2>
            <span className="text-xs text-subtle">
              Pre-fills the form from public data.
            </span>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleLookup();
                }
              }}
              placeholder="e.g. Mammut, Patagonia, Arc'teryx"
              disabled={isLooking}
              className="flex-1 rounded-md border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none transition focus:border-warm disabled:opacity-50"
            />
            <button
              type="button"
              onClick={handleLookup}
              disabled={isLooking || lookupQuery.trim().length < 2}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-line-strong bg-paper px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-paper-2 hover:border-warm disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line-strong disabled:hover:bg-paper"
            >
              {isLooking ? "Researching…" : "Look up"}
            </button>
          </div>
          {isLooking && (
            <p className="mt-3 text-xs text-subtle">
              Searching the web for current public data — typically 10–30
              seconds.
            </p>
          )}
          {lookupError && (
            <p className="mt-3 text-xs text-warm">{lookupError}</p>
          )}
          {(lookupSources || lookupNotes) && !isLooking && (
            <div className="mt-4 rounded-md border border-line bg-canvas p-4">
              {lookupNotes && (
                <p className="text-xs leading-relaxed text-mute">
                  {lookupNotes}
                </p>
              )}
              {lookupSources && lookupSources.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {lookupSources.map((s, i) => (
                    <li key={i} className="text-xs text-subtle">
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-mute underline-offset-4 hover:text-ink hover:underline"
                      >
                        {s.label}
                      </a>
                      {s.year ? (
                        <span className="ml-1 tabular">({s.year})</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>

        {nonOutdoor && (
          <div
            role="status"
            className="mt-10 rounded-md border border-warm/30 bg-warm/5 p-5"
          >
            <p className="text-sm font-medium text-warm">
              This calculator is designed specifically for Sports &amp; Outdoor.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-mute">
              {apiNotOutdoorMessage ??
                "The model — assumptions, sector benchmarks, channel mix defaults — is tuned for performance and outdoor brands. We'd be glad to talk about your segment separately."}
            </p>
          </div>
        )}

        <Section eyebrow="Identity">
          <Field
            label="Brand name"
            hint="As you&rsquo;d describe it in the meeting."
            full
          >
            <input
              type="text"
              value={brandName}
              onChange={(e) => {
                setBrandName(e.target.value);
                if (apiNotOutdoorMessage) setApiNotOutdoorMessage(null);
              }}
              placeholder="e.g. Mammut"
              className={inputClass}
            />
          </Field>

          <Field
            label="Sector"
            hint={
              sectorMeta
                ? `${sectorMeta.examples}${sectorMeta.notes ? " — " + sectorMeta.notes : ""}`
                : "Select the closest match. We use this for sector-specific benchmarks."
            }
            full
          >
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value as OutdoorSector | "")}
              className={inputClass}
            >
              <option value="">— select sector —</option>
              {(Object.keys(SECTOR_DATA) as OutdoorSector[]).map((key) => (
                <option key={key} value={key}>
                  {SECTOR_DATA[key].label}
                </option>
              ))}
            </select>
          </Field>
        </Section>

        <Section eyebrow="Financials">
          <Field label="Reporting currency">
            <select
              value={reportingCurrency}
              onChange={(e) =>
                setReportingCurrency(e.target.value as CurrencyCode)
              }
              className={inputClass}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </Field>
          <Field label="Annual revenue" hint="Total annual brand revenue.">
            <input
              type="number"
              inputMode="decimal"
              value={annualRevenue}
              onChange={(e) => setAnnualRevenue(Number(e.target.value))}
              className={inputClass}
            />
          </Field>
        </Section>

        <Section eyebrow="Product">
          <Field label="Average item price">
            <input
              type="number"
              inputMode="decimal"
              value={avgItemPrice}
              onChange={(e) => setAvgItemPrice(Number(e.target.value))}
              className={inputClass}
            />
          </Field>
          <Field
            label="Baseline return rate"
            hint="As %. Outdoor typically 8–15."
            suffix="%"
          >
            <input
              type="number"
              inputMode="decimal"
              value={baselineReturnRate}
              onChange={(e) => setBaselineReturnRate(Number(e.target.value))}
              className={inputClass}
            />
          </Field>
        </Section>

        <Section eyebrow="Retail footprint">
          <Field label="Own stores">
            <input
              type="number"
              inputMode="numeric"
              value={ownStores}
              onChange={(e) => setOwnStores(Number(e.target.value))}
              className={inputClass}
            />
          </Field>
          <Field label="Staff per store">
            <input
              type="number"
              inputMode="numeric"
              value={storeStaffPerStore}
              onChange={(e) => setStoreStaffPerStore(Number(e.target.value))}
              className={inputClass}
            />
          </Field>
          <Field label="Units sold in own stores" full>
            <input
              type="number"
              inputMode="numeric"
              value={unitsSoldOwnStores}
              onChange={(e) => setUnitsSoldOwnStores(Number(e.target.value))}
              className={inputClass}
            />
          </Field>
        </Section>

        <Section
          eyebrow="Channel mix"
          hint={
            <span className={channelOk ? "text-subtle" : "text-warm"}>
              Must sum to 100. Currently{" "}
              <span className="tabular">{channelSum}</span>%.
            </span>
          }
        >
          <Field label="Own stores" suffix="%">
            <input
              type="number"
              inputMode="decimal"
              value={ownStoresPct}
              onChange={(e) => setOwnStoresPct(Number(e.target.value))}
              className={inputClass}
            />
          </Field>
          <Field label="Own ecom" suffix="%">
            <input
              type="number"
              inputMode="decimal"
              value={ownEcomPct}
              onChange={(e) => setOwnEcomPct(Number(e.target.value))}
              className={inputClass}
            />
          </Field>
          <Field label="Wholesale" suffix="%">
            <input
              type="number"
              inputMode="decimal"
              value={wholesalePct}
              onChange={(e) => setWholesalePct(Number(e.target.value))}
              className={inputClass}
            />
          </Field>
        </Section>

        <div className="mt-12 flex items-center gap-6 border-t border-line pt-8">
          <button
            type="button"
            onClick={handleSave}
            disabled={!canContinue}
            className="group inline-flex items-center gap-3 rounded-md border border-line-strong bg-paper px-5 py-3 text-sm font-medium text-ink transition hover:bg-paper-2 hover:border-warm disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line-strong disabled:hover:bg-paper"
          >
            Save and continue
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="text-sm text-subtle underline-offset-4 hover:text-mute hover:underline"
          >
            Reset to defaults
          </button>
        </div>
      </main>
    </>
  );
}

const inputClass =
  "w-full rounded-md border border-line bg-paper/60 px-3 py-2.5 text-sm text-ink outline-none transition focus:border-warm focus:bg-paper";

function Section({
  eyebrow,
  hint,
  children,
}: {
  eyebrow: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12 border-t border-line pt-8">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h2 className="text-xs uppercase tracking-[0.18em] text-warm">
          {eyebrow}
        </h2>
        {hint && <div className="text-xs">{hint}</div>}
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  suffix,
  full,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  suffix?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="block text-sm text-mute">{label}</label>
      {hint && <p className="mt-1 text-xs text-subtle">{hint}</p>}
      <div className="mt-2 flex items-center gap-2">
        <div className="flex-1">{children}</div>
        {suffix && (
          <span className="text-sm text-subtle tabular">{suffix}</span>
        )}
      </div>
    </div>
  );
}
