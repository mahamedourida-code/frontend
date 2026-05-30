"use client"

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ScrollAnimatedSection from "@/components/ScrollAnimatedSection";
import { AppLogo } from "@/components/AppIcon";
import { BrandVisualFrame } from "@/components/BrandVisual";
import { VideoPlaceholder } from "@/components/landing/VideoPlaceholder";
import { FeatureHoverCards } from "@/components/landing/FeatureHoverCards";

import NextLink from "next/link";
import { GoogleOneTap } from "@/components/GoogleOneTap";
import { MarketingNavBar } from "@/components/MarketingNavBar";
import { useAuth } from "@/hooks/useAuth";

const TestimonialsMarquee = dynamic(
  () => import("@/components/landing/TestimonialsMarquee"),
  { ssr: false }
);

let gsapLoadPromise: Promise<any> | null = null;

function loadGsap() {
  if (!gsapLoadPromise) {
    gsapLoadPromise = Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]).then(([gsapModule, scrollTriggerModule]) => {
      const gsap = gsapModule.gsap;
      const ScrollTrigger = scrollTriggerModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      return { gsap, ScrollTrigger };
    });
  }

  return gsapLoadPromise;
}

const solutionCards = [
  {
    title: "Accounting",
    href: "/solutions/accounting",
    asset: "/solution/accounting.svg",
    description:
      "Automate the most time-consuming parts of accounting workflows. Extract clean spreadsheet data from receipts, invoices, bank statements, and expense reports so teams can reduce manual entry and focus on review.",
  },
  {
    title: "Banking",
    href: "/solutions/banking",
    asset: "/solution/banking.svg",
    description:
      "Modernize document-heavy financial operations with structured extraction for checks, loan applications, statements, onboarding packets, and KYC documents while keeping every row ready for downstream review.",
  },
  {
    title: "Backoffice Automation",
    href: "/solutions/backoffice-automation",
    asset: "/solution/Backoffice%20Automation.svg",
    description:
      "Remove repetitive data entry from internal operations. Turn invoices, forms, receipts, and handwritten tables into usable Excel files that can feed finance, admin, and operations workflows.",
  },
  {
    title: "Construction",
    href: "/solutions/construction",
    asset: "/solution/Construction.svg",
    description:
      "Convert site notes, delivery forms, checklists, material logs, and handwritten field tables into clean spreadsheets so project teams can keep records current without retyping paperwork.",
  },
  {
    title: "CPG Brands",
    href: "/solutions/cpg-brands",
    asset: "/solution/CPG%20Brands.svg",
    description:
      "Process retail forms, inventory sheets, distributor paperwork, purchase records, and field reports into structured data that merchandising and operations teams can compare quickly.",
  },
  {
    title: "FinTech",
    href: "/solutions/fintech",
    asset: "/solution/FinTech.svg",
    description:
      "Build document intake flows for financial products without asking users or operators to key in every table manually. Extract page-level data into spreadsheets that are easy to validate.",
  },
  {
    title: "Healthcare",
    href: "/solutions/healthcare",
    asset: "/solution/Healthcare.svg",
    description:
      "Digitize handwritten logs, intake forms, lab sheets, inventory notes, and administrative records while preserving the table structure needed for review, reporting, and internal handoff.",
  },
  {
    title: "Real Estate",
    href: "/solutions/real-estate",
    asset: "/solution/Real%20Estate.svg",
    description:
      "Turn lease packets, inspection forms, closing checklists, rent rolls, and property records into organized spreadsheets for brokers, managers, and operations teams.",
  },
];

const faqItems = [
  {
    question: "Can I convert PDFs and images in the same batch?",
    answer:
      "Yes. PDFs are prepared page by page for processing, while images are handled directly. The final result keeps the batch together so you can download the generated outputs from one job.",
  },
  {
    question: "When are credits used?",
    answer:
      "Credits are reserved when a job starts and settled against successful outputs. Failed, skipped, or cancelled images should not be charged as completed work.",
  },
  {
    question: "How long are result files available?",
    answer:
      "Generated files are kept for a limited retention window so users can download or share results after processing. For long-term storage, keep the downloaded Excel or text file in your own workspace.",
  },
  {
    question: "Is anonymous conversion limited?",
    answer:
      "Yes. Anonymous use is intentionally limited. Creating an account gives the app a real owner for jobs, downloads, billing, history, and recovery after reloads.",
  },
  {
    question: "What happens if a large batch is interrupted?",
    answer:
      "Active jobs are tracked by the backend. If the browser reloads or the connection drops, the app can recover recent job state from durable metadata instead of relying only on the open tab.",
  },
];


type FooterIconProps = {
  className?: string;
};

function FooterLinkedInIcon({ className }: FooterIconProps) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.8 8.1H3.2V20h3.6V8.1Zm.2-3.7A2.1 2.1 0 1 1 2.8 4.4a2.1 2.1 0 0 1 4.2 0ZM20.8 13.2V20h-3.6v-6.3c0-1.6-.6-2.7-2-2.7-1.1 0-1.7.7-2 1.5-.1.3-.1.8-.1 1.2V20H9.5s.1-10.1 0-11.9h3.6v1.7c.5-.8 1.4-2 3.4-2 2.5 0 4.3 1.6 4.3 5.4Z" />
    </svg>
  );
}

function FooterYouTubeIcon({ className }: FooterIconProps) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.4 7.1a2.8 2.8 0 0 0-2-2C17.7 4.6 12 4.6 12 4.6s-5.7 0-7.4.5a2.8 2.8 0 0 0-2 2A29.4 29.4 0 0 0 2.1 12c0 1.7.2 3.4.5 4.9a2.8 2.8 0 0 0 2 2c1.7.5 7.4.5 7.4.5s5.7 0 7.4-.5a2.8 2.8 0 0 0 2-2c.3-1.5.5-3.2.5-4.9 0-1.7-.2-3.4-.5-4.9Zm-11.6 8V8.9l5.5 3.1-5.5 3.1Z" />
    </svg>
  );
}

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Convert files", href: "/dashboard/client" },
      { label: "Review board", href: "/dashboard/client" },
      { label: "AP queue", href: "/dashboard/accounts-payable" },
      { label: "Inbox", href: "/dashboard/inbox" },
      { label: "Integrations", href: "/dashboard/integrations" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Accounting", href: "/solutions/accounting" },
      { label: "Banking", href: "/solutions/banking" },
      { label: "Healthcare", href: "/solutions/healthcare" },
      { label: "Construction", href: "/solutions/construction" },
      { label: "Real Estate", href: "/solutions/real-estate" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blogs" },
      { label: "Pricing", href: "/pricing" },
      { label: "Security", href: "/security" },
      { label: "Handwritten to Excel", href: "/handwritten-to-excel" },
      { label: "Image to Excel", href: "/image-to-excel" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Try AxLiner", href: "/dashboard/client" },
      { label: "Sign in", href: "/sign-in" },
      { label: "Sign up free", href: "/sign-up" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "EULA", href: "/end-user-license-agreement" },
      { label: "Data Deletion", href: "/data-deletion" },
    ],
  },
];

const footerSocialLinks = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com",
    Icon: FooterLinkedInIcon,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com",
    Icon: FooterYouTubeIcon,
  },
];

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const topBackgroundSectionRef = useRef<HTMLDivElement>(null);
  const topBackgroundRef = useRef<HTMLDivElement>(null);
  const contrastSectionRef = useRef<HTMLDivElement>(null);
  const securityBandRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const isAuthenticated = Boolean(user);

  useEffect(() => {
    const topSection = topBackgroundSectionRef.current;
    const topBackground = topBackgroundRef.current;
    if (!topSection || !topBackground) return;

    let ctx: any;
    let cancelled = false;

    void loadGsap().then(({ gsap }) => {
      if (cancelled) return;

      ctx = gsap.context(() => {
        gsap.fromTo(
          topBackground,
          { y: 0 },
          {
            y: -180,
            ease: "none",
            scrollTrigger: {
              trigger: topSection,
              start: "top top",
              end: "bottom top",
              scrub: 1.2,
            },
          }
        );
      }, topSection);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  useEffect(() => {
    const contrastSection = contrastSectionRef.current;
    if (!contrastSection) return;

    let ctx: any;
    let cancelled = false;

    void loadGsap().then(({ gsap }) => {
      if (cancelled) return;

      ctx = gsap.context(() => {
        [securityBandRef.current].forEach((band) => {
          if (!band) return;

          gsap.fromTo(
            band,
            {
              clipPath:
                "polygon(0 4%, 12% 2.8%, 25% 4.6%, 40% 2.4%, 58% 4.3%, 75% 2.7%, 100% 4%, 100% 100%, 0 100%)",
            },
            {
              clipPath:
                "polygon(0 10%, 10% 6.2%, 24% 10.8%, 42% 4.8%, 58% 9.7%, 76% 5.6%, 100% 9%, 100% 100%, 0 100%)",
              ease: "none",
              scrollTrigger: {
                trigger: band.parentElement || band,
                start: "top 82%",
                end: "top 24%",
                scrub: 1.15,
              },
            }
          );
        });
      }, contrastSection);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  // Smooth scroll function
  const scrollToSection = (sectionId: string) => {
    if (sectionId === "converter") {
      window.location.assign("/dashboard/client");
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="min-h-screen relative bg-transparent">
      <MarketingNavBar onSectionClick={scrollToSection} />

      {/* Hero Section */}
      <main className="relative z-10">
        <div ref={topBackgroundSectionRef} className="relative isolate overflow-hidden bg-background">
          <div
            ref={topBackgroundRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 bg-cover bg-top bg-no-repeat will-change-transform"
            style={{
              backgroundColor: "var(--background)",
            }}
          />
          <div className="relative z-10">
        <section ref={heroRef} className="relative overflow-hidden pt-24 pb-16 sm:pt-28 sm:pb-[4.5rem] lg:pt-28 lg:pb-24">
          <div className="relative z-10 container mx-auto max-w-[1500px] px-4 sm:px-5 lg:px-9">
            <div className="grid min-h-[500px] items-center gap-14 lg:min-h-[535px] lg:grid-cols-[minmax(0,1.08fr)_minmax(460px,0.92fr)] lg:gap-16">
              <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:translate-x-8 lg:text-left xl:translate-x-10">
                <h1 className="ax-h1 font-bold text-black dark:text-white">
                  Invoices, receipts, bank statements —{" "}
                  <br className="hidden sm:block" />
                  reviewed by you, posted to QuickBooks correctly.
                </h1>
                <p className="ax-body mt-6 font-semibold text-foreground">
                  AxLiner extracts every document type you receive in one mixed batch, shows you the data to verify before anything touches your books, and handles the messy ones — handwritten notes, WhatsApp photos, scanned receipts.
                </p>

                <div className="mt-9 flex flex-col items-center gap-5 sm:flex-row lg:items-center">
                  <div className="flex flex-col items-center gap-3 lg:items-start">
                    <Button variant="glossy" asChild className="h-[52px] rounded-full px-10 text-base font-bold">
                      <NextLink href="/dashboard/client">Start free</NextLink>
                    </Button>
                    <button
                      type="button"
                      onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                      className="ax-interactive text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      See how it works ↓
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Image
                          key={i}
                          src={`/avatars/${i}.webp`}
                          alt={`User ${i + 1}`}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm"
                        />
                      ))}
                    </div>
                    <div className="h-9 w-px bg-border" />
                    <div className="text-left">
                      <p className="text-sm font-bold leading-none text-foreground">5,000+</p>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">bookkeepers & accountants</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center lg:translate-x-14 lg:items-end xl:translate-x-20">
                <BrandVisualFrame treatment="cutout" className="relative w-full max-w-[800px]">
                  <div className="absolute inset-x-8 bottom-5 h-20 rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />
                  <img
                    src="/header.svg"
                    alt="AxLiner document conversion illustration"
                    className="relative z-10 mx-auto h-auto w-full max-w-[760px] object-contain"
                  />
                </BrandVisualFrame>
              </div>
            </div>
          </div>
        </section>

        <TestimonialsMarquee />

          </div>
        </div>

        <div className="relative z-20 isolate bg-background px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div
          ref={contrastSectionRef}
          className="relative mx-auto max-w-[1280px] text-foreground"
        >
          <div className="relative z-10">
        {/* Companies Section - Trusted By */}
        <ScrollAnimatedSection id="trusted" className="w-full overflow-hidden py-5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">

            <div className="relative z-10 overflow-hidden" data-animate="stagger">
              <div
                className="flex gap-8 items-center"
                style={{
                  animation: 'scroll-left 60s linear infinite',
                  width: 'max-content',
                  willChange: 'transform'
                }}
              >
                {Array.from({ length: 10 }, (_, setIndex) =>
                  [1, 2, 3, 4, 5, 6, 7, 8, 9].map((imgNum) => (
                    <Card
                      key={`${setIndex}-${imgNum}`}
                      className="flex-shrink-0 border border-gray-200 bg-white transition-all duration-300 hover:border-primary/30 hover:shadow-md dark:border-gray-200 dark:bg-white w-[108px] h-[70px]"
                    >
                      <CardContent className="p-2 flex items-center justify-center w-full h-full">
                        <Image
                          src={`/${imgNum}.jpeg`}
                          alt={`Company ${imgNum}`}
                          width={100}
                          height={60}
                          className="w-[100px] h-[60px] object-contain opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<span class="text-xs font-medium text-muted-foreground">Company ${imgNum}</span>`;
                            }
                          }}
                        />
                      </CardContent>
                    </Card>
                  ))
                ).flat()}
              </div>
            </div>
          </div>
        </ScrollAnimatedSection>
          </div>
        </div>

        <div className="relative isolate overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 bg-cover bg-top bg-no-repeat"
            style={{ backgroundColor: "var(--background)" }}
          />
          <div className="relative z-10">
        {/* ── Alternating feature band ── */}
        <div id="how-it-works" className="bg-emerald-100">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">

            {/* A — text left · video right */}
            <div className="grid items-center gap-10 py-20 lg:grid-cols-2 lg:gap-20 lg:py-28">
              <div data-animate="headline">
                <h3 className="ax-h2 max-w-lg font-bold text-neutral-900">
                  Throw us the whole folder.
                </h3>
                <p className="ax-body mt-5 font-semibold text-neutral-900">
                  Invoices, receipts, bank statements — drop them all at once. AxLiner classifies each file automatically and extracts on the right schema. No sorting, no separate uploads.
                </p>
                <NextLink href="/dashboard/client" className="mt-8 inline-flex h-11 items-center rounded-full border-2 border-emerald-700 bg-transparent px-8 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-700 hover:text-white">
                  See how it works →
                </NextLink>
              </div>
              <div className="overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-emerald-300/40 sm:p-8" data-animate="stagger">
                <VideoPlaceholder caption="Auto-detect: 40 mixed files classified in one batch" />
              </div>
            </div>

            {/* B — video left · text right */}
            <div className="grid items-center gap-10 border-t border-emerald-300/60 py-20 lg:grid-cols-2 lg:gap-20 lg:py-28">
              <div className="order-last overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-emerald-300/40 sm:p-8 lg:order-first" data-animate="stagger">
                <VideoPlaceholder caption="Review board: source document side-by-side with extracted data" />
              </div>
              <div data-animate="headline">
                <h3 className="ax-h2 max-w-lg font-bold text-neutral-900">
                  See everything before it touches QuickBooks.
                </h3>
                <p className="ax-body mt-5 font-semibold text-neutral-900">
                  Every extracted document lands in your review board before export. Original image on the left, editable cells on the right. Click to correct, tab to move on.
                </p>
                <NextLink href="/dashboard/client" className="mt-8 inline-flex h-11 items-center rounded-full border-2 border-emerald-700 bg-transparent px-8 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-700 hover:text-white">
                  Explore the review board →
                </NextLink>
              </div>
            </div>

            {/* C — text left · video right */}
            <div className="grid items-center gap-10 border-t border-emerald-300/60 py-20 lg:grid-cols-2 lg:gap-20 lg:py-28">
              <div data-animate="headline">
                <h3 className="ax-h2 max-w-lg font-bold text-neutral-900">
                  The messy stuff. WhatsApp photos. Handwritten receipts.
                </h3>
                <p className="ax-body mt-5 font-semibold text-neutral-900">
                  Other tools claim accuracy on clean PDFs. AxLiner was built for the document your client photographed in bad light and sent over WhatsApp. Per-field confidence flags tell you exactly which cells to check.
                </p>
                <NextLink href="/dashboard/client" className="mt-8 inline-flex h-11 items-center rounded-full border-2 border-emerald-700 bg-transparent px-8 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-700 hover:text-white">
                  Try with a handwritten document →
                </NextLink>
              </div>
              <div className="overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-emerald-300/40 sm:p-8" data-animate="stagger">
                <VideoPlaceholder caption="Handwritten receipt → structured spreadsheet with confidence flags" />
              </div>
            </div>

            {/* D — video left · text right */}
            <div className="grid items-center gap-10 border-t border-emerald-300/60 py-20 pb-28 lg:grid-cols-2 lg:gap-20 lg:py-28 lg:pb-36">
              <div className="order-last overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-emerald-300/40 sm:p-8 lg:order-first" data-animate="stagger">
                <VideoPlaceholder caption="AP queue: code, review, and publish bills to QuickBooks in one screen" />
              </div>
              <div data-animate="headline">
                <h3 className="ax-h2 max-w-lg font-bold text-neutral-900">
                  Reviewed, coded, posted — without copy-pasting.
                </h3>
                <p className="ax-body mt-5 font-semibold text-neutral-900">
                  Connect your QuickBooks Online company. Code invoices with vendor, account, and tax. Publish a draft Bill with the original document attached. If anything fails, retry without creating a duplicate.
                </p>
                <NextLink href="/dashboard/client" className="mt-8 inline-flex h-11 items-center rounded-full bg-emerald-500 px-8 text-sm font-bold text-neutral-950 transition-colors hover:bg-emerald-400">
                  Start free →
                </NextLink>
              </div>
            </div>

          </div>
        </div>

        {/* Why Choose Us Section — black band, white text */}
        <ScrollAnimatedSection id="features" className="relative z-20 bg-emerald-100 pt-20 pb-24 lg:pt-24 lg:pb-28">
          <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
            <div className="mb-14" data-animate="headline">
              <h2 className="ax-h2 font-bold text-neutral-900">
                Works for anyone who touches documents.
              </h2>
              <p className="ax-body mt-4 max-w-2xl font-semibold text-neutral-900">
                From solo bookkeepers to construction managers — one workflow, every document type.
              </p>
            </div>

            <FeatureHoverCards cards={solutionCards} className="w-full" />
          </div>
        </ScrollAnimatedSection>
          </div>
        </div>
        </div>

        <div className="relative isolate overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 bg-cover bg-top bg-no-repeat"
            style={{ backgroundColor: "var(--background)" }}
          />
          <div className="relative z-10">
        <ScrollAnimatedSection id="security" className="relative z-10 overflow-hidden py-16 lg:py-20">
          <div
            ref={securityBandRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              backgroundColor: "var(--background)",
              boxShadow: "0 -24px 60px rgb(0 0 0 / 0.06)",
              clipPath:
                "polygon(0 4%, 12% 2.8%, 25% 4.6%, 40% 2.4%, 58% 4.3%, 75% 2.7%, 100% 4%, 100% 100%, 0 100%)",
            }}
          />
          <div className="container relative z-10 mx-auto max-w-[1540px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[minmax(360px,0.82fr)_minmax(520px,1.18fr)] lg:items-center">
              <div data-animate="headline">
                <p className="ax-eyebrow text-primary">Security</p>
                <h2 className="ax-h2 mt-3 max-w-2xl font-bold text-foreground">
                  Your data never leaves the review board uninvited.
                </h2>

                <BrandVisualFrame treatment="photo" className="mt-8 max-w-[500px]">
                    <Image
                      src="/secu.webp"
                      alt="Secure digital document processing"
                      width={760}
                      height={420}
                      sizes="(min-width: 1024px) 40vw, 100vw"
                      className="h-[210px] w-full rounded-md object-cover object-center sm:h-[240px] lg:h-[260px]"
                    />
                </BrandVisualFrame>
              </div>

              <div className="lg:pt-8" data-animate="stagger">
                <p className="ax-body mt-0 max-w-3xl text-foreground">
                  Documents are processed and deleted after export. No training on your data, no persistent storage beyond your retention window, no third-party sharing. Built around GDPR, SOC 2, and HIPAA-conscious workflows from day one.
                </p>

                <div className="mt-8 space-y-5">
                  {[
                    "ISO 27001-aligned security controls",
                    "Built for GDPR, SOC 2, CCPA and HIPAA-conscious workflows",
                    "Secure infrastructure across Supabase, Fly.io and Vercel",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-4 text-base text-foreground sm:text-lg">
                      <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-primary text-primary">
                        <span className="h-2.5 w-1.5 rotate-45 border-b-2 border-r-2 border-current" />
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <Button
                  variant="surface"
                  className="mt-9 h-11 px-7 text-sm font-semibold"
                  asChild
                >
                  <NextLink href="/security">More Information</NextLink>
                </Button>
              </div>
            </div>

            <div className="mx-auto mt-16 max-w-[928px] lg:mt-20" data-animate="headline">
              <p className="ax-eyebrow text-primary">FAQ</p>
              <h3 className="ax-h2 mt-3 font-bold text-foreground">
                Questions we hear from bookkeepers.
              </h3>
            </div>

            <div className="mx-auto mt-10 max-w-[928px] border-y border-border text-left" data-animate="stagger">
              {faqItems.map((item, index) => (
                <details
                  key={item.question}
                  className="group border-b border-border last:border-b-0"
                  open={index === 0}
                >
                  <summary className="flex min-h-[70px] cursor-pointer list-none items-center justify-between gap-6 py-4 text-lg font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                    <span>{item.question}</span>
                    <span className="relative h-6 w-6 shrink-0">
                      <span className="absolute left-1/2 top-1/2 h-[2px] w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground" />
                      <span className="absolute left-1/2 top-1/2 h-5 w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground transition-opacity duration-200 group-open:opacity-0" />
                    </span>
                  </summary>
                  <div className="pb-7 pr-10">
                    <p className="ax-body text-muted-foreground">{item.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </ScrollAnimatedSection>
          </div>
        </div>
      </main>

      {/* ── Deep CTA band — last pitch before footer ── */}
      <section className="relative z-10 overflow-hidden bg-neutral-950">
        {/* Soft emerald glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.18), transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(16,185,129,0.10), transparent 50%)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-[1280px] px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <p className="ax-eyebrow text-emerald-400">Start free today</p>
            <h2 className="ax-h2 mt-4 font-bold tracking-tight text-white">
              Take back control of your document workflow.
            </h2>
            <p className="ax-body mt-6 font-semibold text-white">
              Invoices, receipts, bank statements, handwritten notes — reviewed by you, posted correctly. No per-client minimums, no surprise pricing.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <NextLink
                href="/dashboard/client"
                className="inline-flex h-14 items-center rounded-full bg-emerald-500 px-10 text-base font-bold text-neutral-950 shadow-[0_8px_28px_-8px_rgba(16,185,129,0.5)] transition-all hover:bg-emerald-400 hover:shadow-[0_12px_32px_-8px_rgba(16,185,129,0.6)]"
              >
                Start free →
              </NextLink>
              <NextLink
                href="/pricing"
                className="inline-flex h-14 items-center rounded-xl border-2 border-white/25 px-10 text-base font-bold text-white transition-colors hover:bg-white/10"
              >
                See pricing
              </NextLink>
            </div>

            <p className="mt-8 text-sm font-semibold text-white/55">
              No credit card · 50 free conversions · Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* ── Clean Proposify-style footer ── */}
      <footer className="relative z-10 border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-[1480px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,2.4fr)] lg:gap-16">
            {/* Logo column */}
            <div>
              <NextLink href="/" aria-label="AxLiner home" className="inline-flex items-center">
                <AppLogo className="h-8 w-auto" />
              </NextLink>
              <p className="mt-6 max-w-xs text-[15px] font-semibold leading-relaxed text-neutral-900">
                Invoice & document review for bookkeepers and accounting practices.
              </p>
            </div>

            {/* Link columns */}
            <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-5 lg:gap-8">
              {footerColumns.map((column) => (
                <div key={column.title}>
                  <h4 className="text-[15px] font-bold text-emerald-700">
                    {column.title}
                  </h4>
                  <ul className="mt-5 space-y-3.5">
                    {column.links.map((link) => (
                      <li key={`${column.title}-${link.label}`}>
                        <NextLink
                          href={link.href}
                          className="text-[14px] font-semibold text-neutral-900 transition-colors hover:text-emerald-700"
                        >
                          {link.label}
                        </NextLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom row */}
          <div className="mt-16 flex flex-col gap-6 border-t border-neutral-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] font-semibold text-neutral-900">
              © 2026 AxLiner Inc. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center gap-6">
              <NextLink href="/contact" className="text-[13px] font-semibold text-neutral-900 transition-colors hover:text-emerald-700">
                Contact Us
              </NextLink>
              <NextLink href="/privacy-policy" className="text-[13px] font-semibold text-neutral-900 transition-colors hover:text-emerald-700">
                Privacy Policy
              </NextLink>
              <NextLink href="/end-user-license-agreement" className="text-[13px] font-semibold text-neutral-900 transition-colors hover:text-emerald-700">
                Terms & Conditions
              </NextLink>
            </div>

            <div className="flex items-center gap-3">
              {footerSocialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-800"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
      
      <GoogleOneTap enabled={!isAuthenticated} redirectPath="/dashboard/client" />
    </div>
  )}
