"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatMoney } from "@/lib/booking/deposit";
import { formatDateLabel, formatTimeLabel } from "@/lib/booking/time";
import type { AdminBooking } from "@/lib/booking/admin";
import type { BookingStatus } from "@/lib/booking/types";

const STATUS_STYLE: Record<BookingStatus, string> = {
  confirmed: "bg-sage/20 text-ink",
  completed: "bg-sage/30 text-ink",
  pending_payment: "bg-oak/40 text-gray",
  cancelled: "bg-[#a1584e]/15 text-[#a1584e]",
  no_show: "bg-[#a1584e]/15 text-[#a1584e]",
  payment_failed: "bg-[#a1584e]/15 text-[#a1584e]",
  expired: "bg-oak/30 text-gray/70",
};

export default function AdminBookingsTable({ bookings, token }: { bookings: AdminBooking[]; token: string }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const act = async (id: string, action: "cancel" | "complete" | "no_show") => {
    setBusyId(id);
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, id, action }),
    }).catch(() => {});
    setBusyId(null);
    router.refresh();
  };

  if (bookings.length === 0) {
    return <p className="mt-8 text-[0.9rem] text-gray">No bookings yet.</p>;
  }

  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full min-w-[52rem] border-collapse text-[0.85rem]">
        <thead>
          <tr className="border-b border-oak/60 text-left text-[0.7rem] uppercase tracking-[0.1em] text-gray">
            <th className="py-3 pr-4 font-normal">When</th>
            <th className="py-3 pr-4 font-normal">Guest</th>
            <th className="py-3 pr-4 font-normal">Service · Specialist</th>
            <th className="py-3 pr-4 font-normal">Deposit</th>
            <th className="py-3 pr-4 font-normal">Status</th>
            <th className="py-3 font-normal">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => {
            const start = new Date(b.startsAt);
            const closed = ["cancelled", "completed", "no_show", "expired"].includes(b.status);
            return (
              <tr key={b.id} className="border-b border-oak/40 align-top">
                <td className="py-4 pr-4">
                  <div className="text-ink">{formatDateLabel(start)}</div>
                  <div className="text-gray">{formatTimeLabel(start)}</div>
                </td>
                <td className="py-4 pr-4">
                  <div className="text-ink">{b.customerName}</div>
                  <div className="text-gray">{b.customerEmail}</div>
                  <div className="text-gray">{b.customerPhone}</div>
                </td>
                <td className="py-4 pr-4">
                  <div className="text-ink">{b.serviceName}</div>
                  <div className="text-gray">{b.staffName}</div>
                  <div className="text-gray/70">#{b.confirmationNumber}</div>
                </td>
                <td className="py-4 pr-4 tabular-nums">
                  <div>{b.depositCents > 0 ? formatMoney(b.depositCents) : "—"}</div>
                  <div className="text-gray">{formatMoney(b.remainingCents)} due</div>
                </td>
                <td className="py-4 pr-4">
                  <span className={`inline-block rounded-full px-2.5 py-1 text-[0.68rem] tracking-[0.04em] ${STATUS_STYLE[b.status]}`}>
                    {b.status.replace("_", " ")}
                  </span>
                </td>
                <td className="py-4">
                  {!closed && (
                    <div className="flex flex-col gap-1.5">
                      <button disabled={busyId === b.id} onClick={() => act(b.id, "complete")} className="link-center text-left text-ink disabled:opacity-40">Mark completed</button>
                      <button disabled={busyId === b.id} onClick={() => act(b.id, "no_show")} className="link-center text-left text-gray disabled:opacity-40">No-show</button>
                      <button disabled={busyId === b.id} onClick={() => act(b.id, "cancel")} className="link-center text-left text-[#a1584e] disabled:opacity-40">Cancel</button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
