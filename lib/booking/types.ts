/**
 * Shared booking-domain types. Used by both server (engine, API, DB) and
 * client (UI). Keep this the single source of truth for shapes — no duplicate
 * definitions elsewhere.
 */

export type DepositType = "fixed" | "percent" | "none";

/** The lifecycle of an appointment. */
export type BookingStatus =
  | "pending_payment"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show"
  | "payment_failed"
  | "expired";

/** 0 = Sunday … 6 = Saturday (JS getDay convention, in business timezone). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Service {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  priceCents: number;
  durationMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  depositType: DepositType;
  /** dollars for "fixed", 0–100 for "percent", ignored for "none" */
  depositValue: number;
  /** staff ids qualified to perform this service */
  staffIds: string[];
  active: boolean;
}

/** A recurring working window for one weekday, wall-clock in business tz. */
export interface WorkWindow {
  dayOfWeek: Weekday;
  /** "HH:MM" 24h, business timezone */
  start: string;
  end: string;
}

/** A recurring daily break, wall-clock in business tz. */
export interface WorkBreak {
  dayOfWeek: Weekday;
  start: string;
  end: string;
}

/** A one-off unavailable range (vacation, blocked time), stored as ISO UTC. */
export interface TimeOff {
  startsAt: string; // ISO UTC
  endsAt: string; // ISO UTC
  reason?: string;
}

export interface Staff {
  id: string;
  slug: string;
  name: string;
  title: string;
  bio: string;
  imageUrl: string;
  specialties: string[];
  yearsExperience?: number;
  /** service ids this specialist performs */
  serviceIds: string[];
  active: boolean;
  availability: WorkWindow[];
  breaks: WorkBreak[];
  timeOff: TimeOff[];
  /** overrides business defaults when present */
  minNoticeMinutes?: number;
  maxAdvanceDays?: number;
}

export interface BookingPolicy {
  id: string;
  title: string;
  summary: string;
  fullText: string;
  version: string;
  active: boolean;
}

/** A computed, bookable slot for a specific staff member. */
export interface AvailableSlot {
  /** ISO UTC instant of the service start */
  startUtc: string;
  /** ISO UTC instant of the service end (excludes buffers) */
  endUtc: string;
  staffId: string;
  staffName: string;
  /** display label in business tz, e.g. "2:30 PM" */
  label: string;
  /** "HH:MM" business tz, for grouping/sorting */
  localTime: string;
  period: "morning" | "afternoon" | "evening";
}

/** An interval that occupies a staff member's calendar (includes buffers). */
export interface BusyInterval {
  startUtc: string;
  endUtc: string;
}

/** Deposit breakdown for a service price. */
export interface DepositBreakdown {
  servicePriceCents: number;
  depositCents: number;
  remainingCents: number;
  label: string; // e.g. "20%" or "$40" or "No deposit"
}

/** The client's in-progress selection, persisted across steps. */
export interface BookingDraft {
  serviceId: string | null;
  staffId: string | null; // "any" is stored as the literal ANY_STAFF sentinel
  /** ISO date "YYYY-MM-DD" in business tz */
  date: string | null;
  /** chosen slot start (ISO UTC) */
  slotStartUtc: string | null;
  /** resolved staff for the chosen slot (matters when "any" was picked) */
  resolvedStaffId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
  firstTime: boolean;
  policyAccepted: boolean;
}

export const ANY_STAFF = "any" as const;

/** Structured confirmation payload — safe to hand to email/SMS later. */
export interface ConfirmationData {
  confirmationNumber: string;
  serviceName: string;
  staffName: string;
  startUtc: string;
  /** pre-formatted business-tz strings for display + messaging */
  dateLabel: string;
  timeLabel: string;
  durationMinutes: number;
  servicePriceCents: number;
  depositPaidCents: number;
  remainingCents: number;
  locationName: string;
  locationAddress: string[];
  arrivalNote: string;
  status: BookingStatus;
}
