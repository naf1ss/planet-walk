import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { BODY_SLUGS } from "@/lib/planet-content";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const pages: MetadataRoute.Sitemap = [
    { url: SITE.url, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE.url}/about`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/map`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/tracker`, lastModified, changeFrequency: "monthly", priority: 0.6 },
  ];
  const planets: MetadataRoute.Sitemap = BODY_SLUGS.map((slug) => ({
    url: `${SITE.url}/planet/${slug}`,
    lastModified,
    changeFrequency: "yearly",
    priority: 0.7,
  }));
  return [...pages, ...planets];
}
