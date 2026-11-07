import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { LandingExperience } from "@/components/landing/LandingExperience";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE } from "@/lib/constants";
import { BODY_CONTENT, BODY_SLUGS } from "@/lib/planet-content";
import { HOME_TITLE, pageSeo } from "@/lib/seo";
import { homeJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: SITE.description,
  ...pageSeo({ path: "/", title: HOME_TITLE, description: SITE.description }),
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={homeJsonLd()} />
      {/* The 3D landing renders client-side only; this server-rendered
          summary gives crawlers and screen readers the same story. */}
      <section className="sr-only" aria-label="About Planet Walk">
        <h2>Gettysburg Planet Walk</h2>
        <p>{SITE.description}</p>
        <nav aria-label="Planet Walk pages">
          <Link href="/about">About the project and artist {SITE.author}</Link>
          <Link href="/map">Campus map of every stop</Link>
          <Link href="/tracker">Walk tracker passport</Link>
          {BODY_SLUGS.map((slug) => (
            <Link key={slug} href={`/planet/${slug}`}>
              {BODY_CONTENT[slug].name}
            </Link>
          ))}
        </nav>
      </section>
      <Suspense fallback={null}>
        <LandingExperience />
      </Suspense>
    </>
  );
}
