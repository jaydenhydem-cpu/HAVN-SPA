import { NextRequest, NextResponse } from "next/server";
import { availabilityQuerySchema } from "@/lib/booking/validation";
import { ANY_STAFF } from "@/lib/booking/types";
import { findService, findStaff, staffForService, getStaffBusy, expireStaleHolds } from "@/lib/booking/db";
import { computeSlotsForStaff, mergeAnyStaffSlots } from "@/lib/booking/availability";

export const dynamic = "force-dynamic";

/**
 * Server-computed availability for a service + staff (or ANY) on a date.
 * The browser never decides what's bookable. Stale holds are expired first so
 * abandoned slots reappear.
 */
export async function GET(request: NextRequest) {
  const q = availabilityQuerySchema.safeParse({
    serviceId: request.nextUrl.searchParams.get("serviceId"),
    staffId: request.nextUrl.searchParams.get("staffId"),
    date: request.nextUrl.searchParams.get("date"),
  });
  if (!q.success) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
  const { serviceId, staffId, date } = q.data;

  const service = findService(serviceId);
  if (!service) return NextResponse.json({ success: false, error: "Unknown service" }, { status: 404 });

  await expireStaleHolds();

  const now = new Date();

  if (staffId === ANY_STAFF) {
    const qualified = staffForService(serviceId);
    const perStaff = await Promise.all(
      qualified.map(async (staff) => {
        const busy = await getStaffBusy(staff.id, date);
        return computeSlotsForStaff({ service, staff, dateStr: date, busy, now });
      })
    );
    return NextResponse.json({ success: true, slots: mergeAnyStaffSlots(perStaff) });
  }

  const staff = findStaff(staffId);
  if (!staff || !staff.serviceIds.includes(serviceId)) {
    return NextResponse.json({ success: false, error: "Staff unavailable for this service" }, { status: 404 });
  }
  const busy = await getStaffBusy(staff.id, date);
  const slots = computeSlotsForStaff({ service, staff, dateStr: date, busy, now });
  return NextResponse.json({ success: true, slots });
}
