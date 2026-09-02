import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ResourceFooter, ResourceHeader } from "../site-chrome";

export const metadata: Metadata = {
  title: "About Career Pilot",
  description: "Career Pilot is a practical, evidence-led AI job-search system for non-technical professionals, active job seekers, and career changers.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const jsonLd = { "@context": "https://schema.org", "@type": "AboutPage", name: "About Career Pilot", url: "https://careerpilot.store/about", mainEntity: { "@type": "Organization", name: "Career Pilot", url: "https://careerpilot.store", email: "arkzlab@gmail.com" } };
  return <><ResourceHeader /><main className="about-page shell"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} /><section className="about-hero"><div><p className="eyebrow">About Career Pilot</p><h1>Use AI to reveal your value—<em>never to invent it.</em></h1><p>Career Pilot is a practical job-search system for non-technical professionals who want more clarity, stronger applications, and a process they can actually repeat.</p></div><Image src="/assets/book-cover.jpeg" alt="Cover of The AI Job Search Blueprint" width={1054} height={1492} priority /></section><section className="about-copy"><h2>Why this system exists</h2><div><p>Job searching often becomes a cycle of unclear targets, generic résumés, random applications, and uncertain follow-ups. AI can make that cycle faster without making it better.</p><p>Career Pilot organizes AI around the decisions that matter: understanding your strengths, choosing realistic roles, communicating evidence, approaching the right people, preparing for interviews, evaluating offers, and building momentum.</p></div><h2>What we believe</h2><div><p>Your application should remain truthful. AI should help uncover, structure, and communicate experience you already have—not fabricate qualifications, achievements, responsibilities, or metrics.</p><p>Quality and relevance matter more than application volume. A connected workflow is more useful than a folder of disconnected prompts.</p></div><h2>What is inside</h2><div><p>The Blueprint contains 50 guided prompts across ten stages, plus a prompt roadmap and a seven-day implementation challenge. The bundle adds an AI-ready résumé template and a practical checklist for applying, following up, and reviewing your week.</p><Link className="text-link" href="/#bundle">See the complete bundle →</Link></div></section></main><ResourceFooter /></>;
}
