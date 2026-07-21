# HAVN — Per-Client Setup Checklist

Repeatable steps to re-skin and launch this template for a new spa client.
Work top to bottom. Budget ~2–4 hours for a full re-skin once you're practiced.

---

## 0. Before you start — get paid & collect assets

- [ ] Deposit received (50% upfront is standard; never build fully on spec)
- [ ] Business name, logo (or confirm you'll typeset the name)
- [ ] Services + prices + durations
- [ ] Studio address(es), hours, closed days
- [ ] Phone number(s) + contact email
- [ ] Real photos (or agree on stock while they gather them)
- [ ] Instagram / social links
- [ ] Decide: who owns the domain registration? (→ have the CLIENT own it)

---

## 1. Copy the project

- [ ] Duplicate this repo for the new client (new folder + new GitHub repo)
- [ ] `npm install`
- [ ] `npm run dev` — confirm it runs locally before changing anything

---

## 2. Re-brand — everything lives in `lib/site.ts`

- [ ] `name`, `tagline`, `description`
- [ ] `url` → the client's final domain (e.g. `https://theirspa.com`)
- [ ] `treatments` — names, durations, prices
- [ ] `enhancements` — add-ons + prices
- [ ] `TIME_SLOTS` — their actual appointment times (24h format, e.g. `"09:00"`;
      the site auto-displays them as `9:00 AM`)
- [ ] `LOCATIONS` — city, address, hours, `closedDays` ([] = never closed,
      [0] = closed Sundays, etc.)
- [ ] `MEMBERSHIP` tiers (or remove the section if they don't offer it)
- [ ] `testimonials`
- [ ] `email`, `instagram`, `copyright`
- [ ] `SITE.seo` block — rewrite titles/descriptions for their city + services
      ("Massage Therapy in {City} — {Brand}")
- [ ] `analyticsId` — their GA4 id, or leave `""` (nothing loads)

## 3. Images

- [ ] Replace files in `public/images/` (keep the same filenames = zero code changes)
- [ ] Regenerate/replace favicon + OG image if needed (`app/icon.tsx`,
      `app/opengraph-image.tsx`)

## 4. Legal + disclaimer

- [ ] Update `app/legal` pages with their real policies
- [ ] REMOVE the "Demonstration template — fictional" disclaimer from the footer

---

## 5. Email notifications (Web3Forms) — bookings land in THEIR inbox

- [ ] Client (or you) creates a free key at https://web3forms.com using THEIR email
- [ ] Paste it into `lib/site.ts` → `formAccessKey`
- [ ] Confirm the first-use verification email that Web3Forms sends to that inbox
- [ ] Test: submit a booking, confirm the email arrives

> Free tier = owner gets notified only. Customer auto-reply needs Web3Forms Pro
> (upsell, or leave as-is — the on-page "we'll confirm by email" covers it).

---

## 6. Booking database (Supabase) — prevents double-booking

Each client needs their OWN Supabase project (free tier is plenty).

- [ ] Client creates a project at https://supabase.com
- [ ] In **SQL Editor → New query**, run:

```sql
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  studio text not null,
  date date not null,
  time text not null,
  treatment text not null,
  minutes int not null,
  enhancements text,
  name text not null,
  email text not null,
  notes text,
  total int not null,
  created_at timestamptz not null default now(),
  unique (studio, date, time)
);

alter table bookings enable row level security;
```

- [ ] Grab the two values from **Project Settings → API**:
  - Project URL
  - `service_role` key (the SECRET one — never commit it, never expose to browser)
- [ ] Put them in `.env.local` locally (already gitignored):

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

- [ ] Test locally: pick a studio + date in the booking flow — taken slots grey out;
      submitting twice for the same slot is rejected.

---

## 7. Deploy to Vercel

- [ ] Push the repo to GitHub
- [ ] Create a NEW Vercel project (don't reuse another client's), import the repo
- [ ] **Vercel → Settings → Environments → Production → Environment Variables**, add:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - (tick Production; Preview + Development too if you want)
- [ ] Deploy
- [ ] Connect the client's custom domain (Settings → Domains)

## 8. Verify on the LIVE domain

- [ ] Homepage loads, branding correct
- [ ] `/api/availability?studio=<City>&date=2099-01-01` returns `{"success":true,...}`
- [ ] Submit a real test booking → row appears in Supabase → email arrives
- [ ] Double-book the same slot → rejected
- [ ] DELETE your test rows from the Supabase Table Editor

## 9. Handoff

- [ ] Show the client their Supabase Table Editor (where bookings live; deleting a
      row frees that slot)
- [ ] Confirm booking emails go to their inbox
- [ ] Hand over domain ownership (in their name/account)
- [ ] Offer the Care Plan (hosting + small edits, recurring) — that's your recurring revenue

---

## Quick reference — the 3 secrets per client

| What | Where it lives | Tied to |
|------|----------------|---------|
| Web3Forms access key | `lib/site.ts` (public, ok to commit) | client's email inbox |
| Supabase URL | Vercel env var + `.env.local` | client's Supabase project |
| Supabase service_role key | Vercel env var + `.env.local` (NEVER commit) | client's Supabase project |

## Paid add-ons (quote separately, don't build into base price)

- Customer auto-confirmation emails → Web3Forms Pro
- Online deposit / payment at booking → Stripe integration
- Extra locations, blog/CMS, membership portal
