import type { MetadataRoute } from "next";
import { articles } from "./blog/articles";
import { planners } from "../lib/planners";

const baseUrl = "https://careerpilot.store";
const lastModified = new Date("2026-11-18");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: baseUrl, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${baseUrl}/bundle`, lastModified, changeFrequency: "monthly", priority: 0.95 },
    { url: `${baseUrl}/planners`, lastModified, changeFrequency: "monthly", priority: 0.85 },
    ...planners.map(({ slug }) => ({ url: `${baseUrl}/planners/${slug}`, lastModified, changeFrequency: "monthly" as const, priority: 0.75 })),
    { url: `${baseUrl}/about`, lastModified, changeFrequency: "yearly", priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/free-ai-job-search-prompts`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/job-fit-check`, lastModified, changeFrequency: "monthly", priority: 0.95 },
    ...articles.map(({ slug }) => ({ url: `${baseUrl}/blog/${slug}`, lastModified, changeFrequency: "monthly" as const, priority: 0.75 })),
    { url: `${baseUrl}/contact`, lastModified, changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/terms`, lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/refund-policy`, lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/digital-delivery`, lastModified, changeFrequency: "yearly", priority: 0.2 },
  ];
}
