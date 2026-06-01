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
  const SolutionIcon = solution.icon;

  return (
    <main className="ax-marketing-page min-h-screen overflow-hidden bg-white text-black">
      <MarketingNavBar />

      <header className="border-b-2 border-black bg-white">
        <div className="ax-marketing-container pb-14 pt-32 sm:pb-16 lg:pb-20 lg:pt-40">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-black">
                <SolutionIcon className="size-4 text-emerald-700" />
                {solution.eyebrow}
              </p>
              <h1 className="ax-marketing-display mt-5 max-w-6xl text-black">
                {solution.headline}
              </h1>
              <p className="ax-marketing-lead mt-7 max-w-4xl text-justify text-black">
                {solution.summary}
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

            <aside className="border-t-2 border-black pt-5 lg:border-l lg:border-t-0 lg:pb-1 lg:pl-7 lg:pt-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black">Why it matters</p>
              <p className="ax-marketing-prose mt-3 text-justify text-black">
                {solution.proof}
              </p>
            </aside>
          </div>
        </div>
      </header>

      <section className="ax-marketing-band-mint border-b border-black/20 bg-[#d1fae5]">
        <div className="ax-marketing-container grid sm:grid-cols-3">
          {solution.signals.map((signal) => (
            <div
              key={signal.value}
              className="border-b border-black/20 py-6 last:border-b-0 sm:border-b-0 sm:border-l sm:px-6 sm:last:border-r"
            >
              <p className="text-xl font-bold tracking-[-0.035em] text-black">{signal.value}</p>
              <p className="ax-marketing-body mt-1 text-black">{signal.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="ax-marketing-container grid gap-10 py-16 sm:py-20 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-20 lg:py-28">
          <div className="max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-800">Built for review</p>
            <h2 className="ax-marketing-section-title mt-4 text-black">
              Accounting work stays useful when the reviewer can still see the story.
            </h2>
          </div>

          <div>
            {solution.benefits.map((benefit, index) => (
              <article
                key={benefit.title}
                className="grid gap-3 border-t border-black/25 py-6 sm:grid-cols-[56px_minmax(0,1fr)] sm:gap-5 sm:py-7 last:border-b"
              >
                <p className="text-[11px] font-bold tracking-[0.2em] text-emerald-800">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <div>
                  <h3 className="text-2xl font-bold leading-tight tracking-[-0.035em] text-black">
                    {benefit.title}
                  </h3>
                  <p className="ax-marketing-prose mt-3 text-justify text-[18px] font-semibold leading-8 text-black">
                    {benefit.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ax-marketing-band-warm border-y border-black/20 bg-[#f7f3e9]">
        <div className="ax-marketing-container grid gap-10 py-16 sm:py-20 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-20 lg:py-24">
          <div className="max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-black">A controlled handoff</p>
            <h2 className="ax-marketing-section-title mt-4 text-black">
              Clear steps from intake to reviewed output.
            </h2>
            <p className="ax-marketing-prose mt-5 text-justify text-[18px] font-semibold leading-8 text-black">
              Keep the batch visible from the moment the files arrive until corrected work is ready for export or
              publish.
            </p>
          </div>

          <ol>
            {solution.workflow.map((step, index) => (
              <li
                key={step.title}
                className="grid gap-3 border-t border-black/25 py-6 sm:grid-cols-[56px_minmax(0,1fr)] sm:gap-5 sm:py-7 last:border-b"
              >
                <p className="text-[11px] font-bold tracking-[0.2em] text-black">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <div>
                  <h3 className="text-2xl font-bold leading-tight tracking-[-0.035em] text-black">{step.title}</h3>
                  <p className="ax-marketing-prose mt-3 text-justify text-[18px] font-semibold leading-8 text-black">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white">
        <div className="ax-marketing-container py-16 sm:py-20 lg:py-24">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-800">Keep exploring</p>
          <h2 className="ax-marketing-section-title mt-4 text-black">
            Related accounting workflows
          </h2>

          <div className="mt-8">
            {solution.related.map((slug, index) => {
              const relatedSolution = getAudienceSolutionBySlug(slug);

              return (
                <Link
                  key={slug}
                  href={audienceSolutionHref(slug)}
                  className="group grid gap-3 border-t border-black/25 py-5 text-black transition-colors hover:text-emerald-800 sm:grid-cols-[56px_minmax(0,1fr)_auto] sm:items-center sm:gap-5 last:border-b"
                >
                  <span className="text-[11px] font-bold tracking-[0.2em]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xl font-bold leading-tight tracking-[-0.025em]">
                    {relatedSolution.menuLabel}
                  </span>
                  <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="ax-marketing-band-mint border-t-2 border-black bg-[#d1fae5]">
        <div className="ax-marketing-container flex flex-col gap-7 py-14 sm:py-16 lg:flex-row lg:items-center lg:justify-between lg:py-20">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-black">Ready for the next batch</p>
            <h2 className="ax-marketing-section-title mt-4 max-w-4xl text-black">
              Bring the folder. Keep the review step.
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
