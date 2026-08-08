import type { Service } from "@/lib/booking/types";

/**
 * Service catalog seed — derived from HAVN's existing TREATMENTS (lib/site.ts)
 * but expanded into concrete bookable services (one fixed duration + price
 * each, the way a staff-booking system needs). Categories, buffers and deposit
 * rules are added here.
 *
 * The staff↔service relationship is defined ONCE on the staff records
 * (staff.serviceIds); `staffIds` here is computed by lib/booking/data/catalog.ts,
 * so it is intentionally omitted from this seed to avoid duplicate definitions.
 *
 * Deposit types are intentionally varied to exercise all three modes:
 *   percent → deposit is depositValue% of price
 *   fixed   → deposit is depositValue dollars
 *   none    → no deposit taken
 */
export type ServiceSeed = Omit<Service, "staffIds">;

export const SERVICES_SEED: ServiceSeed[] = [
  {
    id: "signature-60",
    slug: "signature-massage-60",
    name: "Signature Massage · 60 min",
    category: "Massage",
    description:
      "Warm oil, unhurried hands, and pressure that listens — one long exhale, sixty minutes wide.",
    priceCents: 14000,
    durationMinutes: 60,
    bufferBeforeMinutes: 0,
    bufferAfterMinutes: 15,
    depositType: "percent",
    depositValue: 20,
    active: true,
  },
  {
    id: "signature-90",
    slug: "signature-massage-90",
    name: "Signature Massage · 90 min",
    category: "Massage",
    description:
      "The signature, extended — ninety minutes to let the body arrive fully and stay a while.",
    priceCents: 19000,
    durationMinutes: 90,
    bufferBeforeMinutes: 0,
    bufferAfterMinutes: 15,
    depositType: "percent",
    depositValue: 20,
    active: true,
  },
  {
    id: "deep-60",
    slug: "deep-tissue-60",
    name: "Deep Tissue · 60 min",
    category: "Massage",
    description:
      "Slow, deliberate work into the deeper layers — patience applied where the week has settled.",
    priceCents: 16000,
    durationMinutes: 60,
    bufferBeforeMinutes: 0,
    bufferAfterMinutes: 15,
    depositType: "percent",
    depositValue: 20,
    active: true,
  },
  {
    id: "deep-90",
    slug: "deep-tissue-90",
    name: "Deep Tissue · 90 min",
    category: "Massage",
    description: "A full ninety minutes of focused, deeper work for long-held tension.",
    priceCents: 21000,
    durationMinutes: 90,
    bufferBeforeMinutes: 0,
    bufferAfterMinutes: 15,
    depositType: "percent",
    depositValue: 20,
    active: true,
  },
  {
    id: "hot-stone-75",
    slug: "hot-stone-75",
    name: "Hot Stone · 75 min",
    category: "Massage",
    description:
      "Basalt warmed in water, drawn along the spine at the pace of a resting heartbeat.",
    priceCents: 17500,
    durationMinutes: 75,
    bufferBeforeMinutes: 10,
    bufferAfterMinutes: 15,
    depositType: "fixed",
    depositValue: 50,
    active: true,
  },
  {
    id: "body-60",
    slug: "body-treatment-60",
    name: "Body Treatment · 60 min",
    category: "Body",
    description:
      "Clay, salt and oil for the whole body — an exfoliation and wrap that leaves the skin quiet.",
    priceCents: 15000,
    durationMinutes: 60,
    bufferBeforeMinutes: 0,
    bufferAfterMinutes: 15,
    depositType: "percent",
    depositValue: 20,
    active: true,
  },
  {
    id: "facial-60",
    slug: "the-facial-60",
    name: "The Facial · 60 min",
    category: "Facial",
    description:
      "Cleansing, warm compresses and botanical oil, worked in by hand. No machines, only care.",
    priceCents: 15500,
    durationMinutes: 60,
    bufferBeforeMinutes: 0,
    bufferAfterMinutes: 10,
    depositType: "none",
    depositValue: 0,
    active: true,
  },
];
