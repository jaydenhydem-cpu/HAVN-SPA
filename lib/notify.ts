import { SITE } from "./site";

/**
 * Deliver a validated, sanitized form submission through the single shared
 * endpoint (SITE.formEndpoint). Booking, enquiry, newsletter and membership
 * all flow through here. Provider-agnostic: the body carries the fields both
 * Web3Forms (`subject`, `access_key`) and Formspree (`_subject`) expect, so a
 * single endpoint value routes every form to the client's inbox.
 *
 * With SITE.formEndpoint empty (the demo default) submissions are logged
 * server-side only — still validated, still confirming to the visitor.
 */
export async function deliver(subject: string, payload: Record<string, unknown>): Promise<void> {
  if (!SITE.formEndpoint) {
    console.info(`[HAVN] ${subject} (log-only — set SITE.formEndpoint to deliver)`, payload);
    return;
  }

  const body: Record<string, unknown> = {
    subject, // Web3Forms email subject
    _subject: subject, // Formspree email subject
    from: `${SITE.name} website`,
    ...payload,
  };
  if (SITE.formAccessKey) body.access_key = SITE.formAccessKey; // Web3Forms auth

  const res = await fetch(SITE.formEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`form delivery failed: ${res.status}`);
}
