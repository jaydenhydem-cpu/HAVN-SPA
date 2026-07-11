import AnimatedSection from "@/components/ui/AnimatedSection";
import Button from "@/components/ui/Button";
import { MEMBERSHIP } from "@/lib/site";

/**
 * Chapter 5 — Membership.
 * A pricing layout with no boxes: three columns separated by oak
 * hairlines, typography doing all of the work.
 */
export default function MembershipSection() {
  return (
    <section id="membership" className="scroll-mt-24 bg-sand py-32 md:py-44">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <p className="kicker">05 — Membership</p>
        <AnimatedSection>
          <h2 className="type-chapter mt-12 max-w-[13em]">Rest, kept on the calendar.</h2>
        </AnimatedSection>

        <div className="rule mt-24 grid md:grid-cols-3">
          {MEMBERSHIP.map((tier, i) => (
            <AnimatedSection
              key={tier.name}
              delay={i * 0.08}
              className={`flex flex-col gap-10 py-14 md:px-10 ${
                i > 0 ? "rule md:border-t-0 md:border-l md:border-l-[color-mix(in_srgb,var(--oak)_38%,transparent)]" : ""
              } ${i === 0 ? "md:pl-0" : ""} ${i === MEMBERSHIP.length - 1 ? "md:pr-0" : ""}`}
            >
              <div className="flex items-baseline justify-between">
                <h3 className="type-title">{tier.name}</h3>
                {tier.featured && <span className="kicker text-sage">Most chosen</span>}
              </div>
              <p className="font-serif text-5xl font-normal">
                ${tier.price}
                <span className="ml-2 align-middle text-sm font-sans text-gray">/ {tier.per}</span>
              </p>
              <ul className="flex flex-col gap-3 text-[0.95rem] leading-relaxed text-gray">
                {tier.includes.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <div className="mt-auto pt-4">
                <Button href="/book" variant={tier.featured ? "solid" : "ghost"}>
                  Begin
                </Button>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
