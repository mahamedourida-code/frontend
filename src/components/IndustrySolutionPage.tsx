import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandVisualFrame } from "@/components/BrandVisual";
import { MarketingNavBar } from "@/components/MarketingNavBar";
import { IndustrySolution, POLIVALENT_SOLUTION_IMAGE } from "@/lib/industry-solutions";

function ArrowMark({ className = "" }: { className?: string }) {
  return (
    <span className={`relative inline-block h-4 w-7 ${className}`} aria-hidden="true">
      <span className="absolute left-0 top-1/2 h-[2px] w-7 -translate-y-1/2 rounded-full bg-current" />
      <span className="absolute right-0 top-[3px] h-3 w-3 rotate-45 border-r-2 border-t-2 border-current" />
    </span>
  );
}

function NumberedBlock({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="ax-surface rounded-md p-4">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
        {number}
      </div>
      <h3 className="text-xl font-bold leading-tight tracking-[-0.025em] text-black">{title}</h3>
      <p className="ax-marketing-card-copy mt-3">{text}</p>
    </div>
  );
}

export function IndustrySolutionPage({ solution }: { solution: IndustrySolution }) {
  return (
    <main className="ax-marketing-page min-h-screen overflow-hidden bg-white text-black">
      <MarketingNavBar />

      <section className="ax-marketing-container-editorial relative grid gap-8 pb-12 pt-32 lg:grid-cols-[0.96fr_1.04fr] lg:pb-16 lg:pt-36">
        <div className="flex flex-col justify-center">
          <div className="w-fit rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-primary shadow-sm">
            {solution.eyebrow}
          </div>
          <h1 className="ax-marketing-section-title mt-5 max-w-2xl text-black">
            {solution.headline}
          </h1>
          <p className="ax-marketing-body mt-5 max-w-2xl text-black">
            {solution.summary}
          </p>
          <p className="ax-marketing-body mt-4 max-w-2xl text-black">
            {solution.proof}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="glossy" className="h-12 px-6">
              <Link href="/dashboard/client">
                Try it with your files
                <ArrowMark className="ml-2" />
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="h-12 px-6"
            >
              <Link href="/pricing">See plans</Link>
            </Button>
          </div>
        </div>

        <BrandVisualFrame treatment="photo" className="min-h-[300px] sm:min-h-[360px] lg:min-h-[440px]">
          <Image
            src={solution.detailImage}
            alt={`${solution.title} document workflow`}
            fill
            priority
            sizes="(min-width: 1024px) 54vw, 100vw"
            className="rounded-md object-cover"
          />
        </BrandVisualFrame>
      </section>

      <section className="ax-marketing-container-editorial py-10">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {solution.useCases.map((item) => (
            <div
              key={item}
              className="ax-surface rounded-md px-4 py-5"
            >
              <div className="mb-4 h-[3px] w-10 rounded-full bg-primary" />
              <p className="ax-marketing-card-copy">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="ax-marketing-container-editorial py-10">
        <div className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <div className="ax-surface rounded-md p-6">
            <p className="ax-marketing-eyebrow text-emerald-700">
              Where it fits
            </p>
            <h2 className="ax-marketing-section-title mt-4 text-black">
              Built for the gap between handwritten files and corrected spreadsheet output.
            </h2>
          </div>

          <div className="grid gap-4">
            <div className="ax-surface rounded-md p-6">
              <p className="ax-marketing-body text-black">
                Most {solution.title.toLowerCase()} teams already know what has to happen after conversion: review the rows, correct edge cases, and send the spreadsheet into reporting or operations. AxLiner is shaped around that step instead of leaving a pile of handwritten paperwork to rebuild by hand.
              </p>
            </div>
            <div className="ax-surface rounded-md p-6">
              <p className="ax-marketing-body text-black">
                The product keeps batches simple: upload the invoices, bank statements, forms, or table files, inspect the result set, fix the exceptions, then download corrected outputs your team can open immediately. That fits daily intake and backlog cleanup without forcing a custom project for every format.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="ax-marketing-container-editorial grid gap-8 py-12 lg:grid-cols-[1.04fr_0.96fr] lg:py-16">
        <BrandVisualFrame treatment="photo" className="min-h-[300px] sm:min-h-[360px] lg:min-h-[420px]">
          <Image
            src={POLIVALENT_SOLUTION_IMAGE}
            alt="AxLiner workspace overview"
            fill
            sizes="(min-width: 1024px) 54vw, 100vw"
            className="rounded-md object-cover"
          />
        </BrandVisualFrame>

        <div className="flex flex-col justify-center">
          <div className="ax-surface rounded-md p-6 sm:p-7">
            <p className="ax-marketing-eyebrow text-emerald-700">
              How it works
            </p>
            <h2 className="ax-marketing-section-title mt-4 text-black">
              A short path from a file batch to reviewable Excel output.
            </h2>
            <div className="mt-7 grid gap-4">
              {solution.workflow.map((step, index) => (
                <NumberedBlock
                  key={step}
                  number={`0${index + 1}`}
                  title={step}
                  text={solution.outcomes[index] ?? "Keep the process clear, fast, and easy to review."}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="ax-marketing-container-editorial pb-20">
        <div className="ax-marketing-band-mint overflow-hidden rounded-md border-2 border-neutral-900 bg-[var(--brand-green)] p-6 text-black shadow-sm sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="ax-marketing-eyebrow text-black">
                Ready for batch work
              </p>
              <h2 className="ax-marketing-section-title mt-4 max-w-3xl text-black">
                Convert {solution.title.toLowerCase()} documents without building a custom data-entry team.
              </h2>
            </div>
            <Button asChild variant="ink" className="h-12 px-6">
              <Link href="/dashboard/client">
                Start converting
                <ArrowMark className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
