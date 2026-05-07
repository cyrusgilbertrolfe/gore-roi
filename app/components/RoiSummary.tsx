import { formatCurrency } from "@/app/lib/roi/finance";
import type { CurrencyCode } from "@/app/brand/brandTypes";

export type LineItem = { key: string; label: string; value: number };

export default function RoiSummary({
  total,
  lineItems,
  currency,
}: {
  total: number;
  lineItems: LineItem[];
  currency: CurrencyCode;
}) {
  return (
    <div className="rounded-md border border-line bg-paper/40 p-6">
      <p className="text-xs uppercase tracking-[0.18em] text-warm">
        Annual benefit
      </p>
      <p className="mt-3 text-4xl font-medium tracking-tight text-ink tabular">
        {formatCurrency(total, currency)}
      </p>
      <p className="mt-1 text-xs text-subtle">Recurring, per year.</p>

      {lineItems.length > 0 && (
        <ul className="mt-6 space-y-3 border-t border-line pt-5">
          {lineItems.map((li) => (
            <li
              key={li.key}
              className="flex items-baseline justify-between gap-4 text-sm"
            >
              <span className="text-mute">{li.label}</span>
              <span className="shrink-0 text-ink tabular">
                {formatCurrency(li.value, currency)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
