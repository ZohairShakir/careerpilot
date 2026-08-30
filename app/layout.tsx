import type { Metadata } from "next";
import "./globals.css";
import AnalyticsProvider from "./analytics-provider";
import GoogleAnalytics from "./google-analytics";

export const metadata: Metadata = {
  metadataBase: new URL("https://careerpilot.store"),
  title: {
    default: "AI Job Search Blueprint, Resume Template & Checklist | Career Pilot",
    template: "%s | Career Pilot",
  },
  description: "A practical AI job search bundle with a 67-page blueprint, 50 guided AI prompts, an AI-ready resume template, and a job search checklist.",
  applicationName: "Career Pilot",
  authors: [{ name: "Career Pilot", url: "https://careerpilot.store" }],
  creator: "Career Pilot",
  publisher: "Career Pilot",
  alternates: { canonical: "/" },
  category: "Career development",
  keywords: ["AI job search", "AI resume template", "job search checklist", "AI prompts for job seekers", "career planning"],
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
    description: "Get the complete Career Pilot AI Job Search Bundle for ₹499.",
    images: [{ url: "/assets/career-pilot-bundle-white.png", width: 1536, height: 1024, alt: "Career Pilot AI Job Search Bundle" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Job Search Blueprint, Resume Template & Checklist",
    description: "Get the complete Career Pilot AI Job Search Bundle for ₹499.",
    images: ["/assets/career-pilot-bundle-white.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<AnalyticsProvider /><GoogleAnalytics /></body></html>;
}
