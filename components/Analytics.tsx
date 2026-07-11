import Script from "next/script";
import { SITE } from "@/lib/site";

/**
 * Google Analytics 4, gated on SITE.analyticsId — when the id is empty
 * (the template default) nothing is rendered and nothing loads.
 */
export default function Analytics() {
  if (!SITE.analyticsId) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${SITE.analyticsId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${SITE.analyticsId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
