"use client";

import { formatMoney } from "@/lib/booking/deposit";
import type { ServiceView } from "@/lib/booking/client";

/** Step 1 — choose a service. Grouped by category, HAVN option-row language. */
export default function ServiceStep({
  services,
  staffCountFor,
  selectedId,
  onSelect,
}: {
  services: ServiceView[];
  staffCountFor: (serviceId: string) => number;
  selectedId: string | null;
  onSelect: (serviceId: string) => void;
}) {
  const categories = [...new Set(services.map((s) => s.category))];

  return (
    <div>
      <p className="kicker">01 — The service</p>
      <h2 className="type-title mt-4">What would you like?</h2>

      <div className="mt-10 flex flex-col gap-12">
        {categories.map((cat) => (
          <section key={cat}>
            <p className="kicker text-gray/70">{cat}</p>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {services
                .filter((s) => s.category === cat)
                .map((s) => {
                  const active = s.id === selectedId;
                  const count = staffCountFor(s.id);
                  const buffer = s.bufferBeforeMinutes + s.bufferAfterMinutes;
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(s.id)}
                        aria-pressed={active}
                        className={`flex h-full w-full flex-col rounded-2xl border p-5 text-left transition-all duration-300 ${
                          active ? "border-ink ring-1 ring-ink" : "border-oak/60 hover:border-ink/40"
                        }`}
                      >
                        <div className="flex items-baseline justify-between gap-4">
                          <span className="type-title text-[1.15rem]">{s.name}</span>
                          <span className="shrink-0 tabular-nums text-[0.95rem]">{formatMoney(s.priceCents)}</span>
                        </div>
                        <p className="mt-2 text-[0.85rem] leading-relaxed text-gray">{s.description}</p>
                        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.72rem] text-gray/80">
                          <span>{s.durationMinutes} min</span>
                          <span aria-hidden>·</span>
                          <span>
                            {s.deposit.depositCents > 0
                              ? `${formatMoney(s.deposit.depositCents)} deposit`
                              : "No deposit"}
                          </span>
                          <span aria-hidden>·</span>
                          <span>{count} specialist{count === 1 ? "" : "s"}</span>
                          {buffer > 0 && (
                            <>
                              <span aria-hidden>·</span>
                              <span>{buffer} min cleanup</span>
                            </>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
