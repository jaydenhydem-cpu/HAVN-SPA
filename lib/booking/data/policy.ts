import type { BookingPolicy } from "@/lib/booking/types";

/**
 * Booking & cancellation policy as editable DATA (not buried in a component).
 * TEMPORARY copy — not legal advice, not HAVN's final approved language.
 * Replace `fullText`/`summary` with the business's language and bump `version`
 * (each booking stores the version + acceptance timestamp).
 */
export const BOOKING_POLICY: BookingPolicy = {
  id: "policy-2026-01",
  title: "HAVN booking & cancellation policy",
  version: "2026-01",
  active: true,
  summary:
    "A deposit reserves your appointment and is applied toward your service. Deposits are non-refundable for changes made less than 24 hours ahead. Arriving more than 15 minutes late may shorten your service.",
  fullText: [
    "A deposit is required to reserve your appointment. Your deposit is applied toward the final cost of your service.",
    "Deposits are non-refundable for cancellations or rescheduling made less than 24 hours before the appointment.",
    "Guests arriving more than 15 minutes late may receive a shortened service or may need to reschedule.",
    "Missed appointments may forfeit the deposit.",
  ].join("\n\n"),
};
