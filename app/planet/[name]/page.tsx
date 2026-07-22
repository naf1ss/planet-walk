import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BODY_SLUGS, getBodyContent, isBodySlug } from "@/lib/planet-content";
import { PlanetExperience } from "@/components/planet/PlanetExperience";

type PlanetPageProps = {
  params: Promise<{ name: string }>;
};

export function generateStaticParams() {
  return BODY_SLUGS.map((name) => ({ name }));
}

export async function generateMetadata({
  params,
}: PlanetPageProps): Promise<Metadata> {
  const { name } = await params;
  const body = getBodyContent(name.toLowerCase());
  if (!body) return { title: "Unknown body" };
  return {
    title: body.name,
    description: `${body.name} — ${body.subtitle}. ${body.facts[0]}`,
  };
}

/**
 * Dynamic guided-journey route: /planet/sun | mercury | … | pluto
 * Hit via 3D click or QR code URL.
 */
export default async function PlanetPage({ params }: PlanetPageProps) {
  const { name } = await params;
  const slug = name.toLowerCase();
  if (!isBodySlug(slug)) notFound();

  const body = getBodyContent(slug);
  if (!body) notFound();

  return <PlanetExperience body={body} />;
}
