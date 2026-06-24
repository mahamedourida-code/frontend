import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { MarketingFooter } from "@/components/MarketingFooter";
import { MarketingNavBar } from "@/components/MarketingNavBar";
import { Button } from "@/components/ui/button";
import { POLIVALENT_SOLUTION_IMAGE, type IndustrySolution } from "@/lib/industry-solutions";

function StepCard({
  index,
  title,
  outcome,
}: {
  index: number;
  title: string;
  outcome: string;
}) {
  return (
    <article className="flex min-h-[172px] flex-col justify-between rounded-2xl bg-[#efefef] p-6 sm:p-7">
      <span className="text-sm font-bold tracking-[0.14em] text-[var(--landing-blue)]">
        0{index + 1}
      </span>
      <div className="mt-8">
        <h3 className="text-[22px] font-medium leading-tight tracking-[-0.035em] text-[#191919]">
          {title}
        </h3>
        <p className="mt-3 text-[16px] leading-6 text-[#191919]">{outcome}</p>
      </div>
    </article>
  );
}

export function IndustrySolutionPage({ solution }: { solution: IndustrySolution }) {
  return (
    <div className="ax-marketing-page min-h-screen overflow-hidden bg-[#FDFBF7] text-[#191919]">
      <MarketingNavBar />

      <main>
        <section className="px-4 pb-16 pt-32 sm:px-6 sm:pb-20 lg:pt-40">
          <div className="mx-auto max-w-[1120px] text-center">
            <h1 className="mx-auto max-w-[920px] text-balance text-[clamp(2.5rem,4.5vw,4rem)] font-medium leading-[1.02] tracking-[-0.045em] text-[#191919]">
              {solution.headline}
            </h1>
            <p className="mx-auto mt-7 max-w-[720px] text-pretty text-[18px] font-medium leading-8 text-[#191919] sm:text-[20px]">
              {solution.summary}
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild variant="glossy" size="lg" className="h-12 rounded-full px-7 font-bold">
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

            <div className="relative mt-14 aspect-[4/3] overflow-hidden rounded-[28px] bg-[#efefef] p-3 sm:mt-16 sm:p-5 lg:p-7">
              <div className="relative h-full w-full overflow-hidden rounded-2xl">
                <Image
                  src={solution.detailImage}
                  alt={`${solution.title} document workflow`}
                  fill
                  priority
                  sizes="(min-width: 1120px) 1064px, calc(100vw - 32px)"
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-[1120px]">
            <div className="max-w-[640px]">
              <h2 className="text-balance text-[clamp(2rem,4vw,3.25rem)] font-medium leading-[1.05] tracking-[-0.045em] text-[#191919]">
                The paperwork your team already has.
              </h2>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
              {solution.useCases.map((item, index) => (
                <article
                  key={item}
                  className="flex min-h-[190px] flex-col justify-between rounded-2xl bg-[#efefef] p-6"
                >
                  <span className="text-sm font-bold text-[var(--landing-blue)]">0{index + 1}</span>
                  <h3 className="mt-10 text-[23px] font-medium leading-tight tracking-[-0.04em] text-[#191919]">
                    {item}
                  </h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-[1120px]">
            <div className="max-w-[700px]">
              <h2 className="text-balance text-[clamp(2rem,4vw,3.25rem)] font-medium leading-[1.05] tracking-[-0.045em] text-[#191919]">
                One batch. Three controlled steps.
              </h2>
              <p className="mt-5 max-w-[570px] text-[18px] leading-7 text-[#191919]">
                The source stays close while your team clears exceptions and prepares the reviewed output.
              </p>
            </div>

            <div className="mt-12 grid gap-4 lg:mt-14 lg:grid-cols-[1.12fr_0.88fr]">
              <article className="flex min-h-[520px] flex-col overflow-hidden rounded-2xl bg-[#efefef]">
                <div className="relative aspect-[4/3] w-full bg-white">
                  <Image
                    src={POLIVALENT_SOLUTION_IMAGE}
                    alt="AxLiner workspace overview"
                    fill
                    sizes="(min-width: 1024px) 600px, calc(100vw - 32px)"
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-end p-7 sm:p-9">
                  <h3 className="text-[28px] font-medium leading-tight tracking-[-0.04em] text-[#191919]">
                    Keep the full batch visible.
                  </h3>
                  <p className="mt-4 max-w-[520px] text-[17px] leading-7 text-[#191919]">
                    Move from intake to corrected output without losing the source, job state, or review trail.
                  </p>
                </div>
              </article>

              <div className="grid gap-4">
                {solution.workflow.map((step, index) => (
                  <StepCard
                    key={step}
                    index={index}
                    title={step}
                    outcome={solution.outcomes[index] ?? "A clear, reviewable handoff."}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto grid max-w-[1120px] gap-4 lg:grid-cols-2">
            <article className="rounded-2xl bg-[#efefef] p-7 sm:p-9 lg:p-11">
              <h2 className="text-balance text-[clamp(2rem,4vw,3.15rem)] font-medium leading-[1.05] tracking-[-0.045em] text-[#191919]">
                Correct the work before it moves.
              </h2>
              <p className="mt-6 max-w-[500px] text-[18px] leading-8 text-[#191919]">
                Resolve uncertain fields against the source, then leave with corrected Excel or CSV files your team can use immediately.
              </p>
            </article>

            <article className="rounded-2xl bg-[#191919] p-7 text-white sm:p-9 lg:p-11">
              <h2 className="text-balance text-[clamp(2rem,4vw,3.15rem)] font-medium leading-[1.05] tracking-[-0.045em] text-white">
                Publish reviewed drafts, with control intact.
              </h2>
              <p className="mt-6 max-w-[500px] text-[18px] leading-8 text-white">
                Reviewed invoice drafts can move to QuickBooks Online or Xero. AxLiner never pays, reconciles, or auto-approves them.
              </p>
            </article>
          </div>
        </section>

        <section className="px-4 pb-24 sm:px-6 lg:pb-32">
          <div className="mx-auto flex max-w-[1120px] flex-col gap-8 rounded-[28px] border border-black/10 bg-white p-8 sm:p-10 lg:flex-row lg:items-end lg:justify-between lg:p-12">
            <div>
              <h2 className="max-w-[700px] text-balance text-[clamp(2rem,4vw,3.25rem)] font-medium leading-[1.05] tracking-[-0.045em] text-[#191919]">
                Move {solution.title.toLowerCase()} paperwork from folder to reviewed output.
              </h2>
            </div>
            <Button asChild variant="ink" size="lg" className="h-12 w-fit shrink-0 rounded-full px-7 font-bold">
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
