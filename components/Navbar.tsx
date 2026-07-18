"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { SITE } from "@/lib/site";

const LINKS = [
  { label: "Treatments", href: "/#treatments" },
  { label: "The Space", href: "/#space" },
  { label: "Membership", href: "/#membership" },
  { label: "Locations", href: "/#locations" },
];

/**
 * Sticky navigation: almost transparent at the top of the page,
 * settling onto solid warm white once the visitor begins to scroll.
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // lock body scroll while the menu is open
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 ${
        scrolled ? "bg-paper/95 shadow-[0_1px_0_rgba(28,28,28,0.06)] backdrop-blur-sm" : "bg-transparent"
      }`}
    >
      <nav
        className={`mx-auto flex max-w-[1440px] items-center justify-between px-6 transition-all duration-700 md:px-12 ${
          scrolled ? "py-4" : "py-7"
        }`}
        aria-label="Primary"
      >
        <Link href="/" className="font-serif text-[1.35rem] tracking-[0.02em]" data-cursor>
          {SITE.name}
        </Link>

        <ul className="hidden items-center gap-10 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="link-center text-[0.8rem] tracking-[0.06em] text-ink/80">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          <Link
            href="/book"
            data-cursor
            data-track="begin_booking"
            data-track-source="nav"
            className="hidden rounded-full bg-ink px-6 py-3 text-[0.75rem] tracking-[0.08em] text-paper transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(28,28,28,0.45)] md:inline-flex"
          >
            Book appointment
          </Link>
          <button
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden"
          >
            <span
              className={`h-px w-6 bg-ink transition-transform duration-500 ${open ? "translate-y-[3px] rotate-45" : ""}`}
            />
            <span
              className={`h-px w-6 bg-ink transition-transform duration-500 ${open ? "-translate-y-[3px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </nav>

      {/* mobile menu — slides down softly, serif links */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-[-1] flex flex-col justify-between bg-paper px-6 pb-12 pt-32"
          >
            <ul className="flex flex-col gap-2">
              {LINKS.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.07, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="type-chapter block py-2"
                  >
                    {l.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.6 }}
            >
              <Link
                href="/book"
                onClick={() => setOpen(false)}
                data-track="begin_booking"
                data-track-source="mobile_menu"
                className="inline-flex w-full items-center justify-center rounded-full bg-ink px-8 py-5 text-[0.85rem] tracking-[0.08em] text-paper"
              >
                Book appointment
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
