import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Career Pilot",
    short_name: "Career Pilot",
    description: "A practical AI-powered job-search system.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#365846",
  };
}
