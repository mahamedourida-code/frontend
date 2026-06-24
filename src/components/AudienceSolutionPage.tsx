import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { MarketingFooter } from "@/components/MarketingFooter";
import { MarketingNavBar } from "@/components/MarketingNavBar";
import { Button } from "@/components/ui/button";
import {
  type AudienceSolution,
  audienceSolutionHref,
  getAudienceSolutionBySlug,
} from "@/lib/audience-solutions";

const REVIEW_BOARD_IMAGE = "/review-board-crop.png";
const PRODUCT_BOARD_IMAGE = "/product-board.png";

export function AudienceSolutionPage({ solution }: { solution: AudienceSolution }) {
  return (
    <div className="ax-marketing-page min-h-screen overflow-hidden bg-[#FDFBF7] text-[#191919]">
      <MarketingNavBar />

      <main>
        <section className="px-4 pb-16 pt-32 sm:px-6 sm:pb-20 lg:pt-40">
          <div className="mx-auto max-w-[1120px] text-center">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--landing-blue)]">
              {solution.eyebrow}
            </p>
            <h1 className="mx-auto mt-6 max-w-[960px] text-balance text-[clamp(2.75rem,6vw,5.35rem)] font-medium leading-[0.98] tracking-[-0.055em] text-[#191919]">
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

            <div className="mt-14 rounded-[28px] bg-[#efefef] p-3 sm:mt-16 sm:p-5 lg:p-7">
              <Image
                src={REVIEW_BOARD_IMAGE}
                alt="AxLiner Batch Review Board showing document statuses and source-backed extracted data"
                width={945}
                height={608}
                priority
                sizes="(min-width: 1120px) 1064px, calc(100vw - 32px)"
                className="h-auto w-full rounded-2xl object-contain"
              />
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-[1120px]">
            <div className="max-w-[680px]">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--landing-blue)]">
                Why it works
              </p>
              <h2 className="mt-5 text-balance text-[clamp(2.35rem,5vw,4rem)] font-medium leading-[1.04] tracking-[-0.05em] text-[#191919]">
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
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--landing-blue)]">
                The workflow
              </p>
              <h2 className="mt-5 text-balance text-[clamp(2.35rem,5vw,4rem)] font-medium leading-[1.04] tracking-[-0.05em] text-[#191919]">
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

        <section className="px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-[1120px] overflow-hidden rounded-[28px] bg-[#191919] text-white">
            <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:p-12">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--landing-blue)]">
                  Reviewed before it moves
                </p>
                <h2 className="mt-5 text-balance text-[clamp(2.35rem,4.5vw,3.75rem)] font-medium leading-[1.04] tracking-[-0.05em] text-white">
                  Finish the books, not the judgment.
                </h2>
                <p className="mt-6 max-w-[460px] text-[18px] leading-8 text-white">
                  Export corrected Excel or CSV files, or publish reviewed draft bills to QuickBooks Online or Xero. AxLiner never pays, reconciles, or auto-approves them.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-3 sm:p-5">
                <Image
                  src={PRODUCT_BOARD_IMAGE}
                  alt="AxLiner reviewed document workspace"
                  width={1877}
                  height={668}
                  sizes="(min-width: 1024px) 600px, calc(100vw - 64px)"
                  className="h-auto w-full rounded-xl object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-[1120px]">
            <div className="max-w-[650px]">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--landing-blue)]">
                Keep exploring
              </p>
              <h2 className="mt-5 text-balance text-[clamp(2.35rem,5vw,4rem)] font-medium leading-[1.04] tracking-[-0.05em] text-[#191919]">
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
          <div className="mx-auto flex max-w-[1120px] flex-col gap-8 rounded-[28px] bg-[var(--brand-green)] p-8 sm:p-10 lg:flex-row lg:items-end lg:justify-between lg:p-14">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#191919]">
                Start with the next client batch
              </p>
              <h2 className="mt-5 max-w-[700px] text-balance text-[clamp(2.35rem,5vw,4rem)] font-medium leading-[1.04] tracking-[-0.05em] text-[#191919]">
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
