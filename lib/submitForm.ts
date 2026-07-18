import { SITE } from "./site";

/**
 * The single reusable delivery path for every form — booking, enquiry,
 * newsletter and membership. Submits straight to the provider from the
 * browser (Web3Forms' free tier accepts client-side requests only; its access
 * key is public by design). Callers validate + sanitize before calling this.
 *
 * Empty SITE.formEndpoint/formAccessKey = log-only: the form still validates
 * and confirms to the visitor, but no email is sent (safe demo default).
 */
export async function submitLead(
  subject: string,
  fields: Record<string, unknown>,
  /** Honeypot value from the form's hidden field — humans leave it empty,
   *  bots fill it. Non-empty = silently discard (report success, send
   *  nothing) so the bot learns nothing. */
  honeypot?: string,
): Promise<{ ok: boolean; error?: string }> {
  if (honeypot) return { ok: true };
  if (!SITE.formEndpoint || !SITE.formAccessKey) {
    if (typeof console !== "undefined") {
      console.info(`[${SITE.name}] ${subject} (log-only — set SITE.formEndpoint + formAccessKey)`, fields);
    }
    return { ok: true };
  }

  try {
    const res = await fetch(SITE.formEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: SITE.formAccessKey,
        subject,
        from_name: `${SITE.name} website`,
        ...fields,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.success === false) {
      return { ok: false, error: data?.message || "We could not send that just now — please try again." };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Something went quiet — please try again." };
  }
}
