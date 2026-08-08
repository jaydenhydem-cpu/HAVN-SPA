"use client";

export const STEP_LABELS = ["Service", "Specialist", "Date", "Time", "Details", "Review"] as const;

/**
 * Quiet, editorial step indicator. Completed steps are clickable to return
 * without losing selections. Charcoal/sage on paper — no SaaS blue.
 */
export default function ProgressIndicator({
  current,
  maxReached,
  onJump,
}: {
  current: number;
  maxReached: number;
  onJump: (step: number) => void;
}) {
  return (
    <nav aria-label="Booking progress" className="w-full">
      {/* compact label for small screens */}
      <p className="kicker mb-4 md:hidden">
        Step {current + 1} of {STEP_LABELS.length} · <span className="text-ink">{STEP_LABELS[current]}</span>
      </p>

      <ol className="flex items-center gap-2">
        {STEP_LABELS.map((label, i) => {
          const done = i < current;
          const active = i === current;
          const reachable = i <= maxReached;
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <button
                type="button"
                disabled={!reachable || active}
                onClick={() => reachable && onJump(i)}
                aria-current={active ? "step" : undefined}
                className={`group flex items-center gap-2.5 rounded-full transition-colors duration-300 ${
                  reachable && !active ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[0.7rem] tabular-nums transition-all duration-300 ${
                    active
                      ? "border-ink bg-ink text-paper"
                      : done
                        ? "border-sage bg-sage text-paper"
                        : "border-oak text-gray"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span className={`hidden text-[0.8rem] tracking-[0.02em] lg:inline ${active ? "text-ink" : "text-gray"}`}>
                  {label}
                </span>
              </button>
              {i < STEP_LABELS.length - 1 && (
                <span className={`h-px flex-1 transition-colors duration-300 ${i < current ? "bg-sage/60" : "bg-oak/70"}`} aria-hidden />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
