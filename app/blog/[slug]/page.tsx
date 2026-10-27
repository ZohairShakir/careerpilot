import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, getArticle } from "../articles";
import { ResourceFooter, ResourceHeader } from "../../site-chrome";

export function generateStaticParams() { return articles.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return { title: article.title, description: article.description, alternates: { canonical: `/blog/${slug}` }, openGraph: { type: "article", title: article.title, description: article.description, url: `/blog/${slug}`, images: ["/assets/career-pilot-bundle-white.png"] }, twitter: { card: "summary_large_image", title: article.title, description: article.description, images: ["/assets/career-pilot-bundle-white.png"] } };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  const jsonLd = { "@context": "https://schema.org", "@graph": [
    { "@type": "Article", headline: article.title, description: article.description, author: { "@type": "Organization", name: "Career Pilot", url: "https://careerpilot.store/about" }, publisher: { "@type": "Organization", name: "Career Pilot", url: "https://careerpilot.store" }, mainEntityOfPage: `https://careerpilot.store/blog/${article.slug}` },
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://careerpilot.store" },
      { "@type": "ListItem", position: 2, name: "Guides", item: "https://careerpilot.store/blog" },
      { "@type": "ListItem", position: 3, name: article.title, item: `https://careerpilot.store/blog/${article.slug}` },
    ] },
  ] };
  const articleIndex = articles.findIndex((item) => item.slug === article.slug);
  const related = [articles[(articleIndex + 1) % articles.length], articles[(articleIndex + 2) % articles.length]].filter((item) => item.slug !== article.slug);
  return <><ResourceHeader /><main className="article-page"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} /><header><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/blog">Guides</Link></nav><p className="eyebrow">{article.eyebrow} · {article.readTime}</p><h1>{article.title}</h1><p>{article.description}</p></header><div className="article-body">{article.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.steps ? <ul>{section.steps.map((step) => <li key={step}>{step}</li>)}</ul> : null}</section>)}<aside><p className="eyebrow">Put it into practice</p><h2>See how your résumé matches a real role.</h2><p>Use the free Career Pilot Resume Match Checker to separate demonstrated requirements from unclear evidence and genuine gaps.</p><div className="article-cta-links"><Link className="buy-button" href="/job-fit-check">Check my résumé — free</Link><Link className="text-link" href="/#buy">Explore the complete bundle →</Link></div></aside><nav className="related" aria-label="Related guides"><h2>Keep reading</h2>{related.map((item) => <Link key={item.slug} href={`/blog/${item.slug}`}>{item.title}<span>→</span></Link>)}</nav></div></main><ResourceFooter /></>;
}
