"use client";

import StaffCard from "@/components/booking/StaffCard";
import { ANY_STAFF } from "@/lib/booking/types";
import type { StaffView } from "@/lib/booking/client";

/** Step 2 — choose your specialist (or Any Available). */
export default function StaffStep({
  staff,
  serviceName,
  serviceNamesFor,
  selectedStaffId,
  onSelect,
}: {
  staff: StaffView[];
  serviceName: string;
  serviceNamesFor: (staff: StaffView) => string[];
  selectedStaffId: string | null;
  onSelect: (staffId: string) => void;
}) {
  return (
    <div>
      <p className="kicker">02 — The specialist</p>
      <h2 className="type-title mt-4">Choose your specialist</h2>
      <p className="measure mt-3 text-[0.9rem] text-gray">
        For your {serviceName.toLowerCase()}. Pick a specialist, or let us match you with the first available.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StaffCard isAny selected={selectedStaffId === ANY_STAFF} onSelect={() => onSelect(ANY_STAFF)} />
        {staff.map((s) => (
          <StaffCard
            key={s.id}
            staff={s}
            serviceNames={serviceNamesFor(s)}
            selected={selectedStaffId === s.id}
            onSelect={() => onSelect(s.id)}
          />
        ))}
      </div>
    </div>
  );
}
