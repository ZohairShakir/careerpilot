import type { MetadataRoute } from "next";
import { articles } from "./blog/articles";

const baseUrl = "https://careerpilot.store";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: baseUrl, changeFrequency: "monthly", priority: 1 },
    { url: `${baseUrl}/about`, changeFrequency: "yearly", priority: 0.7 },
    { url: `${baseUrl}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/free-ai-job-search-prompts`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/job-fit-check`, changeFrequency: "monthly", priority: 0.95 },
    ...articles.map(({ slug }) => ({ url: `${baseUrl}/blog/${slug}`, changeFrequency: "monthly" as const, priority: 0.75 })),
    { url: `${baseUrl}/contact`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/refund-policy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/digital-delivery`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
