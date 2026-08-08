import { BOOKING_CONFIG } from "@/lib/booking/config";

/**
 * Timezone helpers for the business timezone (America/New_York) without a
 * third-party tz library. We use Intl to read the zone's UTC offset for a
 * given instant, which handles DST correctly.
 *
 * Convention: the DB stores UTC. Staff hours/breaks are wall-clock strings in
 * the business tz. These helpers bridge the two.
 */
const TZ = BOOKING_CONFIG.timezone;

/** The tz's offset from UTC, in minutes, at a given instant (e.g. -240 EDT). */
export function tzOffsetMinutes(instant: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = dtf.formatToParts(instant);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  let hour = get("hour");
  if (hour === 24) hour = 0; // some engines emit 24 for midnight
  const asUTC = Date.UTC(get("year"), get("month") - 1, get("day"), hour, get("minute"), get("second"));
  return Math.round((asUTC - instant.getTime()) / 60000);
}

/**
 * Convert a wall-clock date + "HH:MM" in the business tz to a UTC Date.
 * Two-pass to be correct across DST boundaries.
 */
export function zonedToUtc(dateStr: string, timeStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  const naiveUtc = Date.UTC(y, m - 1, d, hh, mm, 0);
  const off1 = tzOffsetMinutes(new Date(naiveUtc));
  const guess = new Date(naiveUtc - off1 * 60000);
  const off2 = tzOffsetMinutes(guess);
  if (off2 === off1) return guess;
  return new Date(naiveUtc - off2 * 60000);
}

/** Wall-clock parts of an instant, in the business tz. */
export function utcToZonedParts(instant: Date): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: number; // 0 = Sunday
  dateStr: string; // YYYY-MM-DD
  timeStr: string; // HH:MM
} {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short",
  });
  const parts = dtf.formatToParts(instant);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const year = Number(get("year"));
  const month = Number(get("month"));
  const day = Number(get("day"));
  let hour = Number(get("hour"));
  if (hour === 24) hour = 0;
  const minute = Number(get("minute"));
  const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const weekday = weekdayMap[get("weekday")] ?? 0;
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    year,
    month,
    day,
    hour,
    minute,
    weekday,
    dateStr: `${year}-${pad(month)}-${pad(day)}`,
    timeStr: `${pad(hour)}:${pad(minute)}`,
  };
}

/** "YYYY-MM-DD" (business tz) for an instant. */
export const zonedDateStr = (instant: Date): string => utcToZonedParts(instant).dateStr;

/** Weekday (0–6, business tz) for a "YYYY-MM-DD" date. */
export function weekdayForDate(dateStr: string): number {
  // noon avoids any DST edge at midnight
  return utcToZonedParts(zonedToUtc(dateStr, "12:00")).weekday;
}

/** "2:30 PM" style label for an instant, in the business tz. */
export function formatTimeLabel(instant: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(instant);
}

/** "Friday, August 14, 2026" style label, business tz. */
export function formatDateLabel(instant: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(instant);
}

/** minutes since midnight for "HH:MM". */
export const minutesOfDay = (timeStr: string): number => {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

/** Bucket a business-tz "HH:MM" into a day period. */
export function periodOf(timeStr: string): "morning" | "afternoon" | "evening" {
  const mins = minutesOfDay(timeStr);
  if (mins < 12 * 60) return "morning";
  if (mins < 17 * 60) return "afternoon";
  return "evening";
}
