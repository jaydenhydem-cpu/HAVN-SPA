/**
 * HAVN — site data. The single place to re-brand this template:
 * name, copy, treatments, membership, locations, testimonials.
 */
export const SITE = {
  name: "HAVN",
  tagline: "The art of slowing down",
  description:
    "HAVN is a wellness studio devoted to the art of slowing down — massage, warmth and quiet, practiced in rooms of natural light, oak and stone.",
  url: "https://havn-spa.vercel.app",
  /** GA4 measurement id (e.g. "G-XXXXXXXXXX"). Empty = analytics fully
   *  disabled — no script loads at all. Set per client. */
  analyticsId: "",
  /** Form delivery endpoint (e.g. a Formspree URL). Empty = log-only:
   *  submissions validate, sanitize and return success without emailing
   *  anyone. Set per client to deliver bookings + newsletter signups. */
  formEndpoint: "",
  email: "hello@havn.studio",
  instagram: "https://instagram.com",
  copyright: `© ${new Date().getFullYear()} HAVN Studio`,
} as const;

export type Duration = { minutes: number; price: number };

export type Treatment = {
  slug: string;
  name: string;
  /** offered lengths with their prices — drives the booking total */
  durations: Duration[];
  description: string;
  image: string;
  /** next/image object-position override for art direction */
  position?: string;
};

export const TREATMENTS: Treatment[] = [
  {
    slug: "signature-massage",
    name: "Signature Massage",
    durations: [
      { minutes: 60, price: 140 },
      { minutes: 90, price: 190 },
    ],
    description:
      "Warm oil, unhurried hands, and pressure that listens. Our founding treatment is composed around the breath — one long exhale, sixty minutes wide.",
    image: "/images/treatment-signature.jpg",
  },
  {
    slug: "deep-tissue",
    name: "Deep Tissue",
    durations: [
      { minutes: 60, price: 160 },
      { minutes: 90, price: 210 },
    ],
    description:
      "Slow, deliberate work into the deeper layers. Not force — patience, applied precisely where the week has settled.",
    image: "/images/treatment-deep.jpg",
  },
  {
    slug: "hot-stone",
    name: "Hot Stone",
    durations: [{ minutes: 75, price: 175 }],
    description:
      "Basalt warmed in water, drawn along the spine at the pace of a resting heartbeat. Heat that stays with you into the evening.",
    image: "/images/treatment-stone.jpg",
  },
  {
    slug: "body-treatment",
    name: "Body Treatment",
    durations: [
      { minutes: 60, price: 150 },
      { minutes: 90, price: 200 },
    ],
    description:
      "Clay, salt and oil for the whole body — an exfoliation and wrap that leaves the skin quiet, soft and warm.",
    image: "/images/treatment-body.jpg",
  },
  {
    slug: "facial",
    name: "The Facial",
    durations: [{ minutes: 60, price: 155 }],
    description:
      "Cleansing, warm compresses and botanical oil, worked in by hand. No machines, no fuss — only care and time.",
    image: "/images/treatment-facial.jpg",
  },
];

/** lowest offered price, for "from $X" copy */
export const fromPrice = (t: Treatment) => Math.min(...t.durations.map((d) => d.price));

/** "60 / 90 min" */
export const durationLabel = (t: Treatment) =>
  `${t.durations.map((d) => d.minutes).join(" / ")} min`;

export type Enhancement = {
  id: string;
  name: string;
  price: number;
  note: string;
};

/** quiet add-ons offered during booking — each extends the ritual */
export const ENHANCEMENTS: Enhancement[] = [
  { id: "aromatherapy", name: "Aromatherapy", price: 25, note: "A blend chosen with you, mixed that morning" },
  { id: "scalp", name: "Scalp ritual", price: 30, note: "Fifteen quiet minutes of warm camellia oil" },
  { id: "compress", name: "Warm herbal compress", price: 20, note: "Chamomile and birch, pressed where the day sits" },
  { id: "balm", name: "Recovery balm", price: 25, note: "Worked into shoulders, hands and feet to close" },
];

export const TIME_SLOTS = ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00"];

export const MEMBERSHIP = [
  {
    name: "Monthly",
    price: 120,
    per: "month",
    includes: ["One treatment each month", "10% off additional bookings", "Guest pass twice a year"],
  },
  {
    name: "Ritual",
    price: 220,
    per: "month",
    includes: [
      "Two treatments each month",
      "15% off additional bookings",
      "Priority weekend booking",
      "Guest pass four times a year",
    ],
    featured: true,
  },
  {
    name: "Studio",
    price: 390,
    per: "month",
    includes: [
      "Four treatments each month",
      "20% off additional bookings",
      "Private studio hours",
      "Unlimited guest passes",
    ],
  },
];

export const LOCATIONS = [
  {
    city: "Copenhagen",
    address: ["Værnedamsvej 12", "1619 København V"],
    hours: ["Mon – Fri  08.00 – 20.00", "Sat – Sun  09.00 – 18.00"],
    phone: "+45 31 00 00 00",
    email: "cph@havn.studio",
    maps: "https://maps.google.com/?q=V%C3%A6rnedamsvej+12+K%C3%B8benhavn",
    /** weekdays the studio is dark (0 = Sunday … 6 = Saturday) */
    closedDays: [] as number[],
  },
  {
    city: "Aarhus",
    address: ["Mejlgade 41", "8000 Aarhus C"],
    hours: ["Mon – Fri  08.00 – 19.00", "Sat  09.00 – 17.00 · Sun closed"],
    phone: "+45 32 00 00 00",
    email: "aarhus@havn.studio",
    maps: "https://maps.google.com/?q=Mejlgade+41+Aarhus",
    closedDays: [0] as number[],
  },
];

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** True when a yyyy-mm-dd date falls on a day the studio is closed.
 *  Parsed as a local date to avoid UTC off-by-one. */
export function isClosedOn(closedDays: number[], isoDate: string): boolean {
  if (!isoDate) return false;
  const [y, m, d] = isoDate.split("-").map(Number);
  return closedDays.includes(new Date(y, m - 1, d).getDay());
}

export const closedDayNames = (closedDays: number[]) =>
  closedDays.map((d) => WEEKDAYS[d]).join(", ");

export const TESTIMONIALS = [
  {
    quote:
      "It is the only hour of my week where nothing is asked of me. I leave lighter every single time.",
    name: "Clara Meyer",
    role: "Member since 2023",
    portrait: "/images/portrait-1.jpg",
  },
  {
    quote:
      "The room is warm, the hands are certain, and the silence is complete. HAVN understands rest as a craft.",
    name: "Jonas Lind",
    role: "Member since 2022",
    portrait: "/images/portrait-2.jpg",
  },
  {
    quote:
      "I have been to spas on three continents. None of them made calm feel this effortless.",
    name: "Amalie Sørensen",
    role: "Guest, Copenhagen",
    portrait: "/images/portrait-3.jpg",
  },
];

export const INGREDIENTS = [
  {
    id: "oil",
    name: "Cold-pressed oils",
    body: "Sea buckthorn, almond and jojoba, blended in small batches the week they are used. Nothing sits on a shelf for long.",
    image: "/images/ingredient-oil.jpg",
  },
  {
    id: "stone",
    name: "Basalt stone",
    body: "Volcanic stone that holds warmth the way the body wants to receive it — slowly, evenly, without edges.",
    image: "/images/treatment-stone.jpg",
  },
  {
    id: "water",
    name: "Soft water",
    body: "Filtered and warmed for every compress and soak. Water is the quietest ingredient and the one we use most.",
    image: "/images/ingredient-water.jpg",
  },
  {
    id: "botanics",
    name: "Botanicals",
    body: "Chamomile, birch and pine — gathered from growers we know by name, infused in the studio each morning.",
    image: "/images/space-light.jpg",
  },
];
