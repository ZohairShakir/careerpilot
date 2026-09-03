import type { Metadata } from "next";
import Link from "next/link";
import { articles } from "./articles";
import { ResourceFooter, ResourceHeader } from "../site-chrome";

export const metadata: Metadata = {
  title: "AI Job Search Guides",
  description: "Practical guides for using AI to target roles, improve your résumé, build stronger applications, and run a consistent job search.",
  alternates: { canonical: "/blog" },
  openGraph: { title: "AI Job Search Guides", description: "Practical, truthful guidance for building a stronger AI-assisted job search.", url: "/blog", images: ["/assets/career-pilot-bundle-white.png"] },
  twitter: { card: "summary_large_image", title: "AI Job Search Guides", description: "Practical, truthful guidance for building a stronger AI-assisted job search.", images: ["/assets/career-pilot-bundle-white.png"] },
};

export default function BlogPage() {
  return <><ResourceHeader /><main className="resource-index shell"><p className="eyebrow">Career Pilot guides</p><h1>A clearer way to<br /><em>find your next role.</em></h1><p className="resource-lede">Practical, truthful guidance for using AI throughout your job search—not just to generate another generic application.</p><div className="article-grid">{articles.map((article, index) => <article key={article.slug}><span>{String(index + 1).padStart(2, "0")}</span><p className="eyebrow">{article.eyebrow} · {article.readTime}</p><h2><Link href={`/blog/${article.slug}`}>{article.title}</Link></h2><p>{article.description}</p><Link className="text-link" href={`/blog/${article.slug}`}>Read the guide →</Link></article>)}</div></main><ResourceFooter /></>;
}
