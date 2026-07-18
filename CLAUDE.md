# HAVN — Scandinavian editorial spa template

Auto-loaded each session. Captures what the code alone doesn't say.

## What this is

**Template #2 of 3** in the owner's spa-website collection (solo web designer selling
re-skinnable premium sites to spa/wellness clients). Built **from scratch 2026-07-09** to a
detailed creative brief — deliberately unrelated to template #1 (SOLENNE, `~/solenne-spa`,
dark cinematic luxury). `~/lagom-spa` was an abandoned re-skin attempt; ignore it.

**Design language:** Kinfolk / Norm Architects / Aesop. Minimalism creates the luxury.
Warm white `#F8F7F4`, soft sand `#E8E2D8`, muted sage `#A8B29A` (single accent), deep
charcoal `#1C1C1C`, warm gray `#767676`, oak hairlines. Typography is the hero: Gambetta
(serif display) + Switzer (grotesk body), both via Fontshare. No gold, no marble, no
gradients, nothing bounces.

## Stack & structure

Next.js 15 (App Router, Turbopack) · React 19 · TS · Tailwind v4 · GSAP + ScrollTrigger ·
Lenis · Framer Motion (small UI states only: mobile menu, accordion, ingredient reveal,
testimonial crossfade). No Three.js (deliberately skipped — calm > atmosphere tricks).

- One-page editorial home (`app/page.tsx`) in 8 "chapters": Hero → Philosophy →
  TreatmentShowcase (alternating editorial blocks, not cards) → Gallery (GSAP horizontal
  pin, vertical stack on mobile) → Ingredients (hover-reveal index) → Membership (hairline
  columns, no boxes) → Locations (typeset index) → Testimonials (slow crossfade) →
  BookingCTA (nearly empty screen). Plus `/book` (client-side form, log-only submit).
- All copy/data in `lib/site.ts` — the single re-branding file.
- Animation primitives: `components/ui/AnimatedSection` (fade-up), `SplitLines` (staggered
  line reveals), `ImageReveal` (clip-path + settle + ≤8% parallax). House ease in
  `lib/gsap.ts`; every animation gates on `prefersReducedMotion()`.
- Lenis instance exposed as `window.__lenis` (dev tooling / anchor scrolling).
- Images: curated Unsplash set in `public/images/` (semantic names), swapped per client.

## Status / TODO

**Done:** full homepage (8 chapters), multi-step booking flow with running total
(sessionStorage persistence, closed-day validation, ?treatment= deep links), nav
(transparent→solid), footer, custom cursor ring, images curated, type-check + lint clean.

**SEO done (2026-07-10, titles reworked 2026-07-13):** all titles/descriptions are
service+location oriented ("Massage & Day Spa in Copenhagen…") and live in the
`SITE.seo` block in lib/site.ts — rewrite that one block per client ("Massage Therapy
in Miami — {Brand}"). robots.ts, sitemap.ts, public/llms.txt, canonical per page,
robots meta (max-snippet etc.), OG + Twitter cards, generated opengraph-image.tsx +
icon.tsx, JSON-LD (Organization + WebSite + 2× DaySpa with Offer/Service menu) in
app/page.tsx, GA4 config-gated via SITE.analyticsId (components/Analytics.tsx, empty =
nothing loads), CSP in next.config.ts (self + Fontshare + GA wildcards; 'unsafe-eval'
dev-only). Remember: changing next.config.ts requires a server restart.

**Form security done (2026-07-10):** defence-in-depth per the validation guide. Zod
schemas in lib/validation.ts (shared client+server; unicode names for the Danish market;
cross-field rules: valid duration per treatment, no past dates, studio closed days;
`bookingTotal()` recomputes price server-side — client totals are never trusted). XSS
stripping in lib/sanitize.ts. API routes app/api/{booking,newsletter}/route.ts re-validate,
sanitize, return field-level errors, CORS-allowlist SITE.url, and forward via lib/notify.ts
→ SITE.formEndpoint (empty = log-only). BookingFlow + Footer validate in real time and POST
to the APIs. robots.ts now disallows /api/.

**Crawlability playbook run (2026-07-10): PASS, no work needed.** Phase 0 diagnosis —
distinct HTML per route, unique titles/canonicals, ~1,900 pre-JS words on home. Production
build: every route is ○ Static (prerendered HTML files). Pages are server components
("use client" only in child components); JSON-LD is server-rendered; prod CSP has no
unsafe-eval. Re-run the Phase 0 curls after adding any new page.

**Next:** git init + GitHub repo (author MUST be
`293450179+jaydenhydem-cpu@users.noreply.github.com` or Vercel blocks deploys), Vercel
deploy + set real `SITE.url`, then template #3 to complete the collection.

## Gotchas

- `node_modules` was APFS-cloned from solenne-spa (same dep versions) — `npm install`
  works normally if deps change.
- **Never `npm run build` while the dev server runs** (both write `.next`).
- Preview screenshots follow the user's visible preview tab, not the eval seed tab —
  verify scrolled states with `preview_eval` (DOM/positions/opacity), not screenshots.
- Newsletter + booking forms are log-only by design; wire per client.

## Verify before claiming done

`npx tsc --noEmit` · `npx eslint app/ components/ lib/` · preview both routes.
