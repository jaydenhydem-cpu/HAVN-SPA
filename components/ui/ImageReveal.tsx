"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, prefersReducedMotion, EASE_INOUT } from "@/lib/gsap";

/**
 * Photograph with a clip-path reveal: the frame opens from the bottom
 * while the image settles from a gentle 1.12 scale. Optional parallax
 * drift afterwards — never more than 8%.
 */
export default function ImageReveal({
  src,
  alt,
  className = "",
  sizes = "100vw",
  priority = false,
  parallax = false,
  position = "object-center",
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  parallax?: boolean;
  position?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;
    if (prefersReducedMotion()) {
      gsap.set(wrap, { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(inner, { scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        wrap,
        { clipPath: "inset(0% 0% 100% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.4,
          ease: EASE_INOUT,
          scrollTrigger: { trigger: wrap, start: "top 85%", once: true },
        }
      );
      gsap.fromTo(
        inner,
        { scale: 1.12 },
        {
          scale: 1,
          duration: 1.8,
          ease: "power2.out",
          scrollTrigger: { trigger: wrap, start: "top 85%", once: true },
        }
      );
      if (parallax) {
        gsap.to(inner, {
          yPercent: 6,
          ease: "none",
          scrollTrigger: { trigger: wrap, start: "top bottom", end: "bottom top", scrub: true },
        });
      }
    }, wrap);
    return () => ctx.revert();
  }, [parallax]);

  return (
    <div ref={wrapRef} className={`img-zoom relative overflow-hidden ${className}`}>
      <div ref={innerRef} className="absolute inset-0 will-change-transform">
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={`object-cover ${position}`} />
      </div>
    </div>
  );
}
