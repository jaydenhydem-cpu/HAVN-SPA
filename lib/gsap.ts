import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** House easing — nothing bounces, nothing overshoots. */
export const EASE = "power2.out";
export const EASE_INOUT = "power2.inOut";

export { gsap, ScrollTrigger };
