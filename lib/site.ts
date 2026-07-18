/**
 * HAVN — site data. The single place to re-brand this template:
 * name, copy, treatments, membership, locations, testimonials.
 */
export const SITE = {
  name: "HAVN",
  tagline: "The art of slowing down",
  description:
    "HAVN is a Miami wellness studio devoted to the art of slowing down — massage, warmth and quiet, practiced in rooms of natural light, oak and stone, minutes from Aventura.",
  url: "https://havn-spa.vercel.app",
  /** GA4 measurement id (e.g. "G-XXXXXXXXXX"). Empty = analytics fully
   *  disabled — no script loads at all. Set per client. */
  analyticsId: "",
  /** ── Form delivery ──────────────────────────────────────────────
   *  ONE reusable endpoint delivers every form — bookings, enquiries,
   *  newsletter and membership. No custom backend needed. Two zero-cost
   *  options, either drops straight into these two fields:
   *
   *  • Web3Forms (no account — fastest): get a key at https://web3forms.com
   *      formEndpoint  = "https://api.web3forms.com/submit"
   *      formAccessKey = "<your access key>"
   *  • Formspree (free account): create a form at https://formspree.io
   *      formEndpoint  = "https://formspree.io/f/<your-id>"
   *      formAccessKey = ""   (not used)
   *
   *  Leave formEndpoint empty = log-only: forms validate and confirm to
   *  the visitor but email no one (safe demo default). */
  formEndpoint: "https://api.web3forms.com/submit",
  formAccessKey: "ee4c07b2-76b2-4aaa-88e7-ca48ec1f3599",
  email: "hello@havn.studio",
  instagram: "https://instagram.com",
  copyright: `© ${new Date().getFullYear()} HAVN Studio`,

  /** ── SEO ────────────────────────────────────────────────────────
   *  Search engines rank pages for what people actually type — services
   *  and places — so every title/description here follows the pattern
   *  "{Service} in {City}". REWRITE PER CLIENT, e.g.:
   *    title:       "Massage Therapy & Day Spa in Miami — Solara Spa"
   *    description: "Deep tissue, hot stone and facials in Wynwood,
   *                  Miami. Book online — easy parking on NW 2nd Ave."
   *  Keep titles ≤ 60 chars and descriptions 140–160 chars so they don't
   *  truncate in results. The brand tagline still lives in the visible
   *  hero — this block is what Google and link previews show. */
  seo: {
    /** homepage <title> — service + cities + brand */
    title: "HAVN — Massage & Day Spa in Miami, near Aventura",
    /** sub-page titles render as "{page} — HAVN" via this template */
    template: "%s — HAVN",
    /** homepage meta description — services, cities, booking cue */
    description:
      "Massage, hot stone, facials and body treatments in Aventura and Miami Beach. A quiet Scandinavian-style day spa — book your hour online, from $140.",
    /** /book <title> + description */
    bookTitle: "Book a Massage in Miami — Aventura & Miami Beach",
    bookDescription:
      "Reserve massage, hot stone or facial treatments at HAVN's Aventura and Miami Beach studios. Choose your treatment, length and time — nothing charged online.",
  },

  /** ── Homepage hero ──────────────────────────────────────────────
   *  `lines` render as the giant animated h1 — each line sits inside a
   *  mask with overflow:hidden (for the slide-up reveal), and the type
   *  scales up to 9rem on wide screens while the column caps at ~754px,
   *  so a line MUST measure under ~740px at 144px serif or it gets
   *  silently clipped. Tested-safe short lines only — verify any new
   *  line in devtools at a 1920px viewport before shipping:
   *  `getComputedStyle(el).fontSize` should read 144px there.
   *  `headline` is the h1's accessible name (aria-label) — it isn't
   *  layout-constrained like `lines`, so it carries the full keyword
   *  phrase and mirrors `seo.title` for topical consistency. REWRITE
   *  PER CLIENT, e.g. lines: ["Facials", "Aventura"],
   *  headline: "Facials & Skincare in Aventura, Miami". */
  hero: {
    lines: ["The art of", "slowing down."],
    headline: "Massage & Day Spa in Miami, near Aventura",
    subtext:
      "HAVN is a Miami day spa with studios in Aventura and Miami Beach, offering massage, hot stone treatments, facials and body treatments in quiet rooms of natural light, oak and stone. Book your appointment online.",
  },
} as const;

export type Duration = { minutes: number; price: number };

export type Treatment = {
  slug: string;
  name: string;
  /** offered lengths with their prices — drives the booking total */
  durations: Duration[];
  description: string;
  /** who the treatment is a good fit for — supports the booking decision */
  suitedFor: string;
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
    suitedFor: "First-time guests, everyday stress, and anyone easing into massage.",
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
    suitedFor: "Athletes, desk-bound shoulders, and long-held tension.",
    image: "/images/treatment-deep.jpg",
  },
  {
    slug: "hot-stone",
    name: "Hot Stone",
    durations: [{ minutes: 75, price: 175 }],
    description:
      "Basalt warmed in water, drawn along the spine at the pace of a resting heartbeat. Heat that stays with you into the evening.",
    suitedFor: "Deep fatigue, cold hands, and slow winter evenings.",
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
    suitedFor: "Dull or dry skin, and a glow before an occasion.",
    image: "/images/treatment-body.jpg",
  },
  {
    slug: "facial",
    name: "The Facial",
    durations: [{ minutes: 60, price: 155 }],
    description:
      "Cleansing, warm compresses and botanical oil, worked in by hand. No machines, no fuss — only care and time.",
    suitedFor: "Sensitive skin and anyone who prefers hands over machines.",
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
    city: "Aventura",
    address: ["2980 NE 207th Street", "Aventura, FL 33180"],
    hours: ["Mon – Fri  9:00 AM – 8:00 PM", "Sat – Sun  9:00 AM – 6:00 PM"],
    phone: "+1 (305) 555-0142",
    email: "aventura@havn.studio",
    maps: "https://maps.google.com/?q=2980+NE+207th+Street+Aventura+FL+33180",
    parking: "Free garage parking in the building; valet at the door after 5 PM.",
    /** ZIP for structured data */
    zip: "33180",
    /** weekdays the studio is dark (0 = Sunday … 6 = Saturday) */
    closedDays: [] as number[],
  },
  {
    city: "Miami Beach",
    address: ["710 Washington Avenue", "Miami Beach, FL 33139"],
    hours: ["Mon – Fri  9:00 AM – 7:00 PM", "Sat  9:00 AM – 5:00 PM · Sun closed"],
    phone: "+1 (305) 555-0186",
    email: "miamibeach@havn.studio",
    maps: "https://maps.google.com/?q=710+Washington+Avenue+Miami+Beach+FL+33139",
    parking: "Metered street parking; 7th Street public garage two blocks away.",
    zip: "33139",
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
    name: "Clara M.",
    role: "Signature Massage · Member since 2023",
    portrait: "/images/portrait-1.jpg",
  },
  {
    quote:
      "The room is warm, the hands are certain, and the silence is complete. HAVN understands rest as a craft.",
    name: "Jonas L.",
    role: "Deep Tissue · Member since 2022",
    portrait: "/images/portrait-2.jpg",
  },
  {
    quote:
      "I have been to spas on three continents. None of them made calm feel this effortless.",
    name: "Amalie S.",
    role: "Hot Stone · Guest, Aventura",
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
