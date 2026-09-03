import Image from "next/image";
import Link from "next/link";
import PurchaseButton from "./purchase-button";

const stages = [
  "Know your value", "Find the right roles", "Build your résumé", "Optimize for ATS", "Improve LinkedIn",
  "Tailor applications", "Reach the right people", "Prepare for interviews", "Evaluate offers", "Build momentum",
];

const faqs = [
  ["What exactly will I receive?", "One downloadable ZIP bundle containing three PDFs: the 67-page AI Job Search Blueprint, the AI-Ready Resume Template, and the Job Search Checklist."],
  ["Who is this bundle for?", "It is built for non-technical professionals, active job seekers, and career changers who want a clearer, more consistent process."],
  ["Which AI tools can I use?", "The prompts work with general-purpose AI assistants such as ChatGPT, Claude, or Gemini."],
  ["Is the résumé template editable?", "The current template is delivered as a PDF. You can use its structure as your guide when building your résumé in your preferred editor."],
  ["Does this guarantee a job?", "No. It provides a practical system and tools, but hiring outcomes depend on your experience, market, effort, and employer decisions."],
  ["How do I access my files?", "After verified payment, a secure one-click bundle download appears immediately, with optional links for downloading each PDF separately. The links remain active for 15 minutes."],
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
      description: "A 67-page AI Job Search Blueprint with 50 guided prompts, an AI-ready resume template, and a practical job search checklist.",
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
          <a href="#bundle">Inside the bundle</a><Link href="/free-ai-job-search-prompts">Free prompts</Link><Link href="/blog">Guides</Link><a href="#faq">FAQ</a>
        </nav>
        <PurchaseButton compact />
      </header>

      <section className="hero shell" id="top">
        <div className="hero-copy reveal">
          <h1>Your entire<br />job search.<br /><em>Finally, in one system.</em></h1>
          <p>The 67-page AI Job Search Blueprint, an AI-ready résumé template, and a practical checklist—built to help you move with clarity.</p>
          <PurchaseButton />
          <span className="secure">Instant digital access · Secure checkout</span>
        </div>
        <div className="hero-art reveal delay">
          <Image src="/assets/career-pilot-bundle-white.png" alt="Career Pilot bundle with the AI Job Search Blueprint, resume template, and checklist" width={1536} height={1024} priority />
        </div>
      </section>

      <section className="included shell" id="bundle">
        <div className="section-heading"><h2>One bundle.<br /><em>Every move covered.</em></h2><p>Learn the strategy. Build the application. Keep the search moving.</p></div>
        <div className="product-list">
          <article><span>01</span><div><h3>The AI Job Search Blueprint</h3><p>67 pages · 50 guided prompts</p></div></article>
          <article><span>02</span><div><h3>AI-Ready Resume Template</h3><p>A clean structure for telling your story</p></div></article>
          <article><span>03</span><div><h3>Job Search Checklist</h3><p>A practical system for staying consistent</p></div></article>
        </div>
        <div className="cover-stage"><Image src="/assets/book-cover.jpeg" alt="The AI Job Search Blueprint cover" width={1054} height={1492} /></div>
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
          <Link href="/free-ai-job-search-prompts"><span>Free resource</span><h3>10 AI prompts for a clearer job search</h3><p>Use AI to identify strengths, assess roles, improve your résumé, prepare for interviews, and plan your week.</p><b>Open the prompts →</b></Link>
          <Link href="/blog"><span>Career Pilot guides</span><h3>Build a stronger job-search system</h3><p>Step-by-step guidance on targeting roles, tailoring applications, using AI truthfully, and staying consistent.</p><b>Explore all guides →</b></Link>
        </div>
      </section>

      <section className="purchase" id="buy">
        <div className="shell purchase-grid">
          <div><h2>Everything you need<br />to move <em>forward.</em></h2><ul><li>67-page AI Job Search Blueprint</li><li>AI-Ready Resume Template</li><li>Job Search Checklist</li><li>Instant digital access</li></ul><div className="price">₹499</div><PurchaseButton light /><span className="payment-note">Secure payment via Razorpay</span></div>
          <Image src="/assets/book-cover.jpeg" alt="The AI Job Search Blueprint" width={1054} height={1492} />
        </div>
      </section>

      <section className="faq shell" id="faq"><h2>Questions,<br /><em>answered.</em></h2><div>{faqs.map(([q, a]) => <details key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div></section>

      <footer className="footer shell"><a className="wordmark" href="#top"><Mark />career pilot</a><div><a href="/blog">Guides</a><a href="/free-ai-job-search-prompts">Free prompts</a><a href="/about">About</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/refund-policy">Refund policy</a><a href="/digital-delivery">Digital delivery</a><a href="/contact">Contact</a></div></footer>
    </main>
  );
}
