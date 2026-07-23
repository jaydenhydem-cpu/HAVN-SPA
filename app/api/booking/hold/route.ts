import { NextRequest, NextResponse } from "next/server";
import { holdSchema, getFieldErrors } from "@/lib/booking/validation";
import { ANY_STAFF, type AvailableSlot } from "@/lib/booking/types";
import { sanitize, sanitizeEmail } from "@/lib/sanitize";
import { findService, findStaff, staffForService, getStaffBusy, createHold, setStatus } from "@/lib/booking/db";
import { computeSlotsForStaff } from "@/lib/booking/availability";
import { computeDeposit } from "@/lib/booking/deposit";
import { generateConfirmationNumber } from "@/lib/booking/confirmation";
import { BOOKING_CONFIG } from "@/lib/booking/config";
import { BOOKING_POLICY } from "@/lib/booking/data/policy";
import { zonedDateStr } from "@/lib/booking/time";
import { createDepositCheckout } from "@/lib/booking/stripe";
import type { AppointmentRow } from "@/lib/booking/db";

export const dynamic = "force-dynamic";
const MIN = 60_000;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = holdSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Validation failed", errors: getFieldErrors(parsed.error) }, { status: 400 });
  }
  const input = parsed.data;

  const service = findService(input.serviceId);
  if (!service) return NextResponse.json({ success: false, error: "Unknown service" }, { status: 404 });
  if (input.policyId !== BOOKING_POLICY.id) {
    return NextResponse.json({ success: false, error: "Policy version mismatch — please refresh." }, { status: 409 });
  }

  const dateStr = zonedDateStr(new Date(input.slotStartUtc));
  const now = new Date();

  // ── Server-side re-validation: recompute availability and match the slot ──
  let matched: AvailableSlot | undefined;
  const candidates =
    input.staffId === ANY_STAFF ? staffForService(input.serviceId) : ([findStaff(input.staffId)].filter(Boolean) as ReturnType<typeof findStaff>[]);

  for (const staff of candidates) {
    if (!staff || !staff.serviceIds.includes(service.id)) continue;
    const busy = await getStaffBusy(staff.id, dateStr);
    const slots = computeSlotsForStaff({ service, staff, dateStr, busy, now });
    const found = slots.find((s) => s.startUtc === input.slotStartUtc);
    if (found) {
      matched = found;
      break;
    }
  }

  if (!matched) {
    return NextResponse.json({ success: false, error: "slot_unavailable", message: "That time is no longer available — please choose another." }, { status: 409 });
  }

  // ── Build the appointment ──
  const deposit = computeDeposit(service);
  const id = crypto.randomUUID();
  const confirmationNumber = generateConfirmationNumber();
  const blockStart = new Date(new Date(matched.startUtc).getTime() - service.bufferBeforeMinutes * MIN).toISOString();
  const blockEnd = new Date(new Date(matched.endUtc).getTime() + service.bufferAfterMinutes * MIN).toISOString();
  const noDeposit = deposit.depositCents <= 0;

  // Payment first (so the session id is stored on the single atomic insert).
  // No deposit → confirm straight away; no Stripe involved.
  let checkoutUrl = `/book/confirmation?c=${encodeURIComponent(confirmationNumber)}`;
  let sessionId: string | null = null;
  let paymentMode: "stripe" | "dev" | "none" = "none";

  if (!noDeposit) {
    try {
      const checkout = await createDepositCheckout({
        amountCents: deposit.depositCents,
        serviceName: service.name,
        appointmentId: id,
        confirmationNumber,
        customerEmail: sanitizeEmail(input.email),
        successUrl: `${request.nextUrl.origin}/book/confirmation?c=${encodeURIComponent(confirmationNumber)}`,
        cancelUrl: `${request.nextUrl.origin}/book?cancelled=1`,
      });
      checkoutUrl = checkout.url;
      sessionId = checkout.sessionId;
      paymentMode = checkout.mode;
    } catch (err) {
      console.error("[booking] checkout error:", err);
      return NextResponse.json({ success: false, error: "Could not start payment — please try again." }, { status: 502 });
    }
  }

  const row: Omit<AppointmentRow, "created_at" | "updated_at"> = {
    id,
    confirmation_number: confirmationNumber,
    service_id: service.id,
    staff_id: matched.staffId,
    customer_first_name: sanitize(input.firstName),
    customer_last_name: sanitize(input.lastName),
    customer_email: sanitizeEmail(input.email),
    customer_phone: sanitize(input.phone),
    customer_notes: input.notes ? sanitize(input.notes) : null,
    starts_at: matched.startUtc,
    ends_at: matched.endUtc,
    block_starts_at: blockStart,
    block_ends_at: blockEnd,
    status: noDeposit ? "confirmed" : "pending_payment",
    service_price_cents: deposit.servicePriceCents,
    deposit_amount_cents: deposit.depositCents,
    remaining_balance_cents: deposit.remainingCents,
    stripe_checkout_session_id: sessionId,
    stripe_payment_intent_id: null,
    policy_id: BOOKING_POLICY.id,
    policy_accepted_at: new Date().toISOString(),
    hold_expires_at: noDeposit ? null : new Date(Date.now() + BOOKING_CONFIG.holdMinutes * MIN).toISOString(),
  };

  const result = await createHold(row);
  if (!result.ok) {
    const status = result.reason === "slot_taken" ? 409 : 500;
    return NextResponse.json({ success: false, error: result.reason, message: result.message }, { status });
  }

  // Safety: no-deposit bookings are already confirmed above.
  if (noDeposit) await setStatus(id, "confirmed");

  return NextResponse.json({
    success: true,
    confirmationNumber,
    checkoutUrl,
    paymentMode,
    depositCents: deposit.depositCents,
  });
}
