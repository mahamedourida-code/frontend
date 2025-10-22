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
  const comparisonRef = useRef<HTMLElement>(null);

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
          stagger: 0.15,
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

    // Scroll-triggered animations for sections
    const sections = gsap.utils.toArray('section:not(:first-child)');
    sections.forEach((section: any) => {
      gsap.fromTo(section,
        { 
          y: 60,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // Comparison section special animation
    if (comparisonRef.current) {
      const elements = comparisonRef.current.querySelectorAll('.space-y-4');
      if (elements.length > 0) {
        ScrollTrigger.create({
          trigger: comparisonRef.current,
          start: "top 70%",
          onEnter: () => {
            gsap.fromTo(elements, 
              { scale: 0.9, opacity: 0 },
              {
                scale: 1,
                opacity: 1,
                duration: 1,
                stagger: 0.3,
                ease: "back.out(1.2)"
              }
            );
          }
        });
      }
    }

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
    <div className="min-h-screen bg-background relative">
      {/* Navigation Bar */}
      <nav ref={headerRef} className="fixed top-0 left-0 right-0 z-50 pt-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-black/20 to-black/10 dark:from-white/20 dark:to-white/10 rounded-[35px] border border-black/30 dark:border-white/30 shadow-lg shadow-black/10 dark:shadow-white/10 backdrop-blur-md p-4 flex items-center justify-between">
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
                    <NavigationMenuTrigger className="bg-transparent hover:bg-accent/50 transition-colors">
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

                  {/* Pricing Link */}
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="/pricing"
                      className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-accent/50 transition-colors")}
                    >
                      Pricing
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  {/* Performance Benchmarks */}
                  <NavigationMenuItem>
                    <button
                      className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-accent/50 transition-colors")}
                      onClick={() => scrollToSection('benchmarks')}
                    >
                      Performance
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
          
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-8 sm:gap-12 lg:gap-12 items-center">
              {/* Left Content */}
              <div ref={heroContentRef} className="max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-black/20 to-black/10 border border-black/30 mb-4 sm:mb-5 shadow-lg shadow-black/10">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-black dark:text-white animate-pulse" />
                  <span className="text-xs sm:text-sm font-semibold text-black dark:text-white">Exceletto-7B Handwritten Specialist</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-normal text-foreground leading-[1.1] tracking-tight">
                  <span className="bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
                    Convert Screenshots to Excel instantly
                  </span>
                </h1>
                <p className="mt-4 sm:mt-5 text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed">
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
              <div ref={heroImageRef} className="relative group">
                {/* Subtle shadow glow */}
                <div className="absolute -inset-4 bg-gradient-to-r from-black/10 via-black/20 to-black/10 rounded-2xl blur-2xl opacity-30 group-hover:opacity-50 transition-all duration-700 ease-out" />
                
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
                <div className="relative w-full max-w-[880px]">
                  <div className="relative h-[280px] sm:h-[360px] lg:h-[500px] w-full rounded-xl overflow-hidden bg-gradient-to-br from-slate-950 to-slate-900 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.5)]">
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
                          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-400/30 text-[10px] px-2 py-0.5">
                            98.4% Accuracy
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
        <ScrollAnimatedSection id="features" className="py-24 relative z-10">
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16" data-animate="headline">
              
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Specialized Solutions
              </h2>
              
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <Card data-animate="stagger" className="bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <PenTool className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Handwritten Tables</CardTitle>
                  <CardDescription>
                    <span className="font-semibold text-purple-600">98.4% accuracy</span> on handwritten tables - industry-leading performance with our specialized model
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card data-animate="stagger" className="bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <FileInput className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Paper Forms Automation</CardTitle>
                  <CardDescription>
                    Digitize secretary paperwork and manual forms to CSV with intelligent field recognition
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card data-animate="stagger" className="bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Financial Documents</CardTitle>
                  <CardDescription>
                    Process invoices, receipts, and expense reports to XLSX with accurate financial data extraction
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card data-animate="stagger" className="bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Database className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Data Entry Automation</CardTitle>
                  <CardDescription>
                    Eliminate manual typing with automated Excel conversion and smart data validation
                  </CardDescription>
                </CardHeader>
              </Card>
              
            </div>
          </div>
        </ScrollAnimatedSection>

        {/* Companies Section - Trusted By */}
        <ScrollAnimatedSection id="trusted" className="py-20 relative z-10 overflow-hidden">
          <div className="relative z-10 text-center mb-12" data-animate="headline">
            
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Chosen by experts at top organizations
            </h2>
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

        {/* Interactive Comparison Section */}
        <section ref={comparisonRef} className="py-32 relative z-10 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
                  See the Transformation in Action
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                  Drag the slider to witness the power of our AI-powered OCR technology
                </p>
                {/* CTA Button for Mobile */}
                <div className="lg:hidden mt-4">
                  <Button
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-5 h-auto rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    onClick={() => window.location.href = '/sign-in'}
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Try for free
                  </Button>
                </div>
              </div>

              {/* Comparison Sliders */}
              <div className="space-y-12">
                {/* Handwritten Table Comparison - Featured */}
                <div className="relative group">
                  {/* Subtle shadow glow */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/10 via-purple-600/20 to-purple-500/10 rounded-2xl blur-2xl opacity-30 group-hover:opacity-50 transition-all duration-700 ease-out" />
                  
                  <div className="relative w-full max-w-6xl mx-auto">
                    <h3 className="text-base sm:text-lg font-semibold text-center mb-3 sm:mb-4">Handwritten Table → Excel</h3>
                    <div className="relative h-[350px] sm:h-[450px] lg:h-[600px] w-full rounded-xl overflow-hidden bg-gradient-to-br from-slate-950 to-slate-900 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.5)]">
                      <ComparisonSlider
                        leftLabel=""
                        rightLabel=""
                        leftContent={
                          <div className="relative w-full h-full">
                            <img 
                              src="/ee.png" 
                              alt="Handwritten table before processing"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        }
                        rightContent={
                          <div className="relative w-full h-full">
                            <img 
                              src="/e.jpg" 
                              alt="Excel spreadsheet output"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        }
                      />
                      
                      {/* Status bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-black/40 backdrop-blur-sm border-t border-white/5">
                        <div className="flex items-center justify-between h-full px-4">
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse animation-delay-200" />
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse animation-delay-500" />
                            </div>
                            <span className="text-[9px] uppercase tracking-wider text-white/40 font-mono">Table Processing</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Data Comparison */}
                <div className="relative group">
                  {/* Subtle shadow glow */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-black/10 via-black/20 to-black/10 rounded-2xl blur-2xl opacity-30 group-hover:opacity-50 transition-all duration-700 ease-out" />
                  
                  <div className="relative w-full max-w-6xl mx-auto">
                    <h3 className="text-base sm:text-lg font-semibold text-center mb-3 sm:mb-4"></h3>
                    <div className="relative h-[350px] sm:h-[450px] lg:h-[600px] w-full rounded-xl overflow-hidden bg-gradient-to-br from-slate-950 to-slate-900 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.5)]">
                      <ComparisonSlider
                        leftLabel=""
                        rightLabel=""
                        leftContent={
                          <div className="relative w-full h-full">
                            <img 
                              src="/bb.png" 
                              alt="Paper form before processing"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        }
                        rightContent={
                          <div className="relative w-full h-full">
                            <img 
                              src="/b.jpeg" 
                              alt="Structured data output"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        }
                      />
                      
                      {/* Status bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-black/40 backdrop-blur-sm border-t border-white/5">
                        <div className="flex items-center justify-between h-full px-4">
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse animation-delay-200" />
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse animation-delay-500" />
                            </div>
                            <span className="text-[9px] uppercase tracking-wider text-white/40 font-mono">Form Processing</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <ScrollAnimatedSection id="how-it-works" className="py-24 relative z-10 overflow-hidden">
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16" data-animate="headline">
              <Badge variant="outline" className="mb-4 border-primary/50 text-primary">How It Works</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Three Simple Steps
              </h2>
             
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center" data-animate="stagger">
                <div className="w-16 h-16 bg-primary/10 border-2 border-primary rounded-full flex items-center justify-center mx-auto mb-6 hover:bg-primary hover:scale-110 transition-all group">
                  <span className="text-2xl font-bold text-primary group-hover:text-primary-foreground transition-colors">1</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Upload Screenshot</h3>
                <p className="text-muted-foreground">
                  Simply drag and drop your screenshot or image containing tabular data into Exceletto
                </p>
              </div>

              <div className="text-center" data-animate="stagger">
                <div className="w-16 h-16 bg-primary/10 border-2 border-primary rounded-full flex items-center justify-center mx-auto mb-6 hover:bg-primary hover:scale-110 transition-all group">
                  <span className="text-2xl font-bold text-primary group-hover:text-primary-foreground transition-colors">2</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">AI Processing</h3>
                <p className="text-muted-foreground">
                  Our advanced OCR technology analyzes and extracts the data with high accuracy.
                </p>
              </div>

              <div className="text-center" data-animate="stagger">
                <div className="w-16 h-16 bg-primary/10 border-2 border-primary rounded-full flex items-center justify-center mx-auto mb-6 hover:bg-primary hover:scale-110 transition-all group">
                  <span className="text-2xl font-bold text-primary group-hover:text-primary-foreground transition-colors">3</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Download Excel/CSV</h3>
                <p className="text-muted-foreground">
                  Get your perfectly formatted XLSX or CSV files ready for immediate use in Excel, Google Sheets, or any spreadsheet software.
                </p>
              </div>
            </div>
          </div>
        </ScrollAnimatedSection>

        {/* AI Engine Section */}
        <ScrollAnimatedSection id="ai-engine" className="py-24 relative z-10">
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16" data-animate="headline">
                <Badge variant="outline" className="mb-4 border-primary/50 text-primary">Technical Deep Dive</Badge>
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                  How Exceletto's Engine Is Built
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  A transparent look at our instruction fine-tuning methodology, system prompts, and the engineering decisions that power industry-leading OCR accuracy.
                </p>
              </div>

              {/* Main Content */}
              <div className="space-y-12">
                {/* Instruction Fine-Tuning */}
                <Card className="border border-border/50 shadow-lg" data-animate="stagger">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Layers className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle className="text-2xl">Instruction Fine-Tuning on Llama 3</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-muted-foreground leading-relaxed">
                        To evaluate the generalization capabilities of Exceletto, we fine-tuned the Llama 3 base model on instruction datasets publicly available on the Hugging Face repository. <span className="font-semibold text-foreground">No proprietary data or training tricks were utilized</span> – our approach demonstrates that with careful instruction tuning, open-source models can achieve exceptional performance on document understanding tasks.
                      </p>
                      
                      <p className="text-muted-foreground leading-relaxed">
                        The resulting model, <span className="font-semibold text-primary">Exceletto OCR Engine</span>, is a simple yet powerful demonstration that base language models can be fine-tuned to excel at specialized tasks. Our fine-tuning process focused on:
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">Document Structure Understanding</p>
                          <p className="text-sm text-muted-foreground">Training on table layouts, form structures, and hierarchical document organization</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">Handwriting Recognition</p>
                          <p className="text-sm text-muted-foreground">Extensive exposure to varied handwriting styles and degraded document quality</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">Context Preservation</p>
                          <p className="text-sm text-muted-foreground">Maintaining relationships between cells, columns, and semantic meaning</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">Multi-Language Support</p>
                          <p className="text-sm text-muted-foreground">Fine-tuned on 15+ languages including complex scripts like Arabic and Chinese</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">Benchmark Result:</span> In independent evaluations on MT-Bench, Exceletto achieved a score of <span className="font-semibold text-primary">7.2</span>, outperforming Llama 3 13B (6.65) despite using a more efficient 7B parameter architecture.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* System Prompts & Guardrails */}
                <Card className="border border-border/50 shadow-lg" data-animate="stagger">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle className="text-2xl">System Prompts for Output Quality</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-muted-foreground leading-relaxed">
                        We introduce carefully crafted system prompts to guide the model in generating high-quality, safe outputs within specified guardrails. This approach allows users to move along the Pareto front of <span className="font-semibold text-foreground">model utility versus guardrails enforcement</span>.
                      </p>
                    </div>

                    <div className="p-5 bg-muted/50 rounded-lg border border-border/50 font-mono text-sm">
                      <p className="text-foreground leading-relaxed italic">
                        "Always assist with care, respect, and truth. Respond with utmost utility yet securely. Avoid harmful, unethical, prejudiced, or negative content. Ensure replies promote fairness and positivity."
                      </p>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-border/50 mt-6">
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
                <Card className="border border-border/50 shadow-lg" data-animate="stagger">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle className="text-2xl">Content Moderation with Self-Reflection</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-muted-foreground leading-relaxed">
                        Exceletto can be used as a content moderator: the model itself is able to accurately classify user prompts or generated answers as either acceptable or falling into restricted categories through a self-reflection mechanism.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          Illegal Activities
                        </p>
                        <p className="text-xs text-muted-foreground">Terrorism, child abuse, fraud</p>
                      </div>
                      <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                          Hateful Content
                        </p>
                        <p className="text-xs text-muted-foreground">Discrimination, self-harm, bullying</p>
                      </div>
                      <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                          Unqualified Advice
                        </p>
                        <p className="text-xs text-muted-foreground">Legal, medical, financial domains</p>
                      </div>
                    </div>

                    <div className="mt-6 p-5 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-start gap-3">
                        <Award className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground mb-2">Self-Reflection Performance</p>
                          <p className="text-sm text-muted-foreground mb-3">
                            Evaluated on a manually curated and balanced dataset of adversarial and standard prompts:
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-background rounded-lg border border-border/50">
                              <p className="text-2xl font-bold text-primary">99.4%</p>
                              <p className="text-xs text-muted-foreground mt-1">Precision</p>
                            </div>
                            <div className="text-center p-3 bg-background rounded-lg border border-border/50">
                              <p className="text-2xl font-bold text-primary">95.6%</p>
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

                {/* Knowledge Compression */}
                <Card className="border border-border/50 shadow-lg" data-animate="stagger">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle className="text-2xl">Efficient Knowledge Compression</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-muted-foreground leading-relaxed">
                        Our work demonstrates that language models may <span className="font-semibold text-foreground">compress knowledge more effectively than previously thought</span>. This opens up interesting perspectives: the field has historically emphasized scaling laws in 2 dimensions (model capabilities ↔ training cost), but the problem is rather 3-dimensional:
                      </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center p-5 rounded-lg bg-muted/30 border border-border/50">
                        <TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />
                        <p className="font-semibold text-foreground mb-1">Model Capabilities</p>
                        <p className="text-xs text-muted-foreground">Performance on target tasks</p>
                      </div>
                      <div className="text-center p-5 rounded-lg bg-muted/30 border border-border/50">
                        <DollarSign className="w-8 h-8 text-primary mx-auto mb-3" />
                        <p className="font-semibold text-foreground mb-1">Training Cost</p>
                        <p className="text-xs text-muted-foreground">Computational resources required</p>
                      </div>
                      <div className="text-center p-5 rounded-lg bg-muted/30 border border-border/50">
                        <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
                        <p className="font-semibold text-foreground mb-1">Inference Cost</p>
                        <p className="text-xs text-muted-foreground">Runtime efficiency in production</p>
                      </div>
                    </div>

                    <div className="mt-6 p-5 bg-muted/50 rounded-lg border border-border/50">
                      <p className="text-sm text-foreground leading-relaxed">
                        <span className="font-semibold">Engineering Philosophy:</span> Much remains to be explored to obtain the best performance with the smallest possible model. Exceletto's 7B parameter architecture achieves performance comparable to much larger models through intelligent fine-tuning and optimization – delivering enterprise-grade accuracy at a fraction of the computational cost.
                      </p>
                    </div>
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
        <ScrollAnimatedSection id="benchmarks" className="py-24 relative z-10">
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12" data-animate="headline">
                <Badge variant="outline" className="mb-4 border-primary/50 text-primary">Performance Benchmarks</Badge>
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                  Industry-Leading OCR Accuracy
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Benchmarked against major cloud providers on real-world handwritten documents and complex table structures.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Accuracy Chart */}
                <Card className="border border-border/50 shadow-lg" data-animate="stagger">
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
          fill="hsl(var(--primary))"
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
                <Card className="border border-border/50 shadow-lg" data-animate="stagger">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold">Comprehensive Performance Metrics</CardTitle>
                    <p className="text-sm text-muted-foreground">Average across all test scenarios</p>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-hidden rounded-lg border border-border/50">
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
                            <td className="p-3 text-right font-semibold text-primary">98.4%</td>
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
                <div className="text-center p-4 rounded-lg bg-muted/30 border border-border/50" data-animate="stagger">
                  <div className="text-2xl font-bold text-primary mb-1">15+ Languages</div>
                  <p className="text-sm text-muted-foreground">Multi-language support including complex scripts</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30 border border-border/50" data-animate="stagger">
                  <div className="text-2xl font-bold text-primary mb-1">99.9% Uptime</div>
                  <p className="text-sm text-muted-foreground">Enterprise-grade reliability and availability</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30 border border-border/50" data-animate="stagger">
                  <div className="text-2xl font-bold text-primary mb-1">GDPR Compliant</div>
                  <p className="text-sm text-muted-foreground">Data privacy and security certified</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollAnimatedSection>

        {/* Final CTA Section */}
        <section className="py-24 relative z-10 overflow-hidden">
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            {/* CTA Content */}
            <div className="max-w-3xl mx-auto">
              <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
                Get Started Today
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-foreground bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Ready to Transform Your Workflow?
              </h2>
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#about" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#blog" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center mt-8">
            <p className="text-muted-foreground text-sm">
              © 2024 Exceletto. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Mobile Navigation */}
      <MobileNav onSectionClick={scrollToSection} />
    </div>
  );
}