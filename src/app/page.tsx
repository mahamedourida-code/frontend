"use client"

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/MobileNav";
import ScrollAnimatedSection from "@/components/ScrollAnimatedSection";
import { cn } from "@/lib/utils";
import { AppLogo } from "@/components/AppIcon";
import { ComparisonSlider } from "@/components/ComparisonSlider";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Camera, FileSpreadsheet, Zap, Shield, Clock, Users, Star, CheckCircle, Layers, FileText, PenTool, FileInput, DollarSign, Database, Upload, ArrowRight, Sparkles, TrendingUp, Award, Target, Wand2, Sparkle, Trophy } from "lucide-react";
import { ActiveUsersCounter } from "@/components/ActiveUsersCounter";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const headerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Header animation
    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        { y: -100, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 1,
          ease: "power3.out",
          delay: 0.2
        }
      );
    }

    // Hero content animation
    if (heroContentRef.current) {
      const elements = heroContentRef.current.children;
      gsap.fromTo(elements,
        { 
          y: 50, 
          opacity: 0,
          scale: 0.95
        },
        { 
          y: 0, 
          opacity: 1,
          scale: 1,
          duration: 1.2,
          stagger: 0.5,
          ease: "power3.out",
          delay: 0.5
        }
      );
    }

    // Hero image animation with enhanced effects
    if (heroImageRef.current) {
      // Main container animation
      gsap.fromTo(heroImageRef.current,
        { 
          x: 100, 
          opacity: 0,
          scale: 0.85,
          rotateY: -15,
          rotateX: 5
        },
        { 
          x: 0, 
          opacity: 1,
          scale: 1,
          rotateY: 0,
          rotateX: 0,
          duration: 1.8,
          ease: "power4.out",
          delay: 0.8
        }
      );

      // Enhanced floating animation with subtle 3D effect
      gsap.to(heroImageRef.current, {
        y: -15,
        rotateY: 2,
        rotateX: -1,
        duration: 3,
        ease: "power1.inOut",
        yoyo: true,
        repeat: -1,
        delay: 2
      });
    }

    // Removed section animations per user request
    // Removed comparison section animation per user request



    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Smooth scroll function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background relative" style={{ backgroundColor: '#ffffff' }}>
      {/* Navigation Bar */}
      <nav ref={headerRef} className="fixed top-0 left-0 right-0 z-50 pt-3 lg:pt-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-white rounded-[35px] border-2 border-primary shadow-lg shadow-primary/10 backdrop-blur-md p-2 lg:p-3 flex items-center justify-between">
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
                      <div className="grid gap-6 p-8 w-[650px] lg:w-[750px] grid-cols-2">
                        <div className="space-y-5">
                          <h4 className="text-sm font-semibold text-foreground mb-4 tracking-wide uppercase">BY DOCUMENT TYPE</h4>
                          <NavigationMenuLink asChild>
                            <a
                              href="/solutions/handwritten-tables"
                              className="block select-none space-y-2 rounded-lg p-4 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground border border-transparent hover:border-accent"
                            >
                              <div className="flex items-center gap-3">
                                <PenTool className="w-5 h-5 text-primary" />
                                <div className="text-base font-semibold leading-none">Handwritten Tables</div>
                              </div>
                              <p className="text-sm leading-relaxed text-muted-foreground mt-2">
                                Transform handwritten tables into precise Excel spreadsheets with AI-powered recognition
                              </p>
                            </a>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <a
                              href="/solutions/paper-forms"
                              className="block select-none space-y-2 rounded-lg p-4 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground border border-transparent hover:border-accent"
                            >
                              <div className="flex items-center gap-3">
                                <FileInput className="w-5 h-5 text-primary" />
                                <div className="text-base font-semibold leading-none">Paper Forms Automation</div>
                              </div>
                              <p className="text-sm leading-relaxed text-muted-foreground mt-2">
                                Digitize secretary paperwork and manual forms to CSV with intelligent field recognition
                              </p>
                            </a>
                          </NavigationMenuLink>
                        </div>
                        <div className="space-y-5">
                          <h4 className="text-sm font-semibold text-foreground mb-4 tracking-wide uppercase">USE CASES</h4>
                          <NavigationMenuLink asChild>
                            <a
                              href="/solutions/financial-documents"
                              className="block select-none space-y-2 rounded-lg p-4 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground border border-transparent hover:border-accent"
                            >
                              <div className="flex items-center gap-3">
                                <DollarSign className="w-5 h-5 text-primary" />
                                <div className="text-base font-semibold leading-none">Financial Documents</div>
                              </div>
                              <p className="text-sm leading-relaxed text-muted-foreground mt-2">
                                Process invoices, receipts, and expense reports to XLSX with accurate financial data extraction
                              </p>
                            </a>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <a
                              href="/solutions/data-entry"
                              className="block select-none space-y-2 rounded-lg p-4 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground border border-transparent hover:border-accent"
                            >
                              <div className="flex items-center gap-3">
                                <Database className="w-5 h-5 text-primary" />
                                <div className="text-base font-semibold leading-none">Data Entry Automation</div>
                              </div>
                              <p className="text-sm leading-relaxed text-muted-foreground mt-2">
                                Eliminate manual typing with automated Excel conversion and smart data validation
                              </p>
                            </a>
                          </NavigationMenuLink>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* Pricing Link - Hidden */}
                  {/* <NavigationMenuItem>
                    <NavigationMenuLink
                      href="/pricing"
                      className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-accent/50 transition-colors")}
                    >
                      Pricing
                    </NavigationMenuLink>
                  </NavigationMenuItem> */}

                  {/* How Exceletto's Built */}
                  <NavigationMenuItem>
                    <button
                      className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-accent/50 transition-colors text-black dark:text-white")}
                      onClick={() => scrollToSection('ai-engine')}
                    >
                      How Exceletto's Built
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

            {/* Sign In Button - Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              <Button
                variant="outline"
                className="bg-white/90 dark:bg-white/20 text-foreground border-[1.6px] border-foreground/30 rounded-full px-4 py-2 text-sm font-medium hover:bg-white dark:hover:bg-white/30 transition-colors backdrop-blur-sm"
                onClick={() => window.location.href = '/sign-in'}
              >
                Sign in
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10">
        <section ref={heroRef} className="min-h-screen flex items-center justify-center relative overflow-hidden pt-24 lg:pt-20">

          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-[6fr_7fr] gap-8 sm:gap-12 lg:gap-12 items-center">
              {/* Left Content */}
              <div ref={heroContentRef} className="max-w-xl -mt-4 lg:-mt-8">
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white dark:bg-white border-2 border-primary mb-3 sm:mb-5 shadow-lg shadow-primary/10">
                  <span className="text-xs sm:text-sm font-semibold text-foreground">Exceletto-7B Handwritten Specialist</span>
                </div>
                <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-normal text-black dark:text-white leading-[1.1] tracking-tight">
                  Convert <span className="text-primary font-bold">Screenshots</span> to <span className="text-primary font-bold">Excel</span> instantly
                </h1>
                <p className="mt-3 sm:mt-5 text-sm sm:text-lg text-muted-foreground max-w-lg leading-relaxed">
                  Extract up to 100 table images in one click with our specialized 7B parameter model fine-tuned for handwritten text recognition.
                </p>
                <div className="mt-6 sm:mt-8 md:mt-10">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    onClick={() => window.location.href = '/sign-in'}
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Try for free
                  </Button>
                </div>

                {/* User Count Section */}
                <div className="mt-6 sm:mt-8 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <img
                        key={i}
                        src={`/avatars/${i}.webp`}
                        alt={`User ${i + 1}`}
                        className="w-10 h-10 rounded-full border-2 border-background object-cover"
                      />
                    ))}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">Join 1,260+ users</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Converting tables daily</p>
                  </div>
                </div>
              </div>

              {/* Right Visual - Ultra Minimal Professional Comparison */}
              <div ref={heroImageRef} className="relative group scale-80 lg:scale-90 mt-4">
                {/* Animated corner frames */}
                <div className="absolute -inset-[1px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {/* Top left */}
                  <div className="absolute top-0 left-0 w-16 h-16">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-white/60 to-transparent" />
                    <div className="absolute top-0 left-0 h-full w-[1px] bg-gradient-to-b from-white/60 to-transparent" />
                  </div>
                  {/* Top right */}
                  <div className="absolute top-0 right-0 w-16 h-16">
                    <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-white/60 to-transparent" />
                    <div className="absolute top-0 right-0 h-full w-[1px] bg-gradient-to-b from-white/60 to-transparent" />
                  </div>
                  {/* Bottom left */}
                  <div className="absolute bottom-0 left-0 w-16 h-16">
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-white/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 h-full w-[1px] bg-gradient-to-t from-white/60 to-transparent" />
                  </div>
                  {/* Bottom right */}
                  <div className="absolute bottom-0 right-0 w-16 h-16">
                    <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-l from-white/60 to-transparent" />
                    <div className="absolute bottom-0 right-0 h-full w-[1px] bg-gradient-to-t from-white/60 to-transparent" />
                  </div>
                </div>
                
                {/* Main comparison container - Reduced size */}
                <div className="relative w-full max-w-[650px]">
                  <div className="relative h-[240px] sm:h-[300px] lg:h-[450px] w-full rounded-xl overflow-hidden bg-white border-2 border-gray-200">
                    <ComparisonSlider
                      leftLabel=""
                      rightLabel="" 
                      leftContent={
                        <div className="relative w-full h-full">
                          <img 
                            src="/rtt.png" 
                            alt="Handwritten table before processing"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      }
                      rightContent={
                        <div className="relative w-full h-full">
                          <img 
                            src="/rt.jpg" 
                            alt="Excel output after processing"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      }
                    />
                    
                    {/* Status bar - Solid and Clear */}
                    <div className="absolute bottom-0 left-0 right-0 h-10 bg-black/90 border-t border-white/10">
                      <div className="flex items-center justify-between h-full px-6">
                        <div className="flex items-center gap-4">
                          <div className="flex gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50" />
                            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse animation-delay-200 shadow-lg shadow-yellow-400/50" />
                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse animation-delay-500 shadow-lg shadow-blue-400/50" />
                          </div>
                          <span className="text-xs uppercase tracking-wider text-white/90 font-mono flex items-center gap-2">
                            <Sparkles className="h-3 w-3 text-blue-400" />
                            AI Processing Engine
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="bg-amber-700/20 text-amber-700 border-amber-700/30 text-[10px] px-2 py-0.5">
                            99.5% Accuracy
                          </Badge>
                          <div className="w-px h-4 bg-white/20" />
                          <span className="text-xs text-white/70 font-mono">OCR v2.0</span>
                          <div className="w-px h-4 bg-white/20" />
                          <span className="text-xs text-green-400 font-mono flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            LIVE
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <ScrollAnimatedSection id="features" className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12" data-animate="headline">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-white border-2 border-primary mb-4 shadow-lg shadow-primary/10">
                <h2 className="text-lg sm:text-xl font-bold text-foreground">
                  Specialized Solutions
                </h2>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 max-w-5xl mx-auto justify-center">
              <Card data-animate="stagger" className="flex-1 bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center">
                  <PenTool className="w-12 h-12 text-primary mx-auto mb-4 stroke-[1.5]" />
                  <CardTitle className="text-xl mb-2">Handwritten Tables</CardTitle>
                  <CardDescription className="text-base">
                    <span className="font-semibold text-amber-700">99.5% accuracy</span> on handwritten tables - industry-leading performance with our specialized model
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card data-animate="stagger" className="flex-1 bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center">
                  <FileText className="w-12 h-12 text-primary mx-auto mb-4 stroke-[1.5]" />
                  <CardTitle className="text-xl mb-2">Paper Forms Automation</CardTitle>
                  <CardDescription className="text-base">
                    Digitize secretary paperwork and manual forms to CSV with intelligent field recognition
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card data-animate="stagger" className="flex-1 bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center">
                  <FileSpreadsheet className="w-12 h-12 text-primary mx-auto mb-4 stroke-[1.5]" />
                  <CardTitle className="text-xl mb-2">Financial Documents</CardTitle>
                  <CardDescription className="text-base">
                    Process invoices, receipts, and expense reports to XLSX with accurate financial data extraction
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </ScrollAnimatedSection>

        {/* Companies Section - Trusted By */}
        <ScrollAnimatedSection id="trusted" className="py-12 relative z-10 overflow-hidden">
          <div className="relative z-10 text-center mb-8" data-animate="headline">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-white border-2 border-primary mb-4 shadow-lg shadow-primary/10">
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
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
              {/* Create multiple sets for truly seamless infinite loop */}
              {Array.from({ length: 10 }, (_, setIndex) =>
                [1, 2, 3, 4, 5, 6, 7, 8, 9].map((imgNum) => (
                  <Card
                    key={`${setIndex}-${imgNum}`}
                    className="flex-shrink-0 bg-white dark:bg-white border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-md w-[120px] h-[80px]"
                  >
                    <CardContent className="p-2 flex items-center justify-center w-full h-full">
                      <img
                        src={`/${imgNum}.jpeg`}
                        alt={`Company ${imgNum}`}
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
        </ScrollAnimatedSection>

        {/* Transformation Section */}
        <section className="py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-white border-2 border-primary mb-4 shadow-lg shadow-primary/10">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                    See the Transformation
                  </h2>
                </div>
              </div>

              {/* Transformation Rows */}
              <div className="space-y-16">
                {/* Row 1: Handwritten Tables */}
                <div className="flex items-center justify-center gap-2">
                  <div className="w-[1050px] h-[500px] rounded-2xl overflow-hidden border-2 border-[#1a742e] shadow-2xl">
                    <img src="/ee.png" alt="Handwritten table" className="w-full h-full object-contain" />
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <svg width="80" height="80" viewBox="0 0 80 80" className="flex-shrink-0">
                      <defs>
                        <marker id="arrowhead1" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                          <polygon points="0 0, 10 3, 0 6" fill="#1a742e" />
                        </marker>
                      </defs>
                      <path
                        d="M 10 40 Q 40 15, 70 40"
                        stroke="#1a742e"
                        strokeWidth="2.5"
                        fill="none"
                        markerEnd="url(#arrowhead1)"
                      />
                    </svg>
                  </div>

                  <div className="w-[1050px] h-[500px] rounded-2xl overflow-hidden border-2 border-[#1a742e] shadow-2xl">
                    <img src="/e.jpg" alt="Excel spreadsheet" className="w-full h-full object-contain" />
                  </div>
                </div>

                {/* Row 2: Paper Forms */}
                <div className="flex items-center justify-center gap-2">
                  <div className="w-[1050px] h-[500px] rounded-2xl overflow-hidden border-2 border-[#1a742e] shadow-2xl">
                    <img src="/bb.png" alt="Paper form" className="w-full h-full object-contain" />
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <svg width="80" height="80" viewBox="0 0 80 80" className="flex-shrink-0">
                      <defs>
                        <marker id="arrowhead2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                          <polygon points="0 0, 10 3, 0 6" fill="#1a742e" />
                        </marker>
                      </defs>
                      <path
                        d="M 10 40 Q 40 65, 70 40"
                        stroke="#1a742e"
                        strokeWidth="2.5"
                        fill="none"
                        markerEnd="url(#arrowhead2)"
                      />
                    </svg>
                  </div>

                  <div className="w-[1050px] h-[500px] rounded-2xl overflow-hidden border-2 border-[#1a742e] shadow-2xl">
                    <img src="/b.jpeg" alt="Digital data" className="w-full h-full object-contain" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* AI Engine Section */}
        <ScrollAnimatedSection id="ai-engine" className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16" data-animate="headline">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-white border-2 border-primary mb-4 shadow-lg shadow-primary/10">
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">
                    How Exceletto's Engine Is Built
                  </h2>
                </div>

                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  A transparent look at our instruction fine-tuning methodology, system prompts, and the engineering decisions that power industry-leading OCR accuracy.
                </p>
              </div>

              {/* Main Content */}
              <div className="space-y-12">
                {/* Instruction Fine-Tuning */}
                <Card className="border-2 border-primary shadow-lg" data-animate="stagger">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Layers className="w-6 h-6 text-primary" />
                      <CardTitle className="text-2xl">Instruction Fine-Tuning on Llama 3</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-black font-semibold leading-relaxed">
                        To evaluate the generalization capabilities of Exceletto, we fine-tuned the Llama 3 base model on instruction datasets publicly available on the Hugging Face repository. <span className="font-semibold text-foreground">No proprietary data or training tricks were utilized</span> – our approach demonstrates that with careful instruction tuning, open-source models can achieve exceptional performance on document understanding tasks.
                      </p>

                      <p className="text-black font-semibold leading-relaxed">
                        The resulting model, <span className="font-semibold text-primary">Exceletto OCR Engine</span>, is a simple yet powerful demonstration that base language models can be fine-tuned to excel at specialized tasks. Our fine-tuning process focused on:
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-700/10 border-2 border-amber-700">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">Document Structure Understanding</p>
                          <p className="text-sm text-black font-semibold">Training on table layouts, form structures, and hierarchical document organization</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-700/10 border-2 border-amber-700">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">Handwriting Recognition</p>
                          <p className="text-sm text-black font-semibold">Extensive exposure to varied handwriting styles and degraded document quality</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-700/10 border-2 border-amber-700">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">Context Preservation</p>
                          <p className="text-sm text-black font-semibold">Maintaining relationships between cells, columns, and semantic meaning</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-700/10 border-2 border-amber-700">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">Multi-Language Support</p>
                          <p className="text-sm text-black font-semibold">Fine-tuned on 7+ languages including complex scripts like Arabic and Chinese</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-primary/5 rounded-lg border-2 border-primary">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">Benchmark Result:</span> In independent evaluations on MT-Bench, Exceletto achieved a score of <span className="font-semibold text-primary">7.2</span>, outperforming Llama 3 13B (6.65) despite using a more efficient 7B parameter architecture.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* System Prompts & Guardrails */}
                <Card className="border-2 border-primary shadow-lg" data-animate="stagger">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="w-6 h-6 text-primary" />
                      <CardTitle className="text-2xl">System Prompts for Output Quality</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-black font-semibold leading-relaxed">
                        We introduce carefully crafted system prompts to guide the model in generating high-quality, safe outputs within specified guardrails. This approach allows users to move along the Pareto front of <span className="font-semibold text-foreground">model utility versus guardrails enforcement</span>.
                      </p>
                    </div>

                    <div className="p-5 bg-muted/50 rounded-lg border-2 border-primary font-mono text-sm">
                      <p className="text-foreground leading-relaxed italic">
                        "Always assist with care, respect, and truth. Respond with utmost utility yet securely. Avoid harmful, unethical, prejudiced, or negative content. Ensure replies promote fairness and positivity."
                      </p>
                    </div>

                    <div className="overflow-hidden rounded-lg border-2 border-primary mt-6">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border/50 bg-muted/30">
                            <th className="text-left p-3 font-medium">Configuration</th>
                            <th className="text-right p-3 font-medium">MT-Bench Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-border/50">
                            <td className="p-3 text-muted-foreground">No system prompt</td>
                            <td className="p-3 text-right font-semibold">6.84 ± 0.07</td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="p-3 text-muted-foreground">Llama 3 system prompt</td>
                            <td className="p-3 text-right">6.38 ± 0.07</td>
                          </tr>
                          <tr>
                            <td className="p-3 text-primary font-medium">Exceletto system prompt</td>
                            <td className="p-3 text-right font-semibold text-primary">6.58 ± 0.05</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Our optimized system prompt maintains strong performance while ensuring <span className="font-semibold text-foreground">100% rejection rate</span> on harmful questions from a curated test set of 175 unsafe prompts.
                    </p>
                  </CardContent>
                </Card>

                {/* Content Moderation */}
                <Card className="border-2 border-primary shadow-lg" data-animate="stagger">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="w-6 h-6 text-primary" />
                      <CardTitle className="text-2xl">Content Moderation with Self-Reflection</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-black font-semibold leading-relaxed">
                        Exceletto can be used as a content moderator: the model itself is able to accurately classify user prompts or generated answers as either acceptable or falling into restricted categories through a self-reflection mechanism.
                      </p>
                    </div>

                    <div className="mt-6 p-5 bg-amber-700/10 rounded-lg border-2 border-amber-700">
                      <div className="flex items-start gap-3">
                        <Award className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground mb-2">Self-Reflection Performance</p>
                          <p className="text-sm text-black font-semibold mb-3">
                            Evaluated on a manually curated and balanced dataset of adversarial and standard prompts:
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-background rounded-lg border-2 border-primary">
                              <p className="text-2xl font-bold text-amber-700">99.4%</p>
                              <p className="text-xs text-muted-foreground mt-1">Precision</p>
                            </div>
                            <div className="text-center p-3 bg-background rounded-lg border-2 border-primary">
                              <p className="text-2xl font-bold text-amber-700">95.6%</p>
                              <p className="text-xs text-muted-foreground mt-1">Recall</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Use cases include moderating user-submitted content, brand monitoring, and ensuring compliance in regulated industries. End users can select which categories to filter based on their specific requirements.
                    </p>
                  </CardContent>
                </Card>

              </div>

              {/* Footer Note */}
              <div className="mt-12 text-center" data-animate="stagger">
                <p className="text-sm text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                  <span className="font-semibold text-foreground">Transparency & Reproducibility:</span> Our fine-tuning methodology uses publicly available datasets and standard transformer architectures. We believe in open, reproducible AI research – no proprietary tricks, just thoughtful engineering and domain-specific optimization for document understanding tasks.
                </p>
              </div>
            </div>
          </div>
        </ScrollAnimatedSection>

        {/* Benchmark Section */}
        <ScrollAnimatedSection id="benchmarks" className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12" data-animate="headline">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-white border-2 border-primary mb-4 shadow-lg shadow-primary/10">
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">
                    Industry-Leading OCR Accuracy
                  </h2>
                </div>

                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Benchmarked against major cloud providers on real-world handwritten documents and complex table structures.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Accuracy Chart */}
                <Card className="border-2 border-primary shadow-lg" data-animate="stagger">
  <CardHeader className="pb-3">
    <CardTitle className="text-lg font-semibold">
      Handwritten Text Recognition Accuracy
    </CardTitle>
    <p className="text-sm text-muted-foreground">
      Based on 10,000+ real-world samples
    </p>
  </CardHeader>

  <CardContent>
    <ChartContainer
      config={{
        accuracy: {
          label: "Accuracy",
          color: "hsl(var(--primary))",
        },
      }}
      className="h-[300px] w-full"
    >
      <BarChart
        data={[
          { provider: "Exceletto", accuracy: 96.8 },
          { provider: "AWS Textract", accuracy: 77.2 },
          { provider: "Google Vision", accuracy: 54.5 },
          { provider: "Azure Vision", accuracy: 51.7 },
        ]}
        margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="provider"
          tickLine={false}
          axisLine={true}
          tickMargin={10}
          angle={0}
          textAnchor="middle"
        />
        <YAxis
          tickLine={false}
          axisLine={true}
          tickMargin={10}
          domain={[0, 100]}
          ticks={[0, 20, 40, 60, 80, 100]}
          label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft' }}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar
          dataKey="accuracy"
          fill="rgb(180 83 9)"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ChartContainer>

    {/* Footer */}
    <div className="mt-6 pt-4 border-t border-border/50">
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <CheckCircle className="w-4 h-4 text-primary" />
        <span>Tested on IAM Handwriting Database v3.0</span>
      </div>
    </div>
  </CardContent>
</Card>


                {/* Performance Metrics Table */}
                <Card className="border-2 border-primary shadow-lg" data-animate="stagger">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold">Comprehensive Performance Metrics</CardTitle>
                    <p className="text-sm text-muted-foreground">Average across all test scenarios</p>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-hidden rounded-lg border-2 border-primary">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border/50 bg-muted/30">
                            <th className="text-left p-3 font-medium">Metric</th>
                            <th className="text-right p-3 font-medium text-primary">Exceletto</th>
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
                            <td className="p-3 text-right font-semibold text-amber-700">99.5%</td>
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

              {/* Key Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/30 border-2 border-primary" data-animate="stagger">
                  <div className="text-2xl font-bold text-amber-700 mb-1">7+ Languages</div>
                  <p className="text-sm text-muted-foreground">Multi-language support including complex scripts</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30 border-2 border-primary" data-animate="stagger">
                  <div className="text-2xl font-bold text-amber-700 mb-1">99.9% Uptime</div>
                  <p className="text-sm text-muted-foreground">Enterprise-grade reliability and availability</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30 border-2 border-primary" data-animate="stagger">
                  <div className="text-2xl font-bold text-amber-700 mb-1">GDPR Compliant</div>
                  <p className="text-sm text-muted-foreground">Data privacy and security certified</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollAnimatedSection>

        {/* Final CTA Section */}
        <section className="py-24 relative z-10 overflow-hidden">

          <div className="container mx-auto px-1 sm:px-3 lg:px-4 text-center relative z-10">
            {/* CTA Content */}
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-white border-2 border-primary mb-4 shadow-lg shadow-primary/10">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                  Ready to Transform Your Workflow?
                </h2>
              </div>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of professionals who have already revolutionized their data extraction process with Exceletto.
              </p>
              
              {/* Single Primary CTA */}
              <div className="flex justify-center">
                <Button
                  size="lg"
                  className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-all duration-200 shadow-lg shadow-primary/20"
                  onClick={() => window.location.href = '/sign-in'}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Try for free
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-12 pt-12">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Free trial for 7 days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="backdrop-blur-md relative z-10">
        <div className="container mx-auto px-1 sm:px-3 lg:px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-2xl font-bold text-foreground mb-4">Exceletto</div>
              <p className="text-muted-foreground mb-4">
                Transform screenshots to spreadsheets effortlessly with AI-powered OCR technology.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground hover:text-primary transition-colors">Why Choose Us</a></li>
                <li><a href="#trusted" className="hover:text-foreground hover:text-primary transition-colors">Trusted By</a></li>
                <li><a href="#benchmarks" className="hover:text-foreground hover:text-primary transition-colors">Performance Benchmarks</a></li>
                <li><a href="#how-it-works" className="hover:text-foreground hover:text-primary transition-colors">How It Works</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Contact</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="mailto:excelettoo@gmail.com" className="hover:text-foreground hover:text-primary transition-colors">excelettoo@gmail.com</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center items-center mt-8">
            <p className="text-muted-foreground text-sm">
              © 2024 Exceletto. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      
      {/* Mobile Navigation */}
      <MobileNav onSectionClick={scrollToSection} />
    </div>
  );
}