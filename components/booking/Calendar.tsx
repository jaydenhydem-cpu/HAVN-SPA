"use client";

import { useMemo, useState } from "react";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

/**
 * Calm month calendar in HAVN's language — charcoal selection, sage focus,
 * oak hairlines. Unavailable dates are disabled (not hidden); the selected
 * date is filled. Fully keyboard operable.
 */
export default function Calendar({
  value,
  onSelect,
  isSelectable,
  minDate,
  maxDate,
}: {
  value: string | null;
  onSelect: (date: string) => void;
  isSelectable: (date: string) => boolean;
  minDate: string;
  maxDate: string;
}) {
  const initial = value ?? minDate;
  const [cursor, setCursor] = useState(() => {
    const [y, m] = initial.split("-").map(Number);
    return { year: y, month: m - 1 };
  });

  const grid = useMemo(() => {
    const first = new Date(Date.UTC(cursor.year, cursor.month, 1));
    const startDay = first.getUTCDay();
    const daysInMonth = new Date(Date.UTC(cursor.year, cursor.month + 1, 0)).getUTCDate();
    const cells: (string | null)[] = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(ymd(cursor.year, cursor.month, d));
    return cells;
  }, [cursor]);

  const monthStart = ymd(cursor.year, cursor.month, 1);
  const [minY, minM] = minDate.split("-").map(Number);
  const prevDisabled = cursor.year < minY || (cursor.year === minY && cursor.month + 1 <= minM);
  const nextDisabled = monthStart > maxDate;

  const shift = (delta: number) =>
    setCursor((c) => {
      const m = c.month + delta;
      return { year: c.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });

  return (
    <div className="w-full max-w-sm">
      <div className="mb-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          disabled={prevDisabled}
          aria-label="Previous month"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-oak/70 text-ink transition-colors hover:border-ink disabled:opacity-30 disabled:hover:border-oak/70"
        >
          ←
        </button>
        <p className="type-title text-[1.15rem]">
          {MONTHS[cursor.month]} {cursor.year}
        </p>
        <button
          type="button"
          onClick={() => shift(1)}
          disabled={nextDisabled}
          aria-label="Next month"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-oak/70 text-ink transition-colors hover:border-ink disabled:opacity-30 disabled:hover:border-oak/70"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1" role="grid">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="pb-2 text-center text-[0.68rem] tracking-[0.1em] text-gray/70" aria-hidden>
            {w}
          </div>
        ))}
        {grid.map((date, i) => {
          if (!date) return <div key={`e${i}`} aria-hidden />;
          const day = Number(date.slice(-2));
          const selectable = isSelectable(date);
          const selected = date === value;
          return (
            <button
              key={date}
              type="button"
              disabled={!selectable}
              aria-pressed={selected}
              aria-label={date}
              onClick={() => onSelect(date)}
              className={`aspect-square rounded-full text-[0.85rem] tabular-nums transition-all duration-300 ${
                selected
                  ? "bg-ink text-paper"
                  : selectable
                    ? "text-ink hover:bg-sand"
                    : "cursor-not-allowed text-gray/30"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
