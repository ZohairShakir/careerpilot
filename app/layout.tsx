import type { Metadata } from "next";
import "./globals.css";
import AnalyticsProvider from "./analytics-provider";
import GoogleAnalytics from "./google-analytics";

export const metadata: Metadata = {
  metadataBase: new URL("https://careerpilot.store"),
  title: "Career Pilot — AI Job Search Bundle",
  description: "A practical AI-powered job-search system: 50 guided prompts, an AI-ready resume template, and a job search checklist.",
  openGraph: {
    title: "Career Pilot — Your entire job search, in one system.",
    description: "Get the complete AI Job Search Bundle for ₹499.",
    images: ["/assets/book-cover.jpeg"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<AnalyticsProvider /><GoogleAnalytics /></body></html>;
}
