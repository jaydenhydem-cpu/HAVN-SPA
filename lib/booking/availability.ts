import type { AvailableSlot, BusyInterval, Service, Staff, Weekday } from "@/lib/booking/types";
import { BOOKING_CONFIG } from "@/lib/booking/config";
import {
  formatTimeLabel,
  minutesOfDay,
  periodOf,
  weekdayForDate,
  zonedToUtc,
} from "@/lib/booking/time";

const MIN = 60_000;

const overlaps = (a1: number, a2: number, b1: number, b2: number) => a1 < b2 && b1 < a2;

/**
 * Pure availability engine. Given a service, one staff member, a business-tz
 * date, and that staff member's already-occupied intervals (buffers included),
 * returns every bookable start time.
 *
 * This is the authority — the browser never decides availability. The same
 * function is called again server-side immediately before a booking is held.
 */
export function computeSlotsForStaff(params: {
  service: Service;
  staff: Staff;
  dateStr: string;
  busy: BusyInterval[];
  now?: Date;
}): AvailableSlot[] {
  const { service, staff, dateStr, busy } = params;
  const now = params.now ?? new Date();

  // Staff must be qualified for this service.
  if (!staff.serviceIds.includes(service.id)) return [];

  const weekday = weekdayForDate(dateStr) as Weekday;
  const windows = staff.availability.filter((w) => w.dayOfWeek === weekday);
  if (windows.length === 0) return [];

  const minNotice = staff.minNoticeMinutes ?? BOOKING_CONFIG.minNoticeMinutes;
  const maxAdvanceDays = staff.maxAdvanceDays ?? BOOKING_CONFIG.maxAdvanceDays;
  const earliest = now.getTime() + minNotice * MIN;
  const latest = now.getTime() + maxAdvanceDays * 24 * 60 * MIN;

  const interval = BOOKING_CONFIG.slotIntervalMinutes;
  const total = service.durationMinutes + service.bufferBeforeMinutes + service.bufferAfterMinutes;

  // Breaks for this weekday → UTC intervals on this date.
  const breakIntervals = staff.breaks
    .filter((b) => b.dayOfWeek === weekday)
    .map((b) => ({
      start: zonedToUtc(dateStr, b.start).getTime(),
      end: zonedToUtc(dateStr, b.end).getTime(),
    }));

  const timeOff = staff.timeOff.map((t) => ({
    start: new Date(t.startsAt).getTime(),
    end: new Date(t.endsAt).getTime(),
  }));

  const busyMs = busy.map((b) => ({
    start: new Date(b.startUtc).getTime(),
    end: new Date(b.endUtc).getTime(),
  }));

  const slots: AvailableSlot[] = [];

  for (const w of windows) {
    const winStart = zonedToUtc(dateStr, w.start).getTime();
    const winEnd = zonedToUtc(dateStr, w.end).getTime();

    // Candidate service-start times, stepped by interval.
    // The buffered block must fit entirely inside the working window.
    for (
      let startMin = minutesOfDay(w.start) + service.bufferBeforeMinutes;
      startMin + service.durationMinutes + service.bufferAfterMinutes <= minutesOfDay(w.end);
      startMin += interval
    ) {
      const hh = String(Math.floor(startMin / 60)).padStart(2, "0");
      const mm = String(startMin % 60).padStart(2, "0");
      const localTime = `${hh}:${mm}`;
      const startUtc = zonedToUtc(dateStr, localTime).getTime();

      const blockStart = startUtc - service.bufferBeforeMinutes * MIN;
      const serviceEnd = startUtc + service.durationMinutes * MIN;
      const blockEnd = serviceEnd + service.bufferAfterMinutes * MIN;

      // Inside working window (with buffers) and total actually fits.
      if (blockStart < winStart || blockEnd > winEnd) continue;
      if (total > (winEnd - winStart) / MIN) continue;
      // Booking window (notice + advance horizon).
      if (startUtc < earliest || startUtc > latest) continue;
      // No overlap with breaks, time off, or existing appointments.
      if (breakIntervals.some((b) => overlaps(blockStart, blockEnd, b.start, b.end))) continue;
      if (timeOff.some((t) => overlaps(blockStart, blockEnd, t.start, t.end))) continue;
      if (busyMs.some((b) => overlaps(blockStart, blockEnd, b.start, b.end))) continue;

      const instant = new Date(startUtc);
      slots.push({
        startUtc: instant.toISOString(),
        endUtc: new Date(serviceEnd).toISOString(),
        staffId: staff.id,
        staffName: staff.name,
        label: formatTimeLabel(instant),
        localTime,
        period: periodOf(localTime),
      });
    }
  }

  slots.sort((a, b) => a.startUtc.localeCompare(b.startUtc));
  return slots;
}

/**
 * Merge slots across several staff (the "Any Available Specialist" case).
 * Keeps the earliest-listed staff for each distinct start time so the customer
 * sees one row per time, labelled with who would take it.
 */
export function mergeAnyStaffSlots(perStaff: AvailableSlot[][]): AvailableSlot[] {
  const byTime = new Map<string, AvailableSlot>();
  for (const list of perStaff) {
    for (const slot of list) {
      if (!byTime.has(slot.startUtc)) byTime.set(slot.startUtc, slot);
    }
  }
  return [...byTime.values()].sort((a, b) => a.startUtc.localeCompare(b.startUtc));
}
