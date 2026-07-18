import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = SITE.seo.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social share card: the wordmark and one sentence on warm paper —
 *  the same restraint as the site itself. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          color: "#1c1c1c",
          padding: 80,
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ fontSize: 40, letterSpacing: "0.02em" }}>{SITE.name}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 88, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
            The art of
          </div>
          <div style={{ fontSize: 88, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
            slowing down.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            color: "#6e6e73",
            fontFamily: "Helvetica, sans-serif",
          }}
        >
          <span>Massage · Warmth · Quiet</span>
          <span>Aventura — Miami Beach</span>
        </div>
      </div>
    ),
    size
  );
}
