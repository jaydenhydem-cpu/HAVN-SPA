import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE } from "@/lib/site";
import SmoothScroll from "@/components/providers/SmoothScroll";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Cursor from "@/components/ui/Cursor";
import Analytics from "@/components/Analytics";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  // Titles/descriptions are service + location oriented (what people
  // search) and live in SITE.seo — rewrite there per client, e.g.
  // "Massage Therapy in Miami — {Brand}". The poetic tagline stays in
  // the visible hero; this block is what Google and link previews show.
  title: {
    default: SITE.seo.title,
    template: SITE.seo.template,
  },
  description: SITE.seo.description,
  // homepage canonical; sub-pages set their own via `alternates`
  alternates: { canonical: "/" },
  // let Google show full snippets and large previews
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: SITE.seo.title,
    description: SITE.seo.description,
    url: SITE.url,
    siteName: SITE.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.seo.title,
    description: SITE.seo.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#f8f7f4",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Analytics />
        <SmoothScroll>
          <Cursor />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
