"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * Delegated click tracking. Any element (or ancestor wrapper) carrying
 * `data-track="event_name"` fires that event on click; additional
 * `data-track-foo="bar"` attributes become event params ({ foo: "bar" }).
 * One capture-phase listener — works for server components, costs nothing
 * when analytics are disabled (trackEvent no-ops without gtag).
 */
export default function TrackClicks() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.<HTMLElement>("[data-track]");
      if (!el?.dataset.track) return;
      const params: Record<string, string> = {};
      for (const [key, value] of Object.entries(el.dataset)) {
        // dataset keys: track, trackStudio, trackSource … → studio, source
        if (key !== "track" && key.startsWith("track") && value != null) {
          const param = key.slice(5);
          params[param.charAt(0).toLowerCase() + param.slice(1)] = value;
        }
      }
      trackEvent(el.dataset.track, params);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
