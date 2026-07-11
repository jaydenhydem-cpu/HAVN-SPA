"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, prefersReducedMotion, EASE } from "@/lib/gsap";

/**
 * Soft fade-up on scroll. 32px of travel, once, no bounce —
 * the animation should be almost invisible.
 */
export default function AnimatedSection({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "section" | "div" | "article" | "figure" | "li";
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 32 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.1,
          delay,
          ease: EASE,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [delay]);

  return (
    // @ts-expect-error dynamic tag shares the HTMLElement ref
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
