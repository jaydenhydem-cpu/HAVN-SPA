import { z } from "zod";
import {
  TREATMENTS,
  ENHANCEMENTS,
  LOCATIONS,
  TIME_SLOTS,
  isClosedOn,
  closedDayNames,
} from "./site";

/**
 * Zod schemas shared by the client (real-time feedback) and the API
 * routes (authoritative re-validation — never trust the client).
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// International guests: names must allow accents (é, ñ, ø …) — \p{L}
// covers all unicode letters, unlike [a-zA-Z].
const nameSchema = z
  .string()
  .trim()
  .min(2, "Please give us at least two characters")
  .max(100, "Names longer than 100 characters won't fit our ledger")
  .regex(/^[\p{L}\s\-'’.]+$/u, "Letters, spaces, hyphens and apostrophes only");

const emailSchema = z
  .string()
  .trim()
  .max(254, "That email is longer than emails get")
  .refine((v) => EMAIL_RE.test(v), "Please enter a valid email address")
  .transform((v) => v.toLowerCase());

const TREATMENT_SLUGS = TREATMENTS.map((t) => t.slug) as [string, ...string[]];
const ENHANCEMENT_IDS = ENHANCEMENTS.map((e) => e.id) as [string, ...string[]];
const STUDIO_CITIES = LOCATIONS.map((l) => l.city) as [string, ...string[]];
const SLOTS = TIME_SLOTS as unknown as [string, ...string[]];

/** The contact-details step, validated field-by-field on the client. */
export const bookingDetailsSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  notes: z.string().trim().max(2000, "Please keep notes under 2000 characters").optional().or(z.literal("")),
});

/** The complete booking request — cross-field rules included. */
export const bookingSchema = z
  .object({
    treatment: z.enum(TREATMENT_SLUGS, { message: "Please choose a treatment" }),
    minutes: z.number().int(),
    enhancements: z.array(z.enum(ENHANCEMENT_IDS)).max(ENHANCEMENTS.length),
    studio: z.enum(STUDIO_CITIES, { message: "Please choose a studio" }),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a date"),
    time: z.enum(SLOTS, { message: "Please choose a time" }),
  })
  .extend(bookingDetailsSchema.shape)
  .superRefine((data, ctx) => {
    const treatment = TREATMENTS.find((t) => t.slug === data.treatment);
    if (treatment && !treatment.durations.some((d) => d.minutes === data.minutes)) {
      ctx.addIssue({
        code: "custom",
        path: ["minutes"],
        message: `${treatment.name} is not offered at ${data.minutes} minutes`,
      });
    }
    const today = new Date();
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
      today.getDate()
    ).padStart(2, "0")}`;
    if (data.date < todayIso) {
      ctx.addIssue({ code: "custom", path: ["date"], message: "That day has already passed" });
    }
    const studio = LOCATIONS.find((l) => l.city === data.studio);
    if (studio && isClosedOn(studio.closedDays, data.date)) {
      ctx.addIssue({
        code: "custom",
        path: ["date"],
        message: `Our ${studio.city} studio rests on ${closedDayNames(studio.closedDays)}s`,
      });
    }
  });

export type BookingData = z.infer<typeof bookingSchema>;

/** Authoritative price — always computed from data, never trusted from the client. */
export function bookingTotal(data: Pick<BookingData, "treatment" | "minutes" | "enhancements">): number {
  const treatment = TREATMENTS.find((t) => t.slug === data.treatment);
  const base = treatment?.durations.find((d) => d.minutes === data.minutes)?.price ?? 0;
  const extras = ENHANCEMENTS.filter((e) => data.enhancements.includes(e.id)).reduce(
    (sum, e) => sum + e.price,
    0
  );
  return base + extras;
}

export const newsletterSchema = z.object({
  email: emailSchema,
});

export type NewsletterData = z.infer<typeof newsletterSchema>;

/** General enquiry / lead capture — name, email and a short message. */
const messageSchema = z
  .string()
  .trim()
  .min(5, "A few more words, please")
  .max(2000, "Please keep it under 2000 characters");

export const enquirySchema = z.object({
  name: nameSchema,
  email: emailSchema,
  message: messageSchema,
});

export type EnquiryData = z.infer<typeof enquirySchema>;

/** First error message, for single-line feedback. */
export const getFirstError = (error: z.ZodError): string =>
  error.issues[0]?.message || "Validation failed";

/** All errors keyed by field path, for field-level feedback. */
export const getFieldErrors = (error: z.ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (!errors[path]) errors[path] = issue.message;
  }
  return errors;
};
