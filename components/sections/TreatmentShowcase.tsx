import AnimatedSection from "@/components/ui/AnimatedSection";
import ImageReveal from "@/components/ui/ImageReveal";
import Button from "@/components/ui/Button";
import { TREATMENTS, fromPrice, durationLabel } from "@/lib/site";

/**
 * Chapter 2 — Treatments.
 * Not cards: large alternating editorial blocks. One image, one
 * treatment, one paragraph, one quiet booking link. Each block is
 * given most of a viewport to breathe.
 */
export default function TreatmentShowcase() {
  return (
    <section id="treatments" className="scroll-mt-24 bg-sand py-32 md:py-44">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <p className="kicker">02 — Treatments</p>
        <AnimatedSection>
          <h2 className="type-chapter mt-12 max-w-[14em]">Five treatments. Practiced for years, never rushed.</h2>
        </AnimatedSection>

        <ol className="mt-28 flex flex-col gap-32 md:gap-44">
          {TREATMENTS.map((t, i) => {
            const reversed = i % 2 === 1;
            return (
              <li key={t.slug} className="grid items-center gap-10 md:grid-cols-12 md:gap-8">
                <ImageReveal
                  src={t.image}
                  alt={t.name}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  parallax
                  className={`aspect-[4/3] md:col-span-6 md:aspect-[16/11] ${
                    reversed ? "md:order-2 md:col-start-7" : ""
                  }`}
                />
                <AnimatedSection
                  delay={0.1}
                  className={`md:col-span-5 ${reversed ? "md:order-1 md:col-start-1" : "md:col-start-8"}`}
                >
                  <p className="kicker">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="type-title mt-6">{t.name}</h3>
                  <p className="mt-3 text-sm text-gray">
                    {durationLabel(t)} — from ${fromPrice(t)}
                  </p>
                  <p className="measure mt-8 text-[0.95rem] text-gray">{t.description}</p>
                  <p className="mt-6 text-sm text-gray">
                    <span className="kicker text-gray/80">Suited to</span> {t.suitedFor}
                  </p>
                  <div className="mt-10">
                    <Button href={`/book?treatment=${t.slug}`} variant="ghost">
                      Book {t.name}
                    </Button>
                  </div>
                </AnimatedSection>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
