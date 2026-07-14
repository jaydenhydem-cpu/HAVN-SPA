import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { enquirySchema, getFieldErrors } from "@/lib/validation";
import { sanitizeObject } from "@/lib/sanitize";
import { deliver } from "@/lib/notify";
import { SITE } from "@/lib/site";

const ALLOWED_ORIGINS = [SITE.url, "http://localhost:3000"];

const corsHeaders = (origin: string): Record<string, string> =>
  ALLOWED_ORIGINS.includes(origin) ? { "Access-Control-Allow-Origin": origin } : {};

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin") ?? "";

  try {
    const body = await request.json().catch(() => null);
    const result = enquirySchema.safeParse(body ?? {});
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", errors: getFieldErrors(result.error) },
        { status: 400, headers: corsHeaders(origin) }
      );
    }

    const clean = sanitizeObject(result.data);
    await deliver("New enquiry", clean);

    return NextResponse.json(
      { success: true, message: "Enquiry received" },
      { status: 200, headers: corsHeaders(origin) }
    );
  } catch (error) {
    console.error("enquiry API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", errors: getFieldErrors(error) },
        { status: 400, headers: corsHeaders(origin) }
      );
    }
    return NextResponse.json(
      { success: false, error: "We could not send your note just now — please try again." },
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
