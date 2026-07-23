import "server-only";
import { supabaseAdmin } from "@/lib/supabase";
import type { BookingStatus, BusyInterval, Service, Staff } from "@/lib/booking/types";
import { getService, getStaffMember, getStaffForService, activeServices } from "@/lib/booking/data/catalog";
import { zonedDateStr } from "@/lib/booking/time";

/**
 * Data-access layer for the staff booking system.
 *
 * Catalog (services, staff, schedules, policy) is config-as-code (see
 * lib/booking/data/*) — that is the source of truth for scheduling logic, and
 * the SQL tables mirror it for future admin management.
 *
 * Appointments are the dynamic, sensitive data: persisted in Supabase table
 * `appointments` (named to coexist with the legacy `bookings` table), protected
 * by RLS, with an exclusion constraint that makes double-booking impossible.
 *
 * DEV FALLBACK: if the `appointments` table doesn't exist yet (migration not
 * applied) or Supabase isn't configured, we use an in-memory store so the flow
 * is testable locally. This is clearly labelled and NOT persistent.
 */

const ACTIVE_STATUSES: BookingStatus[] = ["pending_payment", "confirmed"];

export interface AppointmentRow {
  id: string;
  confirmation_number: string;
  service_id: string;
  staff_id: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  customer_notes: string | null;
  starts_at: string;
  ends_at: string;
  block_starts_at: string;
  block_ends_at: string;
  status: BookingStatus;
  service_price_cents: number;
  deposit_amount_cents: number;
  remaining_balance_cents: number;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  policy_id: string;
  policy_accepted_at: string;
  hold_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

// ── mode detection (cached) ────────────────────────────────────────────
let modePromise: Promise<"supabase" | "memory"> | null = null;

async function dbMode(): Promise<"supabase" | "memory"> {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return "memory";
  if (!modePromise) {
    modePromise = (async () => {
      const { error } = await supabaseAdmin.from("appointments").select("id").limit(1);
      if (error && /relation|does not exist|schema cache|PGRST205|42P01/i.test(`${error.code} ${error.message}`)) {
        console.warn("[booking] DEV MODE — `appointments` table not found; using in-memory store. Apply supabase/migrations to persist.");
        return "memory";
      }
      return "supabase";
    })();
  }
  return modePromise;
}

// ── in-memory dev store ────────────────────────────────────────────────
const memoryStore: AppointmentRow[] = [];

function memoryActiveFor(staffId: string): AppointmentRow[] {
  const now = Date.now();
  return memoryStore.filter(
    (a) =>
      a.staff_id === staffId &&
      (a.status === "confirmed" ||
        (a.status === "pending_payment" && a.hold_expires_at != null && new Date(a.hold_expires_at).getTime() > now))
  );
}

// ── catalog reads (config-as-code) ─────────────────────────────────────
export const listServices = (): Service[] => activeServices();
export const findService = (id: string): Service | undefined => getService(id);
export const findStaff = (id: string): Staff | undefined => getStaffMember(id);
export const staffForService = (serviceId: string): Staff[] => getStaffForService(serviceId);

// ── availability inputs ────────────────────────────────────────────────
/** Occupied intervals (buffers included) for a staff member on a business-tz date. */
export async function getStaffBusy(staffId: string, dateStr: string): Promise<BusyInterval[]> {
  const mode = await dbMode();

  if (mode === "memory") {
    return memoryActiveFor(staffId)
      .filter((a) => zonedDateStr(new Date(a.block_starts_at)) === dateStr)
      .map((a) => ({ startUtc: a.block_starts_at, endUtc: a.block_ends_at }));
  }

  // Fetch active appointments for this staff whose block touches the date.
  // We over-fetch a ±1 day window and filter by ET calendar date.
  const dayStart = new Date(`${dateStr}T00:00:00Z`).getTime();
  const lo = new Date(dayStart - 24 * 3600_000).toISOString();
  const hi = new Date(dayStart + 48 * 3600_000).toISOString();
  const nowIso = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("appointments")
    .select("block_starts_at, block_ends_at, status, hold_expires_at")
    .eq("staff_id", staffId)
    .in("status", ACTIVE_STATUSES)
    .gte("block_starts_at", lo)
    .lte("block_starts_at", hi);

  if (error) {
    console.error("[booking] getStaffBusy error:", error.message);
    return [];
  }
  return (data ?? [])
    .filter((r) => r.status === "confirmed" || (r.hold_expires_at && r.hold_expires_at > nowIso))
    .filter((r) => zonedDateStr(new Date(r.block_starts_at)) === dateStr)
    .map((r) => ({ startUtc: r.block_starts_at, endUtc: r.block_ends_at }));
}

// ── create hold (atomic) ───────────────────────────────────────────────
export type CreateHoldResult =
  | { ok: true; appointment: AppointmentRow }
  | { ok: false; reason: "slot_taken" | "error"; message: string };

export async function createHold(row: Omit<AppointmentRow, "created_at" | "updated_at">): Promise<CreateHoldResult> {
  const mode = await dbMode();

  if (mode === "memory") {
    // Single-threaded synchronous critical section — no awaits between check
    // and insert, so two interleaved requests cannot both pass.
    const s = new Date(row.block_starts_at).getTime();
    const e = new Date(row.block_ends_at).getTime();
    const clash = memoryActiveFor(row.staff_id).some((a) => {
      const as = new Date(a.block_starts_at).getTime();
      const ae = new Date(a.block_ends_at).getTime();
      return s < ae && as < e;
    });
    if (clash) return { ok: false, reason: "slot_taken", message: "That time was just taken." };
    const full: AppointmentRow = { ...row, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    memoryStore.push(full);
    return { ok: true, appointment: full };
  }

  const { data, error } = await supabaseAdmin.from("appointments").insert(row).select("*").single();
  if (error) {
    // 23P01 = exclusion_violation (our anti-double-book gist constraint)
    if (error.code === "23P01" || /exclusion|overlap/i.test(error.message)) {
      return { ok: false, reason: "slot_taken", message: "That time was just taken." };
    }
    console.error("[booking] createHold error:", error.message);
    return { ok: false, reason: "error", message: "Could not hold that appointment." };
  }
  return { ok: true, appointment: data as AppointmentRow };
}

// ── status transitions ─────────────────────────────────────────────────
export async function markConfirmedBySession(sessionId: string, paymentIntentId: string | null): Promise<AppointmentRow | null> {
  const mode = await dbMode();
  if (mode === "memory") {
    const appt = memoryStore.find((a) => a.stripe_checkout_session_id === sessionId);
    if (!appt) return null;
    if (appt.status === "pending_payment") {
      appt.status = "confirmed";
      appt.stripe_payment_intent_id = paymentIntentId;
      appt.hold_expires_at = null;
      appt.updated_at = new Date().toISOString();
    }
    return appt;
  }
  const { data, error } = await supabaseAdmin
    .from("appointments")
    .update({ status: "confirmed", stripe_payment_intent_id: paymentIntentId, hold_expires_at: null })
    .eq("stripe_checkout_session_id", sessionId)
    .eq("status", "pending_payment")
    .select("*")
    .maybeSingle();
  if (error) console.error("[booking] markConfirmed error:", error.message);
  return (data as AppointmentRow) ?? null;
}

export async function setStatus(id: string, status: BookingStatus): Promise<void> {
  const mode = await dbMode();
  if (mode === "memory") {
    const appt = memoryStore.find((a) => a.id === id);
    if (appt) {
      appt.status = status;
      appt.updated_at = new Date().toISOString();
    }
    return;
  }
  const { error } = await supabaseAdmin.from("appointments").update({ status }).eq("id", id);
  if (error) console.error("[booking] setStatus error:", error.message);
}

export async function getByConfirmation(confirmationNumber: string): Promise<AppointmentRow | null> {
  const mode = await dbMode();
  if (mode === "memory") {
    return memoryStore.find((a) => a.confirmation_number === confirmationNumber) ?? null;
  }
  const { data } = await supabaseAdmin.from("appointments").select("*").eq("confirmation_number", confirmationNumber).maybeSingle();
  return (data as AppointmentRow) ?? null;
}

export async function getById(id: string): Promise<AppointmentRow | null> {
  const mode = await dbMode();
  if (mode === "memory") return memoryStore.find((a) => a.id === id) ?? null;
  const { data } = await supabaseAdmin.from("appointments").select("*").eq("id", id).maybeSingle();
  return (data as AppointmentRow) ?? null;
}

/** Housekeeping: expire pending holds whose 10-minute window has passed. */
export async function expireStaleHolds(): Promise<number> {
  const mode = await dbMode();
  const nowIso = new Date().toISOString();
  if (mode === "memory") {
    let n = 0;
    for (const a of memoryStore) {
      if (a.status === "pending_payment" && a.hold_expires_at && a.hold_expires_at < nowIso) {
        a.status = "expired";
        n++;
      }
    }
    return n;
  }
  const { data, error } = await supabaseAdmin
    .from("appointments")
    .update({ status: "expired" })
    .eq("status", "pending_payment")
    .lt("hold_expires_at", nowIso)
    .select("id");
  if (error) console.error("[booking] expireStaleHolds error:", error.message);
  return data?.length ?? 0;
}

/** Admin: most-recent appointments (all statuses). */
export async function listAppointments(limit = 100): Promise<AppointmentRow[]> {
  const mode = await dbMode();
  if (mode === "memory") {
    return [...memoryStore].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, limit);
  }
  const { data, error } = await supabaseAdmin
    .from("appointments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[booking] listAppointments error:", error.message);
    return [];
  }
  return (data ?? []) as AppointmentRow[];
}

export async function currentMode(): Promise<"supabase" | "memory"> {
  return dbMode();
}
