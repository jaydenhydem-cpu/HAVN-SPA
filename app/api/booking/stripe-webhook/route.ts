import { NextRequest, NextResponse } from "next/server";
import { verifyStripeSignature } from "@/lib/booking/stripe";
import { markConfirmedBySession, setStatus } from "@/lib/booking/db";

// Webhook needs the raw body + Node crypto — force the Node.js runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook — the ONLY thing that flips a booking to `confirmed`.
 * The success-page redirect is never trusted as proof of payment.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[booking] STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const rawBody = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!verifyStripeSignature(rawBody, sig, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { type: string; data: { object: Record<string, unknown> } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as { id: string; payment_intent?: string; payment_status?: string };
      if (session.payment_status === "paid" || session.payment_status === undefined) {
        await markConfirmedBySession(session.id, session.payment_intent ?? null);
      }
    } else if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object as { metadata?: { appointment_id?: string } };
      const apptId = intent.metadata?.appointment_id;
      if (apptId) await setStatus(apptId, "payment_failed");
    }
  } catch (err) {
    console.error("[booking] webhook handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
