import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { MarketingFooter } from "@/components/MarketingFooter";
import { MarketingNavBar } from "@/components/MarketingNavBar";
import { Button } from "@/components/ui/button";

type ProductImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

type ContentBlock = {
  title: string;
  copy: string;
};

type ConversionMarketingPageProps = {
  title: ReactNode;
  intro: string;
  heroImage: ProductImage;
  sectionTitle: ReactNode;
  sectionIntro: string;
  blocks: [ContentBlock, ContentBlock, ContentBlock];
  steps: [ContentBlock, ContentBlock, ContentBlock];
  finalTitle: string;
};

const reviewImage: ProductImage = {
  src: "/landing/review-board-poster.png",
  alt: "AxLiner Batch Review Board with source documents and editable extracted fields",
  width: 1600,
  height: 829,
};

export function ConversionMarketingPage({
  title,
  intro,
  heroImage,
  sectionTitle,
  sectionIntro,
  blocks,
  steps,
  finalTitle,
}: ConversionMarketingPageProps) {
  return (
    <div className="ax-marketing-page min-h-screen bg-[#FDFBF7] text-[#191919]">
      <MarketingNavBar />

      <main>
        <section className="px-4 pb-20 pt-36 sm:px-6 sm:pb-24 lg:px-8 lg:pb-32 lg:pt-44">
          <div className="mx-auto max-w-[1180px] text-center">
            <h1 className="mx-auto max-w-[920px] text-balance text-[clamp(2.5rem,4.5vw,4rem)] font-medium leading-[1.02] tracking-[-0.045em] text-black">
              {title}
            </h1>
            <p className="mx-auto mt-7 max-w-[700px] text-balance text-lg font-medium leading-8 text-black sm:text-xl">
              {intro}
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="glossy" size="lg" asChild className="h-14 rounded-full px-9 text-base font-semibold">
                <Link href="/sign-up?next=%2Fdashboard%2Fclient">
                  Start free <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="surface" size="lg" asChild className="h-14 rounded-full px-9 text-base font-semibold">
                <Link href="#workflow">
                  See the workflow <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-14 rounded-[24px] bg-[#efefef] p-3 sm:p-5 lg:mt-20 lg:p-8">
              <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_18px_60px_-32px_rgba(0,0,0,0.32)]">
                <Image
                  src={heroImage.src}
                  alt={heroImage.alt}
                  width={heroImage.width}
                  height={heroImage.height}
                  priority
                  sizes="(min-width: 1200px) 1116px, 94vw"
                  className="h-auto w-full object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-[1120px]">
            <h2 className="max-w-[760px] text-balance text-[clamp(2rem,3.5vw,3.25rem)] font-medium leading-[1.06] tracking-[-0.04em] text-black">
              {sectionTitle}
            </h2>
            <p className="mt-6 max-w-[620px] text-lg font-medium leading-8 text-black">
              {sectionIntro}
            </p>

            <div className="mt-14 grid gap-4 lg:mt-16 lg:grid-cols-3 lg:grid-rows-2">
              <article className="flex flex-col overflow-hidden rounded-2xl bg-[#efefef] lg:col-span-2 lg:row-span-2">
                <div className="p-6 pb-0 sm:p-8 sm:pb-0">
                  <h3 className="max-w-xl text-3xl font-medium leading-tight tracking-[-0.035em] text-black sm:text-4xl">
                    Correct the exceptions, not the entire batch.
                  </h3>
                </div>
                <div className="mt-8 overflow-hidden rounded-tl-2xl border-l border-t border-black/10 bg-white">
                  <Image
                    src={reviewImage.src}
                    alt={reviewImage.alt}
                    width={reviewImage.width}
                    height={reviewImage.height}
                    sizes="(min-width: 1024px) 730px, 94vw"
                    className="h-auto w-full object-contain"
                  />
                </div>
              </article>

              {blocks.slice(0, 2).map((block, index) => (
                <article key={block.title} className="flex min-h-[260px] flex-col justify-between rounded-2xl bg-[#efefef] p-7 sm:p-8">
                  <span className="text-sm font-semibold text-black">0{index + 1}</span>
                  <div>
                    <h3 className="text-2xl font-medium tracking-[-0.035em] text-black">{block.title}</h3>
                    <p className="mt-3 text-base font-medium leading-7 text-black">{block.copy}</p>
                  </div>
                </article>
              ))}
            </div>

            <article className="mt-4 grid gap-8 rounded-2xl border border-black/10 bg-[#FDFBF7] p-7 sm:p-9 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:p-12">
              <div>
                <span className="text-sm font-semibold text-black">03</span>
                <h3 className="mt-8 text-3xl font-medium tracking-[-0.04em] text-black">{blocks[2].title}</h3>
                <p className="mt-4 max-w-[440px] text-lg font-medium leading-8 text-black">{blocks[2].copy}</p>
                <ul className="mt-7 space-y-3 text-base font-semibold text-black">
                  {["Excel and CSV exports", "Reviewed drafts to QuickBooks or Xero", "Source document stays attached"].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="flex size-6 items-center justify-center rounded-full bg-[var(--landing-blue)] text-white">
                        <Check className="size-3.5" strokeWidth={3} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_18px_60px_-36px_rgba(0,0,0,0.35)]">
                <Image
                  src="/product-board.png"
                  alt="AxLiner product view showing a batch of accounting documents ready for review"
                  width={1877}
                  height={668}
                  sizes="(min-width: 1024px) 560px, 94vw"
                  className="h-auto w-full object-contain"
                />
              </div>
            </article>
          </div>
        </section>

        <section id="workflow" className="bg-[#FDFBF7] px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-[1120px]">
            <div className="flex flex-col gap-5 border-b border-black pb-8 lg:flex-row lg:items-end lg:justify-between">
              <h2 className="max-w-[680px] text-[clamp(2rem,3.5vw,3.25rem)] font-medium leading-[1.06] tracking-[-0.04em] text-black">
                From source to books in three moves.
              </h2>
              <p className="max-w-[360px] text-base font-medium leading-7 text-black">
                One continuous workflow. No rekeying between extraction, review, and accounting.
              </p>
            </div>

            <div className="grid lg:grid-cols-3">
              {steps.map((step, index) => (
                <article key={step.title} className="border-b border-black py-9 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0">
                  <span className="text-sm font-semibold text-black">0{index + 1}</span>
                  <h3 className="mt-10 text-2xl font-medium tracking-[-0.035em] text-black">{step.title}</h3>
                  <p className="mt-3 text-base font-medium leading-7 text-black">{step.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-black/10 bg-white px-4 py-20 text-black sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto flex max-w-[980px] flex-col items-center text-center">
            <h2 className="text-balance text-[clamp(2.25rem,4vw,3.75rem)] font-medium leading-[1.04] tracking-[-0.045em] text-black">
              {finalTitle}
            </h2>
            <p className="mt-6 max-w-[620px] text-lg font-medium leading-8 text-black">
              Start with one client folder. <span className="text-[var(--landing-blue)]">Every source, flag, and reviewed result</span> stays together.
            </p>
            <Button variant="glossy" size="lg" asChild className="mt-9 h-14 rounded-full px-9 text-base font-semibold">
              <Link href="/sign-up?next=%2Fdashboard%2Fclient">
                Start free <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
