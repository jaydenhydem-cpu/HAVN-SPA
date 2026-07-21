import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { bookingSchema, bookingTotal, getFieldErrors } from "@/lib/validation";
import { sanitizeObject } from "@/lib/sanitize";
import { supabaseAdmin } from "@/lib/supabase";
import { SITE } from "@/lib/site";

const ALLOWED_ORIGINS = [SITE.url, "http://localhost:3000"];

const corsHeaders = (origin: string): Record<string, string> =>
  ALLOWED_ORIGINS.includes(origin) ? { "Access-Control-Allow-Origin": origin } : {};

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin") ?? "";

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400, headers: corsHeaders(origin) }
      );
    }

    // Server-side validation is authoritative — the client is advisory.
    const result = bookingSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", errors: getFieldErrors(result.error) },
        { status: 400, headers: corsHeaders(origin) }
      );
    }

    // Sanitize free-text AFTER validation, and recompute the price from
    // data — a client-sent total is never trusted.
    const clean = sanitizeObject(result.data);
    const total = bookingTotal(clean);

    // The unique (studio, date, time) constraint is the actual guard against
    // double-booking — even a dead-heat race between two submissions, the
    // database rejects whichever insert lands second.
    const { error: insertError } = await supabaseAdmin.from("bookings").insert({
      studio: clean.studio,
      date: clean.date,
      time: clean.time,
      treatment: clean.treatment,
      minutes: clean.minutes,
      enhancements: clean.enhancements.join(", ") || null,
      name: clean.name,
      email: clean.email,
      notes: clean.notes || null,
      total,
    });

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          { success: false, error: "That time was just taken — please choose another." },
          { status: 409, headers: corsHeaders(origin) }
        );
      }
      console.error("booking insert error:", insertError);
      return NextResponse.json(
        { success: false, error: "We could not take your booking just now — please try again." },
        { status: 500, headers: corsHeaders(origin) }
      );
    }

    // The row is the source of truth (and the double-booking guard). Email
    // notification is sent separately, client-side — Web3Forms' free tier
    // rejects server-to-server posts (403), so the browser owns that step.
    return NextResponse.json(
      { success: true, total, message: "Booking request received" },
      { status: 200, headers: corsHeaders(origin) }
    );
  } catch (error) {
    console.error("booking API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", errors: getFieldErrors(error) },
        { status: 400, headers: corsHeaders(origin) }
      );
    }
    return NextResponse.json(
      { success: false, error: "We could not take your booking just now — please try again." },
      { status: 500, headers: corsHeaders(origin) }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin") ?? "";
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsHeaders(origin),
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
