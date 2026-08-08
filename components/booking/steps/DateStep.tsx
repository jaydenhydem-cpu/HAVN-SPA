"use client";

import Calendar from "@/components/booking/Calendar";

/** Step 3 — pick a date. Unavailable days are disabled, not hidden. */
export default function DateStep({
  value,
  onSelect,
  isSelectable,
  minDate,
  maxDate,
  staffName,
}: {
  value: string | null;
  onSelect: (date: string) => void;
  isSelectable: (date: string) => boolean;
  minDate: string;
  maxDate: string;
  staffName: string;
}) {
  return (
    <div>
      <p className="kicker">03 — The date</p>
      <h2 className="type-title mt-4">When would you like to come in?</h2>
      <p className="measure mt-3 text-[0.9rem] text-gray">
        Showing days {staffName} is available. Pick one to see open times.
      </p>
      <div className="mt-8 flex justify-center rounded-2xl border border-oak/60 bg-paper p-6 md:justify-start">
        <Calendar value={value} onSelect={onSelect} isSelectable={isSelectable} minDate={minDate} maxDate={maxDate} />
      </div>
    </div>
  );
}
