import type { Metadata } from "next";
import Link from "next/link";
import { ResourceFooter, ResourceHeader } from "../site-chrome";

export const metadata: Metadata = {
  title: "10 Free AI Job Search Prompts",
  description: "Ten practical AI prompts for discovering your strengths, targeting suitable roles, improving your résumé, networking, and preparing for interviews.",
  alternates: { canonical: "/free-ai-job-search-prompts" },
};

const prompts = [
  ["Discover your transferable skills", "Act as a career strategist. Using only the experience I provide, identify my transferable skills. For each skill, cite the specific responsibility or example that supports it, suggest roles where it is useful, and flag anything that needs more evidence. Do not invent details. Here is my experience: [paste experience]."],
  ["Find your professional strengths", "Review the projects, responsibilities, feedback, and outcomes below. Identify five professional strengths, the problems each strength helps me solve, and questions I should answer to validate them. Base every conclusion on my information: [paste details]."],
  ["Turn responsibilities into achievements", "Rewrite these responsibility-based résumé bullets to emphasize action, context, and outcome. Preserve every fact. If a useful number is missing, insert a clear placeholder and ask me for the real figure instead of inventing one: [paste bullets]."],
  ["Discover suitable job titles", "Based on my experience and interests, suggest realistic target roles in three groups: strong matches, adjacent roles, and stretch roles. Explain the evidence for each suggestion and the likely gaps. My background: [paste background]."],
  ["Decode a job description", "Break this job description into core responsibilities, required skills, preferred skills, tools, repeated terminology, and the three problems the employer most likely needs solved. Then summarize what a strong candidate must demonstrate: [paste job description]."],
  ["Score your fit", "Compare my résumé with this job description. Score my fit across essential requirements, responsibilities, tools, and preferred qualifications. Cite résumé evidence for every match, label unsupported requirements as gaps, and recommend whether I should apply: [paste résumé and description]."],
  ["Audit your résumé", "Review my résumé like a hiring manager for [target role]. Evaluate clarity, relevance, evidence, impact, readability, and unsupported claims. Prioritize the five most valuable changes and explain why each matters: [paste résumé]."],
  ["Improve ATS alignment", "Compare my résumé with the job description. Identify important terminology that is genuinely supported by my experience but missing from the résumé. Suggest natural edits without keyword stuffing or adding skills I do not have: [paste both]."],
  ["Prepare interview answers", "Using my résumé and this job description, predict ten likely interview questions. Ask them one at a time. After each answer, evaluate its clarity and evidence, then help me structure a stronger Situation–Action–Result response without inventing details."],
  ["Build a weekly job-search plan", "Create a realistic weekly plan covering targeted applications, networking, recruiter outreach, interview practice, follow-ups, and tracking. Use my available hours and priorities below. Favor quality and consistency over high application volume: [paste availability and goals]."],
] as const;

export default function FreePromptsPage() {
  const jsonLd = { "@context": "https://schema.org", "@type": "HowTo", name: "10 Free AI Job Search Prompts", description: "A practical set of truthful AI prompts for a more structured job search.", step: prompts.map(([name, text]) => ({ "@type": "HowToStep", name, text })) };
  return <><ResourceHeader /><main className="prompts-page shell"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} /><header><p className="eyebrow">Free resource</p><h1>10 AI prompts for a<br /><em>clearer job search.</em></h1><p>Copy these into your preferred AI assistant. Replace the bracketed sections with your information, verify every claim, and keep the final answer in your own voice.</p></header><ol className="prompt-list">{prompts.map(([title, prompt], index) => <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h2>{title}</h2><p>{prompt}</p></div></li>)}</ol><aside className="resource-cta"><p className="eyebrow">Go beyond the sample</p><h2>Continue with all 50 connected prompts.</h2><p>The complete Blueprint takes you from self-discovery and role targeting through applications, networking, interviews, offers, and follow-up.</p><Link className="buy-button" href="/#buy">Explore the complete bundle</Link></aside></main><ResourceFooter /></>;
}
