"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const FRAMES = [
  { src: "/images/space-sauna.jpg", caption: "The warm room — birch, cedar and quiet light" },
  { src: "/images/hero.jpg", caption: "The bath — stone, pebble and soft water" },
  { src: "/images/space-light.jpg", caption: "Morning light in the garden room" },
  { src: "/images/space-sea.jpg", caption: "The sea, four minutes on foot" },
];

/**
 * Chapter 3 — The Space.
 * A horizontal drift of architectural photography, scrubbed by the
 * vertical scroll. On touch devices the section falls back to a
 * simple vertical stack — no pinning, no tricks.
 */
export default function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || prefersReducedMotion()) return;
    if (!window.matchMedia("(min-width: 768px)").matches) return;

    const ctx = gsap.context(() => {
      const distance = () => track.scrollWidth - window.innerWidth;
      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: 0.8,
          pin: true,
          invalidateOnRefresh: true,
        },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section id="space" ref={sectionRef} className="scroll-mt-24 overflow-hidden py-32 md:py-0">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 md:pt-36">
        <p className="kicker">03 — The Space</p>
        <h2 className="type-chapter mt-12 max-w-[13em]">Rooms that ask nothing of you.</h2>
      </div>

      <div
        ref={trackRef}
        className="mt-20 flex flex-col gap-16 px-6 md:h-[68vh] md:flex-row md:items-center md:gap-10 md:px-12 md:pb-28"
      >
        {FRAMES.map((f) => (
          <figure key={f.src} className="md:w-[54vw] md:shrink-0 lg:w-[44vw]">
            <div className="img-zoom relative aspect-[4/3] overflow-hidden md:aspect-[16/10]">
              <Image
                src={f.src}
                alt={f.caption}
                fill
                sizes="(max-width: 768px) 100vw, 54vw"
                className="object-cover"
              />
            </div>
            <figcaption className="kicker mt-4">{f.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
