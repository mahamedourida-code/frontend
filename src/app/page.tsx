"use client"

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
import { MobileNavigation } from "@/components/MobileNavigation";
import ScrollAnimatedSection from "@/components/ScrollAnimatedSection";
import { cn } from "@/lib/utils";
import { AppLogo } from "@/components/AppIcon";
import { ComparisonSlider } from "@/components/ComparisonSlider";
import { Camera, FileSpreadsheet, Zap, Shield, Clock, Users, Star, CheckCircle, Layers, FileText, PenTool, FileInput, DollarSign, Database, Upload, ArrowRight, Sparkles, TrendingUp, Award, Target } from "lucide-react";

export default function Home() {

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
    <div className="min-h-screen bg-muted/80 relative">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-muted/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <AppLogo />
            </div>

            {/* Mobile Navigation */}
            <MobileNavigation onSectionClick={scrollToSection} />

            {/* Primary Navigation - Desktop */}
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

            {/* CTA Buttons - Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              <ThemeToggle />
              <Button
                variant="ghost"
                className="hidden sm:inline-flex"
                onClick={() => window.location.href = '/sign-in'}
              >
                Log In
              </Button>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => window.location.href = '/sign-in'}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="min-h-screen flex items-start justify-start pt-20 pb-12 bg-background relative overflow-hidden">
          {/* Glowing effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent blur-3xl" />
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">AI-Powered OCR Technology</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight tracking-tight">
                  <span className="text-primary">
                    Convert screenshots to Excel instantly
                  </span>
                </h1>
                <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
                  Process <span className="font-semibold text-foreground">up to 100 screenshots</span> in one click with AI-powered OCR technology.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 h-auto rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    onClick={() => window.location.href = '/sign-in'}
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Try for free
                  </Button>
                </div>
              </div>

              {/* Right Visual - Interactive Comparison Slider */}
              <div className="relative">
                <div className="h-[400px] rounded-lg overflow-hidden shadow-2xl">
                  <ComparisonSlider
                    leftLabel="Before"
                    rightLabel="After"
                    leftContent={
                      <img 
                        src="/before.png" 
                        alt="Handwritten table before processing"
                        className="w-full h-full object-cover"
                      />
                    }
                    rightContent={
                      <img 
                        src="/after.png" 
                        alt="Converted Excel spreadsheet"
                        className="w-full h-full object-cover"
                      />
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Comparison Section */}
        <section className="py-24 bg-background relative z-10 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <Badge variant="outline" className="mb-4 border-primary/50 text-primary">Interactive Demo</Badge>
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                  See the Transformation in Action
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Move your cursor over the preview to see how handwritten data transforms into perfect spreadsheets
                </p>
              </div>

              {/* Comparison Sliders - Stacked Vertically */}
              <div className="space-y-16">
                {/* Handwritten Table Comparison */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-center">Handwritten Table → Excel</h3>
                  <div className="h-[600px]">
                    <ComparisonSlider
                      leftLabel="Original Scan"
                      rightLabel="Excel Output"
                      leftContent={
                        <img 
                          src="/before.png" 
                          alt="Handwritten table before processing"
                          className="w-full h-full object-cover"
                        />
                      }
                      rightContent={
                        <img 
                          src="/after.png" 
                          alt="Excel spreadsheet output"
                          className="w-full h-full object-cover"
                        />
                      }
                    />
                  </div>
                </div>

                {/* Form Data Comparison */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-center">Paper Form → Structured Data</h3>
                  <div className="h-[600px]">
                    <ComparisonSlider
                      leftLabel="Scanned Form"
                      rightLabel="Structured Output"
                      leftContent={
                        <img 
                          src="/before.png" 
                          alt="Paper form before processing"
                          className="w-full h-full object-cover"
                        />
                      }
                      rightContent={
                        <img 
                          src="/after.png" 
                          alt="Structured data output"
                          className="w-full h-full object-cover"
                        />
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <ScrollAnimatedSection id="features" className="py-24 bg-background relative z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16" data-animate="headline">
              <Badge variant="outline" className="mb-4 border-primary/50 text-primary">Features</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Solutions
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
                    Transform handwritten tables into precise Excel spreadsheets with AI-powered recognition
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
        <ScrollAnimatedSection id="trusted" className="py-20 bg-background relative z-10 overflow-hidden">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
          <div className="relative z-10 text-center mb-12" data-animate="headline">
            <Badge variant="outline" className="mb-4 border-primary/50 text-primary">Trusted Organizations</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Chosen by experts at top organizations
            </h2>
          </div>

          <div className="relative z-10 overflow-hidden" data-animate="stagger">
            <div
              className="flex gap-8 items-center"
              style={{
                animation: 'scroll-left 240s linear infinite',
                width: 'max-content'
              }}
            >
              {/* Create multiple sets for seamless loop */}
              {Array.from({ length: 3 }, (_, setIndex) =>
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

        {/* How It Works Section */}
        <ScrollAnimatedSection id="how-it-works" className="py-24 bg-background relative z-10 overflow-hidden">
          {/* Diagonal stripes pattern */}
          <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,_transparent,_transparent_10px,_rgb(255_255_255_/_0.1)_10px,_rgb(255_255_255_/_0.1)_20px)]" />
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

        {/* Benchmark Section */}
        <ScrollAnimatedSection id="benchmarks" className="py-24 bg-background relative z-10">
          {/* Glowing effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent blur-3xl" />
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
                    <CardTitle className="text-lg font-semibold">Handwritten Text Recognition Accuracy</CardTitle>
                    <p className="text-sm text-muted-foreground">Based on 10,000+ real-world samples</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Exceletto */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-primary">Exceletto</span>
                          <span className="text-primary font-bold">96.8%</span>
                        </div>
                        <div className="h-8 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-1000" style={{ width: '96.8%' }}></div>
                        </div>
                      </div>
                      
                      {/* Google Cloud Vision */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Google Cloud Vision</span>
                          <span className="text-muted-foreground">95.2%</span>
                        </div>
                        <div className="h-8 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-muted-foreground/40 rounded-full" style={{ width: '95.2%' }}></div>
                        </div>
                      </div>

                      {/* Azure Computer Vision */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Azure Computer Vision</span>
                          <span className="text-muted-foreground">94.5%</span>
                        </div>
                        <div className="h-8 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-muted-foreground/40 rounded-full" style={{ width: '94.5%' }}></div>
                        </div>
                      </div>

                      {/* AWS Textract */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">AWS Textract</span>
                          <span className="text-muted-foreground">93.7%</span>
                        </div>
                        <div className="h-8 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-muted-foreground/40 rounded-full" style={{ width: '93.7%' }}></div>
                        </div>
                      </div>
                    </div>
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
        <section className="py-24 bg-background relative z-10 overflow-hidden border-t border-border">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          
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
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 h-auto bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-all duration-200 shadow-lg shadow-primary/20"
                  onClick={() => window.location.href = '/sign-up'}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Free Trial
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 h-auto hover:scale-105 transition-all duration-200 border-primary/50 hover:border-primary"
                  onClick={() => window.location.href = '/sign-in'}
                >
                  Sign In to Dashboard
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-12 pt-12 border-t border-border/50">
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
      <footer className="bg-background backdrop-blur-md border-t border-border relative z-10">
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
          
          <Separator className="my-8" />
          
          <div className="flex flex-col sm:flex-row justify-between items-center">
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
    </div>
  );
}