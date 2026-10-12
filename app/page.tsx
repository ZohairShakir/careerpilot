import Image from "next/image";
import Link from "next/link";
import CreatorVideo from "./creator-video";
import OfferPrice, { LaunchFaq, OfferTerms, PurchaseTrust } from "./offer-price";
import PurchaseButton from "./purchase-button";
import ReadinessScorecard from "./readiness-scorecard";
import { initialOfferStatus } from "../lib/launch-offer";
import type { OfferStatus } from "../lib/offer-config";

const resources = [
  ["01", "67-page AI Job Search Blueprint", "50 guided prompts from targeting roles to interview preparation."],
  ["02", "Quick Start Application", "Complete one properly tailored application in about 75 minutes."],
  ["03", "30-Day Implementation Plan", "One focused action for every day of your search."],
  ["04", "AI-Ready Resume Template", "An editable, ATS-friendly structure for your real experience."],
  ["05", "Job Search Checklist", "Check the details before, during, and after every application."],
  ["06", "Job Application Tracker", "Keep applications, contacts, follow-ups, and outcomes together."],
];

const testimonials = [
  { name: "Rohan, 24", meta: "B.Com Graduate · Pune", quote: "The biggest difference was having an actual process to follow. I finally felt like I knew what I was doing." },
  { name: "Priya, 27", meta: "Marketing Executive · Bengaluru", quote: "I wanted something practical, not another generic career guide. The 30-day plan helped me stay consistent." },
  { name: "Aditya, 22", meta: "Engineering Graduate · Indore", quote: "I finally had a system instead of just clicking Apply and hoping for the best." },
];

const faqs = [
  ["What exactly will I receive?", "One downloadable ZIP containing the 67-page Blueprint, Quick Start guide, 30-Day Implementation Plan, editable Word resume template, Job Search Checklist, and Job Application Tracker."],
  ["Who is this bundle for?", "Career Pilot is designed for freshers, career switchers, and non-technical professionals who want a clearer, more intentional job-search process."],
  ["How will this help me get a job?", "It helps you target roles, communicate genuine experience more clearly, tailor applications, and follow a repeatable routine. It does not guarantee interviews or employment."],
  ["Is the résumé template editable?", "Yes. The bundle includes an editable Word document plus a PDF reference version."],
  ["Do I need a paid AI tool?", "No. The prompts work with general-purpose assistants such as ChatGPT, Claude, and Gemini, including their free versions subject to each service's limits."],
  ["Is there a refund policy?", "Yes. You can request a refund within 7 days of purchase by emailing arkzlab@gmail.com with your Razorpay payment ID."],
  ["How will I get access after purchase?", "After Razorpay verifies payment, a secure one-click ZIP download appears immediately. Individual-file links are also available for 15 minutes."],
];

function structuredDataFor(offer: OfferStatus) { return {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": "https://careerpilot.store/#organization", name: "Career Pilot", url: "https://careerpilot.store", email: "arkzlab@gmail.com" },
    { "@type": "WebSite", "@id": "https://careerpilot.store/#website", name: "Career Pilot", url: "https://careerpilot.store", publisher: { "@id": "https://careerpilot.store/#organization" } },
    { "@type": "Product", "@id": "https://careerpilot.store/#product", name: "Career Pilot AI Job Search Bundle", description: "A six-resource AI job-search implementation system.", image: "https://careerpilot.store/assets/career-pilot-bundle-white.png", brand: { "@type": "Brand", name: "Career Pilot" }, offers: { "@type": "Offer", url: "https://careerpilot.store", priceCurrency: "INR", price: String(offer.currentPrice), availability: "https://schema.org/OnlineOnly", itemCondition: "https://schema.org/NewCondition" } },
    { "@type": "FAQPage", mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) },
  ],
}; }

function Mark() { return <span className="mark" aria-hidden="true">✦</span>; }

export default async function Home() {
  const offer = await initialOfferStatus();
  return <main className="conversion-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredDataFor(offer)).replace(/</g, "\\u003c") }} />

    <header className="conversion-nav shell">
      <a className="wordmark" href="#top"><Mark />career pilot</a>
      <nav aria-label="Primary navigation"><a href="#readiness">Job Fit Check</a><a href="#inside">Inside the bundle</a><a href="#stories">Stories</a><a href="#faq">FAQ</a></nav>
      <PurchaseButton compact />
    </header>

    <section className="conversion-hero shell" id="top">
      <div className="conversion-hero-copy">
        <h1>Stop mass-applying.<br /><em>Start landing interviews.</em></h1>
        <p>Get a properly tailored, ATS-ready application done in 75 minutes—without guessing prompts, mass-applying, or starting from scratch.</p>
        <div className="conversion-hero-actions"><a className="readiness-link" href="#readiness">Check my job-search readiness — free</a><div className="hero-purchase"><PurchaseButton label="Get the complete bundle" /></div></div>
        <PurchaseTrust />
      </div>
      <div className="conversion-hero-art"><Image src="/assets/career-pilot-bundle-cutout.png" alt="Career Pilot Blueprint, ATS-ready resume template, job-search checklist, and application tracker" width={1536} height={1024} sizes="(max-width: 800px) 100vw, 52vw" priority fetchPriority="high" /></div>
    </section>

    <div className="readiness-intro shell"><span aria-hidden="true" /><p>A 3-minute readiness check across targeting, application strength, and consistency.</p></div>
    <ReadinessScorecard />

    <section className="inspect-section" id="inside"><div className="shell">
      <header className="inspect-heading"><h2>See what you’ll<br />actually use.</h2><p>Real pages from the Blueprint, Quick Start guide, résumé template, and job tracker.</p></header>
      <div className="inspect-grid">
        <figure><div><Image src="/assets/samples/blueprint-resume-match.png" alt="Blueprint prompt for comparing a resume with a job description" width={692} height={1080} sizes="(max-width: 700px) 78vw, 29vw" /></div><figcaption><b>Blueprint prompt</b><span>Compare your résumé with a real role.</span></figcaption></figure>
        <figure><div><Image src="/assets/samples/quick-start.png" alt="Quick Start guide page for a tailored application" width={1072} height={1516} sizes="(max-width: 700px) 78vw, 29vw" /></div><figcaption><b>Quick Start guide</b><span>Build one tailored application in 75 minutes.</span></figcaption></figure>
        <figure><div><Image src="/assets/samples/30-day-plan.png" alt="30-day job-search implementation plan" width={1072} height={1516} sizes="(max-width: 700px) 78vw, 29vw" /></div><figcaption><b>30-Day Plan</b><span>Turn the system into a daily routine.</span></figcaption></figure>
      </div>
    </div></section>

    <section className="proof-section shell" id="stories">
      <header><h2>Proof you can inspect.</h2><p>Real product pages, on-camera job-search perspectives, and unhidden feedback—not a carousel.</p></header>
      <div className="proof-wall">
        <figure className="proof-video"><CreatorVideo poster="/assets/creator-advice/creator-advice-1.jpg" label="On-camera perspective about building a better job-search process" src="/assets/creator-advice/creator-advice-1.mp4" /><figcaption>Why more applications are not a substitute for a better process.</figcaption></figure>
        <figure className="proof-video"><CreatorVideo poster="/assets/creator-advice/creator-advice-3.jpg" label="On-camera perspective about tailoring a resume to a job description" src="/assets/creator-advice/creator-advice-3.mp4" /><figcaption>How to compare what a role needs with what your résumé shows.</figcaption></figure>
        <article className="proof-featured-quote"><span aria-hidden="true">“</span><blockquote>“{testimonials[2].quote}”</blockquote><footer><strong>{testimonials[2].name}</strong><small>{testimonials[2].meta}</small></footer></article>
      </div>
      <div className="proof-quotes">{testimonials.slice(0, 2).map((item) => <article key={item.name}><blockquote>“{item.quote}”</blockquote><footer><strong>{item.name}</strong><small>{item.meta}</small></footer></article>)}</div>
    </section>

    <section className="conversion-offer" id="buy"><div className="shell conversion-offer-grid">
      <div className="conversion-offer-copy"><h2>Your complete<br />job-search system.</h2><p>Six connected resources for targeting roles, tailoring applications, and building a repeatable routine.</p><ol>{resources.map(([number, title]) => <li key={number}><span>{number}</span>{title}</li>)}</ol></div>
      <div className="conversion-offer-art"><Image src="/assets/career-pilot-bundle.png" alt="Career Pilot six-resource job-search bundle" width={1536} height={1024} sizes="(max-width: 800px) 100vw, 45vw" /></div>
      <div className="conversion-offer-buy"><OfferPrice kind="section" /><OfferTerms /><PurchaseButton light label="Get the complete bundle" /><PurchaseTrust /></div>
    </div></section>

    <section className="conversion-faq shell" id="faq"><h2>Questions,<br />answered.</h2><div><LaunchFaq />{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></section>

    <section className="conversion-final shell"><h2>Make your next<br />application intentional.</h2><p>Clearer roles. Stronger applications. A more focused you.</p><div><a className="readiness-link outline" href="#readiness">Check my readiness — free</a><PurchaseButton label="Get the bundle" /></div></section>

    <footer className="conversion-footer shell"><a className="wordmark" href="#top"><Mark />career pilot</a><p>A more focused you.</p><nav aria-label="Footer navigation"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/refund-policy">Refund policy</Link><Link href="/contact">Contact</Link></nav></footer>
    <div className="mobile-buy-bar"><div><span>Complete bundle</span><OfferPrice kind="sticky" /></div><PurchaseButton compact /></div>
  </main>;
}
