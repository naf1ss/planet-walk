import type { Metadata } from "next";
import { SITE } from "@/lib/constants";

export const HOME_TITLE = "Planet Walk · Gettysburg College Solar System Scale Model";

export const OG_IMAGE = {
  url: "/og-image.jpg",
  width: 1200,
  height: 630,
  alt: "Gettysburg Planet Walk — an interactive solar system across Gettysburg College",
};

type PageSeo = {
  path: string;
  title: string;
  description: string;
  type?: "website" | "profile";
};

/**
 * Next.js replaces (rather than merges) `openGraph` and `twitter` per page,
 * so every page builds the full set here.
 */
export function pageSeo({
  path,
  title,
  description,
  type = "website",
}: PageSeo): Pick<Metadata, "alternates" | "openGraph" | "twitter"> {
  return {
    alternates: { canonical: path },
    openGraph: {
      type,
      siteName: SITE.name,
      locale: "en_US",
      url: path,
      title,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
