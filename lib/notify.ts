import { SITE } from "./site";

/**
 * Deliver a validated, sanitized form submission. With SITE.formEndpoint
 * empty (the template default) submissions are logged server-side only —
 * still validated, still returning success. Set a Formspree-style URL per
 * client to route every form to their inbox.
 */
export async function deliver(subject: string, payload: Record<string, unknown>): Promise<void> {
  if (!SITE.formEndpoint) {
    console.info(`[HAVN] ${subject} (log-only — set SITE.formEndpoint to deliver)`, payload);
    return;
  }
  const res = await fetch(SITE.formEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ _subject: subject, ...payload }),
  });
  if (!res.ok) throw new Error(`form delivery failed: ${res.status}`);
}
