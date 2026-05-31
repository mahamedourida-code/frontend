import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AudienceSolutionPage } from "@/components/AudienceSolutionPage";
import { audienceSolutions, getAudienceSolution } from "@/lib/audience-solutions";

type AudiencePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return audienceSolutions.map((solution) => ({
    slug: solution.slug,
  }));
}

export async function generateMetadata({ params }: AudiencePageProps): Promise<Metadata> {
  const { slug } = await params;
  const solution = getAudienceSolution(slug);

  if (!solution) {
    return {};
  }

  return {
    title: `${solution.menuLabel} | AxLiner`,
    description: solution.summary,
  };
}

export default async function AudienceDetailPage({ params }: AudiencePageProps) {
  const { slug } = await params;
  const solution = getAudienceSolution(slug);

  if (!solution) {
    notFound();
  }

  return <AudienceSolutionPage solution={solution} />;
}
