import Image from "next/image";
import CreatorVideo from "./creator-video";
import Link from "next/link";
import PurchaseButton from "./purchase-button";
import OfferPrice, { OfferTerms, PurchaseTrust, LaunchFaq } from "./offer-price";
import { initialOfferStatus } from "../lib/launch-offer";
import { OFFER_CONFIG, type OfferStatus } from "../lib/offer-config";

const resources = [
  ["01", "The AI Job Search Blueprint", "Use 50 guided prompts to understand your value and move from targeting to interviews."],
  ["02", "Quick Start Application", "Complete one properly tailored application in about 75 minutes."],
  ["03", "30-Day Implementation Plan", "Turn the bundle into one focused, repeatable action every day."],
  ["04", "AI-Ready Resume Template", "Organize your real experience in an editable, ATS-friendly structure."],
  ["05", "Job Search Checklist", "Check the details before, during and after every application."],
  ["06", "Job Application Tracker", "Track applications, contacts, follow-ups and outcomes in one place."],
];

const testimonials = [
  { name: "Rohan, 24", meta: "Pune · B.Com Graduate", quote: "The biggest difference for me was having an actual process to follow. I finally felt like I knew what I was doing.", detail: "The prompts helped me improve my resume, write better LinkedIn messages and prepare answers for interviews instead of randomly applying everywhere." },
  { name: "Priya, 27", meta: "Bengaluru · Marketing Executive", quote: "I wanted something practical, not another generic career guide.", detail: "The resume template and AI prompts helped me turn my existing experience into much clearer resume points and tailored applications. The 30-day plan helped me stay consistent." },
  { name: "Aditya, 22", meta: "Indore · Engineering Graduate", quote: "It made the whole process feel much less confusing. I finally had a system instead of just clicking Apply and hoping for the best.", detail: "The prompts gave me a starting point for my resume, recruiter outreach and interview practice, while the tracker kept every application organized." },
];

const faqs = [
  ["What exactly will I receive?", "One downloadable ZIP containing the 67-page Blueprint, Quick Start guide, 30-Day Implementation Plan, editable Word resume template, Job Search Checklist and Job Application Tracker."],
  ["Will this work if I am not technical?", "Yes. Career Pilot is designed primarily for non-technical professionals, freshers and career switchers who want a clearer job-search process."],
  ["Do I need a paid AI tool?", "No. The prompts work with general-purpose assistants such as ChatGPT, Claude and Gemini, including their free versions subject to each service's limits."],
  ["Can the system guarantee interviews or a job?", "No. It helps you run a clearer, more targeted and repeatable search, but hiring outcomes depend on your experience, the market and employer decisions."],
  ["What is the refund policy?", "You can request a refund within 7 days of purchase. Email arkzlab@gmail.com with your Razorpay payment ID."],
  ["How do I receive the files?", "After Razorpay verifies payment, a secure one-click ZIP download appears immediately. Optional individual-file links are also provided for 15 minutes."],
];

function structuredDataFor(offer: OfferStatus, questions: typeof faqs) { return {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": "https://careerpilot.store/#organization", name: "Career Pilot", url: "https://careerpilot.store", email: "arkzlab@gmail.com" },
    { "@type": "WebSite", "@id": "https://careerpilot.store/#website", name: "Career Pilot", url: "https://careerpilot.store", publisher: { "@id": "https://careerpilot.store/#organization" } },
    { "@type": "Product", "@id": "https://careerpilot.store/#product", name: "Career Pilot AI Job Search Bundle", description: "A six-resource AI job-search implementation system.", image: "https://careerpilot.store/assets/career-pilot-bundle-white.png", brand: { "@type": "Brand", name: "Career Pilot" }, offers: { "@type": "Offer", url: "https://careerpilot.store", priceCurrency: "INR", price: String(offer.currentPrice), availability: "https://schema.org/OnlineOnly", itemCondition: "https://schema.org/NewCondition", hasMerchantReturnPolicy: { "@type": "MerchantReturnPolicy", applicableCountry: "IN", merchantReturnDays: 7, returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow", merchantReturnLink: "https://careerpilot.store/refund-policy" } } },
    { "@type": "FAQPage", mainEntity: questions.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) },
  ],
}; }

function Mark() { return <span className="mark" aria-hidden="true">✦</span>; }
function TrustLine() { return <PurchaseTrust />; }
function SectionCta() { return <div className="sales-inline-cta"><PurchaseButton  /><TrustLine /></div>; }

export default async function Home() {
  const offer = await initialOfferStatus();
  const questions = offer.launchActive ? [[`Why ₹${OFFER_CONFIG.LAUNCH_PRICE}?`, `It’s a launch price for the first ${OFFER_CONFIG.LAUNCH_CAP} buyers. After that, the price is ₹${OFFER_CONFIG.POST_LAUNCH_PRICE}.`], ...faqs] : faqs;
  return <main className="sales-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredDataFor(offer, questions)).replace(/</g, "\\u003c") }} />
    <header className="sales-nav shell"><a className="wordmark" href="#top"><Mark />career pilot</a><nav aria-label="Primary navigation"><a href="#inside">Inside</a><a href="#samples">Samples</a><a href="#stories">Stories</a><a href="#faq">FAQ</a></nav><PurchaseButton compact  /></header>

    <section className="sales-hero shell" id="top"><div className="sales-hero-copy"><h1>Don&apos;t apply to jobs.<br /><em>Not until you&apos;ve done this first.</em></h1><p>Tailor your resume to the role, communicate your real value and follow a job-search system you can repeat.</p><OfferPrice /><PurchaseButton  /><TrustLine /></div><div className="sales-hero-art"><Image src="/assets/career-pilot-bundle-white.png" alt="Career Pilot six-resource AI job-search bundle" width={1536} height={1024} sizes="(max-width: 600px) calc(112vw - 36px), (max-width: 900px) min(calc(112vw - 45px), 762px), (max-width: 1496px) calc(60.32vw - 58px), 845px" priority fetchPriority="high" /></div></section>

    <aside className="proof-strip"><div className="shell"><blockquote>“The biggest difference was having an actual process to follow.”</blockquote><span>Rohan · B.Com Graduate · Pune</span><b>67-page Blueprint · 50 prompts · 6 connected resources</b></div></aside>

    <section className="sales-problem shell" aria-labelledby="problem-title"><div><span>What gets in the way</span><h2 id="problem-title">The application isn&apos;t always the problem.<br /><em>The process is.</em></h2></div><ul><li><b>01</b><span>A generic resume for every role</span></li><li><b>02</b><span>Time spent on wrong-fit jobs</span></li><li><b>03</b><span>No clear evidence to highlight</span></li></ul></section>

    <section className="sales-inside shell" id="inside"><header><h2>Six resources.<br /><em>One connected system.</em></h2><p>Learn the strategy, build the application and keep the search moving.</p></header><div className="sales-inside-grid"><div className="sales-resource-list">{resources.map(([number, title, description]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div></article>)}</div><div className="sales-bundle-art"><Image src="/assets/career-pilot-six-resource-bundle.png" alt="Career Pilot Blueprint, Quick Start guide, 30-day plan, resume template, checklist and application tracker" width={1536} height={1024} sizes="(max-width: 600px) calc(112vw - 36px), (max-width: 900px) min(calc(112vw - 45px), 762px), (max-width: 1496px) calc(60.32vw - 58px), 845px" /></div></div><SectionCta /></section>

    <section className="sales-samples" id="samples"><div className="shell"><header><span>Look inside before you buy</span><h2>Real pages.<br /><em>Practical by design.</em></h2><p>These previews come directly from the files included in the bundle.</p></header><div className="sample-grid"><figure><div><Image src="/assets/samples/blueprint-resume-match.png" alt="Actual Blueprint page showing a resume and job-description matching prompt" width={692} height={1080} sizes="(max-width: 600px) calc(82vw - 46px), (max-width: 900px) 210px, (max-width: 1496px) calc(33.33vw - 51px), 448px" /></div><figcaption><b>Blueprint prompt</b><span>Compare your resume with a real job description.</span></figcaption></figure><figure><div><Image src="/assets/samples/quick-start.png" alt="Actual Quick Start guide sample page" width={1072} height={1516} sizes="(max-width: 600px) calc(82vw - 46px), (max-width: 900px) 210px, (max-width: 1496px) calc(33.33vw - 51px), 448px" /></div><figcaption><b>Quick Start</b><span>Complete your first properly tailored application.</span></figcaption></figure><figure><div><Image src="/assets/samples/30-day-plan.png" alt="Actual Week 1 page from the 30-Day Implementation Plan" width={1072} height={1516} sizes="(max-width: 600px) calc(82vw - 46px), (max-width: 900px) 210px, (max-width: 1496px) calc(33.33vw - 51px), 448px" /></div><figcaption><b>30-Day Plan</b><span>Turn intention into one clear action every day.</span></figcaption></figure></div></div></section>

    <section className="sales-stories shell" id="stories"><header><span>Real users. Honest feedback.</span><h2>A clearer way to<br /><em>keep moving.</em></h2></header><div className="testimonial-grid">{testimonials.map((item, index) => <article key={item.name}><span>{String(index + 1).padStart(2, "0")}</span><blockquote>“{item.quote}”</blockquote><p>{item.detail}</p><footer><strong>{item.name}</strong><small>{item.meta}</small></footer></article>)}</div></section>

    <section className="creator-section"><div className="shell"><header><div><span>Creator advice</span><h2>Three job-search<br /><em>reality checks.</em></h2></div><p>Short perspectives on why sending the same application everywhere rarely creates a better search.</p></header><div className="creator-grid"><figure><CreatorVideo poster="/assets/creator-advice/creator-advice-1.jpg" label="Creator advice about building a better job-search process" src="/assets/creator-advice/creator-advice-1.mp4" /><figcaption>More applications are not a substitute for a better process.</figcaption></figure><figure><CreatorVideo poster="/assets/creator-advice/creator-advice-2.jpg" label="Creator advice about using AI prompts across a job search" src="/assets/creator-advice/creator-advice-2.mp4" /><figcaption>Use AI across the journey—from resume to interview.</figcaption></figure><figure><CreatorVideo poster="/assets/creator-advice/creator-advice-3.jpg" label="Creator advice about tailoring a resume to a job description" src="/assets/creator-advice/creator-advice-3.mp4" /><figcaption>Start by comparing what the role needs with what your resume shows.</figcaption></figure></div><SectionCta /></div></section>

    <section className="sales-how shell"><header><span>Three simple steps</span><h2>Buy it. Use it.<br /><em>Build the habit.</em></h2></header><ol><li><b>01</b><div><h3>Get the bundle</h3><p>Complete one secure payment through Razorpay.</p></div></li><li><b>02</b><div><h3>Download instantly</h3><p>Receive the complete ZIP and individual files immediately.</p></div></li><li><b>03</b><div><h3>Follow the plan</h3><p>Start with Quick Start, then build consistency over 30 days.</p></div></li></ol></section>

    <section className="sales-audience"><div className="shell"><div><h2>Who it&apos;s for</h2><ul><li>Freshers who need a structured starting point</li><li>Career switchers translating existing experience</li><li>Non-technical professionals using AI thoughtfully</li><li>Job seekers tired of random applications</li></ul></div><div><h2>Who it&apos;s not for</h2><ul><li>Anyone looking to fabricate qualifications</li><li>Anyone expecting guaranteed interviews or employment</li><li>Anyone wanting an automated mass-application bot</li></ul></div></div></section>

    <section className="sales-offer" id="buy"><div className="shell sales-offer-grid"><div><span>The complete Career Pilot system</span><h2>Everything you need to<br /><em>apply with intention.</em></h2><p>Six connected resources for targeting roles, strengthening applications and building a repeatable job-search routine.</p></div><div><ol>{resources.map(([, title]) => <li key={title}>{title}</li>)}</ol><OfferPrice kind="section" /><OfferTerms /><PurchaseButton light  /><TrustLine /></div></div></section>

    <section className="faq shell" id="faq"><h2>Questions,<br /><em>answered.</em></h2><div><LaunchFaq />{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></section>

    <section className="quiet-free shell"><div><span>Not ready yet?</span><h2>Start useful.<br /><em>Start free.</em></h2></div><div><Link href="/job-fit-check">Free Job Fit Checker →</Link><Link href="/free-ai-job-search-prompts">10 free AI prompts →</Link><Link href="/blog">Practical job-search guides →</Link></div></section>

    <section className="sales-final"><div className="shell"><h2>Your next application<br /><em>can be more intentional.</em></h2><PurchaseButton light  /><TrustLine /></div></section>

    <footer className="footer shell"><a className="wordmark" href="#top"><Mark />career pilot</a><div><Link href="/job-fit-check">Job Fit Check</Link><Link href="/blog">Guides</Link><Link href="/about">About</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/contact">Contact</Link></div></footer>
    <div className="mobile-buy-bar"><div><span>Complete bundle</span><OfferPrice kind="sticky" /></div><PurchaseButton compact  /></div>
  </main>;
}
