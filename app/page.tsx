import Hero from "@/components/sections/Hero";
import Philosophy from "@/components/sections/Philosophy";
import TreatmentShowcase from "@/components/sections/TreatmentShowcase";
import Gallery from "@/components/sections/Gallery";
import Ingredients from "@/components/sections/Ingredients";
import MembershipSection from "@/components/sections/MembershipSection";
import LocationSection from "@/components/sections/LocationSection";
import Testimonials from "@/components/sections/Testimonials";
import BookingCTA from "@/components/sections/BookingCTA";
import { SITE, LOCATIONS, TREATMENTS, fromPrice } from "@/lib/site";

/** Organization + WebSite + per-studio DaySpa structured data, so search
 *  engines understand the brand, both locations and the service menu. */
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE.url}/#org`,
      name: `${SITE.name} Studio`,
      url: SITE.url,
      description: SITE.description,
      email: SITE.email,
      logo: `${SITE.url}/icon`,
      sameAs: [SITE.instagram],
    },
    {
      "@type": "WebSite",
      name: SITE.name,
      url: SITE.url,
      publisher: { "@id": `${SITE.url}/#org` },
    },
    ...LOCATIONS.map((l) => ({
      "@type": "DaySpa",
      name: `${SITE.name} ${l.city}`,
      parentOrganization: { "@id": `${SITE.url}/#org` },
      address: {
        "@type": "PostalAddress",
        streetAddress: l.address[0],
        addressLocality: l.city,
        postalCode: l.address[1].split(" ").slice(0, -1).join(" "),
        addressCountry: "DK",
      },
      telephone: l.phone,
      email: l.email,
      url: SITE.url,
      priceRange: "$$",
      makesOffer: TREATMENTS.map((t) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: t.name, description: t.description },
        price: fromPrice(t),
        priceCurrency: "USD",
      })),
    })),
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Hero />
      <Philosophy />
      <TreatmentShowcase />
      <Gallery />
      <Ingredients />
      <MembershipSection />
      <LocationSection />
      <Testimonials />
      <BookingCTA />
    </>
  );
}
