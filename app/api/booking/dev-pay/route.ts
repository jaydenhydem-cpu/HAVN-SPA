import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { isStripeConfigured } from "@/lib/booking/stripe";
import { markConfirmedBySession } from "@/lib/booking/db";

export const dynamic = "force-dynamic";

/**
 * DEVELOPMENT ONLY. Simulates the Stripe webhook confirming a paid deposit so
 * the flow is testable without Stripe keys. Refuses to run once real Stripe is
 * configured. This never represents a real charge.
 */
export async function POST(request: NextRequest) {
  if (isStripeConfigured()) {
    return NextResponse.json({ error: "Dev payment disabled — Stripe is configured." }, { status: 403 });
  }
  const { session } = await request.json().catch(() => ({ session: null }));
  if (!session || typeof session !== "string" || !session.startsWith("dev_sess_")) {
    return NextResponse.json({ error: "Invalid dev session" }, { status: 400 });
  }
  const appt = await markConfirmedBySession(session, `dev_pi_${crypto.randomBytes(8).toString("hex")}`);
  if (!appt) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  return NextResponse.json({ ok: true, confirmationNumber: appt.confirmation_number });
}
