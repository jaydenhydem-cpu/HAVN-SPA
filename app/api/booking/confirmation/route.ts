import { NextRequest, NextResponse } from "next/server";
import { getByConfirmation, findService, findStaff } from "@/lib/booking/db";
import { buildConfirmationData } from "@/lib/booking/confirmation";

export const dynamic = "force-dynamic";

/**
 * Look up a booking by its (unguessable) confirmation number and return only
 * safe, display-ready fields. Reflects the DB status — the page shows
 * "finalizing" until the webhook has confirmed payment.
 */
export async function GET(request: NextRequest) {
  const c = request.nextUrl.searchParams.get("c");
  if (!c) return NextResponse.json({ success: false, error: "Missing confirmation number" }, { status: 400 });

  const appt = await getByConfirmation(c);
  if (!appt) return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });

  const service = findService(appt.service_id);
  const staff = findStaff(appt.staff_id);

  const confirmation = buildConfirmationData({
    confirmationNumber: appt.confirmation_number,
    service: {
      name: service?.name ?? "Service",
      durationMinutes: service?.durationMinutes ?? 0,
      priceCents: appt.service_price_cents,
    },
    staff: { name: staff?.name ?? "Your specialist" },
    startUtc: appt.starts_at,
    depositPaidCents: appt.deposit_amount_cents,
    remainingCents: appt.remaining_balance_cents,
    status: appt.status,
  });

  return NextResponse.json({ success: true, confirmation });
}
