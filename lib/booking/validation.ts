import { z } from "zod";
import { ANY_STAFF } from "@/lib/booking/types";

/**
 * Zod schemas shared by the booking API routes. Server-side is authoritative;
 * the client uses the same field rules for inline feedback.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const nameField = z
  .string()
  .trim()
  .min(1, "Required")
  .max(80, "Too long")
  .regex(/^[\p{L}\s\-'’.]+$/u, "Letters only");

const emailField = z
  .string()
  .trim()
  .max(254, "Too long")
  .refine((v) => EMAIL_RE.test(v), "Enter a valid email")
  .transform((v) => v.toLowerCase());

// Lenient but real: 10–15 digits after stripping formatting.
const phoneField = z
  .string()
  .trim()
  .min(7, "Enter a valid phone number")
  .max(25, "Too long")
  .refine((v) => (v.replace(/\D/g, "").length >= 10), "Enter a valid mobile number");

export const availabilityQuerySchema = z.object({
  serviceId: z.string().min(1),
  staffId: z.string().min(1), // service-staff id or ANY_STAFF
  date: z.string().regex(DATE_RE, "Invalid date"),
});

export const detailsSchema = z.object({
  firstName: nameField,
  lastName: nameField,
  email: emailField,
  phone: phoneField,
  notes: z.string().trim().max(1000, "Please keep notes under 1000 characters").optional().or(z.literal("")),
  firstTime: z.boolean().optional().default(false),
});

export const holdSchema = detailsSchema.extend({
  serviceId: z.string().min(1),
  staffId: z.string().min(1).default(ANY_STAFF),
  slotStartUtc: z.string().datetime({ message: "Invalid time" }),
  policyId: z.string().min(1),
  policyAccepted: z.literal(true, { message: "Please accept the policy" }),
});

export type HoldInput = z.infer<typeof holdSchema>;
export type DetailsInput = z.infer<typeof detailsSchema>;

export const getFieldErrors = (error: z.ZodError): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
};
