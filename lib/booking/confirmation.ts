import type { BookingStatus, ConfirmationData, Service, Staff } from "@/lib/booking/types";
import { BOOKING_CONFIG } from "@/lib/booking/config";
import { formatDateLabel, formatTimeLabel } from "@/lib/booking/time";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I

/** Human-friendly, hard-to-mistype confirmation code, e.g. "HAVN-7KQ4MP". */
export function generateConfirmationNumber(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  const code = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
  return `HAVN-${code}`;
}

/**
 * Structured confirmation payload. Deliberately pre-formats display strings so
 * it can be reused as-is by a future email/SMS sender without re-deriving tz.
 */
export function buildConfirmationData(input: {
  confirmationNumber: string;
  service: Pick<Service, "name" | "durationMinutes" | "priceCents">;
  staff: Pick<Staff, "name">;
  startUtc: string;
  depositPaidCents: number;
  remainingCents: number;
  status: BookingStatus;
}): ConfirmationData {
  const start = new Date(input.startUtc);
  return {
    confirmationNumber: input.confirmationNumber,
    serviceName: input.service.name,
    staffName: input.staff.name,
    startUtc: input.startUtc,
    dateLabel: formatDateLabel(start),
    timeLabel: formatTimeLabel(start),
    durationMinutes: input.service.durationMinutes,
    servicePriceCents: input.service.priceCents,
    depositPaidCents: input.depositPaidCents,
    remainingCents: input.remainingCents,
    locationName: BOOKING_CONFIG.location.name,
    locationAddress: [...BOOKING_CONFIG.location.address],
    arrivalNote: BOOKING_CONFIG.location.arrivalNote,
    status: input.status,
  };
}
