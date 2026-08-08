"use client";

import { useState } from "react";

/**
 * Booking & cancellation policy panel shown immediately before payment.
 * Copy comes from data (props), never hard-coded here. The pay button stays
 * disabled (controlled by the parent) until `accepted` is true.
 */
export default function PolicyPanel({
  policy,
  accepted,
  onAcceptChange,
}: {
  policy: { title: string; summary: string; fullText: string; version: string };
  accepted: boolean;
  onAcceptChange: (v: boolean) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-oak/60 bg-sand/60 p-6">
      <p className="kicker">Before you book</p>
      <h3 className="type-title mt-3 text-[1.25rem]">{policy.title}</h3>
      <p className="measure mt-3 text-[0.9rem] leading-relaxed text-gray">{policy.summary}</p>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="link-center mt-4 text-[0.8rem] text-ink"
      >
        {open ? "Hide full policy" : "Read full policy"}
      </button>

      {open && (
        <div className="mt-4 flex flex-col gap-3 rounded-xl bg-paper/70 p-4 text-[0.85rem] leading-relaxed text-gray">
          {policy.fullText.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
          <p className="pt-1 text-[0.72rem] text-gray/70">
            Policy version {policy.version}. This is temporary placeholder copy, not legal advice or HAVN&rsquo;s final language.
          </p>
        </div>
      )}

      <label className="mt-6 flex cursor-pointer items-start gap-3 text-[0.9rem] text-ink">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => onAcceptChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--sage)]"
        />
        <span>I have read and agree to HAVN&rsquo;s booking and cancellation policy.</span>
      </label>
    </div>
  );
}
