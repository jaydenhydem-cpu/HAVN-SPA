import { NextResponse } from "next/server";
import { listServices, staffForService } from "@/lib/booking/db";
import { STAFF } from "@/lib/booking/data/catalog";
import { BOOKING_POLICY } from "@/lib/booking/data/policy";
import { BOOKING_CONFIG } from "@/lib/booking/config";
import { computeDeposit } from "@/lib/booking/deposit";

export const dynamic = "force-dynamic";

/**
 * Catalog for the booking flow: active services (with deposit breakdown and
 * qualified staff ids), safe staff profiles + schedules (for client-side date
 * disabling only — times are still computed server-side), and the active policy.
 */
export async function GET() {
  const services = listServices().map((s) => ({
    ...s,
    deposit: computeDeposit(s),
  }));

  // Safe staff serialization — all fields here are public-facing.
  const staff = STAFF.filter((s) => s.active).map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    title: s.title,
    bio: s.bio,
    imageUrl: s.imageUrl,
    specialties: s.specialties,
    yearsExperience: s.yearsExperience ?? null,
    serviceIds: s.serviceIds,
    // schedule shape the client uses to grey out non-working days
    workdays: [...new Set(s.availability.map((w) => w.dayOfWeek))],
    timeOff: s.timeOff.map((t) => ({ startsAt: t.startsAt, endsAt: t.endsAt })),
    minNoticeMinutes: s.minNoticeMinutes ?? BOOKING_CONFIG.minNoticeMinutes,
    maxAdvanceDays: s.maxAdvanceDays ?? BOOKING_CONFIG.maxAdvanceDays,
  }));

  return NextResponse.json({
    services,
    staff,
    policy: { id: BOOKING_POLICY.id, title: BOOKING_POLICY.title, summary: BOOKING_POLICY.summary, fullText: BOOKING_POLICY.fullText, version: BOOKING_POLICY.version },
    config: {
      timezone: BOOKING_CONFIG.timezone,
      maxAdvanceDays: BOOKING_CONFIG.maxAdvanceDays,
      minNoticeMinutes: BOOKING_CONFIG.minNoticeMinutes,
      slotIntervalMinutes: BOOKING_CONFIG.slotIntervalMinutes,
    },
    // Which staff can perform each service (mirror of service.staffIds, handy client-side)
    staffByService: Object.fromEntries(
      listServices().map((svc) => [svc.id, staffForService(svc.id).map((st) => st.id)])
    ),
  });
}
