"use client"

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileNav } from "@/components/MobileNav";
import ScrollAnimatedSection from "@/components/ScrollAnimatedSection";
import { cn } from "@/lib/utils";
import { AppLogo } from "@/components/AppIcon";

import { createClient } from "@/utils/supabase/client";
import NextLink from "next/link";
import { IndustrySolutionsMenuGrid } from "@/components/IndustrySolutionsMenuGrid";
import { GoogleOneTap } from "@/components/GoogleOneTap";
import { ThemeToggle } from "@/components/theme-toggle";

const BenchmarkAccuracyChart = dynamic(
  () => import("@/components/landing/BenchmarkAccuracyChart"),
  {
    ssr: false,
    loading: () => (
      <Card className="h-full min-h-[430px] border-border bg-card/80 shadow-sm backdrop-blur-md" />
    ),
  }
);

const LandingConverter = dynamic(
  () => import("@/components/landing/LandingConverter"),
  { ssr: false }
);

const TestimonialsMarquee = dynamic(
  () => import("@/components/landing/TestimonialsMarquee"),
  { ssr: false }
);

const GoogleSignInModal = dynamic(
  () => import("@/components/GoogleSignInModal").then((mod) => mod.GoogleSignInModal),
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

const ownedPipelineImages = [
  { src: "/sex.png", alt: "AxLiner document intake interface" },
  { src: "/sex1.png", alt: "AxLiner extraction workflow" },
  { src: "/sex2.png", alt: "AxLiner structured output review" },
];

const ownedPipelineCopy = [
  "AxLiner owns the job queue, file metadata, download permissions, export layer, and recovery flow around every batch. Each file stays tied to a durable owner so status, sharing, and downloads follow the same access model.",
  "The product is shaped for handwritten tables and spreadsheet review, not a generic OCR wrapper stitched into a landing page. Every result is prepared for rows, columns, review, and clean export instead of loose extracted text.",
  "External infrastructure can sit behind the pipeline, but the workflow, storage model, and user experience stay controlled by AxLiner. That keeps retries, batch recovery, and output delivery predictable for real users.",
];

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const converterMountRef = useRef<HTMLDivElement>(null);
  const topBackgroundSectionRef = useRef<HTMLDivElement>(null);
  const topBackgroundRef = useRef<HTMLDivElement>(null);
  const contrastSectionRef = useRef<HTMLDivElement>(null);
  const whatSectionRef = useRef<HTMLDivElement>(null);
  const benchmarkBandRef = useRef<HTMLDivElement>(null);
  const securityBandRef = useRef<HTMLDivElement>(null);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [signInRedirectPath, setSignInRedirectPath] = useState("/dashboard/client");
  const [shouldLoadConverter, setShouldLoadConverter] = useState(false);
  const supabase = createClient();

  const openSignInModal = useCallback((redirectPath = "/dashboard/client") => {
    setSignInRedirectPath(redirectPath);
    setShowSignInModal(true);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (shouldLoadConverter) return;

    const mountTarget = converterMountRef.current;
    if (!mountTarget) return;

    if (typeof IntersectionObserver === "undefined") {
      setShouldLoadConverter(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadConverter(true);
          observer.disconnect();
        }
      },
      { rootMargin: "720px 0px" }
    );

    observer.observe(mountTarget);
    return () => observer.disconnect();
  }, [shouldLoadConverter]);

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
    const whatSection = whatSectionRef.current;
    if (!contrastSection || !whatSection) return;

    let ctx: any;
    let cancelled = false;

    void loadGsap().then(({ gsap }) => {
      if (cancelled) return;

      ctx = gsap.context(() => {
        gsap.fromTo(
          ".what-story-row",
          { opacity: 0, y: 76 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.18,
            scrollTrigger: {
              trigger: whatSection,
              start: "top 70%",
              end: "bottom 72%",
              toggleActions: "play none none reverse",
            },
          }
        );

        gsap.fromTo(
          ".what-story-image",
          { opacity: 0, scale: 0.84, rotation: (index: number) => (index === 1 ? 4 : -4) },
          {
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: 1,
            ease: "power3.out",
            stagger: 0.2,
            scrollTrigger: {
              trigger: whatSection,
              start: "top 68%",
              end: "bottom 72%",
              toggleActions: "play none none reverse",
            },
          }
        );

        gsap.fromTo(
          ".what-story-path",
          { strokeDasharray: 520, strokeDashoffset: 520 },
          {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: {
              trigger: whatSection,
              start: "top 60%",
              end: "bottom 62%",
              scrub: 1,
            },
          }
        );

        [benchmarkBandRef.current, securityBandRef.current].forEach((band) => {
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
      setShouldLoadConverter(true);
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
      {/* Navigation Bar */}
      <nav className="fixed inset-x-0 top-0 z-50 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
            {/* Logo */}
            <div className="flex-shrink-0">
              <AppLogo />
            </div>

            {/* Desktop Navigation Items - Hidden on Mobile */}
            <div className="hidden flex-1 items-center justify-center lg:flex">
              <NavigationMenu>
                <NavigationMenuList className="gap-1">
                  {/* Solutions Dropdown */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent text-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                      Solutions
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <IndustrySolutionsMenuGrid />
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="/pricing"
                      className={cn(navigationMenuTriggerStyle(), "bg-transparent text-foreground transition-colors hover:bg-accent hover:text-accent-foreground")}
                    >
                      Pricing
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="/blogs"
                      className={cn(navigationMenuTriggerStyle(), "bg-transparent text-foreground transition-colors hover:bg-accent hover:text-accent-foreground")}
                    >
                      Blogs
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  {/* How AxLiner's Built */}
                  <NavigationMenuItem>
                    <button
                      className={cn(navigationMenuTriggerStyle(), "bg-transparent text-foreground transition-colors hover:bg-accent hover:text-accent-foreground")}
                      onClick={() => scrollToSection('ai-engine')}
                    >
                      How AxLiner's Built
                    </button>
                  </NavigationMenuItem>

                  {/* Benchmarks */}
                  <NavigationMenuItem>
                    <button
                      className={cn(navigationMenuTriggerStyle(), "bg-transparent text-foreground transition-colors hover:bg-accent hover:text-accent-foreground")}
                      onClick={() => scrollToSection('benchmarks')}
                    >
                      Benchmarks
                    </button>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Sign In & Try for Free Buttons - Desktop */}
            <div className="hidden items-center gap-2 lg:flex">
              <ThemeToggle />
              {isAuthenticated ? (
                <Button
                  size="sm"
                  asChild
                >
                  <NextLink href="/dashboard">Go to Dashboard</NextLink>
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    onClick={() => openSignInModal("/pricing?from=signup")}
                  >
                    Sign Up
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openSignInModal("/dashboard/client")}
                  >
                    Sign in
                  </Button>
                </>
              )}
            </div>
        </div>
      </nav>

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
                <h1 className="text-4xl font-semibold leading-[1.04] tracking-tight text-primary sm:text-5xl lg:text-6xl">
                  Handwritten images to Excel in seconds
                </h1>
                <p className="mt-8 text-base leading-8 text-foreground sm:text-lg lg:text-xl">
                  Upload handwritten tables, class notes, invoices, receipts, paper forms, and screenshots from any workflow. AxLiner reads the structure, preserves the rows and columns, and gives you clean Excel files you can review, edit, share, or use in reporting without retyping everything by hand.
                </p>

                <div className="mt-9 flex flex-col items-center gap-5 sm:flex-row lg:items-center">
                  <Button
                    onClick={() => scrollToSection('converter')}
                    className="h-12 px-8 text-base font-semibold"
                  >
                    Try It
                  </Button>

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
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">active teams</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center lg:translate-x-14 lg:items-end xl:translate-x-20">
                <div className="relative w-full max-w-[800px]">
                  <div className="absolute inset-x-8 bottom-5 h-20 rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />
                  <img
                    src="/header.svg"
                    alt="AxLiner document conversion illustration"
                    className="relative z-10 mx-auto h-auto w-full max-w-[760px] object-contain drop-shadow-[0_30px_70px_rgba(42,35,64,0.16)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <TestimonialsMarquee />
        <div id="converter" ref={converterMountRef} className="scroll-mt-28">
          {shouldLoadConverter ? (
            <LandingConverter />
          ) : (
            <section className="relative z-10 pt-6 pb-16 sm:pt-8 lg:pt-10">
              <div className="container mx-auto max-w-[1540px] px-4 sm:px-5 lg:px-9">
                <div className="mx-auto rounded-xl border bg-card/80 p-8 text-center shadow-sm backdrop-blur">
                  <div className="inline-flex items-center gap-2 rounded-md border bg-background px-4 py-2 shadow-sm">
                    <h2 className="text-lg font-semibold text-foreground sm:text-xl">Try It</h2>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

          </div>
        </div>

        <div className="relative isolate bg-background px-4 py-10 sm:px-6 lg:px-8">
        <div
          ref={contrastSectionRef}
          className="relative mx-auto max-w-[1540px] overflow-hidden rounded-md bg-primary px-3 py-10 text-primary-foreground shadow-sm sm:px-5 lg:px-8 lg:py-14 [&_.text-card-foreground]:!text-primary-foreground [&_.text-foreground]:!text-primary-foreground [&_.text-muted-foreground]:!text-primary-foreground/80 [&_.text-primary]:!text-primary-foreground"
        >
          <div className="relative z-10">
        {/* What is Axliner Section */}
        <section ref={whatSectionRef} className="relative z-10 py-4 lg:py-6">
          <div className="container mx-auto max-w-[960px] px-2 sm:px-4">
            <div className="mx-auto max-w-[900px]">
              {/* Section Header */}
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-2 rounded-md border border-white/25 bg-white/10 px-3 py-1.5 mb-2 shadow-sm shadow-black/10 backdrop-blur-2xl">
                  <h2 className="text-sm font-semibold text-foreground sm:text-base">
                    What is Axliner?
                  </h2>
                </div>
              </div>

              {/* Main Content */}
              <div className="relative mx-auto max-w-[840px]">
                <svg
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full lg:block"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <path
                    className="what-story-path"
                    d="M74 15 L26 50 L74 85"
                    fill="none"
                    stroke="rgba(255,255,255,0.42)"
                    strokeWidth="0.34"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="1.4 1.15"
                  />
                </svg>

                <div className="relative z-10 space-y-4 lg:space-y-5">
                  <div className="what-story-row grid items-center gap-4 lg:grid-cols-[minmax(0,0.98fr)_minmax(260px,1.02fr)]">
                    <Card className="rounded-md border border-white/20 bg-white/10 shadow-sm shadow-black/10 backdrop-blur-2xl">
                      <CardContent className="p-3 sm:p-4">
                        <p className="text-xs leading-5 text-foreground sm:text-sm sm:leading-6">
                          Axliner is a <span className="font-bold">7-billion parameter vision-language model</span> fine-tuned from Meta's Llama 3 family for handwritten tables, forms, and spreadsheet-like documents. It understands document structure first, so the result is usable rows, columns, headers, and values.
                        </p>
                      </CardContent>
                    </Card>

                    <div className="what-story-image relative flex min-h-[130px] items-center justify-center lg:min-h-[190px]">
                      <img
                        src="/what-is/chaos-invoices.svg"
                        alt=""
                        className="h-[135px] w-full object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.15)] sm:h-[165px] lg:h-[220px]"
                      />
                    </div>
                  </div>

                  <div className="what-story-row grid items-center gap-4 lg:grid-cols-[minmax(260px,1.02fr)_minmax(0,0.98fr)]">
                    <div className="what-story-image relative order-2 flex min-h-[145px] items-center justify-center lg:order-1 lg:min-h-[205px]">
                      <img
                        src="/what-is/axliner-cpu.svg"
                        alt=""
                        className="h-[150px] w-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.16)] sm:h-[185px] lg:h-[245px]"
                      />
                    </div>

                    <Card className="order-1 rounded-md border border-white/20 bg-white/10 shadow-sm shadow-black/10 backdrop-blur-2xl lg:order-2">
                      <CardContent className="p-3 sm:p-4">
                        <p className="text-xs leading-5 text-foreground sm:text-sm sm:leading-6">
                          During conversion, Axliner cleans the image, detects table regions, reads handwriting, and keeps cell relationships intact. It was trained on diverse handwritten datasets, table extraction data, and augmented noisy documents, so dense notes and phone photos can still become structured spreadsheets.
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="what-story-row grid items-center gap-4 lg:grid-cols-[minmax(0,0.98fr)_minmax(260px,1.02fr)]">
                    <Card className="rounded-md border border-white/20 bg-white/10 shadow-sm shadow-black/10 backdrop-blur-2xl">
                      <CardContent className="p-3 sm:p-4">
                        <p className="text-xs leading-5 text-foreground sm:text-sm sm:leading-6">
                          The workflow is designed for batch processing. Upload several images, watch progress as each page finishes, then download clean Excel files ready for review, reporting, editing, or sharing without losing the table logic people need in the final workbook.
                        </p>
                      </CardContent>
                    </Card>

                    <div className="what-story-image relative flex min-h-[130px] items-center justify-center lg:min-h-[190px]">
                      <img
                        src="/what-is/chill-output.svg"
                        alt=""
                        className="h-[135px] w-full object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.15)] sm:h-[165px] lg:h-[220px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden">
                <Card className="ax-glass-card overflow-hidden rounded-xl border-border shadow-sm">
                  <CardContent className="space-y-8 p-6 sm:p-8 lg:p-10">
                    <p className="text-xl text-foreground leading-relaxed">
                      Axliner is a <span className="font-bold">7-billion parameter vision-language model</span> a fine-tuned Meta's Llama 3 Model. The model underwent extensive instruction fine-tuning specifically optimized for <span className="font-bold">handwritten text recognition</span>, <span className="font-bold">table structure preservation</span>, and <span className="font-bold">multi-language document understanding</span>.
                    </p>

                    <p className="text-xl text-foreground leading-relaxed">
                      Unlike generic OCR systems, Axliner was trained on diverse handwritten datasets including the <span className="font-bold">IAM Handwriting Database</span>, proprietary table extraction datasets, and synthetic augmented data. The fine-tuning process focused on <span className="font-bold">preserving table semantics, cell relationships, and hierarchical document structures</span> — achieving <span className="font-bold">96.8% accuracy</span> on complex handwritten tables.
                    </p>

                    <p className="text-xl text-foreground leading-relaxed">
                      The system supports <span className="font-bold">batch processing using your live plan limit</span>, with real-time conversion progress as each page finishes. Axliner handles <span className="font-bold">8+ languages</span> including complex scripts like Arabic and Chinese, while maintaining cell relationships and formatting integrity across all output formats.
                    </p>

                    <p className="text-xl text-foreground leading-relaxed">
                      Built for enterprise workflows, Axliner excels in <span className="font-bold">financial document processing</span>, <span className="font-bold">invoice digitization</span>, <span className="font-bold">form automation</span>, and archive digitization — trained on over <span className="font-bold">2 million handwritten samples</span> using a Llama 3-based vision-language transformer architecture.
                    </p>
                  </CardContent>
                </Card>

                <div />
              </div>
            </div>
          </div>
        </section>

        {/* Companies Section - Trusted By */}
        <ScrollAnimatedSection id="trusted" className="w-full overflow-hidden py-5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-4" data-animate="headline">
              <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-white/25 bg-white/10 px-3 py-2 shadow-sm shadow-black/10 backdrop-blur-2xl">
                <h2 className="text-sm font-semibold text-foreground sm:text-base">
                  Chosen by experts at top organizations
                </h2>
              </div>
            </div>

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
        {/* Why Choose Us Section */}
        <ScrollAnimatedSection id="features" className="relative z-20 pt-16 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12" data-animate="headline">
              <div className="inline-flex items-center gap-2 rounded-md border bg-background px-4 py-2 mb-4 shadow-sm">
                <h2 className="text-lg sm:text-xl font-bold text-foreground">
                  Solutions
                </h2>
              </div>
            </div>

            <div className="mx-auto grid max-w-[1540px] grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {solutionCards.map((solution) => (
                <Card
                  key={solution.title}
                  data-animate="stagger"
                  className="group flex min-h-[560px] overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
                >
                  <CardContent className="flex h-full w-full flex-col p-7 sm:p-8">
                    <div className="flex h-56 items-center justify-center sm:h-64">
                      <img
                        src={solution.asset}
                        alt=""
                        className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    </div>

                    <div className="mt-10 flex flex-1 flex-col">
                      <CardTitle className="text-2xl font-semibold tracking-normal text-foreground">
                        {solution.title}
                      </CardTitle>
                      <CardDescription className="mt-5 text-[15px] leading-7 text-muted-foreground">
                        {solution.description}
                      </CardDescription>

                      <NextLink
                        href={solution.href}
                        className="mt-auto flex items-end justify-between gap-4 pt-12 text-left text-sm font-medium text-foreground transition-colors hover:text-primary"
                      >
                        <span>Discover More</span>
                        <span className="relative block h-10 w-10 text-primary transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                          <span className="absolute bottom-2 right-1 h-[4px] w-9 origin-right rotate-[-45deg] rounded-full bg-current" />
                          <span className="absolute right-1 top-1 h-8 w-8 border-r-[4px] border-t-[4px] border-current" />
                        </span>
                      </NextLink>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ScrollAnimatedSection>
        {/* Benchmark Section */}
        <ScrollAnimatedSection id="benchmarks" className="relative z-20 -mt-6 overflow-hidden pt-28 pb-16">
          <div
            ref={benchmarkBandRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              backgroundColor: "var(--background)",
              boxShadow: "0 -24px 60px rgb(0 0 0 / 0.06)",
              clipPath:
                "polygon(0 4%, 12% 2.8%, 25% 4.6%, 40% 2.4%, 58% 4.3%, 75% 2.7%, 100% 4%, 100% 100%, 0 100%)",
            }}
          />
          <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12" data-animate="headline">
                <div className="inline-flex items-center gap-2 rounded-md border bg-background px-4 py-2 mb-4 shadow-sm">
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">
                    Benchmarks
                  </h2>
                </div>

                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Benchmarked against major cloud providers on real-world handwritten documents and complex table structures.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                <BenchmarkAccuracyChart />

                {/* Performance Metrics Table */}
                <Card className="border-border bg-card/80 shadow-sm backdrop-blur-md" data-animate="stagger">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold">Comprehensive Performance Metrics</CardTitle>
                    <p className="text-sm text-muted-foreground">Average across all test scenarios</p>
                  </CardHeader>
                  <CardContent>
                      <div className="overflow-hidden rounded-lg border border-border bg-background/80 backdrop-blur-md">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border/50 bg-muted/30">
                            <th className="text-left p-3 font-medium">Metric</th>
                            <th className="text-right p-3 font-medium text-primary">AxLiner</th>
                            <th className="text-right p-3 font-medium text-muted-foreground">Industry Avg</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-border/50">
                            <td className="p-3 text-muted-foreground">Character Error Rate</td>
                            <td className="p-3 text-right font-semibold text-primary">3.2%</td>
                            <td className="p-3 text-right text-muted-foreground">5.8%</td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="p-3 text-muted-foreground">Word Recognition</td>
                            <td className="p-3 text-right font-semibold text-primary">99.5%</td>
                            <td className="p-3 text-right text-muted-foreground">95.1%</td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="p-3 text-muted-foreground">Table Structure</td>
                            <td className="p-3 text-right font-semibold text-primary">99.1%</td>
                            <td className="p-3 text-right text-muted-foreground">92.3%</td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="p-3 text-muted-foreground">Noisy Image Handling</td>
                            <td className="p-3 text-right font-semibold text-primary">94.7%</td>
                            <td className="p-3 text-right text-muted-foreground">87.2%</td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="p-3 text-muted-foreground">Mixed Font Recognition</td>
                            <td className="p-3 text-right font-semibold text-primary">97.9%</td>
                            <td className="p-3 text-right text-muted-foreground">94.6%</td>
                          </tr>
                          <tr>
                            <td className="p-3 text-muted-foreground">Processing Speed</td>
                            <td className="p-3 text-right font-semibold text-primary">0.8s/page</td>
                            <td className="p-3 text-right text-muted-foreground">2.1s/page</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        </ScrollAnimatedSection>

        <ScrollAnimatedSection id="owned-ai" className="relative z-20 overflow-hidden px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-[1280px]">
            <div className="mx-auto max-w-[980px] text-center" data-animate="headline">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
                Not a third-party wrapper
              </p>
              <h2 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-normal text-foreground sm:text-5xl lg:text-[4.2rem]">
                Document AI built before the hype cycle.
              </h2>
            </div>

            <div className="mx-auto mt-10 max-w-[980px]" data-animate="stagger">
              <div className="mx-auto overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="grid min-h-[170px] sm:grid-cols-3 lg:min-h-[220px]">
                  {ownedPipelineImages.map((image) => (
                    <div key={image.src} className="relative min-h-[170px] border-border sm:border-l sm:first:border-l-0 lg:min-h-[220px]">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="(min-width: 1024px) 31vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mx-auto mt-8 grid max-w-[940px] gap-6 text-center text-foreground md:grid-cols-3">
                {ownedPipelineCopy.map((item, index) => (
                  <div key={item} className="border-t border-border pt-5">
                    <p className="text-sm font-bold text-primary">0{index + 1}</p>
                    <p className="mt-3 text-base font-medium leading-8 text-foreground/80">{item}</p>
                  </div>
                ))}
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
        {/* AI Engine Section */}
        <ScrollAnimatedSection id="ai-engine" className="py-16">
          <div className="container mx-auto max-w-[1640px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto">
              <div className="mx-auto mb-12 max-w-4xl text-center" data-animate="headline">
                <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">
                    How AxLiner's Engine Is Built
                  </h2>
                </div>
              </div>

              {/* Main Content */}
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)] lg:items-start">
                <Card className="overflow-hidden border-border bg-card shadow-sm" data-animate="stagger">
                  <CardHeader className="border-b border-border">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Workflow</p>
                        <CardTitle className="mt-1 text-2xl">From page to workbook</CardTitle>
                      </div>
                      <span className="rounded-md border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                        4 stage pipeline
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {[
                      ["01", "Image cleanup", "Rotation, contrast, shadows, and page noise are normalized before extraction."],
                      ["02", "Table detection", "The engine finds headers, repeated rows, totals, and spreadsheet-like regions."],
                      ["03", "Handwriting read", "Letters, numbers, and symbols stay attached to the cells where they belong."],
                      ["04", "Workbook export", "Rows and columns are packaged into XLSX files ready for review."],
                    ].map(([step, title, copy]) => (
                      <div key={step} className="grid gap-4 border-b border-border p-5 last:border-b-0 sm:grid-cols-[72px_1fr_auto] sm:items-center">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background text-sm font-semibold text-primary">
                          {step}
                        </span>
                        <div>
                          <p className="font-semibold text-foreground">{title}</p>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">{copy}</p>
                        </div>
                        <div className="hidden h-12 w-28 items-end gap-1 sm:flex">
                          {[42, 58, 48, 74, 62, 88, 72].map((height, index) => (
                            <span
                              key={`${step}-${index}`}
                              className="w-full rounded-t-sm bg-primary/70"
                              style={{ height: `${height}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <div className="space-y-4" data-animate="stagger">
                  <div className="overflow-hidden rounded-xl border border-border bg-card p-3 shadow-sm">
                    <Image
                      src="/purchase.webp"
                      alt="Professionals reviewing documents"
                      width={720}
                      height={860}
                      sizes="(min-width: 1024px) 30vw, 100vw"
                      className="h-[360px] w-full rounded-lg object-cover object-center lg:h-[520px]"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="mt-12 text-center" data-animate="stagger">
                <p className="text-sm text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                  <span className="font-semibold text-foreground">Designed for operators:</span> every step is shaped around the spreadsheet people need after the upload, from invoices and paper forms to handwritten class notes and archive tables.
                </p>
              </div>
            </div>
          </div>
        </ScrollAnimatedSection>
        <ScrollAnimatedSection id="security" className="relative z-10 overflow-hidden py-20 lg:py-24">
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
                <p className="text-xl font-medium text-foreground">Security & Compliance</p>
                <h2 className="mt-6 max-w-2xl text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                  Your Data Security Guaranteed
                </h2>

                <div className="mt-8 max-w-[500px] overflow-hidden rounded-xl border border-border bg-card p-2 shadow-sm">
                    <Image
                      src="/secu.webp"
                      alt="Secure digital document processing"
                      width={760}
                      height={420}
                      sizes="(min-width: 1024px) 40vw, 100vw"
                      className="h-[210px] w-full rounded-lg object-cover object-center sm:h-[240px] lg:h-[260px]"
                    />
                </div>
              </div>

              <div className="lg:pt-12" data-animate="stagger">
                <p className="max-w-3xl text-2xl leading-10 text-foreground">
                  At AxLiner, your data is treated with utmost care. We build around global data protection expectations and international privacy requirements for document processing workflows.
                </p>

                <div className="mt-10 space-y-7">
                  {[
                    "ISO 27001-aligned security controls",
                    "Built for GDPR, SOC 2, CCPA and HIPAA-conscious workflows",
                    "Secure infrastructure across Supabase, Fly.io and Vercel",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-4 text-xl text-foreground">
                      <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-primary text-primary">
                        <span className="h-2.5 w-1.5 rotate-45 border-b-2 border-r-2 border-current" />
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="mt-12 bg-secondary px-8 py-6 text-lg font-semibold text-secondary-foreground shadow-none hover:bg-secondary/80"
                  asChild
                >
                  <NextLink href="/privacy-policy">More Information</NextLink>
                </Button>
              </div>
            </div>

            <div className="mx-auto mt-24 max-w-[1160px] text-center lg:mt-28" data-animate="headline">
              <h3 className="text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-[4.25rem]">
                Frequently Asked Questions
              </h3>
            </div>

            <div className="mx-auto mt-14 max-w-[928px] border-y border-border text-left" data-animate="stagger">
              {faqItems.map((item, index) => (
                <details
                  key={item.question}
                  className="group border-b border-border last:border-b-0"
                  open={index === 0}
                >
                  <summary className="flex min-h-[78px] cursor-pointer list-none items-center justify-between gap-6 py-5 text-xl font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                    <span>{item.question}</span>
                    <span className="relative h-6 w-6 shrink-0">
                      <span className="absolute left-1/2 top-1/2 h-[2px] w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground" />
                      <span className="absolute left-1/2 top-1/2 h-5 w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground transition-opacity duration-200 group-open:opacity-0" />
                    </span>
                  </summary>
                  <div className="pb-9 pr-10">
                    <p className="text-base leading-8 text-muted-foreground">{item.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </ScrollAnimatedSection>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 overflow-hidden bg-primary text-primary-foreground">
        <div className="pointer-events-none absolute inset-0 opacity-35">
          <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-primary-foreground/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-primary-foreground/10 blur-3xl" />
        </div>

        <div className="relative border-y border-primary-foreground/10 py-4">
          <div
            className="flex w-max items-center gap-10 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.28em] text-primary-foreground/70"
            style={{ animation: "scroll-left 42s linear infinite" }}
          >
            {[...Array(2)].map((_, repeat) => (
              <div key={repeat} className="flex items-center gap-10">
                <span>0101001110</span>
                <span>handwritten tables</span>
                <span>secure exports</span>
                <span>batch recovery</span>
                <span>structured xlsx</span>
                <span>0100100001</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto max-w-[1540px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(640px,1fr)]">
            <div>
              <div className="text-4xl font-semibold tracking-tight">AxLiner</div>
              <p className="mt-6 max-w-xl text-lg leading-8 text-primary-foreground/75">
                Upload handwritten documents, recover the table structure, and move clean Excel files into your workflow without rebuilding the spreadsheet by hand.
              </p>
              <p className="mt-7 text-sm font-semibold uppercase tracking-[0.24em] text-primary-foreground/60">
                Made with love in Alaska.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild className="bg-background px-7 py-5 font-semibold text-foreground hover:bg-background/90">
                  <NextLink href="/dashboard/client">Try It</NextLink>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-primary-foreground/25 bg-primary-foreground/10 px-7 py-5 font-semibold text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
                >
                  <NextLink href="/pricing">See Pricing</NextLink>
                </Button>
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-4">
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground/60">Discover</h4>
                <ul className="mt-5 space-y-3 text-sm font-medium text-primary-foreground/80">
                  <li><a href="#features" className="transition-colors hover:text-primary-foreground">Solutions</a></li>
                  <li><a href="#benchmarks" className="transition-colors hover:text-primary-foreground">Benchmarks</a></li>
                  <li><a href="#how-it-works" className="transition-colors hover:text-primary-foreground">How it works</a></li>
                  <li><NextLink href="/pricing" className="transition-colors hover:text-primary-foreground">Pricing</NextLink></li>
                  <li><NextLink href="/blogs" className="transition-colors hover:text-primary-foreground">Blogs</NextLink></li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground/60">Product</h4>
                <ul className="mt-5 space-y-3 text-sm font-medium text-primary-foreground/80">
                  <li><NextLink href="/dashboard/client" className="transition-colors hover:text-primary-foreground">Process images</NextLink></li>
                  <li><NextLink href="/history" className="transition-colors hover:text-primary-foreground">History</NextLink></li>
                  <li><NextLink href="/dashboard/settings" className="transition-colors hover:text-primary-foreground">Billing</NextLink></li>
                  <li><a href="#security" className="transition-colors hover:text-primary-foreground">Security</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground/60">Support</h4>
                <ul className="mt-5 space-y-3 text-sm font-medium text-primary-foreground/80">
                  <li><a href="mailto:axliner.excel@gmail.com" className="transition-colors hover:text-primary-foreground">Contact</a></li>
                  <li><NextLink href="/privacy-policy" className="transition-colors hover:text-primary-foreground">Privacy</NextLink></li>
                  <li><NextLink href="/terms-of-service" className="transition-colors hover:text-primary-foreground">Terms</NextLink></li>
                  <li><NextLink href="/data-deletion" className="transition-colors hover:text-primary-foreground">Data deletion</NextLink></li>
                </ul>
              </div>

              <div className="rounded-xl border border-primary-foreground/15 bg-primary-foreground/10 p-5 backdrop-blur-md">
                <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground/60">Create</h4>
                <p className="mt-5 text-sm leading-7 text-primary-foreground/75">
                  Start with a small batch, then upgrade when your document volume grows.
                </p>
                <NextLink href="/sign-up" className="mt-5 inline-flex text-sm font-semibold text-primary-foreground underline underline-offset-4">
                  Create free account
                </NextLink>
              </div>
            </div>
          </div>
          
          <div className="mt-14 flex flex-col gap-4 border-t border-primary-foreground/10 pt-6 text-xs font-medium text-primary-foreground/50 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 AxLiner. All rights reserved.</p>
            <p>Secure document processing for teams that live in spreadsheets.</p>
          </div>
        </div>
      </footer>
      
      {/* Mobile Navigation */}
      <MobileNav 
        onSectionClick={scrollToSection}
        onSignInClick={() => openSignInModal("/dashboard/client")}
        isAuthenticated={isAuthenticated}
      />

      {showSignInModal && (
        <GoogleSignInModal
          open={showSignInModal}
          onOpenChange={setShowSignInModal}
          redirectPath={signInRedirectPath}
        />
      )}

      <GoogleOneTap enabled={!isAuthenticated && !showSignInModal} redirectPath="/dashboard/client" />
    </div>
  )}
