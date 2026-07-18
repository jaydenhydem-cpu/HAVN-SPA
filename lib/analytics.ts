/**
 * Conversion + event tracking, layered on the GA4 setup in
 * components/Analytics.tsx. With SITE.analyticsId empty (the template
 * default) `window.gtag` never exists and every call here is a silent
 * no-op — safe to leave the wiring in place per client.
 *
 * Two ways to record an event:
 *  1. Client components call `trackEvent(name, params)` directly
 *     (used for form conversions: booking_request, contact_submit …).
 *  2. Any element — including server components — can declare
 *     `data-track="event_name"` plus optional `data-track-*` params;
 *     the delegated listener in components/TrackClicks.tsx picks it up
 *     (used for clicks: directions, phone, email, begin_booking …).
 *
 * Conversion vocabulary (keep names stable so GA reports stay coherent):
 *  booking_request   – completed appointment request (THE conversion)
 *  begin_booking     – any click that opens /book (params: source, treatment?, studio?)
 *  contact_submit    – enquiry form sent
 *  membership_lead   – membership interest sent (param: plan)
 *  newsletter_signup – newsletter joined
 *  phone_click / email_click / directions_click – off-site intent (param: studio?)
 */
export function trackEvent(
  name: string,
  params?: Record<string, string | number | undefined>,
): void {
  if (typeof window === "undefined") return;
  const w = window as { gtag?: (...args: unknown[]) => void };
  w.gtag?.("event", name, params);
}
