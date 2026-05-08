export type AssumptionRow = {
  label: string;
  /** Display value (formatted for reading — e.g. "35%", "$180", "0.5 percentage points"). */
  display: string;
  /** Where this number comes from. Plain text. */
  source: string;
};

export default function AssumptionsPanel({
  inputs,
  modelled,
  notIncluded,
  lastReviewed,
}: {
  inputs: AssumptionRow[];
  modelled: string;
  notIncluded: string[];
  lastReviewed?: string;
}) {
  return (
    <section className="mt-12 rounded-md border border-line bg-paper/30 p-6 sm:p-8">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-xs uppercase tracking-[0.18em] text-warm">
          How we calculated this
        </h2>
        <span className="text-xs text-subtle">Credible impact, by design.</span>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-ink">Inputs we used</h3>
        <ul className="mt-3 divide-y divide-line">
          {inputs.map((row, i) => (
            <li
              key={i}
              className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[1fr_auto_2fr] sm:items-baseline sm:gap-6"
            >
              <span className="text-sm text-mute">{row.label}</span>
              <span className="text-sm text-ink tabular sm:text-right">
                {row.display}
              </span>
              <span className="text-xs text-subtle sm:text-right">
                {row.source}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <h3 className="text-sm font-medium text-ink">What we modelled</h3>
          <p className="mt-2 text-sm leading-relaxed text-mute">{modelled}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-ink">
            What we did not include
          </h3>
          <ul className="mt-2 space-y-2 text-sm leading-relaxed text-mute">
            {notIncluded.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-subtle" aria-hidden>
                  ·
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {lastReviewed && (
        <p className="mt-8 border-t border-line pt-4 text-xs text-subtle">
          Last reviewed: {lastReviewed}
        </p>
      )}
    </section>
  );
}
