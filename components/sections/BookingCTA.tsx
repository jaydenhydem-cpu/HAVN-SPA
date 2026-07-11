import SplitLines from "@/components/ui/SplitLines";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Button from "@/components/ui/Button";

/**
 * Chapter 8 — The invitation.
 * A nearly empty screen. One sentence, one button, and room to breathe.
 */
export default function BookingCTA() {
  return (
    <section className="flex min-h-[88vh] items-center">
      <div className="mx-auto flex max-w-[1100px] flex-col items-center px-6 text-center md:px-12">
        <SplitLines
          as="h2"
          className="type-chapter"
          text={"Your hour of quiet\nis waiting."}
        />
        <AnimatedSection delay={0.25} className="mt-14">
          <Button href="/book">Book your visit</Button>
        </AnimatedSection>
      </div>
    </section>
  );
}
