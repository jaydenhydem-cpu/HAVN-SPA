"use client";

import { formatMoney } from "@/lib/booking/deposit";
import type { ServiceView } from "@/lib/booking/client";

/** Sticky "your appointment" recap. Deposit is shown as part of the price. */
export default function Summary({
  service,
  staffName,
  dateLabel,
  timeLabel,
}: {
  service: ServiceView | null;
  staffName: string | null;
  dateLabel: string | null;
  timeLabel: string | null;
}) {
  return (
    <aside className="rounded-2xl border border-oak/60 bg-sand/50 p-6 lg:sticky lg:top-28">
      <p className="kicker">Your appointment</p>

      <dl className="mt-6 flex flex-col gap-4 text-[0.9rem]">
        <Row label="Service" value={service?.name} />
        <Row label="Specialist" value={staffName} />
        <Row label="Date" value={dateLabel} />
        <Row label="Time" value={timeLabel} />
        {service && <Row label="Duration" value={`${service.durationMinutes} minutes`} />}
      </dl>

      {service && (
        <div className="rule mt-6 flex flex-col gap-2 pt-5 text-[0.9rem]">
          <div className="flex items-baseline justify-between">
            <span className="text-gray">Service price</span>
            <span className="tabular-nums">{formatMoney(service.priceCents)}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-gray">Deposit today</span>
            <span className="tabular-nums text-ink">
              {service.deposit.depositCents > 0 ? formatMoney(service.deposit.depositCents) : "None"}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-gray">Due at the spa</span>
            <span className="tabular-nums">{formatMoney(service.deposit.remainingCents)}</span>
          </div>
        </div>
      )}

      <p className="mt-6 text-[0.72rem] leading-relaxed text-gray/70">
        Your deposit is applied toward the service total — never added on top.
      </p>
    </aside>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <dt className="text-gray">{label}</dt>
      <dd className={`text-right ${value ? "text-ink" : "text-gray/50"}`}>{value ?? "—"}</dd>
    </div>
  );
}
