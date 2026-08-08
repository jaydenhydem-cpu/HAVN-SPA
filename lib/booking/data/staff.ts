import type { Staff } from "@/lib/booking/types";

/**
 * ── HAVN staff seed data ──────────────────────────────────────────────
 * TEMPORARY, realistic placeholder specialists. This is the ONE place that
 * defines who works when and which services they perform — edit here (and
 * mirror into supabase/seed.sql) to replace with real staff.
 *
 * Schedules are independent per person and expressed in the business timezone
 * (America/New_York). timeOff ranges are ISO UTC.
 *
 * Photos reuse existing /public/images portraits as placeholders — swap
 * `imageUrl` for real headshots later.
 */
export const STAFF: Staff[] = [
  {
    id: "elena",
    slug: "elena-rivas",
    name: "Elena Rivas",
    title: "Senior Massage Therapist",
    bio: "Fifteen years of unhurried, intuitive bodywork. Elena is known for a slow, grounding pressure and a room that feels like an exhale.",
    imageUrl: "/images/portrait-1.jpg",
    specialties: ["Swedish", "Hot stone", "Prenatal"],
    yearsExperience: 15,
    serviceIds: ["signature-60", "signature-90", "hot-stone-75", "body-60"],
    active: true,
    // Monday–Thursday, 10:00–18:00, with a midday break
    availability: [
      { dayOfWeek: 1, start: "10:00", end: "18:00" },
      { dayOfWeek: 2, start: "10:00", end: "18:00" },
      { dayOfWeek: 3, start: "10:00", end: "18:00" },
      { dayOfWeek: 4, start: "10:00", end: "18:00" },
    ],
    breaks: [
      { dayOfWeek: 1, start: "13:00", end: "14:00" },
      { dayOfWeek: 2, start: "13:00", end: "14:00" },
      { dayOfWeek: 3, start: "13:00", end: "14:00" },
      { dayOfWeek: 4, start: "13:00", end: "14:00" },
    ],
    // Example vacation block — replace with real dates
    timeOff: [
      {
        startsAt: "2026-08-10T00:00:00Z",
        endsAt: "2026-08-18T04:00:00Z",
        reason: "Vacation",
      },
    ],
  },
  {
    id: "marcus",
    slug: "marcus-hale",
    name: "Marcus Hale",
    title: "Deep Tissue & Sports Specialist",
    bio: "A former physiotherapist who works with precision and purpose. Marcus is the one to see for stubborn knots and recovery.",
    imageUrl: "/images/portrait-2.jpg",
    specialties: ["Deep tissue", "Sports recovery", "Trigger point"],
    yearsExperience: 9,
    serviceIds: ["deep-60", "deep-90", "signature-60", "hot-stone-75"],
    active: true,
    // Tuesday–Saturday, 11:00–19:00
    availability: [
      { dayOfWeek: 2, start: "11:00", end: "19:00" },
      { dayOfWeek: 3, start: "11:00", end: "19:00" },
      { dayOfWeek: 4, start: "11:00", end: "19:00" },
      { dayOfWeek: 5, start: "11:00", end: "19:00" },
      { dayOfWeek: 6, start: "11:00", end: "19:00" },
    ],
    breaks: [
      { dayOfWeek: 2, start: "15:00", end: "15:30" },
      { dayOfWeek: 3, start: "15:00", end: "15:30" },
      { dayOfWeek: 4, start: "15:00", end: "15:30" },
      { dayOfWeek: 5, start: "15:00", end: "15:30" },
      { dayOfWeek: 6, start: "15:00", end: "15:30" },
    ],
    timeOff: [],
  },
  {
    id: "sofia",
    slug: "sofia-nguyen",
    name: "Sofia Nguyen",
    title: "Lead Esthetician",
    bio: "A skin-first, ingredient-obsessed practitioner. Sofia's facials and body treatments are quiet, methodical, and deeply restorative.",
    imageUrl: "/images/portrait-3.jpg",
    specialties: ["Facials", "Body treatments", "Sensitive skin"],
    yearsExperience: 11,
    serviceIds: ["facial-60", "body-60", "signature-60"],
    active: true,
    // Wednesday–Sunday, 09:00–17:00
    availability: [
      { dayOfWeek: 3, start: "09:00", end: "17:00" },
      { dayOfWeek: 4, start: "09:00", end: "17:00" },
      { dayOfWeek: 5, start: "09:00", end: "17:00" },
      { dayOfWeek: 6, start: "09:00", end: "17:00" },
      { dayOfWeek: 0, start: "09:00", end: "17:00" },
    ],
    breaks: [
      { dayOfWeek: 3, start: "12:30", end: "13:30" },
      { dayOfWeek: 4, start: "12:30", end: "13:30" },
      { dayOfWeek: 5, start: "12:30", end: "13:30" },
      { dayOfWeek: 6, start: "12:30", end: "13:30" },
      { dayOfWeek: 0, start: "12:30", end: "13:30" },
    ],
    timeOff: [],
    // Sofia asks for a little more lead time
    minNoticeMinutes: 240,
  },
  {
    id: "amara",
    slug: "amara-okafor",
    name: "Amara Okafor",
    title: "Massage & Body Therapist",
    bio: "Weekend-forward and warm, Amara blends Swedish flow with restorative body work. A favourite for a slow Sunday reset.",
    imageUrl: "/images/portrait-1.jpg",
    specialties: ["Swedish", "Body treatments", "Aromatherapy"],
    yearsExperience: 6,
    serviceIds: ["signature-60", "signature-90", "body-60", "facial-60"],
    active: true,
    // Friday–Sunday, 11:00–20:00 (the weekend/evening specialist)
    availability: [
      { dayOfWeek: 5, start: "11:00", end: "20:00" },
      { dayOfWeek: 6, start: "11:00", end: "20:00" },
      { dayOfWeek: 0, start: "11:00", end: "20:00" },
    ],
    breaks: [
      { dayOfWeek: 5, start: "16:00", end: "16:45" },
      { dayOfWeek: 6, start: "16:00", end: "16:45" },
      { dayOfWeek: 0, start: "16:00", end: "16:45" },
    ],
    timeOff: [],
  },
];
