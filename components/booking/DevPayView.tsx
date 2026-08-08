"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * DEVELOPMENT-MODE payment screen. Shown only when Stripe keys aren't
 * configured. It never represents a real charge — it just simulates the
 * webhook so the flow is testable end to end.
 */
export default function DevPayView() {
  const params = useSearchParams();
  const router = useRouter();
  const session = params.get("session");
  const c = params.get("c");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pay = async () => {
    if (!session) return;
    setWorking(true);
    setError(null);
    const res = await fetch("/api/booking/dev-pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session }),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      router.push(`/book/confirmation?c=${encodeURIComponent(data.confirmationNumber ?? c ?? "")}`);
    } else {
      setWorking(false);
      setError(data.error ?? "Could not complete the simulated payment.");
    }
  };

  return (
    <div className="max-w-lg">
      <div className="rounded-2xl border border-dashed border-sage bg-sand/50 px-4 py-2 text-center text-[0.72rem] tracking-[0.1em] text-gray uppercase">
        Development mode · no real payment
      </div>

      <h1 className="type-chapter mt-8">Deposit checkout</h1>
      <p className="measure mt-5 text-[0.95rem] text-gray">
        Stripe isn’t configured in this environment, so this stands in for the secure Stripe checkout page. Nothing is charged.
        Confirming here simulates a successful deposit and books your appointment.
      </p>

      {error && <p className="mt-6 text-[0.9rem] text-[#a1584e]">{error}</p>}

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={pay}
          disabled={working || !session}
          className="inline-flex items-center justify-center rounded-full bg-ink px-8 py-4 text-[0.8rem] tracking-[0.06em] text-paper transition-all duration-500 hover:-translate-y-0.5 disabled:opacity-40"
        >
          {working ? "Confirming…" : "Simulate successful deposit"}
        </button>
        <Link href="/book?cancelled=1" className="link-center text-[0.8rem] text-gray">
          Cancel
        </Link>
      </div>
    </div>
  );
}
