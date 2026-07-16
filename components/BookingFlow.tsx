"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  TREATMENTS,
  ENHANCEMENTS,
  LOCATIONS,
  TIME_SLOTS,
  isClosedOn,
  closedDayNames,
  type Treatment,
} from "@/lib/site";
import { bookingSchema, bookingDetailsSchema, getFieldErrors } from "@/lib/validation";
import { sanitizeObject } from "@/lib/sanitize";
import { submitLead } from "@/lib/submitForm";

/**
 * The booking ritual — six questions, one at a time, with a running
 * total that updates as choices are made. Progress survives a page
 * reload (sessionStorage). Ships log-only: the confirmation step
 * records the request locally; wire a backend per client.
 */

type Selections = {
  treatment: string | null;
  minutes: number | null;
  enhancements: string[];
  studio: string | null;
  date: string;
  time: string | null;
  name: string;
  email: string;
  notes: string;
};

const EMPTY: Selections = {
  treatment: null,
  minutes: null,
  enhancements: [],
  studio: null,
  date: "",
  time: null,
  name: "",
  email: "",
  notes: "",
};

const STORE_KEY = "havn:booking";
const STEPS = ["Treatment", "Length", "Enhancements", "Studio", "Time", "You"] as const;

const stepMotion = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
};

/* ————— tiny building blocks, all hairline-styled ————— */

function OptionRow({
  selected,
  onSelect,
  title,
  meta,
  note,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  meta?: string;
  note?: string;
}) {
  return (
    <li className="rule">
      <button
        type="button"
        onClick={onSelect}
        data-cursor
        aria-pressed={selected}
        className={`group flex w-full items-baseline justify-between gap-6 py-6 text-left transition-colors duration-500 ${
          selected ? "text-ink" : "text-gray hover:text-ink"
        }`}
      >
        <span>
          <span className="flex items-center gap-4">
            <span
              aria-hidden
              className={`h-2 w-2 shrink-0 rounded-full transition-colors duration-500 ${
                selected ? "bg-sage" : "bg-ink/15 group-hover:bg-ink/30"
              }`}
            />
            <span className="font-serif text-xl md:text-2xl">{title}</span>
          </span>
          {note && <span className="mt-2 block pl-6 text-sm text-gray">{note}</span>}
        </span>
        {meta && <span className="shrink-0 text-sm tabular-nums">{meta}</span>}
      </button>
    </li>
  );
}

const inputCls =
  "w-full border-0 border-b border-[color-mix(in_srgb,var(--oak)_38%,transparent)] bg-transparent py-4 text-base outline-none transition-colors duration-500 focus:border-ink placeholder:text-gray/60";

/* ————— the flow ————— */

function Flow() {
  const params = useSearchParams();
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState<Selections>(EMPTY);
  const [confirmed, setConfirmed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [serverTotal, setServerTotal] = useState<number | null>(null);

  // restore a half-finished booking, then apply any ?treatment= preselect
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { step: number; sel: Selections };
        setStep(parsed.step);
        setSel(parsed.sel);
      }
    } catch {
      /* fresh start is fine */
    }
    const pre = params.get("treatment");
    if (pre && TREATMENTS.some((t) => t.slug === pre)) {
      setSel((s) => (s.treatment === pre ? s : { ...s, treatment: pre, minutes: null }));
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated || confirmed) return;
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify({ step, sel }));
    } catch {
      /* private mode — non-fatal */
    }
  }, [step, sel, hydrated, confirmed]);

  // On confirmation, bring the "Request received" screen to the top so it isn't
  // hidden under the sticky nav after submitting from a lower step.
  useEffect(() => {
    if (!confirmed) return;
    const lenis = (window as unknown as { __lenis?: { scrollTo: (t: number) => void } }).__lenis;
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  }, [confirmed]);

  const treatment: Treatment | undefined = TREATMENTS.find((t) => t.slug === sel.treatment);
  const duration = treatment?.durations.find((d) => d.minutes === sel.minutes);
  const studio = LOCATIONS.find((l) => l.city === sel.studio);
  const chosenEnhancements = ENHANCEMENTS.filter((e) => sel.enhancements.includes(e.id));

  const total = useMemo(
    () => (duration?.price ?? 0) + chosenEnhancements.reduce((sum, e) => sum + e.price, 0),
    [duration, chosenEnhancements]
  );

  const dateClosed = studio ? isClosedOn(studio.closedDays, sel.date) : false;
  const today = new Date().toISOString().slice(0, 10);

  const canContinue = [
    !!sel.treatment,
    !!sel.minutes,
    true, // enhancements are optional
    !!sel.studio,
    !!sel.date && !!sel.time && !dateClosed && sel.date >= today,
    bookingDetailsSchema.safeParse({ name: sel.name, email: sel.email, notes: sel.notes }).success,
  ][step];

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  /** Real-time, per-field feedback on the details step. */
  const validateDetail = (field: "name" | "email" | "notes", value: string) => {
    const result = bookingDetailsSchema.shape[field].safeParse(value);
    setErrors((prev) => {
      const nextErrors = { ...prev };
      if (!result.success) nextErrors[field] = result.error.issues[0]?.message ?? "Invalid";
      else delete nextErrors[field];
      return nextErrors;
    });
  };

  const confirm = async () => {
    setApiError("");
    const payload = {
      treatment: sel.treatment,
      minutes: sel.minutes,
      enhancements: sel.enhancements,
      studio: sel.studio,
      date: sel.date,
      time: sel.time,
      name: sel.name,
      email: sel.email,
      notes: sel.notes,
    };

    // client-side gate, mirrored by the API's authoritative re-validation
    const result = bookingSchema.safeParse(payload);
    if (!result.success) {
      setErrors(getFieldErrors(result.error));
      return;
    }

    setSubmitting(true);
    const clean = sanitizeObject(result.data);
    const r = await submitLead("New booking request", {
      ...clean,
      enhancements: chosenEnhancements.map((e) => e.name).join(", ") || "None",
      total: `$${total}`,
    });
    setSubmitting(false);
    if (!r.ok) {
      setApiError(r.error ?? "Something went quiet on our end — please try again.");
      return;
    }
    setServerTotal(total);
    try {
      sessionStorage.removeItem(STORE_KEY);
    } catch {
      /* non-fatal */
    }
    setConfirmed(true);
  };

  if (confirmed) {
    const first = sel.name.split(" ")[0] || "there";
    const rows: [string, string][] = [
      ["Treatment", treatment?.name ?? "—"],
      ["Length", sel.minutes ? `${sel.minutes} minutes` : "—"],
      ...(chosenEnhancements.length
        ? ([["Added", chosenEnhancements.map((e) => e.name).join(", ")]] as [string, string][])
        : []),
      ["Studio", sel.studio ?? "—"],
      ["Date", sel.date || "—"],
      ["Time", sel.time ?? "—"],
      ["Guest", `${sel.name} · ${sel.email}`],
    ];
    return (
      <motion.div {...stepMotion} className="max-w-2xl">
        <div className="rule pt-12">
          <p className="kicker text-sage">Request received</p>
          <h2 className="type-title mt-6">Thank you, {first}.</h2>
          <p className="measure mt-6 text-[0.95rem] text-gray">
            Your request is with the studio. We&rsquo;ll confirm by email at{" "}
            <span className="text-ink">{sel.email}</span> within the hour — nothing is
            charged online, your visit is settled at the studio.
          </p>
        </div>

        <dl className="mt-10">
          {rows.map(([k, v]) => (
            <div key={k} className="rule flex items-baseline justify-between gap-6 py-4">
              <dt className="kicker shrink-0 text-gray">{k}</dt>
              <dd className="text-right text-[0.95rem] text-ink">{v}</dd>
            </div>
          ))}
          <div className="rule flex items-baseline justify-between py-5">
            <dt className="kicker text-gray">Total</dt>
            <dd className="font-serif text-2xl">
              ${serverTotal ?? total}
              <span className="ml-2 font-sans text-xs text-gray">at the studio</span>
            </dd>
          </div>
        </dl>

        <Link
          href="/"
          className="mt-10 inline-flex text-[0.8rem] tracking-[0.06em] text-gray link-center"
        >
          ← Back to HAVN
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-16 lg:grid-cols-[1fr_360px] lg:gap-24">
      {/* ——— the questions ——— */}
      <div>
        {/* progress — six quiet marks */}
        <ol className="flex items-center gap-2" aria-label="Booking progress">
          {STEPS.map((label, i) => (
            <li key={label} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                aria-current={i === step ? "step" : undefined}
                aria-label={`Step ${i + 1}: ${label}`}
                data-cursor
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === step ? "w-10 bg-ink/70" : i < step ? "w-5 bg-sage" : "w-5 bg-ink/10"
                }`}
              />
            </li>
          ))}
        </ol>

        <div className="mt-14 min-h-[24rem]">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.fieldset key="treatment" {...stepMotion}>
                <legend className="kicker">01 — The treatment</legend>
                <h2 className="type-title mt-6">What does your body need?</h2>
                <ul className="mt-10">
                  {TREATMENTS.map((t) => (
                    <OptionRow
                      key={t.slug}
                      selected={sel.treatment === t.slug}
                      onSelect={() =>
                        setSel((s) => ({ ...s, treatment: t.slug, minutes: null }))
                      }
                      title={t.name}
                      meta={`from $${Math.min(...t.durations.map((d) => d.price))}`}
                    />
                  ))}
                </ul>
              </motion.fieldset>
            )}

            {step === 1 && treatment && (
              <motion.fieldset key="length" {...stepMotion}>
                <legend className="kicker">02 — The length</legend>
                <h2 className="type-title mt-6">How long can you stay?</h2>
                <ul className="mt-10">
                  {treatment.durations.map((d) => (
                    <OptionRow
                      key={d.minutes}
                      selected={sel.minutes === d.minutes}
                      onSelect={() => setSel((s) => ({ ...s, minutes: d.minutes }))}
                      title={`${d.minutes} minutes`}
                      meta={`$${d.price}`}
                    />
                  ))}
                </ul>
                {treatment.durations.length === 1 && (
                  <p className="mt-6 text-sm text-gray">
                    {treatment.name} is practiced at one length — it needs all of it.
                  </p>
                )}
              </motion.fieldset>
            )}

            {step === 2 && (
              <motion.fieldset key="enhancements" {...stepMotion}>
                <legend className="kicker">03 — Enhancements</legend>
                <h2 className="type-title mt-6">Anything further? Entirely optional.</h2>
                <ul className="mt-10">
                  {ENHANCEMENTS.map((e) => {
                    const on = sel.enhancements.includes(e.id);
                    return (
                      <OptionRow
                        key={e.id}
                        selected={on}
                        onSelect={() =>
                          setSel((s) => ({
                            ...s,
                            enhancements: on
                              ? s.enhancements.filter((x) => x !== e.id)
                              : [...s.enhancements, e.id],
                          }))
                        }
                        title={e.name}
                        note={e.note}
                        meta={`+ $${e.price}`}
                      />
                    );
                  })}
                </ul>
              </motion.fieldset>
            )}

            {step === 3 && (
              <motion.fieldset key="studio" {...stepMotion}>
                <legend className="kicker">04 — The studio</legend>
                <h2 className="type-title mt-6">Which door will you take?</h2>
                <ul className="mt-10">
                  {LOCATIONS.map((l) => (
                    <OptionRow
                      key={l.city}
                      selected={sel.studio === l.city}
                      onSelect={() => setSel((s) => ({ ...s, studio: l.city, time: null }))}
                      title={l.city}
                      note={`${l.address[0]} · ${l.hours[0]}`}
                    />
                  ))}
                </ul>
              </motion.fieldset>
            )}

            {step === 4 && studio && (
              <motion.fieldset key="time" {...stepMotion}>
                <legend className="kicker">05 — The hour</legend>
                <h2 className="type-title mt-6">When shall we expect you?</h2>
                <label className="mt-10 block max-w-sm">
                  <span className="kicker">Date</span>
                  <input
                    type="date"
                    min={today}
                    value={sel.date}
                    onChange={(e) => setSel((s) => ({ ...s, date: e.target.value }))}
                    className={inputCls}
                  />
                </label>
                {dateClosed && (
                  <p className="mt-4 text-sm text-gray">
                    Our {studio.city} studio rests on {closedDayNames(studio.closedDays)}s —
                    choose another day, or the other door.
                  </p>
                )}
                {sel.date && !dateClosed && (
                  <div className="mt-10">
                    <span className="kicker">Time</span>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {TIME_SLOTS.map((t) => (
                        <button
                          key={t}
                          type="button"
                          data-cursor
                          onClick={() => setSel((s) => ({ ...s, time: t }))}
                          aria-pressed={sel.time === t}
                          className={`rounded-full border px-5 py-2.5 text-sm tabular-nums transition-all duration-400 ${
                            sel.time === t
                              ? "border-ink bg-ink text-paper"
                              : "border-ink/20 text-ink/80 hover:border-ink/50"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.fieldset>
            )}

            {step === 5 && (
              <motion.fieldset key="you" {...stepMotion}>
                <legend className="kicker">06 — You</legend>
                <h2 className="type-title mt-6">Lastly, who is coming?</h2>
                <div className="mt-10 grid max-w-2xl gap-10 md:grid-cols-2">
                  <label className="block">
                    <span className="kicker">Your name</span>
                    <input
                      value={sel.name}
                      onChange={(e) => {
                        setSel((s) => ({ ...s, name: e.target.value }));
                        validateDetail("name", e.target.value);
                      }}
                      placeholder="Full name"
                      autoComplete="name"
                      aria-invalid={!!errors.name}
                      className={inputCls}
                    />
                    {errors.name && <span className="mt-2 block text-xs text-[#a1584e]">{errors.name}</span>}
                  </label>
                  <label className="block">
                    <span className="kicker">Email</span>
                    <input
                      type="email"
                      value={sel.email}
                      onChange={(e) => {
                        setSel((s) => ({ ...s, email: e.target.value }));
                        validateDetail("email", e.target.value);
                      }}
                      placeholder="you@example.com"
                      autoComplete="email"
                      aria-invalid={!!errors.email}
                      className={inputCls}
                    />
                    {errors.email && <span className="mt-2 block text-xs text-[#a1584e]">{errors.email}</span>}
                  </label>
                  <label className="block md:col-span-2">
                    <span className="kicker">Anything we should know (optional)</span>
                    <input
                      value={sel.notes}
                      onChange={(e) => {
                        setSel((s) => ({ ...s, notes: e.target.value }));
                        validateDetail("notes", e.target.value);
                      }}
                      placeholder="Pregnancy, injuries, preferences…"
                      aria-invalid={!!errors.notes}
                      className={inputCls}
                    />
                    {errors.notes && <span className="mt-2 block text-xs text-[#a1584e]">{errors.notes}</span>}
                  </label>
                </div>
              </motion.fieldset>
            )}
          </AnimatePresence>
        </div>

        {/* ——— controls ——— */}
        <div className="rule mt-12 flex items-center justify-between pt-8">
          <button
            type="button"
            onClick={back}
            data-cursor
            className={`link-center text-sm transition-opacity duration-300 ${
              step === 0 ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
          >
            ← Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              disabled={!canContinue}
              data-cursor
              className="inline-flex items-center justify-center rounded-full bg-ink px-8 py-4 text-[0.8rem] tracking-[0.08em] text-paper transition-all duration-500 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:translate-y-0"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={confirm}
              disabled={!canContinue || submitting}
              data-cursor
              className="inline-flex items-center justify-center rounded-full bg-ink px-8 py-4 text-[0.8rem] tracking-[0.08em] text-paper transition-all duration-500 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:translate-y-0"
            >
              {submitting ? "Requesting…" : `Request booking — $${total}`}
            </button>
          )}
        </div>
        {apiError && <p className="mt-4 text-right text-sm text-[#a1584e]">{apiError}</p>}
      </div>

      {/* ——— the running total ——— */}
      <aside className="order-first lg:order-none">
        <div className="rule pt-8 lg:sticky lg:top-28">
          <p className="kicker">Your visit</p>
          <dl className="mt-8 flex flex-col gap-5 text-[0.95rem]">
            <div className="flex items-baseline justify-between gap-6">
              <dt className={treatment ? "text-ink" : "text-gray/60"}>
                {treatment ? treatment.name : "Treatment"}
                {duration && <span className="text-gray"> · {duration.minutes} min</span>}
              </dt>
              <dd className="tabular-nums text-gray">{duration ? `$${duration.price}` : "—"}</dd>
            </div>
            {chosenEnhancements.map((e) => (
              <div key={e.id} className="flex items-baseline justify-between gap-6">
                <dt className="text-ink">{e.name}</dt>
                <dd className="tabular-nums text-gray">+ ${e.price}</dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-6">
              <dt className={sel.studio ? "text-ink" : "text-gray/60"}>
                {sel.studio ?? "Studio"}
              </dt>
              <dd className="text-gray">
                {sel.date && sel.time ? `${sel.date} · ${sel.time}` : ""}
              </dd>
            </div>
          </dl>
          <div className="rule mt-8 flex items-baseline justify-between pt-6">
            <span className="kicker">Total</span>
            <span className="font-serif text-4xl tabular-nums">${total}</span>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-gray">
            Nothing is charged now — your visit is settled at the studio. Cancel freely up to
            24 hours before.
          </p>
        </div>
      </aside>
    </div>
  );
}

export default function BookingFlow() {
  return (
    <Suspense>
      <Flow />
    </Suspense>
  );
}
