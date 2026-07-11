import AnimatedSection from "@/components/ui/AnimatedSection";
import { LOCATIONS } from "@/lib/site";

/**
 * Chapter 6 — Locations.
 * Two studios, typeset like an index page: city as display type,
 * address, hours, directions. No map widget — a quiet link instead.
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
                <h3 className="font-serif text-[2.4rem] leading-none md:col-span-4 md:text-[3.2rem]">
                  {l.city}
                </h3>
                <address className="text-[0.95rem] not-italic leading-relaxed text-gray md:col-span-3">
                  {l.address.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
                <div className="text-[0.95rem] leading-relaxed text-gray md:col-span-3">
                  {l.hours.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col gap-2 text-[0.95rem] md:col-span-2">
                  <a className="link-center self-start" href={`mailto:${l.email}`}>
                    Write to us
                  </a>
                  <a className="link-center self-start" href={l.maps} target="_blank" rel="noreferrer">
                    Directions ↗
                  </a>
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
