export default function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center px-6">
        <div className="flex items-center gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/gore.svg"
            alt="W. L. Gore & Associates"
            className="h-7 w-auto"
          />
          <div aria-hidden className="h-5 w-px bg-line-strong" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/kezzler.svg"
            alt="Kezzler"
            className="h-7 w-auto"
          />
        </div>

        <div className="ml-auto text-xs tracking-wide text-subtle uppercase">
          ROI Calculator
        </div>
      </div>
    </header>
  );
}
