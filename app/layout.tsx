import type { Metadata } from "next";
import "./globals.css";
import AnalyticsProvider from "./analytics-provider";
import GoogleAnalytics from "./google-analytics";
import MicrosoftClarity from "./microsoft-clarity";
import MetaPixel from "./meta-pixel";
import OfferProvider from "./offer-provider";
import { initialOfferStatus } from "../lib/launch-offer";

export const metadata: Metadata = {
  metadataBase: new URL("https://careerpilot.store"),
  title: {
    default: "AI Job Search Blueprint, Resume Template & Checklist | Career Pilot",
    template: "%s | Career Pilot",
  },
  description: "A practical six-resource AI job-search system with a 67-page Blueprint, Quick Start guide, 30-day plan, editable resume template, checklist, and tracker.",
  applicationName: "Career Pilot",
  authors: [{ name: "Career Pilot", url: "https://careerpilot.store" }],
  creator: "Career Pilot",
  publisher: "Career Pilot",
  referrer: "origin-when-cross-origin",
  alternates: { canonical: "/" },
  category: "Career development",
  keywords: ["AI job search", "job fit checker", "resume job description match", "AI resume template", "job search checklist", "AI prompts for job seekers", "career planning"],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "Career Pilot",
    title: "AI Job Search Blueprint, Resume Template & Checklist",
    description: "Get the complete Career Pilot AI Job Search Bundle with instant access and a 7-day refund.",
    images: [{ url: "/assets/career-pilot-bundle-white.png", width: 1536, height: 1024, alt: "Career Pilot AI Job Search Bundle" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Job Search Blueprint, Resume Template & Checklist",
    description: "Get the complete Career Pilot AI Job Search Bundle with instant access and a 7-day refund.",
    images: ["/assets/career-pilot-bundle-white.png"],
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const offer = await initialOfferStatus();
  return <html lang="en"><head><link rel="preload" href="/fonts/dm-sans-latin-9fea608a.woff2" as="font" type="font/woff2" crossOrigin="anonymous" /><link rel="preload" href="/fonts/instrument-serif-latin-5eb09b5a.woff2" as="font" type="font/woff2" crossOrigin="anonymous" /></head><body><OfferProvider initialOffer={offer}>{children}<AnalyticsProvider /><GoogleAnalytics /><MicrosoftClarity /><MetaPixel /></OfferProvider></body></html>;
}
