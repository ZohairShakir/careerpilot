import Image from "next/image";
import Link from "next/link";
import PurchaseButton from "./purchase-button";

const stages = [
  "Know your value", "Find the right roles", "Build your résumé", "Optimize for ATS", "Improve LinkedIn",
  "Tailor applications", "Reach the right people", "Prepare for interviews", "Evaluate offers", "Build momentum",
];

const faqs = [
  ["What exactly will I receive?", "One downloadable ZIP containing six connected resources: the 67-page Blueprint, Quick Start guide, 30-Day Implementation Plan, editable Word résumé template, Job Search Checklist, and Job Application Tracker."],
  ["Who is this bundle for?", "It is built for non-technical professionals, active job seekers, and career changers who want a clearer, more consistent process."],
  ["Which AI tools can I use?", "The prompts work with general-purpose AI assistants such as ChatGPT, Claude, or Gemini."],
  ["Is the résumé template editable?", "Yes. The template is delivered as an editable Word document with an ATS-friendly single-column structure and clear instructions."],
  ["Does this guarantee a job?", "No. It provides a practical system and tools, but hiring outcomes depend on your experience, market, effort, and employer decisions."],
  ["How do I access my files?", "After verified payment, a secure one-click ZIP download appears immediately, with optional links for downloading all six resources separately. The links remain active for 15 minutes."],
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://careerpilot.store/#organization",
      name: "Career Pilot",
      url: "https://careerpilot.store",
      email: "arkzlab@gmail.com",
      contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: "arkzlab@gmail.com" },
    },
    {
      "@type": "WebSite",
      "@id": "https://careerpilot.store/#website",
      name: "Career Pilot",
      url: "https://careerpilot.store",
      publisher: { "@id": "https://careerpilot.store/#organization" },
    },
    {
      "@type": "Product",
      "@id": "https://careerpilot.store/#product",
      name: "Career Pilot AI Job Search Bundle",
      description: "A six-resource AI job-search implementation system with a 67-page Blueprint, Quick Start guide, 30-day plan, editable resume template, checklist, and application tracker.",
      image: "https://careerpilot.store/assets/career-pilot-bundle-white.png",
      brand: { "@type": "Brand", name: "Career Pilot" },
      seller: { "@id": "https://careerpilot.store/#organization" },
      category: "Digital career development resources",
      offers: {
        "@type": "Offer",
        url: "https://careerpilot.store",
        priceCurrency: "INR",
        price: "499",
        availability: "https://schema.org/OnlineOnly",
        itemCondition: "https://schema.org/NewCondition",
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          applicableCountry: "IN",
          returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
          merchantReturnLink: "https://careerpilot.store/refund-policy",
        },
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
  ],
};

function Mark() {
  return <span className="mark" aria-hidden="true">✦</span>;
}

export default function Home() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <header className="nav shell">
        <a className="wordmark" href="#top"><Mark />career pilot</a>
        <nav aria-label="Primary navigation">
          <a href="#bundle">Inside the bundle</a><Link href="/job-fit-check">Job Fit Check</Link><Link href="/free-ai-job-search-prompts">Free prompts</Link><a href="#faq">FAQ</a>
        </nav>
        <PurchaseButton compact />
      </header>

      <section className="hero shell" id="top">
        <div className="hero-copy reveal">
          <h1>Your entire<br />job search.<br /><em>Finally, in one system.</em></h1>
          <p>Six connected resources that take you from choosing the right role to sending targeted applications and building a routine you can repeat.</p>
          <PurchaseButton />
          <span className="secure">Instant digital access · Secure checkout</span>
        </div>
        <div className="hero-art reveal delay">
          <Image src="/assets/career-pilot-bundle-white.png" alt="Career Pilot AI Job Search Blueprint and application resources" width={1536} height={1024} priority />
        </div>
      </section>

      <section className="included shell" id="bundle">
        <div className="section-heading"><h2>One bundle.<br /><em>Every move covered.</em></h2><p>Learn the strategy. Make the application. Build the routine.</p></div>
        <div className="product-list">
          <article><span>01</span><div><h3>The AI Job Search Blueprint</h3><p>67 pages · 50 guided prompts</p></div></article>
          <article><span>02</span><div><h3>Quick Start: Your First AI-Powered Application</h3><p>One properly tailored application in about 75 minutes</p></div></article>
          <article><span>03</span><div><h3>30-Day AI Job Search Implementation Plan</h3><p>One clear action for every day</p></div></article>
          <article><span>04</span><div><h3>AI-Ready Resume Template</h3><p>Editable Word document · ATS-friendly</p></div></article>
          <article><span>05</span><div><h3>AI Job Search Checklist</h3><p>Before, during, and after every application</p></div></article>
          <article><span>06</span><div><h3>Job Application Tracker</h3><p>Log applications and never miss a follow-up</p></div></article>
        </div>
        <div className="cover-stage"><Image className="bundle-visual" src="/assets/career-pilot-six-resource-bundle.png" alt="The Career Pilot Blueprint, résumé template, Quick Start guide, 30-day plan, checklist, and application tracker" width={1536} height={1024} /></div>
      </section>

      <section className="system" id="system">
        <div className="shell"><div className="section-heading wide"><h2>From unsure to <em>intentional.</em></h2><p>A connected process that takes you from self-discovery to a repeatable job-search rhythm.</p></div>
          <ol className="stage-line">{stages.map((stage, index) => <li key={stage}><span>{String(index + 1).padStart(2, "0")}</span><p>{stage}</p></li>)}</ol>
        </div>
      </section>

      <section className="transformation shell">
        <div><h2>Built to turn<br />thought into <em>action.</em></h2></div>
        <div className="transform-list">
          <p><span>Career confusion</span><b>→</b><span>Clear target roles</span></p>
          <p><span>Generic résumé</span><b>→</b><span>Evidence-led story</span></p>
          <p><span>Random applications</span><b>→</b><span>A repeatable system</span></p>
        </div>
      </section>

      <section className="truth">
        <div className="shell truth-grid"><p className="quote">“Use AI to communicate your real value—not invent qualifications, achievements, or experience.”</p><p>Career Pilot is built around truthful, evidence-led applications. AI helps you discover, structure, and communicate what is already yours.</p></div>
      </section>

      <section className="resources shell" aria-labelledby="resources-title">
        <div className="resources-heading"><h2 id="resources-title">Start useful.<br /><em>Start free.</em></h2><p>Clear, practical guidance built from the same evidence-led system as the complete Blueprint.</p></div>
        <div className="resource-links">
          <Link href="/job-fit-check"><span>Free AI tool</span><h3>Know the fit before you apply</h3><p>Compare your résumé with a real job description and see demonstrated matches, unclear evidence, important gaps, and what to improve.</p><b>Check your job fit →</b></Link>
          <Link href="/free-ai-job-search-prompts"><span>Free resource</span><h3>10 AI prompts for a clearer job search</h3><p>Use AI to identify strengths, assess roles, improve your résumé, prepare for interviews, and plan your week.</p><b>Open the prompts →</b></Link>
          <Link href="/blog"><span>Career Pilot guides</span><h3>Build a stronger job-search system</h3><p>Step-by-step guidance on targeting roles, tailoring applications, using AI truthfully, and staying consistent.</p><b>Explore all guides →</b></Link>
        </div>
      </section>

      <section className="purchase" id="buy">
        <div className="shell purchase-grid">
          <div><h2>The complete<br />Career Pilot <em>system.</em></h2><ul><li>67-page Blueprint with 50 guided prompts</li><li>Quick Start application guide</li><li>30-Day Implementation Plan</li><li>Editable AI-Ready Resume Template</li><li>Job Search Checklist</li><li>Job Application Tracker</li></ul><div className="price">₹499</div><PurchaseButton light /><span className="payment-note">One-time payment · Secure payment via Razorpay</span></div>
          <Image src="/assets/book-cover.jpeg" alt="The AI Job Search Blueprint" width={1054} height={1492} />
        </div>
      </section>

      <section className="faq shell" id="faq"><h2>Questions,<br /><em>answered.</em></h2><div>{faqs.map(([q, a]) => <details key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div></section>

      <footer className="footer shell"><a className="wordmark" href="#top"><Mark />career pilot</a><div><a href="/job-fit-check">Job Fit Check</a><a href="/blog">Guides</a><a href="/free-ai-job-search-prompts">Free prompts</a><a href="/about">About</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/refund-policy">Refund policy</a><a href="/digital-delivery">Digital delivery</a><a href="/contact">Contact</a></div></footer>
    </main>
  );
}
