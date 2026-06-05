"use client"

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ScrollAnimatedSection from "@/components/ScrollAnimatedSection";
import { AppLogo } from "@/components/AppIcon";
import { BrandVisualFrame } from "@/components/BrandVisual";
import { VideoPlaceholder } from "@/components/landing/VideoPlaceholder";
import { FeatureHoverCards } from "@/components/landing/FeatureHoverCards";
import { VerifiableShowcase } from "@/components/landing/VerifiableShowcase";
import { OutcomeStats } from "@/components/landing/OutcomeStats";
import { TypewriterWord } from "@/components/landing/TypewriterWord";
import { ScrollGrowSection } from "@/components/landing/ScrollGrowSection";

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

// Who AxLiner is for — the client types a bookkeeper / accounting team keeps
// the books for. Every card stays on the core promise: messy documents →
// reviewed entries → published to QuickBooks. Not a generic OCR "industries"
// grid.
const solutionCards = [
  {
    title: "Accounting firms",
    href: "/solutions/accounting",
    asset: "/solution/accounting.svg",
    description:
      "Clear the monthly close faster. Drop a client's whole folder of invoices, receipts, and bank statements, let AxLiner classify and extract each one, then review the flagged fields and publish straight to QuickBooks.",
  },
  {
    title: "Construction",
    href: "/solutions/construction",
    asset: "/solution/Construction.svg",
    description:
      "Keep job costs current without retyping. Turn supplier invoices, delivery dockets, and material receipts into reviewed entries — coded by vendor and ready to post to the books, with uncertain fields flagged for you.",
  },
  {
    title: "Property & real estate",
    href: "/solutions/real-estate",
    asset: "/solution/Real%20Estate.svg",
    description:
      "Stay on top of the books across every unit. Process vendor invoices, utility bills, and bank statements into reviewed entries, then publish to QuickBooks — no copy-pasting from PDFs and photos.",
  },
  {
    title: "Retail & e-commerce",
    href: "/solutions/cpg-brands",
    asset: "/solution/CPG%20Brands.svg",
    description:
      "Reconcile the stack of supplier invoices and receipts behind every sale. AxLiner reads them in one batch, catches duplicates before they hit your books, and hands you reviewed entries to approve.",
  },
  {
    title: "Restaurants & hospitality",
    href: "/solutions/backoffice-automation",
    asset: "/solution/Backoffice%20Automation.svg",
    description:
      "Tame the daily pile of supplier invoices and till receipts. Batch them in, review the flagged lines, and post coded bills to QuickBooks — so the books stay current without late nights of data entry.",
  },
  {
    title: "Professional services",
    href: "/solutions/fintech",
    asset: "/solution/FinTech.svg",
    description:
      "Keep client and overhead spend in order. Convert invoices, expense receipts, and statements into reviewed entries, pre-coded by vendor memory and ready to publish — you just approve.",
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
    <div className="ax-marketing-page relative min-h-screen bg-white text-neutral-950">
      <MarketingNavBar onSectionClick={scrollToSection} />

      {/* Hero Section */}
      <main className="relative z-10">
        <div ref={topBackgroundSectionRef} className="relative isolate overflow-hidden bg-white">
          <div
            ref={topBackgroundRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 bg-cover bg-top bg-no-repeat will-change-transform"
            style={{
              backgroundColor: "#ffffff",
            }}
          />
          <div className="relative z-10">
        <section ref={heroRef} className="relative overflow-hidden pt-16 pb-10 sm:pt-20 sm:pb-12 lg:pt-20 lg:pb-14">
          <div className="ax-marketing-container relative z-10">
            {/* Centered hero copy */}
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="ax-h1 ax-marketing-display font-bold text-black">
                The review layer between{" "}
                <br className="hidden sm:block" />
                messy invoices and your books.
              </h1>
              <p className="ax-body ax-marketing-lead mx-auto mt-6 font-semibold text-neutral-950">
                AxLiner reads the documents other tools refuse: handwriting, phone photos, and wrinkled receipts. It checks them and gets every entry one keystroke from QuickBooks Online. You stay in control.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button variant="glossy" asChild className="h-[52px] rounded-full px-10 text-base font-bold">
                  <NextLink href="/dashboard/client">Start free</NextLink>
                </Button>
              </div>

            </div>

            {/* Tella / Screen-Studio-style video placeholder — drop the recording in here */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
              className="relative mx-auto mt-14 max-w-[1040px] lg:mt-16"
            >
              <div className="rounded-[1.5rem] border border-black/10 bg-white p-2 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.35)] sm:rounded-[2.25rem] sm:p-3">
                <div className="relative aspect-video w-full overflow-hidden rounded-[1.1rem] bg-neutral-950 ring-1 ring-black/5 sm:rounded-[1.6rem]">
                  {/* window chrome */}
                  <div className="absolute inset-x-0 top-0 z-10 flex h-9 items-center gap-1.5 bg-neutral-900/90 px-4">
                    <span className="size-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="size-2.5 rounded-full bg-[#febc2e]" />
                    <span className="size-2.5 rounded-full bg-[#28c840]" />
                  </div>
                  {/* subtle dot grid */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                      backgroundImage: "radial-gradient(circle, #ffffff 1.4px, transparent 1.4px)",
                      backgroundSize: "26px 26px",
                    }}
                  />
                  {/* play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex size-20 items-center justify-center rounded-full bg-[var(--brand-green)] text-[#064e3b] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),0_8px_22px_-10px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:scale-105">
                      <svg viewBox="0 0 16 16" fill="currentColor" className="ml-1 size-7" aria-hidden="true">
                        <path d="M3 2.25 14.5 8 3 13.75V2.25Z" />
                      </svg>
                    </div>
                  </div>
                  <p className="absolute inset-x-0 bottom-4 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                    Product walkthrough — coming soon
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

          </div>
        </div>

        <div className="relative z-20 isolate bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
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

        <ScrollGrowSection />

        <div className="relative isolate overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 bg-cover bg-top bg-no-repeat"
            style={{ backgroundColor: "#ffffff" }}
          />
          <div className="relative z-10">
        {/* ── Alternating feature band ── */}
        <div id="how-it-works" className="ax-marketing-band-mint bg-[var(--brand-green)] text-neutral-950">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">

            {/* A — text left · video right */}
            <div className="grid items-center gap-10 py-20 lg:grid-cols-2 lg:gap-20 lg:py-28">
              <div data-animate="headline">
                <h3 className="ax-h2 ax-marketing-section-title max-w-lg font-bold text-neutral-950">
                  Throw us the whole folder.
                </h3>
                <p className="ax-body ax-marketing-body mt-5 font-semibold text-neutral-950">
                  Invoices, receipts, bank statements: drop them all at once. AxLiner classifies each file automatically and extracts on the right schema. No sorting, no separate uploads.
                </p>
                <NextLink href="/dashboard/client" className="mt-8 inline-flex h-11 items-center rounded-full border-2 border-neutral-950 bg-transparent px-8 text-sm font-bold text-neutral-950 transition-colors hover:bg-neutral-950 hover:text-white">
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
                <h3 className="ax-h2 ax-marketing-section-title max-w-lg font-bold text-neutral-950">
                  See everything before it touches QuickBooks.
                </h3>
                <p className="ax-body ax-marketing-body mt-5 font-semibold text-neutral-950">
                  Every extracted document lands in your review board before export. Original image on the left, editable cells on the right. Click to correct, tab to move on.
                </p>
                <p className="ax-body ax-marketing-body mt-5 font-bold text-neutral-950">
                  AxLiner prepares it. You approve it.
                </p>
                <NextLink href="/dashboard/client" className="mt-8 inline-flex h-11 items-center rounded-full border-2 border-neutral-950 bg-transparent px-8 text-sm font-bold text-neutral-950 transition-colors hover:bg-neutral-950 hover:text-white">
                  Explore the review board →
                </NextLink>
              </div>
            </div>

            {/* C — text left · video right */}
            <div className="grid items-center gap-10 border-t border-emerald-300/60 py-20 lg:grid-cols-2 lg:gap-20 lg:py-28">
              <div data-animate="headline">
                <h3 className="ax-h2 ax-marketing-section-title max-w-lg font-bold text-neutral-950">
                  The messy stuff. WhatsApp photos. Handwritten receipts.
                </h3>
                <p className="ax-body ax-marketing-body mt-5 font-semibold text-neutral-950">
                  Other tools claim accuracy on clean PDFs. AxLiner was built for the document your client photographed in bad light and sent over WhatsApp. Per-field confidence flags tell you exactly which cells to check.
                </p>
                <NextLink href="/dashboard/client" className="mt-8 inline-flex h-11 items-center rounded-full border-2 border-neutral-950 bg-transparent px-8 text-sm font-bold text-neutral-950 transition-colors hover:bg-neutral-950 hover:text-white">
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
                <h3 className="ax-h2 ax-marketing-section-title max-w-lg font-bold text-neutral-950">
                  Reviewed, coded, posted. No copy-pasting.
                </h3>
                <p className="ax-body ax-marketing-body mt-5 font-semibold text-neutral-950">
                  Connect your QuickBooks Online company. Code invoices with vendor, account, and tax. Publish a draft Bill with the original document attached. If anything fails, retry without creating a duplicate.
                </p>
                <NextLink href="/dashboard/client" className="mt-8 inline-flex h-11 items-center rounded-full border-2 border-neutral-950 bg-neutral-950 px-8 text-sm font-bold text-white shadow-sm transition-colors hover:bg-transparent hover:text-neutral-950">
                  Start free
                </NextLink>
              </div>
            </div>

          </div>
        </div>

        {/* ── Organizations testimonials — moved beneath the QuickBooks band ── */}
        <TestimonialsMarquee />

        {/* Why Choose Us Section — white band, dark text + cycling typewriter */}
        <ScrollAnimatedSection id="features" className="relative z-20 bg-white pt-20 pb-24 text-neutral-950 lg:pt-24 lg:pb-28">
          <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
            <div className="mb-14" data-animate="headline">
              <h2 className="ax-h2 ax-marketing-section-title font-bold text-neutral-950">
                <span className="block">
                  Turn every{" "}
                  <TypewriterWord
                    words={["invoice", "receipt", "bank statement", "handwritten table", "expense report"]}
                    className="text-[#8a5a2b]"
                  />
                </span>
                <span className="block">into reviewed accounting work.</span>
              </h2>
            </div>

            <FeatureHoverCards cards={solutionCards} className="w-full" />
          </div>
        </ScrollAnimatedSection>
          </div>
        </div>
        </div>

        {/* ── Verifiable, not invisible — black-box AI vs AxLiner ── */}
        <VerifiableShowcase />

        {/* ── Outcome stat band (A5) — animated count-up social proof ── */}
        <OutcomeStats />

        {/* ── Integrations band — large raw logos of the tools we plug into ── */}
        <section className="relative z-10 overflow-hidden bg-white py-20 lg:py-28">
          <div className="mx-auto max-w-[1280px] px-4 text-center sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            >
              <h2 className="ax-h2 ax-marketing-section-title mx-auto max-w-3xl font-bold text-neutral-950">
                Works with the tools you already use.
              </h2>
              <p className="ax-body ax-marketing-body mx-auto mt-5 max-w-2xl font-semibold text-neutral-950">
                Pull documents in from email and Drive, publish reviewed entries straight to your accounting system. No new place to learn.
              </p>
            </motion.div>

            <motion.ul
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
              }}
              className="mt-16 flex flex-wrap items-center justify-center gap-x-16 gap-y-12 sm:gap-x-24 lg:gap-x-28"
            >
              {[
                { src: "/integrations/quickbooks-qb.png", alt: "QuickBooks", label: "QuickBooks", h: 76 },
                { src: "/integrations/xero.png", alt: "Xero", label: "Xero", h: 88 },
                { src: "/integrations/gmail.webp", alt: "Gmail", label: "Gmail", h: 72 },
                { src: "/drive.png", alt: "Google Drive", label: "Google Drive", h: 92 },
              ].map((logo) => (
                <motion.li
                  key={logo.label}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
                  }}
                  className="flex flex-col items-center gap-4"
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={200}
                    height={logo.h}
                    style={{ height: logo.h, width: "auto" }}
                    className="object-contain"
                  />
                  <span className="text-sm font-bold uppercase tracking-[0.16em] text-neutral-700">
                    {logo.label}
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </section>

        <div className="relative isolate overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 bg-cover bg-top bg-no-repeat"
            style={{ backgroundColor: "#ffffff" }}
          />
          <div className="relative z-10">
        <ScrollAnimatedSection id="security" className="relative z-10 overflow-hidden py-16 lg:py-20">
          <div
            ref={securityBandRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              backgroundColor: "#ffffff",
              boxShadow: "0 -24px 60px rgb(0 0 0 / 0.06)",
              clipPath:
                "polygon(0 4%, 12% 2.8%, 25% 4.6%, 40% 2.4%, 58% 4.3%, 75% 2.7%, 100% 4%, 100% 100%, 0 100%)",
            }}
          />
          <div className="container relative z-10 mx-auto max-w-[1540px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[minmax(360px,0.82fr)_minmax(520px,1.18fr)] lg:items-center">
              <div data-animate="headline">
                <h2 className="ax-h2 ax-marketing-section-title max-w-2xl font-bold text-neutral-950">
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
                <p className="ax-body ax-marketing-body mt-0 max-w-3xl text-neutral-950">
                  Documents are processed and deleted after export. No training on your data, no persistent storage beyond your retention window, no third-party sharing. Built around GDPR, SOC 2, and HIPAA-conscious workflows from day one.
                </p>

                <div className="mt-8 space-y-5">
                  {[
                    "ISO 27001-aligned security controls",
                    "Built for GDPR, SOC 2, CCPA and HIPAA-conscious workflows",
                    "Secure infrastructure across Supabase, Fly.io and Vercel",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-4 text-base text-neutral-950 sm:text-lg">
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
              <p className="ax-eyebrow text-black">FAQ</p>
              <h3 className="ax-h2 ax-marketing-section-title mt-3 font-bold text-neutral-950">
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
                  <summary className="flex min-h-[70px] cursor-pointer list-none items-center justify-between gap-6 py-4 text-lg font-semibold text-neutral-950 [&::-webkit-details-marker]:hidden">
                    <span>{item.question}</span>
                    <span className="relative h-6 w-6 shrink-0">
                      <span className="absolute left-1/2 top-1/2 h-[2px] w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-950" />
                      <span className="absolute left-1/2 top-1/2 h-5 w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-950 transition-opacity duration-200 group-open:opacity-0" />
                    </span>
                  </summary>
                  <div className="pb-7 pr-10">
                    <p className="ax-body ax-marketing-body text-neutral-900">{item.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </ScrollAnimatedSection>
          </div>
        </div>
      </main>

      {/* ── Footer — Descript dark-footer recipe, recolored to black ── */}
      <footer className="relative z-10 bg-black text-white">
        <div className="mx-auto max-w-[1200px] px-4 pt-16 pb-10 sm:px-6 lg:px-8 lg:pt-20">
          {/* Logo + social row */}
          <div className="flex flex-col gap-6 border-b border-white/12 pb-10 sm:flex-row sm:items-center sm:justify-between">
            <NextLink href="/" aria-label="AxLiner home" className="inline-flex items-center">
              <AppLogo className="h-8 w-auto invert" />
            </NextLink>
            <div className="flex items-center gap-3">
              {footerSocialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-green)] hover:text-black"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-10 py-12 sm:grid-cols-3 lg:grid-cols-5 lg:gap-8">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <p className="text-[15px] font-bold text-white">
                  {column.title}
                </p>
                <ul className="mt-5 space-y-3.5">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.label}`}>
                      <NextLink
                        href={link.href}
                        className="text-[14px] font-medium text-white/70 transition-opacity hover:text-white hover:opacity-100"
                      >
                        {link.label}
                      </NextLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom legal row */}
          <div className="flex flex-col gap-6 border-t border-white/12 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] font-medium text-white/70">
              © 2026 AxLiner Inc. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center gap-6">
              <NextLink href="/contact" className="text-[13px] font-medium text-white/70 transition-colors hover:text-white">
                Contact Us
              </NextLink>
              <NextLink href="/privacy-policy" className="text-[13px] font-medium text-white/70 transition-colors hover:text-white">
                Privacy Policy
              </NextLink>
              <NextLink href="/end-user-license-agreement" className="text-[13px] font-medium text-white/70 transition-colors hover:text-white">
                Terms &amp; Conditions
              </NextLink>
            </div>
          </div>
        </div>
      </footer>
      
      <GoogleOneTap enabled={!isAuthenticated} redirectPath="/dashboard/client" />
    </div>
  )}
