"use client";

/**
 * Spam honeypot: a text input named like a real field, moved off-screen and
 * hidden from assistive tech + keyboard. Humans never see or fill it; dumb
 * bots auto-fill everything. Pass its value to submitLead's third argument —
 * a non-empty value makes delivery silently discard the submission.
 * (Deliberately not display:none — some bots skip those.)
 */
export default function Honeypot({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="text"
      name="company_website"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      style={{
        position: "absolute",
        left: "-9999px",
        width: "1px",
        height: "1px",
        opacity: 0,
        pointerEvents: "none",
      }}
    />
  );
}
