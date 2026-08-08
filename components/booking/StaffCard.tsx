"use client";

import Image from "next/image";
import type { StaffView } from "@/lib/booking/client";

/**
 * Reusable specialist card — one component for every staff member and for the
 * "Any Available Specialist" option (isAny). No per-employee hard-coding.
 */
export default function StaffCard({
  staff,
  isAny = false,
  serviceNames = [],
  selected,
  onSelect,
}: {
  staff?: StaffView;
  isAny?: boolean;
  serviceNames?: string[];
  selected: boolean;
  onSelect: () => void;
}) {
  const ring = selected ? "border-ink ring-1 ring-ink" : "border-oak/60 hover:border-ink/40";

  if (isAny) {
    return (
      <div className={`flex flex-col rounded-2xl border ${ring} bg-sand/40 p-6 transition-colors duration-300`}>
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-oak text-lg text-gray">✶</span>
        <h3 className="type-title mt-5 text-[1.35rem]">Any Available Specialist</h3>
        <p className="mt-2 text-[0.9rem] leading-relaxed text-gray">
          We&rsquo;ll show every open time across our qualified specialists and match you with the right hands.
        </p>
        <div className="mt-auto pt-6">
          <SelectButton selected={selected} onSelect={onSelect} label="Show all availability" />
        </div>
      </div>
    );
  }

  if (!staff) return null;

  return (
    <div className={`flex flex-col rounded-2xl border ${ring} bg-paper p-6 transition-colors duration-300`}>
      <div className="flex items-start gap-4">
        <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-sand">
          <Image src={staff.imageUrl} alt={staff.name} fill sizes="64px" className="object-cover" />
        </span>
        <div className="min-w-0">
          <h3 className="type-title text-[1.3rem] leading-tight">{staff.name}</h3>
          <p className="mt-1 text-[0.8rem] tracking-[0.02em] text-gray">{staff.title}</p>
          {staff.yearsExperience != null && (
            <p className="mt-1 text-[0.75rem] text-gray/80">{staff.yearsExperience} years of experience</p>
          )}
        </div>
      </div>

      <p className="mt-4 text-[0.9rem] leading-relaxed text-gray">{staff.bio}</p>

      {staff.specialties.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {staff.specialties.map((s) => (
            <li key={s} className="rounded-full border border-oak/70 px-3 py-1 text-[0.72rem] tracking-[0.03em] text-gray">
              {s}
            </li>
          ))}
        </ul>
      )}

      {serviceNames.length > 0 && (
        <p className="mt-4 text-[0.75rem] leading-relaxed text-gray/80">
          <span className="kicker">Performs</span>
          <br />
          {serviceNames.join(" · ")}
        </p>
      )}

      <div className="mt-auto pt-6">
        <SelectButton selected={selected} onSelect={onSelect} label="Select specialist" />
      </div>
    </div>
  );
}

function SelectButton({ selected, onSelect, label }: { selected: boolean; onSelect: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-[0.78rem] tracking-[0.06em] transition-all duration-400 ${
        selected ? "bg-ink text-paper" : "border border-ink/25 text-ink hover:border-ink/60"
      }`}
    >
      {selected ? "Selected" : label}
    </button>
  );
}
