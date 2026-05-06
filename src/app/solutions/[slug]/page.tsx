import { notFound } from "next/navigation";
import { IndustrySolutionPage } from "@/components/IndustrySolutionPage";
import { getIndustrySolution, industrySolutions } from "@/lib/industry-solutions";

type SolutionPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return industrySolutions.map((solution) => ({
    slug: solution.slug,
  }));
}

export async function generateMetadata({ params }: SolutionPageProps) {
  const { slug } = await params;
  const solution = getIndustrySolution(slug);

  if (!solution) {
    return {};
  }

  return {
    title: `${solution.title} OCR to Excel | AxLiner`,
    description: solution.summary,
  };
}

export default async function SolutionDetailPage({ params }: SolutionPageProps) {
  const { slug } = await params;
  const solution = getIndustrySolution(slug);

  if (!solution) {
    notFound();
  }

  return <IndustrySolutionPage solution={solution} />;
}
