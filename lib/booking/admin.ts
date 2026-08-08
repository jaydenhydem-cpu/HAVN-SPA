import "server-only";
import type { BookingStatus } from "@/lib/booking/types";
import { listAppointments, setStatus, findService, findStaff, type AppointmentRow } from "@/lib/booking/db";

/**
 * Admin-ready data layer. The customer booking experience is the priority; this
 * is the clean seam a fuller admin dashboard can grow from.
 *
 * IMPLEMENTED (works against the appointments store, memory or Supabase):
 *   - list bookings, cancel, mark completed / no-show, change status
 *
 * CONFIG-AS-CODE FOR NOW (edit the seed files, then reseed):
 *   - staff, schedules, service↔staff assignments → lib/booking/data/staff.ts
 *   - deposit rules / services                    → lib/booking/data/services.ts
 *   - policy                                      → lib/booking/data/policy.ts
 * The matching SQL tables exist (supabase/migrations) so these can migrate to
 * DB-backed admin editing without changing the read APIs.
 */

/** Constant-time-ish admin gate. Replace with real auth before production. */
export function isAdminToken(token: string | null | undefined): boolean {
  const expected = process.env.ADMIN_TOKEN;
  return Boolean(expected) && token === expected;
}

export interface AdminBooking {
  id: string;
  confirmationNumber: string;
  status: BookingStatus;
  serviceName: string;
  staffName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startsAt: string;
  depositCents: number;
  remainingCents: number;
  createdAt: string;
}

function toAdminBooking(a: AppointmentRow): AdminBooking {
  return {
    id: a.id,
    confirmationNumber: a.confirmation_number,
    status: a.status,
    serviceName: findService(a.service_id)?.name ?? a.service_id,
    staffName: findStaff(a.staff_id)?.name ?? a.staff_id,
    customerName: `${a.customer_first_name} ${a.customer_last_name}`.trim(),
    customerEmail: a.customer_email,
    customerPhone: a.customer_phone,
    startsAt: a.starts_at,
    depositCents: a.deposit_amount_cents,
    remainingCents: a.remaining_balance_cents,
    createdAt: a.created_at,
  };
}

export async function listBookingsForAdmin(limit = 100): Promise<AdminBooking[]> {
  const rows = await listAppointments(limit);
  return rows.map(toAdminBooking);
}

const ADMIN_STATUSES: BookingStatus[] = ["cancelled", "completed", "no_show", "confirmed"];

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<{ ok: boolean; error?: string }> {
  if (!ADMIN_STATUSES.includes(status)) return { ok: false, error: "Unsupported status" };
  await setStatus(id, status);
  return { ok: true };
}
