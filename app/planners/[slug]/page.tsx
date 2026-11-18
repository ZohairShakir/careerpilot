import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ResourceFooter, ResourceHeader } from "../../site-chrome";
import { getPlanner, planners } from "../../../lib/planners";

export function generateStaticParams() { return planners.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const planner = getPlanner(slug);
  return planner ? {
    title: planner.title,
    description: planner.description,
    alternates: { canonical: `/planners/${planner.slug}` },
    openGraph: {
      type: "website",
      url: `/planners/${planner.slug}`,
      title: `${planner.title} | CareerPilot`,
      description: planner.description,
      images: [{ url: planner.cover, width: 2048, height: 2048, alt: `${planner.title} cover` }],
    },
    twitter: { card: "summary_large_image", title: `${planner.title} | CareerPilot`, description: planner.description, images: [planner.cover] },
  } : {};
}

export default async function PlannerProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const planner = getPlanner(slug);
  if (!planner) notFound();
  const related = planners.filter((item) => item.slug !== planner.slug).slice(0, 3);
  const url = `https://careerpilot.store/planners/${planner.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://careerpilot.store/" },
          { "@type": "ListItem", position: 2, name: "Digital Career Planners", item: "https://careerpilot.store/planners" },
          { "@type": "ListItem", position: 3, name: planner.title, item: url },
        ],
      },
    ],
  };
  return <><ResourceHeader /><main className="planner-product"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    <section className="planner-product-hero shell">
      <div className="planner-product-cover"><Image src={planner.cover} alt={`${planner.title} cover`} width={1200} height={1550} priority /></div>
      <div className="planner-product-copy"><p className="planner-eyebrow">{planner.eyebrow} · Digital PDF</p><h1>{planner.title}</h1><p className="planner-product-description">{planner.description}</p><div className="planner-product-price"><strong>₹{planner.price}</strong><span>One-time payment</span></div><div className="planner-product-actions"><span>Secure checkout coming next</span><Link href="/planners">See all planners</Link></div><p className="planner-product-note">The finished PDF is ready. Checkout and protected email delivery will be connected before this planner goes live.</p></div>
    </section>
    <section className="planner-product-details"><div className="shell"><header><p>What&apos;s inside</p><h2>A simple system for <em>{planner.cadence.toLowerCase()}.</em></h2></header><ol>{planner.includes.map((item, index) => <li key={item}><span>0{index + 1}</span><b>{item}</b></li>)}</ol><aside><b>{planner.pages}</b><span>thoughtful pages, ready to use</span></aside></div></section>
    <section className="planner-related shell"><p>More planners</p><div>{related.map((item) => <Link key={item.slug} href={`/planners/${item.slug}`}><Image src={item.cover} alt="" width={350} height={450} /><span>{item.shortTitle}</span><b>₹{item.price}</b></Link>)}</div></section>
  </main><ResourceFooter /></>;
}
