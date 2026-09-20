import type { Metadata } from "next";
import JobFitCheck from "./job-fit-check";
import { ResourceFooter, ResourceHeader } from "../site-chrome";

export const metadata: Metadata = {
  title: "Free Job Fit Check — Compare Your Résumé to a Job",
  description: "Compare your résumé with a job description. See demonstrated matches, unclear evidence, important gaps, and the top improvements to make before applying.",
  alternates: { canonical: "/job-fit-check" },
  openGraph: { title: "Career Pilot Job Fit Check", description: "Understand why your résumé aligns—or does not align—with a specific job before you apply.", url: "/job-fit-check", images: ["/assets/career-pilot-bundle-white.png"] },
  twitter: { card: "summary_large_image", title: "Career Pilot Job Fit Check", description: "A free, evidence-led résumé and job-description comparison.", images: ["/assets/career-pilot-bundle-white.png"] },
};

const faqs = [
  ["Is this an ATS score?", "No. Career Pilot explains the requirements you demonstrate, what is unclear, what is not shown, and what to improve. It does not produce a misleading percentage."],
  ["Are my résumé and job description stored?", "No. The documents are processed to create the analysis and are not stored in Career Pilot's database or analytics."],
  ["Will the tool invent missing skills?", "No. Recommendations are limited to clarifying, selecting, or reorganizing evidence already present in your résumé. Missing requirements remain clearly labeled."],
];

export default function JobFitPage() {
  const jsonLd = { "@context": "https://schema.org", "@graph": [
    { "@type": "WebApplication", name: "Career Pilot Job Fit Check", url: "https://careerpilot.store/job-fit-check", applicationCategory: "BusinessApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "A free tool that compares a résumé with a job description and explains demonstrated matches, unclear evidence, gaps, and improvements." },
    { "@type": "FAQPage", mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) },
  ] };
  return <><ResourceHeader /><main className="fit-page"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} /><JobFitCheck /><section className="fit-explainer shell"><div><h2>A thoughtful analysis,<br /><em>not a score.</em></h2></div><div><h3>How it works</h3><p>We extract the role’s requirements and compare them with evidence in your résumé. The result separates demonstrated matches, unclear evidence, and requirements that are not shown.</p></div><div><h3>Your privacy matters</h3><p>Your documents are processed in real time and are not stored. Remove sensitive personal information before uploading. This tool offers guidance, not hiring guarantees.</p></div></section><section className="fit-faq shell"><h2>Before you check.</h2><div>{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></section></main><ResourceFooter /></>;
}
