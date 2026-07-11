import AnimatedSection from "@/components/ui/AnimatedSection";
import SplitLines from "@/components/ui/SplitLines";
import ImageReveal from "@/components/ui/ImageReveal";

/**
 * Chapter 1 — Philosophy.
 * Large typography, one minimal paragraph, a single photograph
 * placed off-axis. The chapter is mostly whitespace, on purpose.
 */
export default function Philosophy() {
  return (
    <section className="mx-auto max-w-[1440px] px-6 py-32 md:px-12 md:py-48">
      <p className="kicker">01 — Philosophy</p>

      <div className="mt-14 grid gap-16 md:grid-cols-12 md:gap-8">
        <SplitLines
          as="h2"
          className="type-chapter md:col-span-8"
          text={"Luxury is not more.\nLuxury is enough."}
        />

        <AnimatedSection className="md:col-span-4 md:col-start-9 md:pt-6" delay={0.15}>
          <p className="measure text-[0.95rem] text-gray">
            We built HAVN around a simple belief: the body knows how to rest — it has only been
            interrupted. Our rooms are warm, our menu is short, and our practitioners are given
            twice the usual time. Everything else, we left out.
          </p>
        </AnimatedSection>
      </div>

      <div className="mt-24 grid md:grid-cols-12">
        <ImageReveal
          src="/images/philosophy.jpg"
          alt="A still life of linen, candlelight and botanicals"
          sizes="(max-width: 768px) 100vw, 58vw"
          className="aspect-[4/3] md:col-span-7 md:col-start-4"
          parallax
        />
      </div>
    </section>
  );
}
