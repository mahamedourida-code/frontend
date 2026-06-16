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
import { FeatureHoverCards } from "@/components/landing/FeatureHoverCards";
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
    asset: "/solution/accounting%20firms.jpg",
    description:
      "Clear the monthly close faster. Drop a client's whole folder of invoices, receipts, and bank statements, let AxLiner classify and extract each one, then review the flagged fields and publish straight to QuickBooks or Xero.",
  },
  {
    title: "Construction",
    href: "/solutions/construction",
    asset: "/solution/construction.jpg",
    description:
      "Keep job costs current without retyping. Turn supplier invoices, delivery dockets, and material receipts into reviewed entries — coded by vendor and ready to post to the books, with uncertain fields flagged for you.",
  },
  {
    title: "Property & real estate",
    href: "/solutions/real-estate",
    asset: "/solution/real%20estate.jpg",
    description:
      "Stay on top of the books across every unit. Process vendor invoices, utility bills, and bank statements into reviewed entries, then publish to QuickBooks or Xero — no copy-pasting from PDFs and photos.",
  },
  {
    title: "Retail & e-commerce",
    href: "/solutions/cpg-brands",
    asset: "/solution/ecommerce.jpg",
    description:
      "Reconcile the stack of supplier invoices and receipts behind every sale. AxLiner reads them in one batch, catches duplicates before they hit your books, and hands you reviewed entries to approve.",
  },
  {
    title: "Restaurants & hospitality",
    href: "/solutions/backoffice-automation",
    asset: "/solution/restaurants%20and%20hospitality.jpg",
    description:
      "Tame the daily pile of supplier invoices and till receipts. Batch them in, review the flagged lines, and post coded bills to QuickBooks or Xero — so the books stay current without late nights of data entry.",
  },
  {
    title: "Professional services",
    href: "/solutions/fintech",
    asset: "/solution/professional%20services.jpg",
    description:
      "Keep client and overhead spend in order. Convert invoices, expense receipts, and statements into reviewed entries, pre-coded by vendor memory and ready to publish — you just approve.",
  },
];

const faqItems = [
  {
    question: "Can I process a whole folder of mixed invoices, receipts, and bank statements in one batch?",
    answer:
      "Yes — batch processing is the heart of AxLiner. Drop everything in at once and it classifies each document, routes it to the right schema, and extracts the fields, so you review one organized batch instead of opening files one at a time.",
  },
  {
    question: "How does the review board work before anything is posted?",
    answer:
      "Every document lands in your review board first: the source on the left, the editable extracted fields on the right. Uncertain fields are flagged for you to confirm, and nothing reaches your books until you approve it.",
  },
  {
    question: "Can AxLiner publish straight to QuickBooks and Xero?",
    answer:
      "Yes. Once a batch is reviewed, you can publish coded entries as draft bills to QuickBooks Online or Xero. AxLiner prepares the draft — it never pays, reconciles, or approves anything on its own.",
  },
  {
    question: "Does it remember how I code each vendor?",
    answer:
      "It does. AxLiner learns the vendor, account, and tax treatment you apply, then pre-codes future documents from the same supplier — so most fields are already filled in before you open the review board.",
  },
  {
    question: "Will it catch duplicate invoices before they hit my books?",
    answer:
      "Yes. AxLiner flags likely duplicates across a batch — same vendor, amount, and invoice number — so you can clear them in review before they ever post and create a double payment.",
  },
  {
    question: "What about handwritten notes or photos taken in bad light?",
    answer:
      "AxLiner is built for the messy stuff, not just clean PDFs — phone photos, crumpled receipts, handwritten tables. Fields it isn't sure about are marked with confidence flags so you know exactly what to check.",
  },
  {
    question: "How are credits counted?",
    answer:
      "Credits are reserved when a job starts and settled against successful outputs. Failed, skipped, or cancelled documents are not charged as completed work.",
  },
  {
    question: "What happens to my documents after I export?",
    answer:
      "Documents are processed and deleted after export, within your retention window. AxLiner never trains on your data, keeps no persistent storage beyond that window, and never shares it with third parties.",
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
    href: "https://www.linkedin.com/company/axliner/?viewAsMember=true",
    Icon: FooterLinkedInIcon,
  },
];

const folderPanelBodyStyle = {
  fontSize: "clamp(1.12rem, 1.25vw, 1.35rem)",
  lineHeight: 1.6,
  letterSpacing: "0",
} as const;

const folderPanelTextClass = "max-w-[640px]";
const folderPanelTitleClass =
  "ax-h1 ax-marketing-display max-w-[660px] text-balance !font-semibold !leading-[1.08] !tracking-normal text-neutral-950";
const folderPanelBodyClass = "ax-body ax-marketing-body mt-5 max-w-[610px] font-semibold text-neutral-950";
const folderPanelCtaClass =
  "mt-8 inline-flex h-12 items-center rounded-full border-2 border-neutral-950 bg-transparent px-8 text-[15px] font-bold text-neutral-950 transition-colors hover:bg-neutral-950 hover:text-white";

function FolderDropVideo() {
  return (
    <div className="overflow-hidden rounded-[2.25rem] bg-[#F6F1EA] sm:rounded-[2.75rem]">
      <video
        className="block w-full origin-center scale-x-[1.025] scale-y-[1.055]"
        aria-label="AxLiner folder upload walkthrough"
        autoPlay
        loop
        muted
        poster="/landing/folder-drop-poster.png"
        playsInline
        preload="metadata"
      >
        <source src="/landing/folder-drop.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

function HeroVideo() {
  return (
    <div className="overflow-hidden rounded-[1.5rem] bg-[#F6F1EA] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.45)] ring-1 ring-black/5 sm:rounded-[2rem]">
      <video
        className="block aspect-video w-full origin-center scale-[1.03] object-cover"
        aria-label="AxLiner product walkthrough"
        autoPlay
        loop
        muted
        poster="/landing/hero-poster.png"
        playsInline
        preload="metadata"
      >
        <source src="/landing/hero.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

function ReviewBoardVideo() {
  return (
    <div className="overflow-hidden rounded-[2.25rem] bg-[#F6F1EA] sm:rounded-[2.75rem]">
      <video
        className="block w-full origin-center scale-x-[1.075] scale-y-[1.085]"
        aria-label="AxLiner review board walkthrough"
        autoPlay
        loop
        muted
        poster="/landing/review-board-poster.png"
        playsInline
        preload="metadata"
      >
        <source src="/landing/review-board.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

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
        <section ref={heroRef} className="relative flex min-h-[calc(100svh-var(--axn-bar,0px))] items-center overflow-hidden py-12 lg:py-16">
          <div className="ax-marketing-container relative z-10 w-full">
            <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
              {/* Left — title, subtitle, CTA */}
              <div className="text-center lg:text-left">
                <h1 className="ax-marketing-display text-balance !font-semibold !leading-[1.05] !tracking-normal text-black text-[2.75rem] sm:text-[3.5rem] lg:text-[4rem]">
                  Handwritten invoices to QuickBooks and Xero,
                  <br />
                  reviewed by you first
                </h1>
                <p className="ax-marketing-lead mx-auto mt-7 max-w-[600px] text-lg font-semibold text-neutral-950 sm:text-xl lg:mx-0">
                  Upload invoices, receipts, bank statements, and handwritten files. AxLiner turns them into clean data you can review, export, or publish.
                </p>

                <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                  <Button variant="glossy" asChild className="h-[58px] rounded-md border-[#A98467] bg-[#A98467] px-12 text-lg font-bold text-white hover:border-[#8a6a52] hover:bg-[#8a6a52] hover:text-white hover:no-underline">
                    <NextLink href="/dashboard/client">Start free</NextLink>
                  </Button>
                </div>
              </div>

              {/* Right — product walkthrough video */}
              <div className="relative mx-auto w-full max-w-[720px] lg:mx-0">
                <HeroVideo />
              </div>
            </div>
          </div>
        </section>

          </div>
        </div>

        {/* ── 1.5 · Outcome stat band — moved before "Throw us" ── */}
        <OutcomeStats />

        {/* ── 2 · "Throw us the whole folder" — full-bleed cyan band (now SECOND) ── */}
        <div className="relative isolate overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 bg-cover bg-top bg-no-repeat"
            style={{ backgroundColor: "#ffffff" }}
          />
          <div className="relative z-10">
        <div id="how-it-works" className="ax-marketing-band-mint text-neutral-950" style={{ backgroundColor: "#F6F1EA" }}>
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">

            {/* A — text left · video right */}
            <div className="grid min-h-[86svh] items-center gap-10 py-20 sm:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:py-28">
              <div className={folderPanelTextClass} data-animate="headline">
                <h3 className={folderPanelTitleClass}>
                  Throw us the whole <span className="text-[var(--brand-brown-dark)]">folder</span>.
                </h3>
                <p className={folderPanelBodyClass} style={folderPanelBodyStyle}>
                  Invoices, receipts, statements — drop them all at once. AxLiner sorts and extracts each one on the right schema.
                </p>
                <NextLink href="/dashboard/client" className={folderPanelCtaClass}>
                  See how it works →
                </NextLink>
              </div>
              <div data-animate="stagger">
                <FolderDropVideo />
              </div>
            </div>

            {/* B — video left · text right */}
            <div className="grid min-h-[86svh] items-center gap-10 border-t border-black/15 py-20 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:py-28">
              <div className="order-last lg:order-first" data-animate="stagger">
                <ReviewBoardVideo />
              </div>
              <div className={folderPanelTextClass} data-animate="headline">
                <h3 className={folderPanelTitleClass}>
                  Review every entry before it posts.
                </h3>
                <p className={folderPanelBodyClass} style={folderPanelBodyStyle}>
                  Each document opens in your review board — source on the left, extracted fields on the right. Nothing reaches QuickBooks or Xero until you approve it.
                </p>
                <NextLink href="/dashboard/client" className={folderPanelCtaClass}>
                  Explore the review board →
                </NextLink>
              </div>
            </div>

            {/* C — text left · video right */}
            <div className="grid min-h-[86svh] items-center gap-10 border-t border-black/15 py-20 sm:py-24 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20 lg:py-28">
              <div className={folderPanelTextClass} data-animate="headline">
                <h3 className={folderPanelTitleClass}>
                  Handwritten and photographed receipts, handled.
                </h3>
                <p className={folderPanelBodyClass} style={folderPanelBodyStyle}>
                  Built for shoebox receipts and phone photos, not just clean PDFs. Confidence flags show which fields to verify before you post.
                </p>
                <NextLink href="/dashboard/client" className={folderPanelCtaClass}>
                  Try with a handwritten document →
                </NextLink>
              </div>
              <div data-animate="stagger">
                <FolderDropVideo />
              </div>
            </div>

            {/* D — video left · text right */}
            <div className="grid min-h-[86svh] items-center gap-10 border-t border-black/15 py-20 pb-24 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:py-28 lg:pb-32">
              <div className="order-last lg:order-first" data-animate="stagger">
                <ReviewBoardVideo />
              </div>
              <div className={folderPanelTextClass} data-animate="headline">
                <h3 className={folderPanelTitleClass}>
                  Coded and posted as a draft bill.
                </h3>
                <p className={folderPanelBodyClass} style={folderPanelBodyStyle}>
                  Set vendor, account, and tax, then post a draft to QuickBooks or Xero with the source attached — no manual keying.
                </p>
                <NextLink href="/dashboard/client" className={folderPanelCtaClass}>
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
              <h2
                className="ax-h2 ax-marketing-section-title font-bold text-neutral-950"
                style={{ fontSize: "clamp(2.5rem, 5.4vw, 4.25rem)", lineHeight: 1.05 }}
              >
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

        {/* ── 7 · Organizations testimonials (white) ── */}
        <TestimonialsMarquee />

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

        {/* ── Scroll-grow cinematic section (white) — last section after FAQ ── */}
        <ScrollGrowSection />
      </main>

      {/* ── Footer — Descript dark-footer recipe, recolored to black ── */}
      <footer className="relative z-10 bg-black text-white">
        <div className="mx-auto max-w-[1200px] px-4 pt-16 pb-10 sm:px-6 lg:px-8 lg:pt-20">
          {/* Logo + contact + social row */}
          <div className="flex flex-col gap-8 pb-10 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-5">
              <NextLink href="/" aria-label="AxLiner home" className="inline-flex items-center">
                <AppLogo className="h-11 w-auto invert" />
              </NextLink>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--brand-green)]">Headquarters</p>
                  <address className="mt-2 text-[15px] font-semibold not-italic leading-relaxed text-white">
                    Rue du Lac de Constance<br />
                    Tunis, Tunisia, 13310, TN
                  </address>
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--brand-green)]">Email</p>
                  <a
                    href="mailto:contact@axliner.com"
                    className="mt-2 inline-block text-[15px] font-semibold text-white transition-opacity hover:opacity-70"
                  >
                    contact@axliner.com
                  </a>
                </div>
              </div>
            </div>
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
