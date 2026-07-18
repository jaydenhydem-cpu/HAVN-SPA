import type { Metadata } from "next";
import Link from "next/link";
import { SITE, LOCATIONS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Policies & Legal",
  description:
    "HAVN's privacy policy, terms of use, cancellation policy and accessibility statement.",
  alternates: { canonical: "/legal" },
};

/** One place for the practical fine print: privacy, terms, cancellation,
 *  accessibility. Written to match what the site actually does — update
 *  alongside any change to forms, booking or delivery. */
export default function LegalPage() {
  const sections = [
    { id: "privacy", label: "Privacy" },
    { id: "terms", label: "Terms of use" },
    { id: "cancellation", label: "Cancellation" },
    { id: "accessibility", label: "Accessibility" },
  ];

  return (
    <div className="mx-auto max-w-[880px] px-6 pb-32 pt-40 md:px-12 md:pt-52">
      <p className="kicker">The fine print</p>
      <h1 className="type-chapter mt-10">Policies &amp; legal.</h1>
      <p className="measure mt-8 text-[0.95rem] text-gray">
        The practical side of a quiet place — what we do with your information,
        and what you can expect from us.
      </p>

      <nav aria-label="Policy sections" className="rule mt-14 pt-6">
        <ul className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          {sections.map((s) => (
            <li key={s.id}>
              <a className="link-center text-ink/80" href={`#${s.id}`}>
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* ——— Privacy ——— */}
      <section id="privacy" className="scroll-mt-28">
        <h2 className="type-title mt-20">Privacy policy</h2>
        <div className="measure mt-6 flex flex-col gap-4 text-[0.95rem] leading-relaxed text-gray">
          <p>
            When you request an appointment, send an enquiry, ask about
            membership or join our newsletter, we collect only what you type
            into the form: your name, email address, optional phone number, and
            the details of your request (such as treatment, studio, date and
            notes).
          </p>
          <p>
            That information is delivered by email to the studio through a form
            delivery service, and we use it for one purpose: responding to you
            and preparing your visit. We do not sell it, share it with
            advertisers, or add you to marketing lists you did not ask for. The
            newsletter is separate and only ever contains what you signed up
            for — you can leave it with one reply.
          </p>
          <p>
            No payment details are collected on this website. Your visit is
            settled at the studio. If our analytics are enabled, they measure
            page visits and button clicks in aggregate to understand how the
            site is used — not to identify you.
          </p>
          <p>
            To have your information corrected or deleted, write to{" "}
            <a className="link-center text-ink" href={`mailto:${SITE.email}`}>
              {SITE.email}
            </a>{" "}
            and we will take care of it promptly.
          </p>
        </div>
      </section>

      {/* ——— Terms ——— */}
      <section id="terms" className="scroll-mt-28">
        <h2 className="type-title mt-20">Terms of use</h2>
        <div className="measure mt-6 flex flex-col gap-4 text-[0.95rem] leading-relaxed text-gray">
          <p>
            Booking through this website sends a request, not a final
            reservation — every appointment is confirmed personally by email
            before it is held for you. Prices shown are in US dollars and
            include the treatment described; enhancements are optional and
            priced separately. Gratuity is welcome but never expected or added
            automatically.
          </p>
          <p>
            Some treatments are not suitable during pregnancy or with certain
            medical conditions — please mention anything relevant in the notes
            when you book, and we will advise honestly, including recommending
            against a treatment when that is the right answer.
          </p>
          <p>
            The content of this website — text, photography and design — belongs
            to {SITE.name} Studio and may not be reused commercially without
            permission.
          </p>
        </div>
      </section>

      {/* ——— Cancellation ——— */}
      <section id="cancellation" className="scroll-mt-28">
        <h2 className="type-title mt-20">Cancellation policy</h2>
        <div className="measure mt-6 flex flex-col gap-4 text-[0.95rem] leading-relaxed text-gray">
          <p>
            Plans change; we understand. Cancel or reschedule freely up to{" "}
            <span className="text-ink">24 hours</span> before your appointment —
            by email, by phone, or by replying to your confirmation.
          </p>
          <p>
            Inside 24 hours we may charge half the treatment price, because the
            hour was held for you and cannot be offered to another guest. A
            missed appointment without notice may be charged in full. No
            deposits are taken online.
          </p>
          <p>
            If you arrive late we will always do our best, but your treatment
            may need to end on time out of respect for the next guest.
          </p>
        </div>
      </section>

      {/* ——— Accessibility ——— */}
      <section id="accessibility" className="scroll-mt-28">
        <h2 className="type-title mt-20">Accessibility statement</h2>
        <div className="measure mt-6 flex flex-col gap-4 text-[0.95rem] leading-relaxed text-gray">
          <p>
            This website is built to be usable by everyone: it can be navigated
            entirely by keyboard, works with screen readers, keeps text contrast
            readable, and respects your system&rsquo;s reduced-motion preference —
            when that is set, animations step aside.
          </p>
          <p>
            Both studios are at street level. If there is anything we can
            prepare to make your visit easier, tell us in the booking notes or
            call ahead — {LOCATIONS.map((l) => `${l.city} ${l.phone}`).join(", ")}.
          </p>
          <p>
            If any part of this website is difficult to use with assistive
            technology, please write to{" "}
            <a className="link-center text-ink" href={`mailto:${SITE.email}`}>
              {SITE.email}
            </a>{" "}
            — we treat accessibility issues as defects and fix them.
          </p>
        </div>
      </section>

      <div className="rule mt-20 pt-8">
        <Link className="link-center text-sm text-ink/80" href="/">
          ← Back to {SITE.name}
        </Link>
      </div>
    </div>
  );
}
