import "server-only";
import crypto from "node:crypto";

/**
 * Minimal Stripe integration over the REST API (via fetch) so we add NO new
 * npm dependency. Real Stripe Checkout is used when STRIPE_SECRET_KEY is set;
 * otherwise a clearly-labelled DEV payment mode is used. Dev mode never claims
 * a real charge occurred — it routes through an obvious /dev-pay endpoint.
 *
 * Card data is never handled here: Stripe Checkout collects it on Stripe's
 * hosted page. We only ever see session/payment-intent IDs.
 */
const STRIPE_API = "https://api.stripe.com/v1";

export const isStripeConfigured = (): boolean => Boolean(process.env.STRIPE_SECRET_KEY);

export interface CheckoutResult {
  mode: "stripe" | "dev";
  sessionId: string;
  url: string;
}

export async function createDepositCheckout(input: {
  amountCents: number;
  serviceName: string;
  appointmentId: string;
  confirmationNumber: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<CheckoutResult> {
  if (!isStripeConfigured()) {
    // DEV MODE — no real payment. The session id is obviously fake, and the
    // "checkout" is our labelled dev-pay screen.
    const sessionId = `dev_sess_${crypto.randomBytes(12).toString("hex")}`;
    const url =
      `/book/dev-pay?session=${encodeURIComponent(sessionId)}` +
      `&appt=${encodeURIComponent(input.appointmentId)}` +
      `&c=${encodeURIComponent(input.confirmationNumber)}`;
    return { mode: "dev", sessionId, url };
  }

  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("success_url", input.successUrl);
  form.set("cancel_url", input.cancelUrl);
  form.set("customer_email", input.customerEmail);
  form.set("client_reference_id", input.appointmentId);
  form.set("metadata[appointment_id]", input.appointmentId);
  form.set("metadata[confirmation_number]", input.confirmationNumber);
  form.set("payment_intent_data[metadata][appointment_id]", input.appointmentId);
  form.set("line_items[0][quantity]", "1");
  form.set("line_items[0][price_data][currency]", "usd");
  form.set("line_items[0][price_data][unit_amount]", String(input.amountCents));
  form.set("line_items[0][price_data][product_data][name]", `Deposit — ${input.serviceName}`);
  form.set("line_items[0][price_data][product_data][description]", "Applied toward your service total at HAVN.");

  const res = await fetch(`${STRIPE_API}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Stripe checkout failed: ${data?.error?.message ?? res.status}`);
  }
  return { mode: "stripe", sessionId: data.id, url: data.url };
}

/**
 * Verify a Stripe webhook signature without the SDK. Implements Stripe's
 * scheme: header `t=<ts>,v1=<sig>`; signed payload is `${t}.${rawBody}`;
 * HMAC-SHA256 with the webhook secret; constant-time compare.
 */
export function verifyStripeSignature(rawBody: string, sigHeader: string | null, secret: string): boolean {
  if (!sigHeader) return false;
  const parts = Object.fromEntries(sigHeader.split(",").map((kv) => kv.split("=") as [string, string]));
  const t = parts["t"];
  const v1 = parts["v1"];
  if (!t || !v1) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(expected));
  } catch {
    return false;
  }
}
