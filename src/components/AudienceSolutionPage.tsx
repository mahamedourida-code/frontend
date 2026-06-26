import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { EditorialPhotoBand } from "@/components/marketing/EditorialPhotoBand";
import { MarketingFooter } from "@/components/MarketingFooter";
import { MarketingNavBar } from "@/components/MarketingNavBar";
import { Button } from "@/components/ui/button";
import {
  type AudienceSolution,
  audienceSolutionHref,
  getAudienceSolutionBySlug,
} from "@/lib/audience-solutions";

type AudiencePhoto = { src: string; alt: string };

// Real desks behind each audience — photographed work, not stock-render filler.
const AUDIENCE_PHOTO: Record<string, AudiencePhoto> = {
  "solo-bookkeepers": {
    src: "/photos/pexels-mikhail-nilov-8297034.jpg",
    alt: "A bookkeeper working through figures by hand beside a calculator and files",
  },
  "accounting-practices": {
    src: "/photos/austin-distel-mpN7xjKQ_Ns-unsplash.jpg",
    alt: "A practice team reviewing work together at a shared desk",
  },
  "mixed-batch-processing": {
    src: "/photos/kelly-sikkema-M98NRBuzbpc-unsplash.jpg",
    alt: "A mixed folder of forms, receipts, and notes ready to be processed as one batch",
  },
  "client-intake": {
    src: "/photos/istockphoto-2246330850-612x612.jpg",
    alt: "A client document being captured with a phone next to a laptop",
  },
};

const DEFAULT_AUDIENCE_PHOTO: AudiencePhoto = {
  src: "/photos/smiling-young-woman-sitting-on-chair-holding-mobil-2023-11-27-04-52-35-utc.webp",
  alt: "A bookkeeper at her desk reviewing paperwork",
};

export function AudienceSolutionPage({ solution }: { solution: AudienceSolution }) {
  const photo = AUDIENCE_PHOTO[solution.slug] ?? DEFAULT_AUDIENCE_PHOTO;

  return (
    <div className="ax-marketing-page min-h-screen overflow-hidden bg-[#FDFBF7] text-[#191919]">
      <MarketingNavBar />

      <main>
        <section className="px-4 pb-16 pt-32 sm:px-6 sm:pb-20 lg:pt-40">
          <div className="mx-auto max-w-[1120px] text-center">
            <h1 className="mx-auto max-w-[920px] text-balance text-[clamp(2.5rem,4.5vw,4rem)] font-medium leading-[1.02] tracking-[-0.045em] text-[#191919]">
              {solution.headline}
            </h1>
            <p className="mx-auto mt-7 max-w-[760px] text-pretty text-[18px] font-medium leading-8 text-[#191919] sm:text-[20px]">
              {solution.summary}
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="glossy" size="lg" asChild className="h-12 rounded-full px-7 font-bold">
                <Link href="/sign-up?next=%2Fdashboard%2Fclient">
                  Start free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 text-[15px] font-semibold text-[var(--landing-blue)] hover:underline"
              >
                See plans
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        <EditorialPhotoBand
          src={photo.src}
          alt={photo.alt}
          caption="Real client paperwork, reviewed by a person before anything reaches the books."
          priority
        />

        <section className="px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-[1120px]">
            <div className="max-w-[680px]">
              <h2 className="text-balance text-[clamp(2rem,4vw,3.25rem)] font-medium leading-[1.05] tracking-[-0.045em] text-[#191919]">
                The batch, without the chaos.
              </h2>
            </div>

            <div className="mt-12 grid gap-4 lg:mt-14 lg:grid-cols-3">
              {solution.benefits.map((benefit, index) => (
                <article
                  key={benefit.title}
                  className="flex min-h-[300px] flex-col justify-between rounded-2xl bg-[#efefef] p-7 sm:p-8"
                >
                  <span className="text-sm font-bold tracking-[0.14em] text-[var(--landing-blue)]">
                    0{index + 1}
                  </span>
                  <div className="mt-12">
                    <h3 className="text-[25px] font-medium leading-tight tracking-[-0.04em] text-[#191919]">
                      {benefit.title}
                    </h3>
                    <p className="mt-4 text-[17px] leading-7 text-[#191919]">
                      {benefit.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-[1120px]">
            <div className="max-w-[700px]">
              <h2 className="text-balance text-[clamp(2rem,4vw,3.25rem)] font-medium leading-[1.05] tracking-[-0.045em] text-[#191919]">
                Three steps. One accountable handoff.
              </h2>
            </div>

            <ol className="mt-12 grid gap-4 lg:mt-14 lg:grid-cols-3">
              {solution.workflow.map((step, index) => (
                <li
                  key={step.title}
                  className="flex min-h-[330px] flex-col rounded-2xl bg-[#efefef] p-7 sm:p-8"
                >
                  <span className="flex size-11 items-center justify-center rounded-full bg-[#191919] text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <div className="mt-auto pt-16">
                    <h3 className="text-[25px] font-medium leading-tight tracking-[-0.04em] text-[#191919]">
                      {step.title}
                    </h3>
                    <p className="mt-4 text-[17px] leading-7 text-[#191919]">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:py-24">
          <div className="mx-auto max-w-[1120px] rounded-[28px] border border-black/10 bg-white p-8 sm:p-10 lg:p-12">
            <h2 className="max-w-[720px] text-balance text-[clamp(2rem,4vw,3.25rem)] font-medium leading-[1.05] tracking-[-0.045em] text-[#191919]">
              Reviewed drafts, with control intact.
            </h2>
            <p className="mt-5 max-w-[680px] text-[18px] leading-8 text-[#191919]">
              Export corrected Excel or CSV files, or publish reviewed draft bills to QuickBooks Online or Xero. AxLiner never pays, reconciles, or auto-approves them.
            </p>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-[1120px]">
            <div className="max-w-[650px]">
              <h2 className="text-balance text-[clamp(2rem,4vw,3.25rem)] font-medium leading-[1.05] tracking-[-0.045em] text-[#191919]">
                The next part of the workflow.
              </h2>
            </div>

            <div className="mt-12 grid gap-4 lg:mt-14 lg:grid-cols-3">
              {solution.related.map((slug) => {
                const relatedSolution = getAudienceSolutionBySlug(slug);

                return (
                  <Link
                    key={slug}
                    href={audienceSolutionHref(slug)}
                    className="group flex min-h-[180px] flex-col justify-between rounded-2xl bg-[#efefef] p-7 text-[#191919] transition-transform hover:-translate-y-1"
                  >
                    <ArrowRight className="size-5 text-[var(--landing-blue)] transition-transform group-hover:translate-x-1" />
                    <span className="mt-10 text-[24px] font-medium leading-tight tracking-[-0.04em]">
                      {relatedSolution.menuLabel}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 pb-24 sm:px-6 lg:pb-32">
          <div className="mx-auto flex max-w-[1120px] flex-col gap-8 rounded-[28px] border border-black/10 bg-white p-8 sm:p-10 lg:flex-row lg:items-end lg:justify-between lg:p-12">
            <div>
              <h2 className="max-w-[700px] text-balance text-[clamp(2rem,4vw,3.25rem)] font-medium leading-[1.05] tracking-[-0.045em] text-[#191919]">
                Put the whole folder through one reviewable workflow.
              </h2>
            </div>
            <Button variant="ink" size="lg" asChild className="h-12 w-fit shrink-0 rounded-full px-7 font-bold">
              <Link href="/sign-up?next=%2Fdashboard%2Fclient">
                Start free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
