import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ResourceFooter, ResourceHeader } from "../site-chrome";
import { planners } from "../../lib/planners";

export const metadata: Metadata = {
  title: "Digital Career Planners",
  description: "Practical digital planners for a more intentional job search, interview, career change, and first 90 days.",
  alternates: { canonical: "/planners" },
  openGraph: {
    type: "website",
    url: "/planners",
    title: "Digital Career Planners | CareerPilot",
    description: "Five focused digital planners for your job search, interviews, career change, and first 90 days.",
    images: [{ url: "/assets/planners/daily-job-search-planner.png", width: 2048, height: 2048, alt: "CareerPilot digital career planners" }],
  },
  twitter: { card: "summary_large_image", title: "Digital Career Planners | CareerPilot", description: "Five focused digital planners for career progress.", images: ["/assets/planners/daily-job-search-planner.png"] },
};

export default function PlannersPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "CareerPilot Digital Career Planners",
        description: "Five focused digital planners for job search, interviews, career change, and the first 90 days in a new role.",
        url: "https://careerpilot.store/planners",
        mainEntity: {
          "@type": "ItemList",
          itemListElement: planners.map((planner, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `https://careerpilot.store/planners/${planner.slug}`,
            name: planner.title,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://careerpilot.store/" },
          { "@type": "ListItem", position: 2, name: "Digital Career Planners", item: "https://careerpilot.store/planners" },
        ],
      },
    ],
  };
  return <><ResourceHeader /><main className="planner-index"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    <header className="planner-index-hero shell"><p>CareerPilot planners</p><h1>Make the next step<br />feel <em>doable.</em></h1><div><span>Five focused digital planners for the moments around your job search.</span><small>Instant digital PDF · Use on screen or print at home</small></div></header>
    <section className="planner-grid shell" aria-label="CareerPilot planners">
      {planners.map((planner, index) => <Link className="planner-card" href={`/planners/${planner.slug}`} key={planner.slug}>
        <div className={`planner-cover planner-cover-${index + 1}`}><Image src={planner.cover} alt={`${planner.title} preview`} width={960} height={1240} sizes="(max-width: 700px) 50vw, 25vw" /></div>
        <p>{planner.eyebrow}</p><h2>{planner.title}</h2><span>{planner.pages} pages · ₹{planner.price}</span><i aria-hidden="true">↗</i>
      </Link>)}
    </section>
    <section className="planner-index-note"><div className="shell"><p>Designed for quiet, steady progress.</p><span>Each planner is a standalone, printable PDF with simple prompts and space to think clearly.</span></div></section>
  </main><ResourceFooter /></>;
}
