import type { DepositBreakdown, Service } from "@/lib/booking/types";

/** Cents → "$140.00" (or "$140" when whole). */
export function formatMoney(cents: number): string {
  const dollars = cents / 100;
  return dollars % 1 === 0 ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

/**
 * Deposit is always a portion of (never added on top of) the service price.
 * Returns the deposit due today and the remaining balance due at the spa.
 */
export function computeDeposit(service: Pick<Service, "priceCents" | "depositType" | "depositValue">): DepositBreakdown {
  const price = service.priceCents;
  let deposit = 0;
  let label = "No deposit";

  if (service.depositType === "fixed") {
    deposit = Math.round(service.depositValue * 100);
    label = formatMoney(deposit);
  } else if (service.depositType === "percent") {
    deposit = Math.round((price * service.depositValue) / 100);
    label = `${service.depositValue}%`;
  }

  deposit = Math.max(0, Math.min(deposit, price));
  return {
    servicePriceCents: price,
    depositCents: deposit,
    remainingCents: price - deposit,
    label,
  };
}
