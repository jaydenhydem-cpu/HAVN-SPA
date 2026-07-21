import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { LOCATIONS } from "@/lib/site";

const STUDIO_CITIES = LOCATIONS.map((l) => l.city);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Which time slots are already taken for a given studio + date. */
export async function GET(request: NextRequest) {
  const studio = request.nextUrl.searchParams.get("studio") ?? "";
  const date = request.nextUrl.searchParams.get("date") ?? "";

  if (!STUDIO_CITIES.includes(studio) || !DATE_RE.test(date)) {
    return NextResponse.json({ success: false, error: "Invalid studio or date" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("time")
    .eq("studio", studio)
    .eq("date", date);

  if (error) {
    console.error("availability API error:", error);
    return NextResponse.json({ success: false, error: "Could not load availability" }, { status: 500 });
  }

  return NextResponse.json({ success: true, taken: data.map((row) => row.time) });
}
