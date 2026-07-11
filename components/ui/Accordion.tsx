"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type AccordionItem = {
  id: string;
  heading: ReactNode;
  body: ReactNode;
};

/**
 * Editorial accordion: hairline rows, serif headings, natural height
 * animation. Framer Motion handles only this small UI state.
 */
export default function Accordion({
  items,
  defaultOpen,
}: {
  items: AccordionItem[];
  defaultOpen?: string;
}) {
  const [open, setOpen] = useState<string | null>(defaultOpen ?? null);

  return (
    <ul>
      {items.map((item) => {
        const isOpen = open === item.id;
        return (
          <li key={item.id} className="rule">
            <button
              onClick={() => setOpen(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              data-cursor
              className="flex w-full items-center justify-between gap-8 py-8 text-left"
            >
              <span className="type-title">{item.heading}</span>
              <span
                className={`text-2xl font-light text-gray transition-transform duration-500 ${
                  isOpen ? "rotate-45" : ""
                }`}
                aria-hidden
              >
                +
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pb-10">{item.body}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
