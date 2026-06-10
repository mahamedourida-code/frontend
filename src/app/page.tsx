"use client"

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { IntegrationsLogos } from "@/components/landing/IntegrationsLogos";
import ScrollAnimatedSection from "@/components/ScrollAnimatedSection";
import { AppLogo } from "@/components/AppIcon";
import { BrandVisualFrame } from "@/components/BrandVisual";
import { VideoPlaceholder } from "@/components/landing/VideoPlaceholder";
import { FeatureHoverCards } from "@/components/landing/FeatureHoverCards";
import { VerifiableShowcase } from "@/components/landing/VerifiableShowcase";
import { OutcomeStats } from "@/components/landing/OutcomeStats";
import { TypewriterWord } from "@/components/landing/TypewriterWord";
import { ScrollGrowSection } from "@/components/landing/ScrollGrowSection";
import { useRouter } from "next/navigation";

import NextLink from "next/link";
import { GoogleOneTap } from "@/components/GoogleOneTap";
import { MarketingNavBar } from "@/components/MarketingNavBar";
import { AnnouncementBar } from "@/components/AnnouncementBar";
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
      "Clear the monthly close faster. Drop a client's whole folder of invoices, receipts, and bank statements, let AxLiner classify and extract each one, then review the flagged fields and publish straight to QuickBooks or Xero.",
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
      "Stay on top of the books across every unit. Process vendor invoices, utility bills, and bank statements into reviewed entries, then publish to QuickBooks or Xero — no copy-pasting from PDFs and photos.",
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
      "Tame the daily pile of supplier invoices and till receipts. Batch them in, review the flagged lines, and post coded bills to QuickBooks or Xero — so the books stay current without late nights of data entry.",
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
  const router = useRouter();
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
      router.push("/dashboard/client");
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
      <AnnouncementBar />
      <MarketingNavBar onSectionClick={scrollToSection} />

      {/* Hero Section */}
      <main className="relative z-10 pt-[var(--axn-bar,0px)]">
        {/* ── 1 · HERO (white) ── */}
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
            <div className="mx-auto max-w-[1120px] text-center">
              <h1 className="ax-h1 ax-marketing-display text-balance !font-semibold !leading-[1.08] !tracking-normal text-black">
                All your client documents
                <br />
                reviewed in one place
              </h1>
              <p className="ax-body ax-marketing-lead mx-auto mt-6 max-w-[860px] font-semibold text-neutral-950">
                Upload invoices, receipts, bank statements, and handwritten files. AxLiner turns them into clean data you can review, export, or publish.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button variant="glossy" asChild className="h-[52px] rounded-md px-10 text-base font-bold">
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
                    <div className="flex size-20 items-center justify-center rounded-full bg-[var(--brand-green)] text-black shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),0_8px_22px_-10px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:scale-105">
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

        {/* ── 2 · "Throw us the whole folder" — full-bleed cyan band (now SECOND) ── */}
        <div className="relative isolate overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 bg-cover bg-top bg-no-repeat"
            style={{ backgroundColor: "#ffffff" }}
          />
          <div className="relative z-10">
        <div id="how-it-works" className="ax-marketing-band-mint text-neutral-950" style={{ backgroundColor: "#F6F1EA" }}>
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">

            {/* A — text left · video right */}
            <div className="grid items-center gap-10 py-20 lg:grid-cols-2 lg:gap-20 lg:py-28">
              <div data-animate="headline">
                <h3 className="ax-h2 ax-marketing-section-title max-w-lg font-bold text-neutral-950">
                  Throw us the whole <span className="text-[var(--brand-brown-dark)]">folder</span>.
                </h3>
                <p className="ax-body ax-marketing-body mt-5 font-semibold text-neutral-950">
                  Invoices, receipts, statements — drop them all at once. AxLiner sorts and extracts each one on the right schema.
                </p>
                <NextLink href="/dashboard/client" className="mt-8 inline-flex h-11 items-center rounded-md border-2 border-neutral-950 bg-transparent px-8 text-sm font-bold text-neutral-950 transition-colors hover:bg-neutral-950 hover:text-white">
                  See how it works →
                </NextLink>
              </div>
              <div className="overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/10 sm:p-8" data-animate="stagger">
                <VideoPlaceholder caption="Auto-detect: a folder of mixed files, sorted onto the right schema" />
              </div>
            </div>

            {/* B — video left · text right */}
            <div className="grid items-center gap-10 border-t border-black/15 py-20 lg:grid-cols-2 lg:gap-20 lg:py-28">
              <div className="order-last overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/10 sm:p-8 lg:order-first" data-animate="stagger">
                <VideoPlaceholder caption="Review board: source document side-by-side with extracted data" />
              </div>
              <div data-animate="headline">
                <h3 className="ax-h2 ax-marketing-section-title max-w-lg font-bold text-neutral-950">
                  See everything before it touches QuickBooks or Xero.
                </h3>
                <p className="ax-body ax-marketing-body mt-5 font-semibold text-neutral-950">
                  Every document lands in your review board first: source on the left, editable fields on the right. AxLiner prepares it, you approve it.
                </p>
                <NextLink href="/dashboard/client" className="mt-8 inline-flex h-11 items-center rounded-md border-2 border-neutral-950 bg-transparent px-8 text-sm font-bold text-neutral-950 transition-colors hover:bg-neutral-950 hover:text-white">
                  Explore the review board →
                </NextLink>
              </div>
            </div>

            {/* C — text left · video right */}
            <div className="grid items-center gap-10 border-t border-black/15 py-20 lg:grid-cols-2 lg:gap-20 lg:py-28">
              <div data-animate="headline">
                <h3 className="ax-h2 ax-marketing-section-title max-w-lg font-bold text-neutral-950">
                  The messy stuff. WhatsApp photos. Handwritten receipts.
                </h3>
                <p className="ax-body ax-marketing-body mt-5 font-semibold text-neutral-950">
                  Built for the receipt photographed in bad light, not just clean PDFs. Confidence flags show you exactly which fields to check.
                </p>
                <NextLink href="/dashboard/client" className="mt-8 inline-flex h-11 items-center rounded-md border-2 border-neutral-950 bg-transparent px-8 text-sm font-bold text-neutral-950 transition-colors hover:bg-neutral-950 hover:text-white">
                  Try with a handwritten document →
                </NextLink>
              </div>
              <div className="overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/10 sm:p-8" data-animate="stagger">
                <VideoPlaceholder caption="Handwritten receipt → structured spreadsheet with confidence flags" />
              </div>
            </div>

            {/* D — video left · text right */}
            <div className="grid items-center gap-10 border-t border-black/15 py-20 pb-28 lg:grid-cols-2 lg:gap-20 lg:py-28 lg:pb-36">
              <div className="order-last overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/10 sm:p-8 lg:order-first" data-animate="stagger">
                <VideoPlaceholder caption="AP queue: code, review, and publish bills to QuickBooks or Xero in one screen" />
              </div>
              <div data-animate="headline">
                <h3 className="ax-h2 ax-marketing-section-title max-w-lg font-bold text-neutral-950">
                  Reviewed, coded, posted. No copy-pasting.
                </h3>
                <p className="ax-body ax-marketing-body mt-5 font-semibold text-neutral-950">
                  Code each bill with vendor, account, and tax, then publish a draft to QuickBooks or Xero with the document attached.
                </p>
                <NextLink href="/dashboard/client" className="mt-8 inline-flex h-11 items-center rounded-md border-2 border-neutral-950 bg-transparent px-8 text-sm font-bold text-neutral-950 transition-colors hover:bg-neutral-950 hover:text-white">
                  Start free
                </NextLink>
              </div>
            </div>

          </div>
        </div>
          </div>
        </div>

        {/* ── Integrations — brown-tinted logo wall (white) ── */}
        <div ref={contrastSectionRef}>
          <IntegrationsLogos />
        </div>

        {/* ── Scroll-grow cinematic section (white), before the features band ── */}
        <ScrollGrowSection />

        {/* ── 4 · Why Choose Us — white band, brown cycling typewriter ── */}
        <div className="relative isolate overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 bg-cover bg-top bg-no-repeat"
            style={{ backgroundColor: "#ffffff" }}
          />
          <div className="relative z-10">
        <ScrollAnimatedSection id="features" className="relative z-20 bg-white pt-20 pb-24 text-neutral-950 lg:pt-24 lg:pb-28">
          <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
            <div className="mb-14" data-animate="headline">
              <h2 className="ax-h2 ax-marketing-section-title font-bold text-neutral-950">
                <span className="block">
                  Turn every{" "}
                  <TypewriterWord
                    words={["invoice", "receipt", "bank statement", "handwritten table", "expense report"]}
                    className="font-bold text-[var(--brand-brown)]"
                  />
                </span>
                <span className="block">
                  into reviewed{" "}
                  <span className="font-bold">accounting work</span>.
                </span>
              </h2>
            </div>

            <FeatureHoverCards cards={solutionCards} className="w-full" />
          </div>
        </ScrollAnimatedSection>
          </div>
        </div>

        {/* ── 6 · Verifiable, not invisible (white) ── */}
        <VerifiableShowcase />

        {/* ── 7 · Organizations testimonials (white) ── */}
        <TestimonialsMarquee />

        {/* ── 8 · Outcome stat band — animated count-up social proof (white) ── */}
        <OutcomeStats />

        {/* ── Security + FAQ — redesigned to match the system (white) ── */}
        <div className="relative isolate overflow-hidden bg-white">
          <div className="relative z-10">
        <ScrollAnimatedSection id="security" className="relative z-10 overflow-hidden bg-white py-20 lg:py-28">
          <div className="container relative z-10 mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            {/* Heading — matches the white-section type scale, brown accent */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="mx-auto max-w-3xl text-center"
              data-animate="headline"
            >
              <p className="ax-eyebrow text-[var(--brand-brown)]">Security</p>
              <h2 className="ax-h2 ax-marketing-section-title mt-3 font-bold text-neutral-950">
                Your data never leaves the review board{" "}
                <span className="font-bold text-[var(--brand-brown)]">uninvited</span>.
              </h2>
              <p className="ax-body ax-marketing-body mx-auto mt-5 max-w-2xl font-semibold text-neutral-950">
                Documents are processed and deleted after export. No training on your data, no persistent storage beyond your retention window, no third-party sharing — built around GDPR, SOC 2, and HIPAA-conscious workflows from day one.
              </p>
            </motion.div>

            {/* Body — image card + checklist, consistent rounded cards */}
            <div className="mt-16 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                data-animate="stagger"
              >
                <BrandVisualFrame treatment="photo" className="max-w-[560px]">
                  <Image
                    src="/secu.webp"
                    alt="Secure digital document processing"
                    width={760}
                    height={420}
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="h-[240px] w-full rounded-md object-cover object-center sm:h-[280px] lg:h-[320px]"
                  />
                </BrandVisualFrame>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
                data-animate="stagger"
              >
                <div className="space-y-5">
                  {[
                    "ISO 27001-aligned security controls",
                    "Built for GDPR, SOC 2, CCPA and HIPAA-conscious workflows",
                    "Secure infrastructure across Supabase, Fly.io and Vercel",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-4 text-base font-semibold text-neutral-950 sm:text-lg">
                      <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[var(--brand-green)] text-[var(--brand-green)]">
                        <span className="h-2.5 w-1.5 rotate-45 border-b-2 border-r-2 border-current" />
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <Button
                  variant="glossy"
                  className="mt-9 h-11 rounded-md px-7 text-sm font-bold"
                  asChild
                >
                  <NextLink href="/security">More information</NextLink>
                </Button>
              </motion.div>
            </div>

            {/* FAQ */}
            <div className="mx-auto mt-20 max-w-[928px] text-center" data-animate="headline">
              <p className="ax-eyebrow text-[var(--brand-brown)]">FAQ</p>
              <h3 className="ax-h2 ax-marketing-section-title mt-3 font-bold text-neutral-950">
                Questions we hear from{" "}
                <span className="font-bold">bookkeepers</span>.
              </h3>
            </div>

            <div className="mx-auto mt-10 max-w-[928px] text-left" data-animate="stagger">
              {faqItems.map((item, index) => (
                <details
                  key={item.question}
                  className="group border-b border-black/10 last:border-b-0"
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
                    <p className="ax-body ax-marketing-body font-semibold text-neutral-900">{item.answer}</p>
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
          <div className="flex flex-col gap-6 pb-10 sm:flex-row sm:items-center sm:justify-between">
            <NextLink href="/" aria-label="AxLiner home" className="inline-flex items-center">
              <AppLogo className="h-11 w-auto invert" />
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

          {/* Link columns — cyan titles, raw white bigger sub-links, no dividers */}
          <div className="grid grid-cols-2 gap-12 py-12 sm:grid-cols-3 lg:grid-cols-5 lg:gap-8">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <p className="text-lg font-bold text-[var(--brand-green)]">
                  {column.title}
                </p>
                <ul className="mt-6 space-y-4">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.label}`}>
                      <NextLink
                        href={link.href}
                        className="text-[17px] font-semibold text-white transition-opacity hover:opacity-70"
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
          <div className="flex flex-col gap-6 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[15px] font-semibold text-white">
              © 2026 AxLiner Inc. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center gap-6">
              <NextLink href="/contact" className="text-[15px] font-semibold text-white transition-opacity hover:opacity-70">
                Contact Us
              </NextLink>
              <NextLink href="/privacy-policy" className="text-[15px] font-semibold text-white transition-opacity hover:opacity-70">
                Privacy Policy
              </NextLink>
              <NextLink href="/end-user-license-agreement" className="text-[15px] font-semibold text-white transition-opacity hover:opacity-70">
                Terms &amp; Conditions
              </NextLink>
            </div>
          </div>
        </div>
      </footer>
      
      <GoogleOneTap enabled={!isAuthenticated} redirectPath="/dashboard/client" />
    </div>
  )}
