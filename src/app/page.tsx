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

const BenchmarkAccuracyChart = dynamic(
  () => import("@/components/landing/BenchmarkAccuracyChart"),
  {
    ssr: false,
    loading: () => (
      <Card className="h-full min-h-[430px] border border-[#A78BFA]/35 bg-white/45 shadow-xl shadow-[#A78BFA]/10 backdrop-blur-md" />
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

const siteIcons = {
  arrow: "/site-icons/io/arrow.svg",
};

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

function SiteIcon({ src, className, alt = "" }: { src: string; className?: string; alt?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      className={cn("inline-block object-contain", className)}
    />
  );
}

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const converterMountRef = useRef<HTMLDivElement>(null);
  const topBackgroundSectionRef = useRef<HTMLDivElement>(null);
  const topBackgroundRef = useRef<HTMLDivElement>(null);
  const purpleSectionRef = useRef<HTMLDivElement>(null);
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
    const purpleSection = purpleSectionRef.current;
    const whatSection = whatSectionRef.current;
    if (!purpleSection || !whatSection) return;

    const topClipStart =
      "polygon(0 3.8%, 9% 2.7%, 20% 4.4%, 35% 2.1%, 50% 4.2%, 66% 2.5%, 82% 4.1%, 100% 2.8%, 100% 100%, 0 100%)";
    const topClipEnd =
      "polygon(0 9%, 8% 5.8%, 19% 9.8%, 35% 4.2%, 51% 8.4%, 68% 4.8%, 84% 8.1%, 100% 5.3%, 100% 100%, 0 100%)";

    let ctx: any;
    let cancelled = false;

    void loadGsap().then(({ gsap }) => {
      if (cancelled) return;

      ctx = gsap.context(() => {
        gsap.fromTo(
          purpleSection,
          { clipPath: topClipStart },
          {
            clipPath: topClipEnd,
            ease: "none",
            scrollTrigger: {
              trigger: purpleSection,
              start: "top 85%",
              end: "top 20%",
              scrub: 1.1,
            },
          }
        );

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
      }, purpleSection);
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
      <nav className="fixed top-0 left-0 right-0 z-50 pt-3 backdrop-blur-2xl lg:pt-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between rounded-[35px] border border-black/10 bg-neutral-100/55 p-2 shadow-[0_18px_45px_rgba(20,20,20,0.08)] ring-1 ring-white/35 backdrop-blur-2xl lg:p-3">
            {/* Logo */}
            <div className="flex-shrink-0">
              <AppLogo />
            </div>

            {/* Desktop Navigation Items - Hidden on Mobile */}
            <div className="hidden lg:flex items-center justify-center flex-1">
              <NavigationMenu>
                <NavigationMenuList className="gap-1">
                  {/* Solutions Dropdown */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent hover:bg-accent/50 transition-colors text-black dark:text-white">
                      Solutions
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <IndustrySolutionsMenuGrid />
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="/pricing"
                      className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-accent/50 transition-colors text-black dark:text-white")}
                    >
                      Pricing
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  {/* How AxLiner's Built */}
                  <NavigationMenuItem>
                    <button
                      className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-accent/50 transition-colors text-black dark:text-white")}
                      onClick={() => scrollToSection('ai-engine')}
                    >
                      How AxLiner's Built
                    </button>
                  </NavigationMenuItem>

                  {/* Benchmarks */}
                  <NavigationMenuItem>
                    <button
                      className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-accent/50 transition-colors text-black dark:text-white")}
                      onClick={() => scrollToSection('benchmarks')}
                    >
                      Benchmarks
                    </button>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Sign In & Try for Free Buttons - Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated ? (
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4 py-2 text-sm font-medium transition-colors shadow-lg hover:shadow-xl"
                  asChild
                >
                  <NextLink href="/dashboard">Go to Dashboard</NextLink>
                </Button>
              ) : (
                <>
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4 py-2 text-sm font-medium transition-colors shadow-lg hover:shadow-xl"
                    onClick={() => openSignInModal("/pricing?from=signup")}
                  >
                    Sign Up
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white/90 dark:bg-white/20 text-foreground border-[1.6px] border-foreground/30 rounded-full px-4 py-2 text-sm font-medium hover:bg-white dark:hover:bg-white/30 transition-colors backdrop-blur-sm"
                    onClick={() => openSignInModal("/dashboard/client")}
                  >
                    Sign in
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10">
        <div ref={topBackgroundSectionRef} className="relative isolate overflow-hidden" style={{ backgroundColor: "#E9ECE4" }}>
          <div
            ref={topBackgroundRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 bg-cover bg-top bg-no-repeat will-change-transform"
            style={{
              backgroundColor: "#E9ECE4",
            }}
          />
          <div className="relative z-10">
        <section ref={heroRef} className="relative overflow-hidden pt-10 pb-16 sm:pt-12 sm:pb-[4.5rem] lg:pt-12 lg:pb-24">
          <div className="relative z-10 container mx-auto max-w-[1500px] px-4 sm:px-5 lg:px-9">
            <div className="grid min-h-[500px] items-center gap-14 lg:min-h-[535px] lg:grid-cols-[minmax(0,1.08fr)_minmax(460px,0.92fr)] lg:gap-16">
              <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:translate-x-8 lg:text-left xl:translate-x-10">
                <h1 className="text-4xl font-semibold leading-[1.04] tracking-tight text-[#2f165e] sm:text-5xl lg:text-6xl">
                  Handwritten images to Excel in seconds
                </h1>
                <p className="mt-8 text-base leading-8 text-black sm:text-lg lg:text-xl">
                  Upload handwritten tables, class notes, invoices, receipts, paper forms, and screenshots from any workflow. AxLiner reads the structure, preserves the rows and columns, and gives you clean Excel files you can review, edit, share, or use in reporting without retyping everything by hand.
                </p>

                <div className="mt-9 flex flex-col items-center gap-5 sm:flex-row lg:items-center">
                  <Button
                    onClick={() => scrollToSection('converter')}
                    className="h-12 rounded-full bg-[#2f165e] px-7 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(47,22,94,0.22)] hover:bg-[#24104b]"
                  >
                    Try it
                    <SiteIcon src={siteIcons.arrow} className="ml-2 h-5 w-5" />
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
                    <div className="h-9 w-px bg-[#2f165e]/18" />
                    <div className="text-left">
                      <p className="text-sm font-bold leading-none text-[#111827]">5,000+</p>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#111827]/60">active teams</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center lg:translate-x-14 lg:items-end xl:translate-x-20">
                <div className="relative w-full max-w-[800px]">
                  <div className="absolute inset-x-8 bottom-5 h-20 rounded-full bg-[#2f165e]/18 blur-3xl" aria-hidden="true" />
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
                <div className="mx-auto rounded-[2rem] border border-white/45 bg-white/35 p-8 text-center shadow-[0_24px_70px_rgba(42,35,64,0.08)] backdrop-blur-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/45 bg-white/50 px-4 py-2 shadow-lg shadow-[#A78BFA]/10 backdrop-blur-2xl">
                    <h2 className="text-lg font-bold text-foreground sm:text-xl">Try It</h2>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

          </div>
        </div>

        <div
          ref={purpleSectionRef}
          className="relative isolate -mt-10 overflow-hidden pt-36 pb-12 text-white [&_.text-card-foreground]:!text-white [&_.text-foreground]:!text-white [&_.text-muted-foreground]:!text-white/85 [&_.text-primary]:!text-white"
          style={{
            backgroundColor: "#2f165e",
            clipPath:
              "polygon(0 3.8%, 9% 2.7%, 20% 4.4%, 35% 2.1%, 50% 4.2%, 66% 2.5%, 82% 4.1%, 100% 2.8%, 100% 100%, 0 100%)",
          }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0"
            style={{ backgroundColor: "#2f165e" }}
          />
          <div className="relative z-10">
        {/* What is Axliner Section */}
        <section ref={whatSectionRef} className="relative z-10 py-16 lg:py-24">
          <div className="container mx-auto max-w-[1860px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1780px]">
              {/* Section Header */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 mb-4 shadow-lg shadow-black/10 backdrop-blur-2xl">
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">
                    What is Axliner?
                  </h2>
                </div>
              </div>

              {/* Main Content */}
              <div className="relative mx-auto max-w-[1540px]">
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

                <div className="relative z-10 space-y-12 lg:space-y-20">
                  <div className="what-story-row grid items-center gap-8 lg:grid-cols-[minmax(0,0.94fr)_minmax(520px,1.06fr)]">
                    <Card className="rounded-[2rem] border border-white/20 bg-white/10 shadow-2xl shadow-black/10 backdrop-blur-2xl">
                      <CardContent className="p-6 sm:p-8 lg:p-10">
                        <p className="text-xl leading-9 text-foreground lg:text-2xl lg:leading-10">
                          Axliner is a <span className="font-bold">7-billion parameter vision-language model</span> fine-tuned from Meta's Llama 3 family for handwritten tables, forms, and spreadsheet-like documents. It understands document structure first, so the result is usable rows, columns, headers, and values.
                        </p>
                      </CardContent>
                    </Card>

                    <div className="what-story-image relative flex min-h-[280px] items-center justify-center lg:min-h-[430px]">
                      <img
                        src="/what-is/chaos-invoices.svg"
                        alt=""
                        className="h-[300px] w-full object-contain drop-shadow-[0_28px_45px_rgba(0,0,0,0.2)] sm:h-[380px] lg:h-[520px]"
                      />
                    </div>
                  </div>

                  <div className="what-story-row grid items-center gap-8 lg:grid-cols-[minmax(520px,1.05fr)_minmax(0,0.95fr)]">
                    <div className="what-story-image relative order-2 flex min-h-[300px] items-center justify-center lg:order-1 lg:min-h-[460px]">
                      <img
                        src="/what-is/axliner-cpu.svg"
                        alt=""
                        className="h-[320px] w-full object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.22)] sm:h-[410px] lg:h-[560px]"
                      />
                    </div>

                    <Card className="order-1 rounded-[2rem] border border-white/20 bg-white/10 shadow-2xl shadow-black/10 backdrop-blur-2xl lg:order-2">
                      <CardContent className="p-6 sm:p-8 lg:p-10">
                        <p className="text-xl leading-9 text-foreground lg:text-2xl lg:leading-10">
                          During conversion, Axliner cleans the image, detects table regions, reads handwriting, and keeps cell relationships intact. It was trained on diverse handwritten datasets, table extraction data, and augmented noisy documents, so dense notes and phone photos can still become structured spreadsheets.
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="what-story-row grid items-center gap-8 lg:grid-cols-[minmax(0,0.94fr)_minmax(520px,1.06fr)]">
                    <Card className="rounded-[2rem] border border-white/20 bg-white/10 shadow-2xl shadow-black/10 backdrop-blur-2xl">
                      <CardContent className="p-6 sm:p-8 lg:p-10">
                        <p className="text-xl leading-9 text-foreground lg:text-2xl lg:leading-10">
                          The workflow is designed for batch processing. Upload several images, watch progress as each page finishes, then download clean Excel files ready for review, reporting, editing, or sharing without losing the table logic people need in the final workbook.
                        </p>
                      </CardContent>
                    </Card>

                    <div className="what-story-image relative flex min-h-[280px] items-center justify-center lg:min-h-[430px]">
                      <img
                        src="/what-is/chill-output.svg"
                        alt=""
                        className="h-[300px] w-full object-contain drop-shadow-[0_28px_45px_rgba(0,0,0,0.2)] sm:h-[380px] lg:h-[520px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden">
                <Card className="ax-glass-card overflow-hidden rounded-[1.75rem] border border-white/45 shadow-xl shadow-[#441F84]/15">
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
        <ScrollAnimatedSection id="trusted" className="w-full overflow-hidden py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-5" data-animate="headline">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 shadow-lg shadow-black/10 backdrop-blur-2xl">
                <h2 className="text-base font-semibold text-foreground sm:text-lg">
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
                      className="flex-shrink-0 bg-white dark:bg-white border border-border/50 hover:border-[#A78BFA]/30 transition-all duration-300 hover:shadow-md w-[120px] h-[80px]"
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
            style={{ backgroundColor: "#E9ECE4" }}
          />
          <div className="relative z-10">
        {/* Why Choose Us Section */}
        <ScrollAnimatedSection id="features" className="relative z-20 pt-16 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12" data-animate="headline">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/45 bg-white/45 px-4 py-2 mb-4 shadow-lg shadow-[#A78BFA]/10 backdrop-blur-2xl">
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
                  className="group flex min-h-[560px] overflow-hidden rounded-[6px] border border-white/70 bg-[#f2f5ee]/78 shadow-[0_26px_70px_rgba(42,35,64,0.08)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white hover:bg-[#f7f9f3]/90 hover:shadow-[0_32px_85px_rgba(42,35,64,0.13)]"
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
                      <CardTitle className="text-2xl font-semibold tracking-normal text-[#141b35]">
                        {solution.title}
                      </CardTitle>
                      <CardDescription className="mt-5 text-[15px] leading-7 text-[#24304a]">
                        {solution.description}
                      </CardDescription>

                      <NextLink
                        href={solution.href}
                        className="mt-auto flex items-end justify-between gap-4 pt-12 text-left text-sm font-medium text-[#24304a] transition-colors hover:text-[#151827]"
                      >
                        <span>Discover More</span>
                        <span className="relative block h-10 w-10 text-[#00a51a] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
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
              backgroundColor: "#E9ECE4",
              boxShadow: "0 -24px 60px rgba(47, 22, 94, 0.08)",
              clipPath:
                "polygon(0 4%, 12% 2.8%, 25% 4.6%, 40% 2.4%, 58% 4.3%, 75% 2.7%, 100% 4%, 100% 100%, 0 100%)",
            }}
          />
          <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12" data-animate="headline">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/45 bg-white/45 px-4 py-2 mb-4 shadow-lg shadow-[#A78BFA]/10 backdrop-blur-2xl">
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
                <Card className="border border-[#A78BFA]/35 bg-white/55 shadow-xl shadow-[#A78BFA]/10 backdrop-blur-md dark:bg-card/70" data-animate="stagger">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold">Comprehensive Performance Metrics</CardTitle>
                    <p className="text-sm text-muted-foreground">Average across all test scenarios</p>
                  </CardHeader>
                  <CardContent>
                      <div className="overflow-hidden rounded-lg border border-[#A78BFA]/45 bg-white/45 backdrop-blur-md">
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
                            <td className="p-3 text-right font-semibold text-[#441F84]">99.5%</td>
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
          </div>
        </div>

        <div className="relative isolate overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 bg-cover bg-top bg-no-repeat"
            style={{ backgroundColor: "#E9ECE4" }}
          />
          <div className="relative z-10">
        {/* AI Engine Section */}
        <ScrollAnimatedSection id="ai-engine" className="py-16">
          <div className="container mx-auto max-w-[1640px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto">
              <div className="mx-auto mb-12 max-w-4xl text-center" data-animate="headline">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#A78BFA]/70 bg-white/55 px-4 py-2 shadow-lg shadow-[#A78BFA]/10 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-[#F97316]" />
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">
                    How AxLiner's Engine Is Built
                  </h2>
                </div>
              </div>

              {/* Main Content */}
              <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(440px,0.9fr)] lg:items-start">
                <div className="space-y-12">
                {/* Engine Workflow */}
                <Card className="overflow-hidden border border-[#A78BFA]/35 bg-white/55 shadow-xl shadow-[#A78BFA]/10 backdrop-blur-md" data-animate="stagger">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F97316]/12 text-sm font-black text-[#C2410C] ring-1 ring-[#F97316]/25">01</span>
                      <CardTitle className="text-2xl">Built as a document workflow</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-[#1f2937] font-medium leading-8 text-base sm:text-lg">
                        AxLiner separates the work into focused stages: clean the image, locate the table, read the handwriting, rebuild the rows, then package the result as an editable workbook. That keeps the experience predictable when a file is crooked, crowded, photographed from a phone, or mixed with notes and totals.
                      </p>

                      <p className="text-[#1f2937] font-medium leading-8 text-base sm:text-lg">
                        The engine is tuned for batch jobs where every page needs the same level of structure. Instead of returning a wall of extracted text, it preserves the relationships that matter in Excel: headers, columns, repeated rows, numeric values, and the original reading order.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                      <div className="flex items-start gap-3 rounded-2xl border border-[#A78BFA]/35 bg-[#fbfdfc]/80 p-4 transition duration-300 hover:-translate-y-1 hover:border-[#F97316]/50 hover:shadow-lg">
                        <span className="mt-0.5 h-2 w-8 flex-shrink-0 rounded-full bg-[#F97316]" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">Image cleanup</p>
                          <p className="text-sm text-muted-foreground font-medium">Rotation, contrast, and page noise are normalized before extraction.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-2xl border border-[#A78BFA]/35 bg-[#fbfdfc]/80 p-4 transition duration-300 hover:-translate-y-1 hover:border-[#F97316]/50 hover:shadow-lg">
                        <span className="mt-0.5 h-2 w-8 flex-shrink-0 rounded-full bg-[#F97316]" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">Handwriting read</p>
                          <p className="text-sm text-muted-foreground font-medium">Letters, numbers, and totals stay connected to their table context.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-2xl border border-[#A78BFA]/35 bg-[#fbfdfc]/80 p-4 transition duration-300 hover:-translate-y-1 hover:border-[#F97316]/50 hover:shadow-lg">
                        <span className="mt-0.5 h-2 w-8 flex-shrink-0 rounded-full bg-[#F97316]" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">Table rebuild</p>
                          <p className="text-sm text-muted-foreground font-medium">Cells are mapped back into rows and columns instead of plain text.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-2xl border border-[#A78BFA]/35 bg-[#fbfdfc]/80 p-4 transition duration-300 hover:-translate-y-1 hover:border-[#F97316]/50 hover:shadow-lg">
                        <span className="mt-0.5 h-2 w-8 flex-shrink-0 rounded-full bg-[#F97316]" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">Workbook export</p>
                          <p className="text-sm text-muted-foreground font-medium">The final XLSX is shaped for review, editing, and sharing.</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 rounded-3xl border border-[#4C1D95]/20 bg-[#2E145F] p-5 text-white shadow-2xl shadow-[#2E145F]/20">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FDBA74]">Extraction plan</p>
                      <p className="mt-2 text-lg font-bold">Messy page in, structured spreadsheet out</p>
                      <div className="mt-5 grid gap-2 sm:grid-cols-3">
                        {["headers", "rows", "totals"].map((item) => (
                          <div key={item} className="rounded-xl bg-white/10 px-3 py-2 text-center text-sm font-semibold">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Export Quality */}
                <Card className="overflow-hidden border border-[#A78BFA]/35 bg-white/55 shadow-xl shadow-[#A78BFA]/10 backdrop-blur-md" data-animate="stagger">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F97316]/12 text-sm font-black text-[#C2410C] ring-1 ring-[#F97316]/25">02</span>
                      <CardTitle className="text-2xl">Quality control before export</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-[#1f2937] font-medium leading-8 text-base sm:text-lg">
                        AxLiner treats export quality as part of the engine, not a final download button. Before a workbook is returned, the output is checked for row continuity, empty columns, mismatched totals, and values that are likely to have been read from the wrong cell.
                      </p>
                    </div>

                    <div className="grid gap-3">
                      {[
                        ["Input", "crooked invoice photo"],
                        ["Structure", "detected columns and repeated rows"],
                        ["Output", "editable XLSX with clean sheet names"],
                      ].map(([label, value]) => (
                        <div key={label} className="grid grid-cols-[110px_1fr] items-center rounded-2xl border border-[#A78BFA]/25 bg-[#fbfdfc]/80 px-4 py-3">
                          <span className="text-xs font-black uppercase tracking-[0.18em] text-[#C2410C]">{label}</span>
                          <span className="text-sm font-semibold text-foreground">{value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-[#A78BFA]/40 mt-6 bg-white/70">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border/50 bg-[#F5EEFF]/70">
                            <th className="text-left p-3 font-medium">Check</th>
                            <th className="text-right p-3 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-border/50">
                            <td className="p-3 text-muted-foreground">Column count</td>
                            <td className="p-3 text-right font-semibold text-primary">matched</td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="p-3 text-muted-foreground">Numeric fields</td>
                            <td className="p-3 text-right font-semibold text-primary">verified</td>
                          </tr>
                          <tr>
                            <td className="p-3 text-muted-foreground">Workbook format</td>
                            <td className="p-3 text-right font-semibold text-primary">ready</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      The result is a file that feels closer to a finished spreadsheet than a raw OCR dump.
                    </p>
                  </CardContent>
                </Card>
                </div>

                <div className="relative min-h-[520px] overflow-hidden rounded-l-[2rem] border border-[#A78BFA]/40 shadow-xl shadow-[#A78BFA]/10 lg:min-h-[760px]" data-animate="stagger">
                  <Image
                    src="/purchase.webp"
                    alt="Professionals reviewing documents"
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
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
              backgroundColor: "#E9ECE4",
              boxShadow: "0 -24px 60px rgba(47, 22, 94, 0.08)",
              clipPath:
                "polygon(0 4%, 12% 2.8%, 25% 4.6%, 40% 2.4%, 58% 4.3%, 75% 2.7%, 100% 4%, 100% 100%, 0 100%)",
            }}
          />
          <div className="container relative z-10 mx-auto max-w-[1540px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[minmax(420px,0.88fr)_minmax(520px,1.12fr)] lg:items-center">
              <div data-animate="headline">
                <p className="text-xl font-medium text-black">Security & Compliance</p>
                <h2 className="mt-6 max-w-2xl text-4xl font-bold leading-tight text-[#11182f] sm:text-5xl lg:text-6xl">
                  Your Data Security Guaranteed
                </h2>

                <div className="mt-10 max-w-[620px] overflow-hidden rounded-[10px] shadow-[0_24px_56px_rgba(17,24,47,0.12)]">
                    <Image
                      src="/secu.webp"
                      alt="Secure digital document processing"
                      width={760}
                      height={420}
                      sizes="(min-width: 1024px) 40vw, 100vw"
                      className="h-[240px] w-full object-cover object-center sm:h-[280px] lg:h-[300px]"
                    />
                </div>
              </div>

              <div className="lg:pt-12" data-animate="stagger">
                <p className="max-w-3xl text-2xl leading-10 text-[#11182f]">
                  At AxLiner, your data is treated with utmost care. We build around global data protection expectations and international privacy requirements for document processing workflows.
                </p>

                <div className="mt-10 space-y-7">
                  {[
                    "ISO 27001-aligned security controls",
                    "Built for GDPR, SOC 2, CCPA and HIPAA-conscious workflows",
                    "Secure infrastructure across Supabase, Fly.io and Vercel",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-4 text-xl text-[#11182f]">
                      <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[#2815FF] text-[#2815FF]">
                        <span className="h-2.5 w-1.5 rotate-45 border-b-2 border-r-2 border-current" />
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="mt-12 rounded-full bg-[#E4E8FA] px-8 py-6 text-lg font-bold text-[#11182f] shadow-none hover:bg-[#d9def4]"
                  asChild
                >
                  <NextLink href="/privacy-policy">More Information</NextLink>
                </Button>
              </div>
            </div>

            <div className="mx-auto mt-24 max-w-[1160px] text-center lg:mt-28" data-animate="headline">
              <h3 className="text-4xl font-bold leading-tight text-[#11182f] sm:text-5xl lg:text-[4.25rem]">
                Frequently Asked Questions
              </h3>
            </div>

            <div className="mx-auto mt-14 max-w-[928px] border-y border-[#11182f]/20 text-left" data-animate="stagger">
              {faqItems.map((item, index) => (
                <details
                  key={item.question}
                  className="group border-b border-[#11182f]/20 last:border-b-0"
                  open={index === 0}
                >
                  <summary className="flex min-h-[78px] cursor-pointer list-none items-center justify-between gap-6 py-5 text-xl font-semibold text-[#11182f] [&::-webkit-details-marker]:hidden">
                    <span>{item.question}</span>
                    <span className="relative h-6 w-6 shrink-0">
                      <span className="absolute left-1/2 top-1/2 h-[2px] w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#11182f]" />
                      <span className="absolute left-1/2 top-1/2 h-5 w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#11182f] transition-opacity duration-200 group-open:opacity-0" />
                    </span>
                  </summary>
                  <div className="pb-9 pr-10">
                    <p className="text-base leading-8 text-[#11182f]/78">{item.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </ScrollAnimatedSection>
        {/* Final CTA Section */}
        <section className="relative z-10 overflow-hidden py-24">
          <div className="grid w-full items-start gap-10 pr-4 sm:pr-6 lg:grid-cols-[minmax(620px,1.18fr)_minmax(420px,0.82fr)] lg:gap-14 lg:pr-12 xl:pr-20">
            <div className="relative min-h-[340px] w-full overflow-hidden sm:min-h-[430px] lg:min-h-[560px]">
              <Image
                src="/cta-team.webp"
                alt="Team collaborating around laptops"
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="absolute inset-0 h-full w-full object-cover object-center lg:rounded-r-[2rem]"
              />
            </div>

            {/* CTA Content */}
            <div className="flex min-h-[560px] max-w-3xl flex-col text-center lg:text-left">
              <div className="inline-flex w-fit items-center gap-2 self-center rounded-full border border-white/45 bg-white/45 px-4 py-2 shadow-lg shadow-[#A78BFA]/10 backdrop-blur-2xl lg:self-start mb-14">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                  Ready to Transform Your Workflow?
                </h2>
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                Join thousands of professionals who have already revolutionized their data extraction process with AxLiner.
              </p>
              
              {/* Single Primary CTA */}
              <div className="mt-24 flex justify-center">
                {isAuthenticated ? (
                  <Button
                    size="lg"
                    className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-all duration-200 shadow-lg shadow-primary/20"
                    asChild
                  >
                    <NextLink href="/dashboard">Go to Dashboard</NextLink>
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-all duration-200 shadow-lg shadow-primary/20"
                    onClick={() => openSignInModal("/pricing?from=signup")}
                  >
                    Try for free
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="backdrop-blur-md relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-2xl font-bold text-foreground mb-4">AxLiner</div>
              <p className="text-muted-foreground mb-4">
                Transform screenshots to spreadsheets effortlessly with AI-powered OCR technology.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground hover:text-primary transition-colors">Why Choose Us</a></li>
                <li><a href="#trusted" className="hover:text-foreground hover:text-primary transition-colors">Trusted By</a></li>
                <li><a href="/pricing" className="hover:text-foreground hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#benchmarks" className="hover:text-foreground hover:text-primary transition-colors">Performance Benchmarks</a></li>
                <li><a href="#how-it-works" className="hover:text-foreground hover:text-primary transition-colors">How It Works</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Contact</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="mailto:axliner.excel@gmail.com" className="hover:text-foreground hover:text-primary transition-colors">axliner.excel@gmail.com</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center items-center mt-8">
            <p className="text-muted-foreground text-sm">
              © 2025 AxLiner. All rights reserved.
            </p>
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
    </div>
  )}
