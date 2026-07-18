import Link from "next/link";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { LOCATIONS } from "@/lib/site";

/**
 * Chapter 6 — Locations.
 * Two studios, typeset like an index page: city as display type, full address,
 * phone, hours, parking, directions — and a book button that pre-selects the
 * studio on the booking page.
 */
export default function LocationSection() {
  return (
    <section id="locations" className="scroll-mt-24">
      <div className="mx-auto max-w-[1440px] px-6 py-32 md:px-12 md:py-48">
        <p className="kicker">06 — Locations</p>
        <AnimatedSection>
          <h2 className="type-chapter mt-12 max-w-[13em]">Two doors. Both quiet.</h2>
        </AnimatedSection>

        <div className="mt-24 flex flex-col">
          {LOCATIONS.map((l, i) => (
            <AnimatedSection key={l.city} delay={i * 0.05} className="rule">
              <div className="grid gap-8 py-16 md:grid-cols-12 md:items-baseline">
                <h3 className="font-serif text-[2.4rem] leading-none md:col-span-3 md:text-[3.2rem]">
                  {l.city}
                </h3>

                <div className="text-[0.95rem] leading-relaxed text-gray md:col-span-3">
                  <address className="not-italic">
                    {l.address.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>
                  <a
                    className="link-center mt-3 inline-block"
                    href={`tel:${l.phone.replace(/[^+\d]/g, "")}`}
                    data-track="phone_click"
                    data-track-studio={l.city}
                  >
                    {l.phone}
                  </a>
                </div>

                <div className="text-[0.95rem] leading-relaxed text-gray md:col-span-3">
                  {l.hours.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                  <p className="mt-4">
                    <span className="kicker block text-gray/80">Parking</span>
                    <span className="mt-1 block">{l.parking}</span>
                  </p>
                </div>

                <div className="flex flex-col items-start gap-4 md:col-span-3">
                  <Link
                    href={`/book?location=${encodeURIComponent(l.city)}`}
                    className="inline-flex rounded-full bg-ink px-6 py-3 text-[0.75rem] tracking-[0.08em] text-paper transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(28,28,28,0.45)]"
                    data-track="begin_booking"
                    data-track-source="location"
                    data-track-studio={l.city}
                  >
                    Book at {l.city}
                  </Link>
                  <div className="flex flex-col gap-2 text-[0.95rem]">
                    <a
                      className="link-center self-start"
                      href={l.maps}
                      target="_blank"
                      rel="noreferrer"
                      data-track="directions_click"
                      data-track-studio={l.city}
                    >
                      Directions ↗
                    </a>
                    <a
                      className="link-center self-start"
                      href={`mailto:${l.email}`}
                      data-track="email_click"
                      data-track-studio={l.city}
                    >
                      Write to us
                    </a>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
          <div className="rule" />
        </div>
      </div>
    </section>
  );
}
