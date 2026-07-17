"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { MEMBERSHIP } from "@/lib/site";
import { bookingDetailsSchema } from "@/lib/validation";
import { submitLead } from "@/lib/submitForm";

type Plan = (typeof MEMBERSHIP)[number];

/**
 * Chapter 5 — Membership.
 * Three hairline columns. Selecting a plan opens a membership-interest form
 * that auto-captures the chosen plan and submits the visitor's contact details
 * through the shared form pipeline (no payment — a concierge follows up).
 */
export default function MembershipSection() {
  const [plan, setPlan] = useState<Plan | null>(null);

  return (
    <section id="membership" className="scroll-mt-24 bg-sand py-32 md:py-44">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <p className="kicker">05 — Membership</p>
        <AnimatedSection>
          <h2 className="type-chapter mt-12 max-w-[13em]">Rest, kept on the calendar.</h2>
        </AnimatedSection>

        <div className="rule mt-24 grid md:grid-cols-3">
          {MEMBERSHIP.map((tier, i) => (
            <AnimatedSection
              key={tier.name}
              delay={i * 0.08}
              className={`flex flex-col gap-10 py-14 md:px-10 ${
                i > 0 ? "rule md:border-t-0 md:border-l md:border-l-[color-mix(in_srgb,var(--oak)_38%,transparent)]" : ""
              } ${i === 0 ? "md:pl-0" : ""} ${i === MEMBERSHIP.length - 1 ? "md:pr-0" : ""}`}
            >
              <div className="flex items-baseline justify-between">
                <h3 className="type-title">{tier.name}</h3>
                {tier.featured && <span className="kicker text-sage">Most chosen</span>}
              </div>
              <p className="font-serif text-5xl font-normal">
                ${tier.price}
                <span className="ml-2 align-middle text-sm font-sans text-gray">/ {tier.per}</span>
              </p>
              <ul className="flex flex-col gap-3 text-[0.95rem] leading-relaxed text-gray">
                {tier.includes.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <div className="mt-auto pt-4">
                <button
                  type="button"
                  onClick={() => setPlan(tier)}
                  data-cursor
                  className={`inline-flex rounded-full px-7 py-3.5 text-[0.75rem] tracking-[0.08em] transition-all duration-500 hover:-translate-y-0.5 ${
                    tier.featured
                      ? "bg-ink text-paper hover:shadow-[0_10px_30px_-12px_rgba(28,28,28,0.45)]"
                      : "border border-ink/25 text-ink hover:border-ink"
                  }`}
                >
                  Ask about membership
                </button>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>

      <MembershipModal plan={plan} onClose={() => setPlan(null)} />
    </section>
  );
}

function MembershipModal({ plan, onClose }: { plan: Plan | null; onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  // fresh form each time a plan is opened
  useEffect(() => {
    if (plan) {
      setErrors({});
      setDone(false);
    }
  }, [plan]);

  // lock scroll + escape to close while open
  useEffect(() => {
    if (!plan) return;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [plan, onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = bookingDetailsSchema.safeParse({ name, email, notes: message });
    if (!result.success) {
      const fe: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const p = issue.path.join(".");
        if (!fe[p]) fe[p] = issue.message;
      }
      setErrors(fe);
      return;
    }
    setPending(true);
    const r = await submitLead(`Membership interest — ${plan?.name}`, {
      plan: plan ? `${plan.name} · $${plan.price}/${plan.per}` : "",
      name,
      email,
      phone,
      message,
    });
    setPending(false);
    if (!r.ok) {
      setErrors({ form: r.error ?? "Something went quiet — please try again." });
      return;
    }
    setDone(true);
  };

  const inputCls =
    "w-full border-0 border-b border-[color-mix(in_srgb,var(--oak)_38%,transparent)] bg-transparent py-3 text-base outline-none transition-colors duration-500 focus:border-ink placeholder:text-gray/60";

  return (
    <AnimatePresence>
      {plan && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={`${plan.name} membership enquiry`}
        >
          <button className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
          <motion.div
            className="relative z-10 max-h-[90vh] w-full overflow-y-auto bg-paper p-8 sm:max-w-lg sm:rounded-sm sm:p-12"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <button
              onClick={onClose}
              className="absolute right-6 top-6 text-[0.75rem] tracking-[0.08em] text-gray hover:text-ink"
            >
              Close
            </button>

            {done ? (
              <div className="pt-4">
                <p className="kicker text-sage">Enquiry received</p>
                <p className="mt-4 font-serif text-[1.7rem] leading-snug">
                  Thank you{name.trim() ? `, ${name.trim().split(" ")[0]}` : ""}.
                </p>
                <p className="mt-4 text-sm text-gray">
                  A concierge will be in touch at <span className="text-ink">{email}</span>{" "}
                  about the <span className="text-ink">{plan.name}</span> membership within a
                  day.
                </p>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <p className="kicker">Membership</p>
                <h3 className="type-title mt-3">The {plan.name} membership</h3>
                <p className="mt-3 text-sm text-gray">
                  ${plan.price} / {plan.per} — no payment now. Leave your details and a
                  concierge will walk you through it.
                </p>

                <div className="mt-8 flex flex-col gap-6">
                  <label className="block">
                    <span className="kicker text-gray">Your name</span>
                    <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} aria-invalid={!!errors.name} />
                    {errors.name && <span className="mt-1 block text-xs text-[#a1584e]">{errors.name}</span>}
                  </label>
                  <label className="block">
                    <span className="kicker text-gray">Email</span>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} aria-invalid={!!errors.email} />
                    {errors.email && <span className="mt-1 block text-xs text-[#a1584e]">{errors.email}</span>}
                  </label>
                  <label className="block">
                    <span className="kicker text-gray">Phone (optional)</span>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
                  </label>
                  <label className="block">
                    <span className="kicker text-gray">Anything to add (optional)</span>
                    <input value={message} onChange={(e) => setMessage(e.target.value)} className={inputCls} />
                  </label>
                </div>

                {errors.form && <p className="mt-4 text-xs text-[#a1584e]">{errors.form}</p>}

                <button
                  type="submit"
                  disabled={pending}
                  className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-ink px-8 py-4 text-[0.8rem] tracking-[0.08em] text-paper transition-all duration-500 hover:-translate-y-0.5 disabled:opacity-40 sm:w-auto"
                >
                  {pending ? "Sending…" : "Send enquiry"}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
