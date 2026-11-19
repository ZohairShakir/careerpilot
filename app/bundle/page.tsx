import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BundleGallery from "./bundle-gallery";
import BundleOffer from "./bundle-offer";
import { BundleReviews, BundleVideos } from "./bundle-proof";
import BundleStickyBar from "./bundle-sticky-bar";
import PurchaseButton from "../purchase-button";
import { ResourceFooter, ResourceHeader } from "../site-chrome";
import { initialDisplayOfferStatus } from "../../lib/launch-offer";
import { planners } from "../../lib/planners";

export const metadata: Metadata = {
  title: "CareerPilot AI Job Search Bundle",
  description: "Get the six-resource CareerPilot AI Job Search Bundle: a 67-page Blueprint, tailored-application guide, 30-day plan, editable resume template, checklist, and tracker.",
  alternates: { canonical: "/bundle" },
  openGraph: {
    type: "website",
    url: "/bundle",
    title: "CareerPilot AI Job Search Bundle",
    description: "Six connected digital resources for a clearer, more intentional job search.",
    images: [{ url: "/assets/careerpilot-bundle-gallery.png", width: 1254, height: 1254, alt: "CareerPilot AI Job Search Bundle with six digital resources" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CareerPilot AI Job Search Bundle",
    description: "Six connected digital resources for a clearer, more intentional job search.",
    images: ["/assets/careerpilot-bundle-gallery.png"],
  },
};

const faqs = [
  ["What do I get in the bundle?", "You get the AI Job Search Blueprint, Quick Start Application guide, 30-Day Implementation Plan, AI-Ready Resume Template, Job Search Checklist, and Job Application Tracker."],
  ["Who is CareerPilot for?", "It is designed for freshers, career switchers, and non-technical professionals who want a clearer, more repeatable job-search process."],
  ["Is the resume template editable?", "Yes. The bundle includes an editable, ATS-friendly Word template along with a PDF reference version."],
  ["How will I receive my files?", "After Razorpay confirms payment, you can download the resources immediately and we send the delivery links to your email."],
  ["Do I need a paid AI tool?", "No. The prompts work with general-purpose AI assistants, including free plans where available."],
  ["What if it is not right for me?", "You can request a refund within 7 days of your purchase. Email support with your Razorpay payment ID and purchase email."],
] as const;

function structuredDataFor(price: number) {
  const url = "https://careerpilot.store/bundle";
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${url}#product`,
        name: "CareerPilot AI Job Search Bundle",
        description: "A six-resource digital job-search system with a 67-page Blueprint, Quick Start Application guide, 30-Day Implementation Plan, AI-Ready Resume Template, Job Search Checklist, and Job Application Tracker.",
        image: "https://careerpilot.store/assets/careerpilot-bundle-gallery.png",
        sku: "careerpilot-ai-job-search-bundle",
        brand: { "@type": "Brand", name: "CareerPilot" },
        category: "Career development digital resources",
        offers: {
          "@type": "Offer",
          url,
          priceCurrency: "INR",
          price: String(price),
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://careerpilot.store/" },
          { "@type": "ListItem", position: 2, name: "CareerPilot AI Job Search Bundle", item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })),
      },
    ],
  };
}

export default function BundlePage() {
  const offer = initialDisplayOfferStatus();

  return <main className="bundle-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredDataFor(offer.currentPrice)).replace(/</g, "\\u003c") }} />
    <ResourceHeader />

    <section className="bundle-product bundle-shell">
      <BundleGallery />
      <div className="bundle-summary">
        <p className="bundle-breadcrumb"><Link href="/">Home</Link><span>/</span>CareerPilot Bundle</p>
        <h1>The AI Job Search<br />6-in-1 Bundle</h1>
        <BundleOffer />
        <p className="bundle-description">Your practical system for choosing roles, tailoring applications, and staying consistent through the search.</p>
        <PurchaseButton className="bundle-primary-cta" label="Get the bundle" placement="bundle_product" />
        <BundleReviews />
        <div className="bundle-assurances">
          <Image src="/assets/careerpilot-checkout-assurances-strip.jpg" alt="Secure Razorpay payment, a 7-day refund promise, and instant email delivery." width={2450} height={1120} sizes="(max-width: 640px) calc(100vw - 40px), 500px" />
        </div>
        <BundleVideos />
      </div>
    </section>

    <section className="bundle-faq bundle-shell" id="faq">
      <header><p>CareerPilot answers</p><h2>Frequently asked<br />questions</h2></header>
      <div>{faqs.map(([question, answer], index) => <details key={question} open={index === 0}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div>
    </section>
    <section className="bundle-more-for-you" aria-label="More CareerPilot planners"><div className="bundle-shell">
      <header><h2>You may also like</h2></header>
      <div className="bundle-planner-rail">{planners.slice(0, 4).map((planner) => <Link className="bundle-planner-card" href={`/planners/${planner.slug}`} key={planner.slug}><span className="bundle-planner-image"><Image src={planner.cover} alt="" fill sizes="(max-width: 640px) 70vw, 25vw" /></span><h3>{planner.title}</h3><small>₹{planner.price}</small></Link>)}</div>
    </div></section>
    <ResourceFooter />
    <BundleStickyBar />
  </main>;
}
