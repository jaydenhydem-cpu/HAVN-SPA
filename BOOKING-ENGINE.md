# Adding the booking engine to a new client site

How to port the staff-based appointment system from this template (your master
copy) into another client's site — without rebuilding it. Follow top to bottom.

The golden rule: **the code is shared; every client's data and keys are their
own.** Two businesses must never share a database, an email account, or a Stripe
account.

---

## The two kinds of files

**ENGINE — copy as-is, never edit per client.** These are identical on every
site. When you improve them here (the master), you copy the updated folders into
each client to propagate the change.

```
lib/booking/           (except data/services.ts, data/staff.ts, data/policy.ts)
components/booking/**   (inherits each site's design tokens automatically)
app/api/booking/**
app/api/admin/route.ts
app/book/confirmation/  app/book/dev-pay/
app/admin/bookings/
lib/supabase.ts
supabase/migrations/    (the SQL schema)
```

**CONFIG — re-skin these per client.** Same shape, different contents.

```
lib/booking/data/services.ts   → the client's services, prices, deposits, buffers
lib/booking/data/staff.ts      → the client's staff, schedules, breaks, time off
lib/booking/data/policy.ts     → the client's cancellation policy
lib/booking/config.ts          → timezone, location address, hold time
supabase/seed.sql              → mirror of the above, for their database
app/book/page.tsx              → the booking page heading/subtext copy
lib/booking/notify.ts          → the brand name in the email template
```

---

## Steps to add it to a client site

1. **Dependencies.** Make sure the client's `package.json` has these (this
   template already does): `@supabase/supabase-js`, `zod`, `server-only`.
   Run the client's package manager to install if you add any.

2. **Copy the ENGINE folders** listed above from this repo into the client site,
   same paths. Nothing to change in them.

3. **Copy the CONFIG files too**, then **re-skin them** for the client:
   - `data/services.ts` — their menu (name, category, price, duration, buffers,
     deposit type/value).
   - `data/staff.ts` — their people (bio, title, photo, `serviceIds`, weekly
     `availability`, `breaks`, `timeOff`). This is the single source of truth for
     who works when.
   - `data/policy.ts` and `config.ts` — their policy, timezone, location.
   - `seed.sql` — update it to match the new `services.ts`/`staff.ts` so their
     database mirrors the config.
   - `app/book/page.tsx` heading and `notify.ts` email brand — swap "HAVN".

4. **Wire the booking page** (if not already): `app/book/page.tsx` renders
   `<StaffBookingFlow />`. Confirm the client's nav "Book" link points to `/book`.

---

## Per-client accounts (the isolation rule)

Each client gets their **own** of each. Never shared.

| Service | Why it's per-client | What to set |
|---|---|---|
| **Supabase** project | Their bookings + customer data must be isolated | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| **Resend** account | Emails send from *their* brand/domain | `RESEND_API_KEY`, `RESEND_FROM` |
| **Stripe** account | Deposits go to *their* bank | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| Admin | Their private admin gate | `ADMIN_TOKEN` |

Setup per client:
1. **Supabase:** create their project → run `supabase/migrations/0001_staff_booking.sql`
   then the re-skinned `seed.sql` in the SQL editor. Add the two keys to their
   `.env.local` and Vercel (all environments).
2. **Resend:** their account → API key → verify their domain → set `RESEND_FROM`.
3. **Stripe:** their account → test keys first → webhook to
   `https://theirsite/api/booking/stripe-webhook` → then live keys.
4. **ADMIN_TOKEN:** any long secret; open `/admin/bookings?token=...`.

Until each is set, that piece safely runs in dev/log mode (no crashes) — so you
can hand off a working demo and switch things on as the client provides accounts.

---

## Verifying a client site
- `/book` loads and steps through service → specialist → date → time.
- `GET /api/booking/services` returns their services + staff.
- A test booking (their own email) confirms and emails; the row appears in *their*
  Supabase `appointments` table; a duplicate slot is rejected (409).

---

## Propagating template updates later
Because the ENGINE files are never edited per client, improving them here and
copying the folders into a client site applies cleanly. When you have several
clients and this copying gets old, the next step is packaging the engine (npm
package or git submodule) so one update flows to all sites automatically — worth
it only once the client count justifies the tooling.
