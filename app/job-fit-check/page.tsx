import type { Metadata } from "next";
import JobFitCheck from "./job-fit-check";
import { ResourceFooter, ResourceHeader } from "../site-chrome";

export const metadata: Metadata = {
  title: { absolute: "Free Resume & Job Description Match Checker | Career Pilot" },
  description: "Compare your resume with a job description for free. See what you demonstrate, what’s unclear, what’s missing, and what to improve before applying.",
  alternates: { canonical: "/job-fit-check" },
  keywords: ["resume vs job description", "resume match", "job fit checker", "resume job match", "job requirements"],
  openGraph: { title: "Free Resume & Job Description Match Checker | Career Pilot", description: "Compare your resume with a job description for free. See what you demonstrate, what’s unclear, what’s missing, and what to improve before applying.", url: "/job-fit-check", images: [{ url: "/assets/career-pilot-bundle-white.png", width: 1536, height: 1024, alt: "Career Pilot resume and job description match checker resources" }] },
  twitter: { card: "summary_large_image", title: "Free Resume & Job Description Match Checker | Career Pilot", description: "Compare your resume with a job description and review the evidence behind your job fit.", images: ["/assets/career-pilot-bundle-white.png"] },
};

const faqs = [
  ["How does the resume and job description match work?", "Career Pilot extracts the job requirements and compares each one with evidence in your resume. It then separates the result into Demonstrated, Unclear, and Not demonstrated so you can see why the match looks the way it does."],
  ["Is this an ATS score?", "No. This job fit checker does not produce an arbitrary percentage. It shows which requirements your resume supports, which need clearer evidence, and which are not currently demonstrated."],
  ["What does ‘Not demonstrated’ mean?", "It means the submitted resume does not contain clear evidence for that job requirement. It does not mean you lack the skill in real life. If you genuinely have the experience, the tool may recommend making it clearer."],
  ["Are my résumé and job description stored?", "No. The documents are processed to create the analysis and are not stored in Career Pilot's database or analytics."],
  ["Will the tool invent missing skills?", "No. Recommendations are limited to clarifying, selecting, or reorganizing evidence already present in your résumé. Missing requirements remain clearly labeled."],
];

export default function JobFitPage() {
  const jsonLd = { "@context": "https://schema.org", "@graph": [
    { "@type": "WebApplication", name: "Career Pilot Job Fit Checker", alternateName: "Free Resume & Job Description Match Checker", url: "https://careerpilot.store/job-fit-check", applicationCategory: "BusinessApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Compare your resume with a job description for free and see demonstrated requirements, unclear evidence, gaps, and practical improvements before applying." },
    { "@type": "FAQPage", mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) },
  ] };
  return <><ResourceHeader /><main className="fit-page"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} /><JobFitCheck /><section className="fit-explainer shell"><div><h2>A thoughtful analysis,<br /><em>not a score.</em></h2></div><div><h3>How the match works</h3><p>Career Pilot reads the specific job requirements and looks for supporting evidence in your resume. Instead of reducing the resume-versus-job-description comparison to an unexplained percentage, it separates each important requirement into Demonstrated, Unclear, or Not demonstrated.</p></div><div><h3>Honest by design</h3><p>A missing match means the evidence is not shown in the resume—not that you lack the skill. Recommendations help you communicate experience you really have; they never ask you to invent qualifications. Your documents are processed in real time and are not stored.</p></div></section><section className="fit-faq shell"><h2>Resume match,<br /><em>explained.</em></h2><div>{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></section></main><ResourceFooter /></>;
}
