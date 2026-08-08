"use client";

import type { BookingDraft } from "@/lib/booking/types";

type Field = "firstName" | "lastName" | "email" | "phone" | "notes";

/** Step 5 — client information. Inline, accessible validation. */
export default function DetailsStep({
  draft,
  errors,
  onChange,
}: {
  draft: BookingDraft;
  errors: Record<string, string>;
  onChange: <K extends keyof BookingDraft>(field: K, value: BookingDraft[K]) => void;
}) {
  return (
    <div>
      <p className="kicker">05 — Your details</p>
      <h2 className="type-title mt-4">Who shall we expect?</h2>

      <div className="mt-8 grid max-w-2xl gap-6 sm:grid-cols-2">
        <TextField label="First name" field="firstName" value={draft.firstName} error={errors.firstName} onChange={onChange} autoComplete="given-name" />
        <TextField label="Last name" field="lastName" value={draft.lastName} error={errors.lastName} onChange={onChange} autoComplete="family-name" />
        <TextField label="Email" field="email" type="email" value={draft.email} error={errors.email} onChange={onChange} autoComplete="email" />
        <TextField label="Mobile phone" field="phone" type="tel" value={draft.phone} error={errors.phone} onChange={onChange} autoComplete="tel" />
      </div>

      <div className="mt-6 max-w-2xl">
        <label className="block">
          <span className="kicker">Notes for your specialist (optional)</span>
          <textarea
            rows={3}
            value={draft.notes}
            onChange={(e) => onChange("notes", e.target.value)}
            aria-invalid={!!errors.notes}
            className="rule mt-3 w-full resize-none bg-transparent pt-2 text-[0.95rem] outline-none placeholder:text-gray/50"
            placeholder="Pressure preferences, areas to focus on, anything we should know…"
          />
          {errors.notes && <span className="mt-1 block text-xs text-[#a1584e]">{errors.notes}</span>}
        </label>
      </div>

      <label className="mt-6 flex cursor-pointer items-center gap-3 text-[0.9rem] text-ink">
        <input
          type="checkbox"
          checked={draft.firstTime}
          onChange={(e) => onChange("firstTime", e.target.checked)}
          className="h-4 w-4 accent-[var(--sage)]"
        />
        This is my first visit to HAVN
      </label>
    </div>
  );
}

function TextField({
  label,
  field,
  value,
  error,
  onChange,
  type = "text",
  autoComplete,
}: {
  label: string;
  field: Field;
  value: string;
  error?: string;
  onChange: (field: Field, value: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="kicker">{label}</span>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(field, e.target.value)}
        aria-invalid={!!error}
        className="rule mt-3 w-full bg-transparent pt-2 text-[0.95rem] outline-none placeholder:text-gray/50"
      />
      {error && <span className="mt-1 block text-xs text-[#a1584e]">{error}</span>}
    </label>
  );
}
