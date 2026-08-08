"use client";

import type { AvailableSlot } from "@/lib/booking/types";

const GROUPS: { key: AvailableSlot["period"]; label: string }[] = [
  { key: "morning", label: "Morning" },
  { key: "afternoon", label: "Afternoon" },
  { key: "evening", label: "Evening" },
];

/** Step 4 — pick a time. Grouped Morning/Afternoon/Evening. Server-computed. */
export default function TimeStep({
  slots,
  loading,
  error,
  isAny,
  dateLabel,
  selectedSlotStart,
  onSelectSlot,
  onChangeDate,
  onChangeStaff,
}: {
  slots: AvailableSlot[];
  loading: boolean;
  error: string | null;
  isAny: boolean;
  dateLabel: string;
  selectedSlotStart: string | null;
  onSelectSlot: (startUtc: string) => void;
  onChangeDate: () => void;
  onChangeStaff: () => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="kicker">04 — The time</p>
          <h2 className="type-title mt-4">{dateLabel}</h2>
        </div>
        <div className="flex gap-4 text-[0.8rem]">
          <button type="button" onClick={onChangeDate} className="link-center text-ink">Change date</button>
          <button type="button" onClick={onChangeStaff} className="link-center text-ink">Change specialist</button>
        </div>
      </div>

      <div className="mt-8 min-h-[8rem]">
        {loading && (
          <div className="flex items-center gap-3 text-[0.9rem] text-gray" role="status" aria-live="polite">
            <span className="h-4 w-4 animate-spin rounded-full border border-oak border-t-ink" aria-hidden />
            Finding open times…
          </div>
        )}

        {!loading && error && <p className="text-[0.9rem] text-[#a1584e]">{error}</p>}

        {!loading && !error && slots.length === 0 && (
          <div className="rounded-2xl border border-oak/60 bg-sand/50 p-6 text-[0.9rem] text-gray">
            No open times on this day. Try another date{isAny ? "" : ", or choose “Any Available Specialist”"} —
            <button type="button" onClick={onChangeDate} className="link-center ml-1 text-ink">pick another date</button>.
          </div>
        )}

        {!loading && !error && slots.length > 0 && (
          <div className="flex flex-col gap-8">
            {GROUPS.map(({ key, label }) => {
              const group = slots.filter((s) => s.period === key);
              if (group.length === 0) return null;
              return (
                <section key={key}>
                  <p className="kicker text-gray/70">{label}</p>
                  <ul className="mt-4 flex flex-wrap gap-2.5">
                    {group.map((slot) => {
                      const active = slot.startUtc === selectedSlotStart;
                      return (
                        <li key={slot.startUtc}>
                          <button
                            type="button"
                            onClick={() => onSelectSlot(slot.startUtc)}
                            aria-pressed={active}
                            className={`flex flex-col items-center rounded-2xl border px-4 py-2.5 text-center transition-all duration-300 ${
                              active ? "border-ink bg-ink text-paper" : "border-oak/60 text-ink hover:border-ink/50"
                            }`}
                          >
                            <span className="text-[0.9rem] tabular-nums">{slot.label}</span>
                            {isAny && (
                              <span className={`mt-0.5 text-[0.68rem] ${active ? "text-paper/70" : "text-gray"}`}>
                                {slot.staffName}
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
