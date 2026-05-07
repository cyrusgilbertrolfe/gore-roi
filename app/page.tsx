import Link from "next/link";
import SiteHeader from "./components/SiteHeader";

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-24 sm:py-32">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.18em] text-warm">
            For Sports &amp; Outdoor brands
          </p>

          <h1 className="mt-6 text-5xl font-medium leading-[1.05] tracking-tight text-ink sm:text-6xl">
            The ROI Calculator
            <br />
            for outdoor brands.
          </h1>

          <p className="mt-8 text-lg leading-relaxed text-mute">
            A facilitation tool for evaluating the commercial impact of Digital
            Product Identity in performance and outdoor apparel. Built jointly
            by Gore and Kezzler, and designed to be used in conversation.
          </p>

          <p className="mt-4 text-base leading-relaxed text-subtle">
            Each use case lists every input, names its source, and states what
            the model deliberately does not include.
          </p>

          <div className="mt-12 flex items-center gap-6">
            <Link
              href="/brand"
              className="group inline-flex items-center gap-3 rounded-md border border-line-strong bg-paper px-5 py-3 text-sm font-medium text-ink transition hover:bg-paper-2 hover:border-warm"
            >
              Begin a session
              <span
                aria-hidden
                className="transition-transform group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
            <span className="text-sm text-subtle">
              Credible impact, by design.
            </span>
          </div>
        </div>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 text-xs text-subtle">
          <span>Gore &amp; Kezzler · 2026</span>
          <span className="tabular">v1.0</span>
        </div>
      </footer>
    </>
  );
}
