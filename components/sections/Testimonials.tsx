"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { TESTIMONIALS } from "@/lib/site";

/**
 * Chapter 7 — Testimonials.
 * One large serif quote at a time with a small round portrait,
 * crossfading on a slow clock. Dots for the impatient.
 */
export default function Testimonials() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % TESTIMONIALS.length), 7000);
    return () => clearInterval(t);
  }, []);

  const current = TESTIMONIALS[index];

  return (
    <section className="bg-sand">
      <div className="mx-auto flex max-w-[1100px] flex-col items-center px-6 py-36 text-center md:px-12 md:py-52">
        <p className="kicker">07 — Kind words</p>

        <div className="relative mt-16 flex min-h-[16em] w-full flex-col items-center md:min-h-[12em]">
          <AnimatePresence mode="wait">
            <motion.figure
              key={index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-col items-center"
            >
              <blockquote className="type-quote max-w-[22em]">“{current.quote}”</blockquote>
              <figcaption className="mt-12 flex items-center gap-4">
                <span className="relative h-12 w-12 overflow-hidden rounded-full">
                  <Image src={current.portrait} alt={current.name} fill sizes="48px" className="object-cover" />
                </span>
                <span className="text-left">
                  <span className="block text-sm">{current.name}</span>
                  <span className="block text-xs text-gray">{current.role}</span>
                </span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        <div className="mt-14 flex gap-3" role="tablist" aria-label="Testimonials">
          {TESTIMONIALS.map((t, i) => (
            <button
              key={t.name}
              role="tab"
              aria-selected={i === index}
              aria-label={`Show quote from ${t.name}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === index ? "w-8 bg-ink/70" : "w-1.5 bg-ink/20 hover:bg-ink/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
