/**
 * Business-wide booking configuration. One place to tune scheduling behavior.
 * Per-staff overrides (minNotice / maxAdvance) live on the staff records.
 */
export const BOOKING_CONFIG = {
  /** All wall-clock times (staff hours, breaks, slot labels) are this tz. */
  timezone: "America/New_York" as const,

  /** Candidate start times are generated every N minutes. */
  slotIntervalMinutes: 15,

  /** Earliest a guest may book from "now". */
  minNoticeMinutes: 120,

  /** Furthest ahead a guest may book. */
  maxAdvanceDays: 60,

  /** A pending_payment hold survives this long before it auto-expires. */
  holdMinutes: 10,

  /** Where the appointment happens (shown on the confirmation). */
  location: {
    name: "HAVN — Aventura",
    address: ["2980 NE 207th Street", "Aventura, FL 33180"],
    arrivalNote:
      "Please arrive ten minutes early so we can settle you in. Street parking and the building garage are both available; take the elevator to the second floor.",
  },
} as const;

export type BookingConfig = typeof BOOKING_CONFIG;
