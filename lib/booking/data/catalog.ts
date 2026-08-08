import type { Service, Staff } from "@/lib/booking/types";
import { SERVICES_SEED } from "@/lib/booking/data/services";
import { STAFF } from "@/lib/booking/data/staff";

/**
 * Assembles the in-memory catalog from the seed files. The staff↔service
 * relationship is defined once (on staff.serviceIds); here we compute each
 * service's `staffIds` from it so there is a single source of truth.
 *
 * This module is the seed/fallback catalog. When Supabase is configured and
 * seeded, the DB layer reads the same shapes from Postgres instead.
 */
export const SERVICES: Service[] = SERVICES_SEED.map((s) => ({
  ...s,
  staffIds: STAFF.filter((st) => st.active && st.serviceIds.includes(s.id)).map((st) => st.id),
}));

export { STAFF };

export const getService = (id: string): Service | undefined =>
  SERVICES.find((s) => s.id === id && s.active);

export const getStaffMember = (id: string): Staff | undefined =>
  STAFF.find((s) => s.id === id && s.active);

/** Active staff qualified for a service. */
export const getStaffForService = (serviceId: string): Staff[] =>
  STAFF.filter((s) => s.active && s.serviceIds.includes(serviceId));

export const activeServices = (): Service[] => SERVICES.filter((s) => s.active);
