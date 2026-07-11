"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * A quiet cursor companion: a small charcoal ring trailing the native
 * cursor (which stays visible), gently enlarging over interactive
 * elements. Fine pointers only; disabled with reduced motion.
 */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = ref.current;
    if (!el) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });

    const move = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const interactive = t.closest("a, button, [data-cursor]");
      gsap.to(el, { scale: interactive ? 2.2 : 1, opacity: interactive ? 0.55 : 1, duration: 0.4, ease: "power2.out" });
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    gsap.set(el, { xPercent: -50, yPercent: -50, opacity: 0 });
    gsap.to(el, { opacity: 1, duration: 0.6, delay: 0.3 });

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[90] hidden h-7 w-7 rounded-full border border-ink/40 md:block"
    />
  );
}
