"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { INGREDIENTS } from "@/lib/site";

/**
 * Chapter 4 — Ingredients.
 * An index of natural materials. Hovering (or focusing) a row reveals
 * its photograph in a fixed frame beside the list — an interactive
 * reveal that stays perfectly calm.
 */
export default function Ingredients() {
  const [active, setActive] = useState(INGREDIENTS[0]);

  return (
    <section className="mx-auto max-w-[1440px] px-6 py-32 md:px-12 md:py-48">
      <p className="kicker">04 — Ingredients</p>

      <div className="mt-14 grid gap-16 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-6">
          <AnimatedSection>
            <h2 className="type-chapter max-w-[11em]">Oil, stone, water, leaf.</h2>
            <p className="measure mt-10 text-[0.95rem] text-gray">
              Everything that touches your skin comes from a short list of things we can name and
              trust. No fragrance we didn&rsquo;t blend, no formula we can&rsquo;t explain.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <ul className="mt-16">
              {INGREDIENTS.map((ing) => (
                <li key={ing.id} className="rule">
                  <button
                    onMouseEnter={() => setActive(ing)}
                    onFocus={() => setActive(ing)}
                    onClick={() => setActive(ing)}
                    data-cursor
                    className={`flex w-full items-baseline justify-between gap-6 py-6 text-left transition-colors duration-500 ${
                      active.id === ing.id ? "text-ink" : "text-gray"
                    }`}
                    aria-pressed={active.id === ing.id}
                  >
                    <span className="type-title">{ing.name}</span>
                    <span
                      aria-hidden
                      className={`h-2 w-2 shrink-0 rounded-full transition-all duration-500 ${
                        active.id === ing.id ? "bg-sage" : "bg-transparent"
                      }`}
                    />
                  </button>
                </li>
              ))}
            </ul>
            <p className="measure mt-8 min-h-[3.5em] text-[0.95rem] text-gray">{active.body}</p>
          </AnimatedSection>
        </div>

        {/* the reveal frame */}
        <div className="relative md:col-span-5 md:col-start-8">
          <div className="relative aspect-[3/4] overflow-hidden bg-sand">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={active.image}
                  alt={active.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
          </div>
          <p className="kicker mt-4">{active.name}</p>
        </div>
      </div>
    </section>
  );
}
