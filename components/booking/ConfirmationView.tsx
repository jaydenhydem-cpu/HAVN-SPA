"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatMoney } from "@/lib/booking/deposit";
import type { ConfirmationData } from "@/lib/booking/types";

/**
 * Premium confirmation screen. Reflects the booking's DB status — a redirect is
 * never treated as proof of payment, so we poll briefly while the webhook
 * finalizes, then show the confirmed appointment.
 */
export default function ConfirmationView() {
  const params = useSearchParams();
  const c = params.get("c");
  const [data, setData] = useState<ConfirmationData | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "pending" | "error">("loading");

  useEffect(() => {
    if (!c) {
      setState("error");
      return;
    }
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`/api/booking/confirmation?c=${encodeURIComponent(c)}`, { cache: "no-store" });
        if (!res.ok) throw new Error();
        const json = await res.json();
        const conf = json.confirmation as ConfirmationData;
        if (cancelled) return;
        setData(conf);
        if (conf.status === "confirmed" || conf.status === "completed") {
          setState("ready");
        } else if (conf.status === "pending_payment" && tries < 6) {
          tries++;
          setState("pending");
          timer = setTimeout(poll, 2000);
        } else {
          setState(conf.status === "pending_payment" ? "pending" : "ready");
        }
      } catch {
        if (!cancelled) setState("error");
      }
    };
    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [c]);

  if (state === "loading") {
    return (
      <div className="flex items-center gap-3 text-[0.9rem] text-gray" role="status">
        <span className="h-4 w-4 animate-spin rounded-full border border-oak border-t-ink" aria-hidden />
        Retrieving your appointment…
      </div>
    );
  }

  if (state === "error" || !data) {
    return (
      <div className="max-w-lg">
        <p className="kicker text-[#a1584e]">We couldn’t find that booking</p>
        <p className="mt-4 text-[0.95rem] text-gray">
          Please check your confirmation link, or <Link href="/book" className="link-center text-ink">start a new booking</Link>.
        </p>
      </div>
    );
  }

  const start = new Date(data.startUtc);
  const end = new Date(start.getTime() + data.durationMinutes * 60_000);
  const gcal = googleCalendarUrl(data, start, end);
  const ics = icsDataUri(data, start, end);

  return (
    <div className="max-w-2xl">
      {state === "pending" && (
        <p className="mb-6 rounded-xl border border-oak/60 bg-sand/60 px-4 py-3 text-[0.82rem] text-gray">
          We’re finalizing your payment confirmation — your appointment details are below and your email confirmation will follow shortly.
        </p>
      )}

      <p className="kicker text-sage">You’re booked</p>
      <h1 className="type-chapter mt-5">A time, held for you.</h1>
      <p className="mt-5 text-[0.95rem] text-gray">
        Confirmation <span className="tabular-nums text-ink">{data.confirmationNumber}</span> — a copy is on its way to your inbox.
      </p>

      <dl className="mt-10 overflow-hidden rounded-2xl border border-oak/60">
        <Line label="Service" value={data.serviceName} />
        <Line label="Specialist" value={data.staffName} />
        <Line label="Date" value={data.dateLabel} />
        <Line label="Time" value={`${data.timeLabel} · ${data.durationMinutes} min`} />
        <Line label="Deposit paid" value={data.depositPaidCents > 0 ? formatMoney(data.depositPaidCents) : "None"} />
        <Line label="Due at the spa" value={formatMoney(data.remainingCents)} last />
      </dl>

      <div className="mt-10 rounded-2xl bg-sand/50 p-6">
        <p className="kicker">Where to find us</p>
        <p className="mt-3 text-[0.95rem] text-ink">{data.locationName}</p>
        <p className="text-[0.9rem] text-gray">{data.locationAddress.join(", ")}</p>
        <p className="measure mt-4 text-[0.85rem] leading-relaxed text-gray">{data.arrivalNote}</p>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <a
          href={gcal}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-full border border-ink/25 px-6 py-3 text-[0.78rem] tracking-[0.06em] text-ink transition-all hover:border-ink/60"
        >
          Add to Google Calendar
        </a>
        <a
          href={ics}
          download={`havn-${data.confirmationNumber}.ics`}
          className="inline-flex items-center justify-center rounded-full border border-ink/25 px-6 py-3 text-[0.78rem] tracking-[0.06em] text-ink transition-all hover:border-ink/60"
        >
          Download .ics
        </a>
        <Link href="/legal#cancellation" className="link-center text-[0.8rem] text-gray">
          Cancellation policy
        </Link>
      </div>

      <div className="rule mt-12 pt-8">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-ink px-8 py-4 text-[0.8rem] tracking-[0.06em] text-paper transition-all duration-500 hover:-translate-y-0.5"
        >
          Return to HAVN
        </Link>
      </div>
    </div>
  );
}

function Line({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-6 px-5 py-4 ${last ? "" : "border-b border-oak/50"}`}>
      <dt className="text-[0.85rem] text-gray">{label}</dt>
      <dd className="text-right text-[0.95rem] text-ink">{value}</dd>
    </div>
  );
}

function toICSDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function googleCalendarUrl(data: ConfirmationData, start: Date, end: Date): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${data.serviceName} — HAVN`,
    dates: `${toICSDate(start)}/${toICSDate(end)}`,
    details: `With ${data.staffName}. Confirmation ${data.confirmationNumber}.`,
    location: `${data.locationName}, ${data.locationAddress.join(", ")}`,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

function icsDataUri(data: ConfirmationData, start: Date, end: Date): string {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//HAVN//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${data.confirmationNumber}@havn`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${data.serviceName} — HAVN`,
    `DESCRIPTION:With ${data.staffName}. Confirmation ${data.confirmationNumber}.`,
    `LOCATION:${data.locationName}\\, ${data.locationAddress.join("\\, ")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}
