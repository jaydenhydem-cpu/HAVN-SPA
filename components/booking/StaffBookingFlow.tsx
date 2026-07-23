"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { AvailableSlot, BookingDraft } from "@/lib/booking/types";
import { ANY_STAFF } from "@/lib/booking/types";
import {
  getCatalog,
  getAvailability,
  postHold,
  isDateSelectable,
  businessToday,
  addDays,
  type CatalogResponse,
  type ServiceView,
  type StaffView,
} from "@/lib/booking/client";
import { detailsSchema, getFieldErrors } from "@/lib/booking/validation";
import { formatDateLabel, formatTimeLabel, zonedToUtc } from "@/lib/booking/time";
import ProgressIndicator from "@/components/booking/ProgressIndicator";
import Summary from "@/components/booking/Summary";
import ServiceStep from "@/components/booking/steps/ServiceStep";
import StaffStep from "@/components/booking/steps/StaffStep";
import DateStep from "@/components/booking/steps/DateStep";
import TimeStep from "@/components/booking/steps/TimeStep";
import DetailsStep from "@/components/booking/steps/DetailsStep";
import ReviewStep from "@/components/booking/steps/ReviewStep";

const STORE_KEY = "havn:staffbooking:v1";

const EMPTY: BookingDraft = {
  serviceId: null,
  staffId: null,
  date: null,
  slotStartUtc: null,
  resolvedStaffId: null,
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  notes: "",
  firstTime: false,
  policyAccepted: false,
};

const stepMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] as const },
};

export default function StaffBookingFlow() {
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState<BookingDraft>(EMPTY);
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [detailErrors, setDetailErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── load catalog + restore draft ──
  useEffect(() => {
    let cancelled = false;
    getCatalog()
      .then((c) => {
        if (cancelled) return;
        setCatalog(c);
        try {
          const saved = sessionStorage.getItem(STORE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved) as { draft: BookingDraft; step: number; maxReached: number };
            setDraft({ ...EMPTY, ...parsed.draft, policyAccepted: false });
            setStep(parsed.step ?? 0);
            setMaxReached(parsed.maxReached ?? parsed.step ?? 0);
          }
        } catch {
          /* ignore */
        }
        setHydrated(true);
      })
      .catch(() => !cancelled && setLoadError("We couldn’t load the booking system. Please refresh and try again."));
    return () => {
      cancelled = true;
    };
  }, []);

  // ── persist ──
  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify({ draft, step, maxReached }));
    } catch {
      /* ignore */
    }
  }, [draft, step, maxReached, hydrated]);

  // ── derived selections ──
  const service = useMemo<ServiceView | null>(
    () => catalog?.services.find((s) => s.id === draft.serviceId) ?? null,
    [catalog, draft.serviceId]
  );
  const qualifiedStaff = useMemo<StaffView[]>(
    () => (catalog && draft.serviceId ? catalog.staff.filter((s) => s.serviceIds.includes(draft.serviceId!)) : []),
    [catalog, draft.serviceId]
  );
  const isAny = draft.staffId === ANY_STAFF;
  const dateStaff = isAny ? qualifiedStaff : qualifiedStaff.filter((s) => s.id === draft.staffId);

  const displayStaffName = useMemo(() => {
    if (draft.resolvedStaffId) return catalog?.staff.find((s) => s.id === draft.resolvedStaffId)?.name ?? null;
    if (isAny) return "Any available specialist";
    return qualifiedStaff.find((s) => s.id === draft.staffId)?.name ?? null;
  }, [catalog, draft.resolvedStaffId, draft.staffId, isAny, qualifiedStaff]);

  const dateLabel = draft.date ? formatDateLabel(zonedToUtc(draft.date, "12:00")) : null;
  const timeLabel = draft.slotStartUtc ? formatTimeLabel(new Date(draft.slotStartUtc)) : null;

  // ── fetch availability whenever service/staff/date are set and we're at/after the time step ──
  const fetchSlots = useCallback(async () => {
    if (!draft.serviceId || !draft.staffId || !draft.date) return;
    setSlotsLoading(true);
    setSlotsError(null);
    try {
      const result = await getAvailability(draft.serviceId, draft.staffId, draft.date);
      setSlots(result);
    } catch (e) {
      setSlotsError(e instanceof Error ? e.message : "Could not load times.");
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, [draft.serviceId, draft.staffId, draft.date]);

  useEffect(() => {
    if (step === 3 && draft.date) fetchSlots();
  }, [step, draft.date, draft.staffId, fetchSlots]);

  // ── navigation ──
  const goTo = useCallback((s: number) => {
    setStep(s);
    setMaxReached((m) => Math.max(m, s));
  }, []);

  const back = () => setStep((s) => Math.max(0, s - 1));

  // ── step handlers ──
  const selectService = (serviceId: string) => {
    setDraft((d) => ({ ...d, serviceId, staffId: null, date: null, slotStartUtc: null, resolvedStaffId: null }));
    goTo(1);
  };
  const selectStaff = (staffId: string) => {
    setDraft((d) => ({ ...d, staffId, date: null, slotStartUtc: null, resolvedStaffId: null }));
    goTo(2);
  };
  const selectDate = (date: string) => {
    setDraft((d) => ({ ...d, date, slotStartUtc: null, resolvedStaffId: null }));
    goTo(3);
  };
  const selectSlot = (startUtc: string) => {
    const slot = slots.find((s) => s.startUtc === startUtc);
    setDraft((d) => ({ ...d, slotStartUtc: startUtc, resolvedStaffId: slot?.staffId ?? null }));
    goTo(4);
  };
  const updateDraft = <K extends keyof BookingDraft>(field: K, value: BookingDraft[K]) =>
    setDraft((d) => ({ ...d, [field]: value }));

  const continueFromDetails = () => {
    const result = detailsSchema.safeParse({
      firstName: draft.firstName,
      lastName: draft.lastName,
      email: draft.email,
      phone: draft.phone,
      notes: draft.notes,
      firstTime: draft.firstTime,
    });
    if (!result.success) {
      setDetailErrors(getFieldErrors(result.error));
      return;
    }
    setDetailErrors({});
    goTo(5);
  };

  const submit = async () => {
    if (!catalog || !service || !draft.slotStartUtc || !draft.date) return;
    setSubmitting(true);
    setSubmitError(null);
    const res = await postHold({
      serviceId: service.id,
      staffId: draft.staffId ?? ANY_STAFF,
      slotStartUtc: draft.slotStartUtc,
      firstName: draft.firstName,
      lastName: draft.lastName,
      email: draft.email,
      phone: draft.phone,
      notes: draft.notes || undefined,
      firstTime: draft.firstTime,
      policyId: catalog.policy.id,
      policyAccepted: true,
    });
    if (res.success && res.checkoutUrl) {
      try {
        sessionStorage.removeItem(STORE_KEY);
      } catch {
        /* ignore */
      }
      window.location.href = res.checkoutUrl;
      return;
    }
    setSubmitting(false);
    if (res.error === "slot_unavailable" || res.error === "slot_taken") {
      setSubmitError("That time was just taken. Please choose another.");
      setDraft((d) => ({ ...d, slotStartUtc: null, resolvedStaffId: null }));
      setStep(3);
      fetchSlots();
    } else {
      setSubmitError(res.message || res.error || "Something went wrong. Please try again.");
    }
  };

  // ── render states ──
  if (loadError) {
    return <p className="text-[0.95rem] text-[#a1584e]">{loadError}</p>;
  }
  if (!catalog) {
    return (
      <div className="flex items-center gap-3 text-[0.9rem] text-gray" role="status">
        <span className="h-4 w-4 animate-spin rounded-full border border-oak border-t-ink" aria-hidden />
        Preparing your booking…
      </div>
    );
  }

  const today = businessToday();
  const maxDate = addDays(today, catalog.config.maxAdvanceDays);
  const serviceNamesFor = (s: StaffView) =>
    s.serviceIds.map((id) => catalog.services.find((sv) => sv.id === id)?.name).filter(Boolean) as string[];

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_20rem]">
      <div>
        <ProgressIndicator current={step} maxReached={maxReached} onJump={goTo} />

        <div className="mt-12 min-h-[24rem]">
          <AnimatePresence mode="wait">
            <motion.div key={step} {...stepMotion}>
              {step === 0 && (
                <ServiceStep
                  services={catalog.services}
                  staffCountFor={(id) => catalog.staffByService[id]?.length ?? 0}
                  selectedId={draft.serviceId}
                  onSelect={selectService}
                />
              )}
              {step === 1 && service && (
                <StaffStep
                  staff={qualifiedStaff}
                  serviceName={service.name}
                  serviceNamesFor={serviceNamesFor}
                  selectedStaffId={draft.staffId}
                  onSelect={selectStaff}
                />
              )}
              {step === 2 && (
                <DateStep
                  value={draft.date}
                  onSelect={selectDate}
                  isSelectable={(d) => isDateSelectable(d, dateStaff)}
                  minDate={today}
                  maxDate={maxDate}
                  staffName={displayStaffName ?? "your specialist"}
                />
              )}
              {step === 3 && (
                <TimeStep
                  slots={slots}
                  loading={slotsLoading}
                  error={slotsError}
                  isAny={isAny}
                  dateLabel={dateLabel ?? ""}
                  selectedSlotStart={draft.slotStartUtc}
                  onSelectSlot={selectSlot}
                  onChangeDate={() => setStep(2)}
                  onChangeStaff={() => setStep(1)}
                />
              )}
              {step === 4 && <DetailsStep draft={draft} errors={detailErrors} onChange={updateDraft} />}
              {step === 5 && service && displayStaffName && (
                <ReviewStep
                  service={service}
                  staffName={displayStaffName}
                  dateLabel={dateLabel ?? ""}
                  timeLabel={timeLabel ?? ""}
                  policy={catalog.policy}
                  accepted={draft.policyAccepted}
                  onAcceptChange={(v) => updateDraft("policyAccepted", v)}
                  onSubmit={submit}
                  submitting={submitting}
                  submitError={submitError}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* nav bar */}
        <div className="rule mt-12 flex items-center justify-between pt-6">
          {step > 0 ? (
            <button type="button" onClick={back} className="link-center text-[0.8rem] tracking-[0.06em] text-gray">
              ← Back
            </button>
          ) : (
            <Link href="/" className="link-center text-[0.8rem] tracking-[0.06em] text-gray">
              ← Leave booking
            </Link>
          )}
          {step === 4 && (
            <button
              type="button"
              onClick={continueFromDetails}
              className="inline-flex items-center justify-center rounded-full bg-ink px-8 py-3.5 text-[0.8rem] tracking-[0.06em] text-paper transition-all duration-500 hover:-translate-y-0.5"
            >
              Continue
            </button>
          )}
        </div>
      </div>

      <Summary service={service} staffName={displayStaffName} dateLabel={dateLabel} timeLabel={timeLabel} />
    </div>
  );
}
