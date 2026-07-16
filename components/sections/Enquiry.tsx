"use client";

import { useState } from "react";
import { enquirySchema } from "@/lib/validation";
import { submitLead } from "@/lib/submitForm";

/**
 * General enquiry / lead-capture form. Mirrors the booking + newsletter
 * pattern: client-side zod feedback, POST to /api/enquiry (which re-validates,
 * sanitizes and delivers). Log-only until SITE.formEndpoint is set.
 */
export default function Enquiry() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = enquirySchema.safeParse({ name, email, message });
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
    const r = await submitLead("New enquiry", result.data);
    setPending(false);
    if (!r.ok) {
      setErrors({ form: r.error ?? "Something went quiet — please try again." });
      return;
    }
    setDone(true);
  };

  return (
    <section id="enquire" className="bg-sand">
      <div className="mx-auto max-w-[1440px] px-6 py-28 md:px-12 md:py-40">
        <div className="grid gap-16 md:grid-cols-[1fr_1.1fr] md:gap-24">
          <div>
            <p className="kicker">A quiet word</p>
            <h2 className="mt-6 font-serif text-[2.2rem] leading-[1.05] md:text-[3.2rem]">
              Before you visit,
              <br />
              ask us anything.
            </h2>
            <p className="mt-8 max-w-sm text-ink/70">
              A first visit, a gift, a group, or a question about the rooms — write
              to us and we will reply, unhurried.
            </p>
          </div>

          <div>
            {done ? (
              <div className="rule pt-10">
                <p className="kicker text-sage">Message received</p>
                <p className="mt-4 font-serif text-[1.7rem] leading-snug">
                  Thank you{name.trim() ? `, ${name.trim().split(" ")[0]}` : ""}.
                </p>
                <p className="mt-4 text-sm text-gray">
                  Your note is with us — we&rsquo;ll reply to{" "}
                  <span className="text-ink">{email}</span> within a day, usually
                  sooner.
                </p>
                {message.trim() && (
                  <p className="mt-6 border-l border-ink/15 pl-4 text-sm italic text-ink/70">
                    &ldquo;{message.trim()}&rdquo;
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-8" noValidate>
                <Field label="Your name" value={name} onChange={setName} error={errors.name} />
                <Field label="Email" type="email" value={email} onChange={setEmail} error={errors.email} />
                <Field label="Your message" textarea value={message} onChange={setMessage} error={errors.message} />
                {errors.form && <p className="text-xs text-[#a1584e]">{errors.form}</p>}
                <button
                  type="submit"
                  disabled={pending}
                  data-cursor
                  className="mt-2 inline-flex w-fit rounded-full bg-ink px-8 py-4 text-[0.8rem] tracking-[0.08em] text-paper transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(28,28,28,0.45)] disabled:opacity-40"
                >
                  {pending ? "Sending…" : "Send message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  textarea?: boolean;
}) {
  const cls =
    "w-full bg-transparent py-3 text-base outline-none placeholder:text-gray/60";
  return (
    <label className="block">
      <span className="kicker">{label}</span>
      <div className="rule mt-3 pt-1">
        {textarea ? (
          <textarea
            rows={4}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={!!error}
            className={`${cls} resize-none`}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={!!error}
            className={cls}
          />
        )}
      </div>
      {error && <p className="mt-2 text-xs text-[#a1584e]">{error}</p>}
    </label>
  );
}
