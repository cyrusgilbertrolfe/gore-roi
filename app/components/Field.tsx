"use client";

import { useEffect, useState } from "react";

export default function Field({
  label,
  hint,
  value,
  suffix,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  const [draft, setDraft] = useState<string>(() =>
    Number.isFinite(value) ? String(value) : "0"
  );

  useEffect(() => {
    setDraft(Number.isFinite(value) ? String(value) : "0");
  }, [value]);

  return (
    <div>
      <label className="block text-sm text-mute">{label}</label>
      {hint && <p className="mt-1 text-xs text-subtle">{hint}</p>}
      <div className="mt-2 flex items-center gap-2 rounded-md border border-line bg-paper/60 px-3 py-2.5 transition focus-within:border-warm focus-within:bg-paper">
        <input
          className="w-full bg-transparent text-sm text-ink outline-none"
          inputMode="decimal"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            const next = Number(draft);
            if (Number.isFinite(next)) onChange(next);
            else setDraft(String(value));
          }}
        />
        {suffix && (
          <span className="shrink-0 text-sm text-subtle tabular">{suffix}</span>
        )}
      </div>
    </div>
  );
}
