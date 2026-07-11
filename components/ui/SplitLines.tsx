"use client";

import { useEffect, useRef, type ElementType } from "react";
import { gsap, prefersReducedMotion, EASE } from "@/lib/gsap";

/**
 * Staggered line reveal for display typography. Splits text on
 * whitespace into word groups wrapped in overflow-hidden masks;
 * lines rise gently into place when the element enters the viewport.
 */
export default function SplitLines({
  text,
  as: Tag = "h2",
  className = "",
  delay = 0,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const inners = el.querySelectorAll<HTMLElement>(".line-inner");
    const ctx = gsap.context(() => {
      gsap.to(inners, {
        y: 0,
        yPercent: 0,
        duration: 1.2,
        delay,
        ease: EASE,
        stagger: 0.09,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    }, el);
    return () => ctx.revert();
  }, [delay, text]);

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {text.split("\n").map((line, i) => (
        <span key={i} className="line-mask" aria-hidden>
          <span className="line-inner" style={{ transform: "translateY(110%)" }}>
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
