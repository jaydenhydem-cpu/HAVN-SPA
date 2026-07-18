"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, prefersReducedMotion, EASE, EASE_INOUT } from "@/lib/gsap";
import Button from "@/components/ui/Button";
import { SITE, LOCATIONS } from "@/lib/site";

/**
 * Chapter 0 — Arrival.
 * Asymmetric editorial hero: massive serif statement on warm white,
 * one photograph breathing in a tall column to the right. The type
 * rises line by line; the image opens with a clip reveal; afterwards
 * the photo drifts a few percent as you scroll. Nothing else moves.
 */
export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const imgInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const lines = root.querySelectorAll<HTMLElement>(".line-inner");
    const rest = root.querySelectorAll<HTMLElement>("[data-hero-fade]");

    if (prefersReducedMotion()) {
      gsap.set([...lines, ...rest], { clearProps: "all", opacity: 1, y: 0 });
      gsap.set(imgWrapRef.current, { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(imgInnerRef.current, { scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: EASE } })
        .to(lines, { yPercent: -110, duration: 1.3, stagger: 0.1 }, 0.15)
        .fromTo(
          imgWrapRef.current,
          { clipPath: "inset(0% 0% 100% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: EASE_INOUT },
          0.3
        )
        .fromTo(imgInnerRef.current, { scale: 1.14 }, { scale: 1, duration: 2, ease: EASE }, 0.3)
        .fromTo(rest, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08 }, 1.05);

      // gentle parallax after arrival — well under 10%
      gsap.to(imgInnerRef.current, {
        yPercent: 7,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const heroLines = SITE.hero.lines;

  return (
    <section ref={rootRef} className="relative min-h-screen">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-6 pt-36 md:grid-cols-[1.15fr_0.85fr] md:gap-8 md:px-12 md:pt-44">
        {/* ——— statement ——— */}
        <div className="flex flex-col justify-between pb-16">
          <h1 className="type-hero" aria-label={SITE.hero.headline}>
            {heroLines.map((line) => (
              <span key={line} className="line-mask" aria-hidden>
                <span className="line-inner" style={{ transform: "translateY(110%)" }}>
                  {line}
                </span>
              </span>
            ))}
          </h1>

          <div className="mt-20 max-w-md md:mt-0">
            <p data-hero-fade className="measure text-[0.95rem] text-gray">
              {SITE.hero.subtext}
            </p>
            <div data-hero-fade className="mt-10 flex flex-wrap items-center gap-5">
              <span data-track="begin_booking" data-track-source="hero">
                <Button href="/book">Book appointment</Button>
              </span>
              <Button href="/#treatments" variant="ghost">
                Explore treatments
              </Button>
            </div>
          </div>
        </div>

        {/* ——— one photograph, breathing ——— */}
        <div className="relative">
          <div
            ref={imgWrapRef}
            className="relative aspect-[3/4] overflow-hidden md:aspect-auto md:h-[78vh]"
            style={{ clipPath: "inset(0% 0% 100% 0%)" }}
          >
            <div ref={imgInnerRef} className="absolute -inset-y-[8%] inset-x-0 will-change-transform">
              <Image
                src="/images/hero.jpg"
                alt="A stone bath in soft daylight"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 44vw"
                className="object-cover"
              />
            </div>
          </div>
          <p data-hero-fade className="kicker mt-5 flex justify-between">
            <span>{LOCATIONS.map((l) => l.city).join(" — ")}</span>
            <span>Est. 2019</span>
          </p>
        </div>
      </div>
    </section>
  );
}
