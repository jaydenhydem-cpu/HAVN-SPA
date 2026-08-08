import "server-only";
import type { AppointmentRow } from "@/lib/booking/db";
import { findService, findStaff } from "@/lib/booking/db";
import { buildConfirmationData } from "@/lib/booking/confirmation";
import { formatMoney } from "@/lib/booking/deposit";
import type { ConfirmationData } from "@/lib/booking/types";

/**
 * Booking notifications. Email goes through Resend (https://resend.com) over
 * its REST API — no new npm dependency. SMS (Twilio) is a documented follow-up.
 *
 * DEV MODE: with no RESEND_API_KEY the email isn't sent, it's logged — so the
 * flow is testable now and starts delivering the instant a key is added.
 * Sending is best-effort: a delivery hiccup never fails a confirmed booking.
 */
const RESEND_API = "https://api.resend.com/emails";

export const isEmailConfigured = (): boolean => Boolean(process.env.RESEND_API_KEY);

/** From-address: a verified domain in prod, Resend's test sender otherwise. */
const fromAddress = () => process.env.RESEND_FROM || "HAVN <onboarding@resend.dev>";

/**
 * Send the booking confirmation email for an appointment. Call this only after
 * a booking has actually become `confirmed`.
 */
export async function sendBookingConfirmation(appt: AppointmentRow): Promise<void> {
  const service = findService(appt.service_id);
  const staff = findStaff(appt.staff_id);

  const data = buildConfirmationData({
    confirmationNumber: appt.confirmation_number,
    service: {
      name: service?.name ?? "Service",
      durationMinutes: service?.durationMinutes ?? 0,
      priceCents: appt.service_price_cents,
    },
    staff: { name: staff?.name ?? "Your specialist" },
    startUtc: appt.starts_at,
    depositPaidCents: appt.deposit_amount_cents,
    remainingCents: appt.remaining_balance_cents,
    status: appt.status,
  });

  const to = appt.customer_email;
  const firstName = appt.customer_first_name || "there";
  const { subject, html, text } = renderConfirmationEmail(data, firstName);

  if (!isEmailConfigured()) {
    console.info(
      `[booking] EMAIL (dev — no RESEND_API_KEY, not sent)\n  to: ${to}\n  subject: ${subject}\n  ${text.replace(/\n/g, "\n  ")}`
    );
    return;
  }

  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: fromAddress(), to, subject, html, text }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[booking] confirmation email failed (${res.status}): ${body}`);
    }
  } catch (err) {
    console.error("[booking] confirmation email error:", err);
  }
}

/**
 * Structured confirmation payload for a future SMS sender (Twilio). Kept short —
 * SMS is a documented next step; this is the message it would send.
 */
export function renderConfirmationSms(data: ConfirmationData): string {
  return `HAVN: You're booked — ${data.serviceName} with ${data.staffName} on ${data.dateLabel} at ${data.timeLabel}. Conf ${data.confirmationNumber}.`;
}

// ── email template (inline styles — required by email clients) ────────────
function renderConfirmationEmail(data: ConfirmationData, firstName: string): { subject: string; html: string; text: string } {
  const subject = `Your HAVN appointment — ${data.dateLabel}`;
  const ink = "#1c1c1c";
  const gray = "#6e6e73";
  const sand = "#f5f5f7";
  const sage = "#a8b29a";

  const row = (label: string, value: string) =>
    `<tr>
      <td style="padding:10px 0;border-bottom:1px solid #ececef;color:${gray};font-size:13px;">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #ececef;color:${ink};font-size:14px;text-align:right;">${value}</td>
    </tr>`;

  const html = `<!doctype html>
<html><body style="margin:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${ink};">
  <div style="max-width:520px;margin:0 auto;padding:40px 28px;">
    <p style="letter-spacing:0.22em;text-transform:uppercase;font-size:11px;color:${sage};margin:0 0 24px;">HAVN</p>
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:28px;line-height:1.2;margin:0 0 16px;">You're booked, ${firstName}.</h1>
    <p style="font-size:14px;line-height:1.6;color:${gray};margin:0 0 28px;">
      Your appointment is confirmed. Here are the details — we look forward to seeing you.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #ececef;">
      ${row("Confirmation", data.confirmationNumber)}
      ${row("Service", data.serviceName)}
      ${row("Specialist", data.staffName)}
      ${row("Date", data.dateLabel)}
      ${row("Time", `${data.timeLabel} · ${data.durationMinutes} min`)}
      ${row("Deposit paid", data.depositPaidCents > 0 ? formatMoney(data.depositPaidCents) : "None")}
      ${row("Due at the spa", formatMoney(data.remainingCents))}
    </table>

    <div style="background:${sand};border-radius:14px;padding:20px;margin:28px 0;">
      <p style="letter-spacing:0.18em;text-transform:uppercase;font-size:10px;color:${gray};margin:0 0 8px;">Where to find us</p>
      <p style="font-size:14px;margin:0 0 2px;color:${ink};">${data.locationName}</p>
      <p style="font-size:13px;color:${gray};margin:0 0 10px;">${data.locationAddress.join(", ")}</p>
      <p style="font-size:13px;line-height:1.6;color:${gray};margin:0;">${data.arrivalNote}</p>
    </div>

    <p style="font-size:12px;line-height:1.6;color:${gray};margin:0;">
      Need to change or cancel? Reply to this email or call the studio. Deposits are non-refundable for changes made less than 24 hours ahead.
    </p>
    <p style="font-size:11px;color:#9a9a9e;margin:24px 0 0;">HAVN — the art of slowing down.</p>
  </div>
</body></html>`;

  const text = [
    `You're booked, ${firstName}.`,
    ``,
    `Confirmation: ${data.confirmationNumber}`,
    `Service: ${data.serviceName}`,
    `Specialist: ${data.staffName}`,
    `Date: ${data.dateLabel}`,
    `Time: ${data.timeLabel} (${data.durationMinutes} min)`,
    `Deposit paid: ${data.depositPaidCents > 0 ? formatMoney(data.depositPaidCents) : "None"}`,
    `Due at the spa: ${formatMoney(data.remainingCents)}`,
    ``,
    `${data.locationName}`,
    `${data.locationAddress.join(", ")}`,
    `${data.arrivalNote}`,
    ``,
    `Need to change or cancel? Reply to this email or call the studio.`,
  ].join("\n");

  return { subject, html, text };
}
