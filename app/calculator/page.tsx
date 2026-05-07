"use client";

import Link from "next/link";
import SiteHeader from "@/app/components/SiteHeader";
import { useBrand } from "@/app/brand/BrandProvider";
import { SECTOR_DATA } from "@/app/brand/brandTypes";
import { USE_CASES } from "./usecases";

export default function CalculatorIndexPage() {
  const { brand } = useBrand();
  const brandLabel = brand.brandName?.trim() || "(no brand selected)";
  const sectorLabel = brand.sector ? SECTOR_DATA[brand.sector].label : "—";

  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
        <div className="flex items-end justify-between gap-6 border-b border-line pb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-warm">
              Stage 2 of 2
            </p>
            <h1 className="mt-4 text-4xl font-medium tracking-tight text-ink">
              {brandLabel}
            </h1>
            <p className="mt-2 text-sm text-subtle">{sectorLabel}</p>
          </div>
          <Link
            href="/brand"
            className="text-sm text-subtle underline-offset-4 hover:text-mute hover:underline"
          >
            Edit profile
          </Link>
        </div>

        <p className="mt-8 max-w-2xl text-base leading-relaxed text-mute">
          Seven use cases. Each one models a single source of value, lists the
          inputs we used and where they came from, and states what the
          calculation deliberately does not include.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2">
          {USE_CASES.map((uc, i) => (
            <Link
              key={uc.slug}
              href={`/calculator/${uc.slug}`}
              className="group flex flex-col bg-canvas p-6 transition hover:bg-paper"
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-xs uppercase tracking-[0.18em] text-subtle tabular">
                  UC {i + 1}
                </span>
                <span
                  aria-hidden
                  className="text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-warm"
                >
                  →
                </span>
              </div>
              <h2 className="mt-4 text-lg font-medium text-ink group-hover:text-warm">
                {uc.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-mute">
                {uc.oneLiner}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
