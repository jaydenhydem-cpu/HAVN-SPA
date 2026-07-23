import type { AvailableSlot, DepositBreakdown, Service } from "@/lib/booking/types";
import { utcToZonedParts, weekdayForDate } from "@/lib/booking/time";

/**
 * Client-side data access + small pure helpers for the booking UI.
 * No secrets here — everything goes through the public /api/booking routes.
 */

export type ServiceView = Service & { deposit: DepositBreakdown };

export interface StaffView {
  id: string;
  slug: string;
  name: string;
  title: string;
  bio: string;
  imageUrl: string;
  specialties: string[];
  yearsExperience: number | null;
  serviceIds: string[];
  workdays: number[];
  timeOff: { startsAt: string; endsAt: string }[];
  minNoticeMinutes: number;
  maxAdvanceDays: number;
}

export interface CatalogResponse {
  services: ServiceView[];
  staff: StaffView[];
  policy: { id: string; title: string; summary: string; fullText: string; version: string };
  config: { timezone: string; maxAdvanceDays: number; minNoticeMinutes: number; slotIntervalMinutes: number };
  staffByService: Record<string, string[]>;
}

export async function getCatalog(): Promise<CatalogResponse> {
  const res = await fetch("/api/booking/services", { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load the booking catalog.");
  return res.json();
}

export async function getAvailability(serviceId: string, staffId: string, date: string): Promise<AvailableSlot[]> {
  const params = new URLSearchParams({ serviceId, staffId, date });
  const res = await fetch(`/api/booking/availability?${params}`, { cache: "no-store" });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data?.error ?? "Could not load times.");
  return data.slots as AvailableSlot[];
}

export interface HoldPayload {
  serviceId: string;
  staffId: string;
  slotStartUtc: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes?: string;
  firstTime?: boolean;
  policyId: string;
  policyAccepted: true;
}

export interface HoldResponse {
  success: boolean;
  confirmationNumber?: string;
  checkoutUrl?: string;
  paymentMode?: "stripe" | "dev" | "none";
  depositCents?: number;
  error?: string;
  message?: string;
  errors?: Record<string, string>;
}

export async function postHold(payload: HoldPayload): Promise<HoldResponse> {
  const res = await fetch("/api/booking/hold", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return { ...data, success: res.ok && data.success };
}

// ── date helpers (business-tz aware, isomorphic) ──────────────────────────
/** Today's date string in the business timezone. */
export function businessToday(): string {
  return utcToZonedParts(new Date()).dateStr;
}

/** Add N days to a YYYY-MM-DD date string (calendar math, tz-agnostic). */
export function addDays(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}

/**
 * Coarse client-side date gate: is this date worth showing as selectable?
 * (Actual time availability is always fetched server-side on selection.)
 * A date is selectable when at least one of the given staff works that weekday,
 * the date is within [today, maxAdvance], and it isn't entirely inside a
 * staff member's time-off.
 */
export function isDateSelectable(dateStr: string, staff: StaffView[]): boolean {
  const today = businessToday();
  if (dateStr < today) return false;
  const weekday = weekdayForDate(dateStr);
  return staff.some((s) => {
    if (dateStr > addDays(today, s.maxAdvanceDays)) return false;
    if (!s.workdays.includes(weekday)) return false;
    const dayStart = Date.parse(`${dateStr}T00:00:00Z`);
    const dayEnd = dayStart + 24 * 3600_000;
    const fullyOff = s.timeOff.some((t) => Date.parse(t.startsAt) <= dayStart && Date.parse(t.endsAt) >= dayEnd);
    return !fullyOff;
  });
}
