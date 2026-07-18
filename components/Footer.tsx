"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { SITE, LOCATIONS } from "@/lib/site";
import { newsletterSchema } from "@/lib/validation";
import { sanitizeEmail } from "@/lib/sanitize";
import { submitLead } from "@/lib/submitForm";
import { trackEvent } from "@/lib/analytics";
import Honeypot from "@/components/ui/Honeypot";

/**
 * Extremely minimal footer: one serif farewell, a quiet newsletter
 * field, navigation, contact, copyright. Mostly whitespace.
 */
export default function Footer() {
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const result = newsletterSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Please check your email address");
      return;
    }
    setPending(true);
    const r = await submitLead("Newsletter signup", { email: sanitizeEmail(result.data.email) }, hp);
    setPending(false);
    if (!r.ok) {
      setError(r.error ?? "Something went quiet — please try again.");
      return;
    }
    trackEvent("newsletter_signup");
    setDone(true);
  };

  return (
    <footer className="bg-sand">
      <div className="mx-auto max-w-[1440px] px-6 py-28 md:px-12 md:py-40">
        <div className="grid gap-20 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-serif text-[2rem] leading-snug md:text-[2.6rem]">
              Slow down.
              <br />
              We will keep the room warm.
            </p>
            <form onSubmit={submit} className="mt-12 max-w-sm">
              <Honeypot value={hp} onChange={setHp} />
              <label htmlFor="newsletter" className="kicker">
                Letters, occasionally
              </label>
              {done ? (
                <p className="mt-4 text-sm text-gray">Thank you. We write rarely, and kindly.</p>
              ) : (
                <>
                  <div className="rule mt-4 flex items-center gap-3 pt-1">
                    <input
                      id="newsletter"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email"
                      aria-invalid={!!error}
                      className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-gray/70"
                    />
                    <button
                      type="submit"
                      disabled={pending}
                      data-cursor
                      className="link-center pb-0.5 text-sm disabled:opacity-40"
                    >
                      {pending ? "Sending…" : "Subscribe"}
                    </button>
                  </div>
                  {error && <p className="mt-3 text-xs text-[#a1584e]">{error}</p>}
                </>
              )}
            </form>
          </div>

          <nav aria-label="Footer">
            <p className="kicker">Visit</p>
            <ul className="mt-6 flex flex-col gap-3 text-sm text-ink/80">
              <li><Link className="link-center" href="/#treatments">Treatments</Link></li>
              <li><Link className="link-center" href="/#space">The Space</Link></li>
              <li><Link className="link-center" href="/#membership">Membership</Link></li>
              <li><Link className="link-center" href="/#locations">Locations</Link></li>
              <li><Link className="link-center" href="/book">Book appointment</Link></li>
            </ul>
          </nav>

          <div>
            <p className="kicker">Contact</p>
            <ul className="mt-6 flex flex-col gap-3 text-sm text-ink/80">
              <li>
                <a className="link-center" href={`mailto:${SITE.email}`} data-track="email_click">
                  {SITE.email}
                </a>
              </li>
              <li>
                <a className="link-center" href={SITE.instagram} target="_blank" rel="noreferrer">
                  Instagram
                </a>
              </li>
              {LOCATIONS.map((l) => (
                <li key={l.city} className="text-gray">
                  {l.city} · {l.address[0]} ·{" "}
                  <a
                    className="link-center"
                    href={`tel:${l.phone.replace(/[^+\d]/g, "")}`}
                    data-track="phone_click"
                    data-track-studio={l.city}
                  >
                    {l.phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rule mt-24 flex flex-col gap-2 pt-8 text-xs text-gray md:flex-row md:items-center md:justify-between">
          <span>{SITE.copyright}</span>
          <Link className="link-center" href="/legal">
            Privacy · Terms · Cancellation · Accessibility
          </Link>
          <span>{SITE.tagline}.</span>
        </div>
        <p className="mt-4 text-xs text-gray/70">
          Demonstration template — the studio, names, testimonials, addresses and prices shown
          are fictional and for preview only.
        </p>
      </div>
    </footer>
  );
}
