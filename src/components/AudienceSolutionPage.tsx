import Link from "next/link";
import {
  ArrowRight,
  Check,
  CircleCheck,
  FileSpreadsheet,
  FolderOpen,
  ScanSearch,
} from "lucide-react";

import { MarketingNavBar } from "@/components/MarketingNavBar";
import { Button } from "@/components/ui/button";
import {
  AudienceSolution,
  audienceSolutionHref,
  getAudienceSolutionBySlug,
} from "@/lib/audience-solutions";

function ReviewBoardPreview({ solution }: { solution: AudienceSolution }) {
  const Icon = solution.icon;

  return (
    <div className="mx-auto w-full max-w-[610px]">
      <div className="overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-[0_24px_70px_-34px_rgba(15,23,42,0.32)]">
        <div className="flex items-center justify-between border-b border-black/8 bg-[#fffdf8] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl border border-emerald-600/15 bg-[#d1fae5] text-[#064e3b]">
              <Icon className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-900/60">
                Batch review
              </p>
              <p className="mt-1 text-sm font-bold text-[#171717]">May close / Client 04</p>
            </div>
          </div>
          <span className="rounded-full border border-emerald-600/20 bg-[#d1fae5] px-3 py-1 text-[11px] font-bold text-[#064e3b]">
            In review
          </span>
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-[0.92fr_1.08fr] sm:p-5">
          <div className="rounded-[22px] border border-black/8 bg-[#fbfaf6] p-3">
            <div className="flex items-center gap-2 px-1 pb-3">
              <FolderOpen className="size-4 text-emerald-800" />
              <p className="text-xs font-bold text-[#171717]">Mixed client batch</p>
            </div>

            <div className="space-y-2">
              {[
                ["Vendor invoices", "18 documents", "Reviewed"],
                ["Expense receipts", "12 documents", "Review"],
                ["Bank statement", "3 pages", "Ready"],
              ].map(([title, meta, status], index) => (
                <div
                  key={title}
                  className="rounded-2xl border border-black/8 bg-white px-3 py-3 shadow-[0_3px_12px_-10px_rgba(15,23,42,0.5)]"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-xl bg-[#f4f1e9] text-[#31312f]">
                      {index === 1 ? <ScanSearch className="size-3.5" /> : <FileSpreadsheet className="size-3.5" />}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-bold text-[#171717]">{title}</p>
                      <p className="mt-1 text-[11px] text-black/50">{meta}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-black/35">
                      {status}
                    </span>
                    <span
                      className={`size-2 rounded-full ${
                        index === 1 ? "bg-amber-400" : "bg-emerald-500"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[22px] border border-emerald-800/10 bg-[#effcf4] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-900/55">
                  Exception review
                </p>
                <p className="mt-1.5 text-sm font-bold text-[#173c31]">Receipt 08 / Total</p>
              </div>
              <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-amber-700 shadow-sm">
                Check field
              </span>
            </div>

            <div className="mt-4 rounded-[18px] border border-emerald-900/10 bg-white p-3.5 shadow-sm">
              <div className="h-2 w-2/3 rounded-full bg-black/10" />
              <div className="mt-2 h-2 w-5/6 rounded-full bg-black/8" />
              <div className="mt-5 rounded-xl border border-dashed border-emerald-700/25 bg-[#f8fff9] px-3 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-900/50">
                  Extracted total
                </p>
                <p className="mt-1 text-lg font-bold tracking-[-0.03em] text-[#173c31]">$1,248.60</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-[#d1fae5] px-3 py-3 text-[#064e3b]">
              <CircleCheck className="size-4 shrink-0" />
              <p className="text-[11px] font-bold leading-4">Source and corrected row stay together.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AudienceSolutionPage({ solution }: { solution: AudienceSolution }) {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfaf6] text-[#171717]">
      <MarketingNavBar />

      <section className="mx-auto grid max-w-[1500px] gap-12 px-4 pb-16 pt-32 sm:px-5 lg:grid-cols-[0.94fr_1.06fr] lg:items-center lg:px-9 lg:pb-24 lg:pt-40">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-600/20 bg-[#d1fae5] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#064e3b]">
            <solution.icon className="size-4" />
            {solution.eyebrow}
          </div>

          <h1 className="mt-7 max-w-3xl text-[2.75rem] font-bold leading-[0.98] tracking-[-0.065em] text-[#171717] sm:text-[4rem] lg:text-[5rem]">
            {solution.headline}
          </h1>
          <p className="mt-7 max-w-2xl text-base font-medium leading-7 text-black/66 sm:text-lg sm:leading-8">
            {solution.summary}
          </p>
          <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-black/70 sm:text-base sm:leading-7">
            {solution.proof}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button variant="glossy" size="lg" asChild className="font-bold">
              <Link href="/sign-up?next=%2Fdashboard%2Fclient">
                Start free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="surface" size="lg" asChild className="font-bold">
              <Link href="/pricing">See plans</Link>
            </Button>
          </div>
        </div>

        <ReviewBoardPreview solution={solution} />
      </section>

      <section className="border-y border-emerald-900/8 bg-[#d1fae5]">
        <div className="mx-auto grid max-w-[1500px] gap-px px-4 sm:grid-cols-3 sm:px-5 lg:px-9">
          {solution.signals.map((signal) => (
            <div key={signal.value} className="border-emerald-900/10 py-6 sm:border-l sm:px-6 sm:last:border-r">
              <p className="text-xl font-bold tracking-[-0.04em] text-[#064e3b]">{signal.value}</p>
              <p className="mt-1 text-sm font-semibold text-[#064e3b]/70">{signal.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 py-20 sm:px-5 lg:px-9 lg:py-28">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-800">Built for review</p>
            <h2 className="mt-4 text-3xl font-bold leading-[1.04] tracking-[-0.055em] text-[#171717] sm:text-5xl">
              Batch work stays useful when the reviewer can still see the accounting story.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {solution.benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-[24px] border border-black/8 bg-white p-5 shadow-[0_18px_45px_-36px_rgba(15,23,42,0.5)]"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-[#d1fae5] text-[#064e3b]">
                  <Check className="size-4" />
                </span>
                <h3 className="mt-7 text-lg font-bold tracking-[-0.03em] text-[#171717]">{benefit.title}</h3>
                <p className="mt-3 text-sm font-medium leading-6 text-black/58">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 pb-20 sm:px-5 lg:px-9 lg:pb-28">
        <div className="overflow-hidden rounded-[32px] border border-emerald-900/10 bg-[#d1fae5] px-5 py-7 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#064e3b]/65">A controlled handoff</p>
              <h2 className="mt-4 max-w-xl text-3xl font-bold leading-[1.03] tracking-[-0.055em] text-[#064e3b] sm:text-5xl">
                Clear steps from folder intake to reviewed output.
              </h2>
            </div>

            <div className="grid gap-3">
              {solution.workflow.map((step, index) => (
                <div
                  key={step.title}
                  className="grid gap-3 rounded-[22px] border border-emerald-900/10 bg-white/75 p-4 sm:grid-cols-[auto_1fr] sm:items-start sm:p-5"
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-[#064e3b] text-xs font-bold text-white">
                    0{index + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-bold tracking-[-0.02em] text-[#173c31]">{step.title}</h3>
                    <p className="mt-1 text-sm font-medium leading-6 text-[#064e3b]/65">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 pb-20 sm:px-5 lg:px-9 lg:pb-28">
        <div className="grid gap-8 border-t border-black/10 pt-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-800">Keep exploring</p>
            <h2 className="mt-4 text-2xl font-bold tracking-[-0.045em] text-[#171717] sm:text-3xl">
              Related accounting workflows
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {solution.related.map((slug) => {
              const relatedSolution = getAudienceSolutionBySlug(slug);
              const Icon = relatedSolution.icon;

              return (
                <Link
                  key={slug}
                  href={audienceSolutionHref(slug)}
                  className="group rounded-[22px] border border-black/8 bg-white p-4 outline-none transition-[border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-emerald-600/30 hover:shadow-[0_18px_36px_-30px_rgba(6,78,59,0.5)] focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <span className="flex size-9 items-center justify-center rounded-2xl bg-[#f4f1e9] text-[#31312f] transition-colors group-hover:bg-[#d1fae5] group-hover:text-[#064e3b]">
                    <Icon className="size-4" />
                  </span>
                  <span className="mt-5 flex items-center justify-between gap-3 text-sm font-bold text-[#171717]">
                    {relatedSolution.menuLabel}
                    <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-black/8 bg-white">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-7 px-4 py-16 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-9 lg:py-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-800">Ready for the next batch</p>
            <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-[1.04] tracking-[-0.055em] text-[#171717] sm:text-5xl">
              Bring the folder. Keep the review step.
            </h2>
          </div>
          <Button variant="ink" size="lg" asChild className="w-fit font-bold">
            <Link href="/sign-up?next=%2Fdashboard%2Fclient">
              Create an account
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
