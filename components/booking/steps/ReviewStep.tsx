"use client";

import PolicyPanel from "@/components/booking/PolicyPanel";
import { formatMoney } from "@/lib/booking/deposit";
import type { ServiceView } from "@/lib/booking/client";

/** Step 6 — review, accept policy, and pay the deposit. */
export default function ReviewStep({
  service,
  staffName,
  dateLabel,
  timeLabel,
  policy,
  accepted,
  onAcceptChange,
  onSubmit,
  submitting,
  submitError,
}: {
  service: ServiceView;
  staffName: string;
  dateLabel: string;
  timeLabel: string;
  policy: { title: string; summary: string; fullText: string; version: string };
  accepted: boolean;
  onAcceptChange: (v: boolean) => void;
  onSubmit: () => void;
  submitting: boolean;
  submitError: string | null;
}) {
  const dep = service.deposit;
  const hasDeposit = dep.depositCents > 0;

  return (
    <div>
      <p className="kicker">06 — Review &amp; confirm</p>
      <h2 className="type-title mt-4">One last look.</h2>

      <dl className="mt-8 max-w-xl overflow-hidden rounded-2xl border border-oak/60">
        <Line label="Service" value={service.name} />
        <Line label="Specialist" value={staffName} />
        <Line label="Date" value={dateLabel} />
        <Line label="Time" value={timeLabel} />
        <Line label="Duration" value={`${service.durationMinutes} minutes`} />
        <Line label="Service price" value={formatMoney(service.priceCents)} />
        <Line label="Deposit due today" value={hasDeposit ? formatMoney(dep.depositCents) : "None"} strong />
        <Line label="Balance due at the spa" value={formatMoney(dep.remainingCents)} muted last />
      </dl>

      <div className="mt-8 max-w-xl">
        <PolicyPanel policy={policy} accepted={accepted} onAcceptChange={onAcceptChange} />
      </div>

      {submitError && <p className="mt-6 max-w-xl text-[0.9rem] text-[#a1584e]">{submitError}</p>}

      <div className="mt-8 max-w-xl">
        <button
          type="button"
          disabled={!accepted || submitting}
          onClick={onSubmit}
          className="inline-flex w-full items-center justify-center rounded-full bg-ink px-8 py-4 text-[0.85rem] tracking-[0.06em] text-paper transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(28,28,28,0.45)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
        >
          {submitting
            ? "Reserving…"
            : hasDeposit
              ? `Pay ${formatMoney(dep.depositCents)} deposit & confirm`
              : "Confirm appointment"}
        </button>
        <p className="mt-3 text-center text-[0.72rem] text-gray/70">
          {hasDeposit
            ? "You’ll be taken to secure checkout. Card details are handled by Stripe — never stored by HAVN."
            : "No deposit is required for this service."}
        </p>
      </div>
    </div>
  );
}

function Line({ label, value, strong, muted, last }: { label: string; value: string; strong?: boolean; muted?: boolean; last?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-6 px-5 py-3.5 ${last ? "" : "border-b border-oak/50"} ${strong ? "bg-sand/40" : ""}`}>
      <dt className="text-[0.85rem] text-gray">{label}</dt>
      <dd className={`text-right text-[0.95rem] tabular-nums ${strong ? "text-ink" : muted ? "text-gray" : "text-ink"}`}>{value}</dd>
    </div>
  );
}
