import { NextRequest, NextResponse } from "next/server";
import { isAdminToken, updateBookingStatus } from "@/lib/booking/admin";
import type { BookingStatus } from "@/lib/booking/types";

export const dynamic = "force-dynamic";

const ACTION_TO_STATUS: Record<string, BookingStatus> = {
  cancel: "cancelled",
  complete: "completed",
  no_show: "no_show",
};

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || !isAdminToken(body.token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const status = ACTION_TO_STATUS[body.action];
  if (!status || typeof body.id !== "string") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
  const result = await updateBookingStatus(body.id, status);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
