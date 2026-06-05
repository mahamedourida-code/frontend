import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { MarketingNavBar } from "@/components/MarketingNavBar";
import { Button } from "@/components/ui/button";
import {
  AudienceSolution,
  audienceSolutionHref,
  getAudienceSolutionBySlug,
} from "@/lib/audience-solutions";

export function AudienceSolutionPage({ solution }: { solution: AudienceSolution }) {
  return (
    <main className="ax-marketing-page min-h-screen overflow-hidden bg-white text-black">
      <MarketingNavBar />

      <header className="border-b border-black/20 bg-white">
        <div className="ax-marketing-container-reading pb-14 pt-32 sm:pb-16 lg:pb-20 lg:pt-40">
          <p className="ax-marketing-eyebrow text-black">{solution.eyebrow}</p>
          <h1 className="ax-marketing-section-title mt-5 text-black">
            {solution.headline}
          </h1>
          <p className="ax-marketing-lead mt-7 max-w-none text-justify text-black">
            {solution.summary}
          </p>
          <p className="ax-marketing-prose mt-5 text-justify text-black">
            {solution.proof}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Button variant="glossy" size="lg" asChild className="font-bold">
              <Link href="/sign-up?next=%2Fdashboard%2Fclient">
                Start free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Link
              href="/pricing"
              className="border-b border-black pb-0.5 text-sm font-bold uppercase tracking-[0.14em] text-black transition-colors hover:border-emerald-700 hover:text-emerald-800"
            >
              See plans
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-white">
        <div className="ax-marketing-container-reading py-16 sm:py-20 lg:py-24">
          <p className="ax-marketing-eyebrow text-emerald-800">Why it helps</p>
          <h2 className="ax-marketing-section-title mt-4 text-black">
            A better way to move the batch forward.
          </h2>

          <div className="mt-9">
            {solution.benefits.map((benefit) => (
              <article
                key={benefit.title}
                className="border-t border-black/25 py-6 sm:py-7 last:border-b"
              >
                <h3 className="ax-marketing-subtitle text-black">{benefit.title}</h3>
                <p className="ax-marketing-prose mt-3 text-justify text-black">
                  {benefit.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ax-marketing-band-warm border-y border-black/20 bg-[#f7f3e9]">
        <div className="ax-marketing-container-reading py-12 sm:py-14 lg:py-16">
          <p className="ax-marketing-eyebrow text-black">Workflow</p>
          <h2 className="ax-marketing-subtitle mt-4 text-black">
            From intake to a reviewed handoff.
          </h2>

          <ol className="mt-7">
            {solution.workflow.map((step) => (
              <li
                key={step.title}
                className="border-t border-black/25 py-4 sm:py-5 last:border-b"
              >
                <h3 className="text-lg font-bold leading-tight tracking-[-0.02em] text-black">
                  {step.title}
                </h3>
                <p className="ax-marketing-body mt-2 text-justify text-black">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white">
        <div className="ax-marketing-container-reading py-16 sm:py-20">
          <p className="ax-marketing-eyebrow text-emerald-800">Related reading</p>
          <h2 className="ax-marketing-subtitle mt-4 text-black">
            Continue with the next workflow.
          </h2>

          <div className="mt-7">
            {solution.related.map((slug) => {
              const relatedSolution = getAudienceSolutionBySlug(slug);

              return (
                <Link
                  key={slug}
                  href={audienceSolutionHref(slug)}
                  className="group flex items-center justify-between gap-5 border-t border-black/25 py-5 text-black transition-colors hover:text-emerald-800 last:border-b"
                >
                  <span className="text-xl font-bold leading-tight tracking-[-0.025em]">
                    {relatedSolution.menuLabel}
                  </span>
                  <ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="ax-marketing-band-mint border-t border-black/20 bg-[var(--brand-green)]">
        <div className="ax-marketing-container-reading flex flex-col gap-7 py-14 sm:py-16 lg:flex-row lg:items-center lg:justify-between lg:py-20">
          <div>
            <p className="ax-marketing-eyebrow text-black">Start with the next client batch</p>
            <h2 className="ax-marketing-subtitle mt-4 max-w-2xl text-black">
              Put the folder through a reviewable accounting workflow.
            </h2>
          </div>
          <Button variant="ink" size="lg" asChild className="w-fit shrink-0 font-bold">
            <Link href="/sign-up?next=%2Fdashboard%2Fclient">
              Start free
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
