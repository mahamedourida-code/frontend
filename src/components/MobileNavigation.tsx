"use client"

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ThemeToggle } from "@/components/theme-toggle";
import { BillingSeal } from "@/components/BillingGlyphs";
import { Menu, ChevronDown, ChevronRight, PenTool, FileInput, Target, TrendingUp, ArrowRight, Upload } from "lucide-react";

interface MobileNavigationProps {
  onSectionClick?: (sectionId: string) => void;
}

export function MobileNavigation({ onSectionClick }: MobileNavigationProps) {
  const [solutionsOpen, setSolutionsOpen] = React.useState(false);
  
  const scrollToSection = (sectionId: string) => {
    if (onSectionClick) {
      onSectionClick(sectionId);
    } else {
      // Default behavior if we're not on the home page
      window.location.href = `/#${sectionId}`;
    }
  };

  return (
    <div className="lg:hidden flex items-center gap-2">
      <ThemeToggle />
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="px-2 hover:bg-accent">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[88vw] max-w-[390px] border-l border-[#eadfff] bg-white/95 p-0 backdrop-blur-xl sm:w-96">
          {/* Header */}
          <div className="border-b border-[#eadfff] bg-[#E9ECE4]/75 px-6 py-4">
            <SheetTitle className="text-xl font-bold">AxLiner</SheetTitle>
            <SheetDescription className="mt-1 text-sm text-muted-foreground">
              Convert images and handwritten tables into Excel.
            </SheetDescription>
          </div>
          
          {/* Navigation Content */}
          <div className="flex h-[calc(100dvh-120px)] flex-col">
            <div className="flex-1 px-6 py-4 space-y-1 overflow-y-auto">
              
              {/* Solutions Section */}
              <Collapsible open={solutionsOpen} onOpenChange={setSolutionsOpen}>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between h-12 px-3 text-base font-medium hover:bg-accent"
                  >
                    <span>Solutions</span>
                    {solutionsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 mt-1">
                  <div className="ml-4 space-y-1">
                    <SheetClose asChild>
                      <a
                        href="/solutions/handwritten-tables"
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors group"
                      >
                        <PenTool className="w-5 h-5 text-primary mt-0.5 group-hover:scale-105 transition-transform" />
                        <div className="flex-1 space-y-1">
                          <div className="font-medium text-sm leading-tight">Handwritten Tables</div>
                          <div className="text-xs text-muted-foreground leading-relaxed">
                            AI-powered handwriting recognition
                          </div>
                        </div>
                      </a>
                    </SheetClose>
                    <SheetClose asChild>
                      <a
                        href="/solutions/paper-forms"
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors group"
                      >
                        <FileInput className="w-5 h-5 text-primary mt-0.5 group-hover:scale-105 transition-transform" />
                        <div className="flex-1 space-y-1">
                          <div className="font-medium text-sm leading-tight">Paper Forms</div>
                          <div className="text-xs text-muted-foreground leading-relaxed">
                            Invoices, receipts, and forms
                          </div>
                        </div>
                      </a>
                    </SheetClose>
                    <SheetClose asChild>
                      <a
                        href="/solutions/data-entry"
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors group"
                      >
                        <Target className="w-5 h-5 text-primary mt-0.5 group-hover:scale-105 transition-transform" />
                        <div className="flex-1 space-y-1">
                          <div className="font-medium text-sm leading-tight">Data Entry Automation</div>
                          <div className="text-xs text-muted-foreground leading-relaxed">
                            Repetitive data entry workflows
                          </div>
                        </div>
                      </a>
                    </SheetClose>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Direct Links */}
              <SheetClose asChild>
                <button
                  onClick={() => scrollToSection('converter')}
                  className="flex h-12 w-full items-center gap-3 rounded-lg px-3 text-left text-base font-medium transition-colors hover:bg-accent"
                >
                  <Upload className="h-5 w-5 text-primary" />
                  Try It
                </button>
              </SheetClose>

              <SheetClose asChild>
                <a
                  href="/pricing"
                  className="flex items-center gap-3 h-12 px-3 rounded-lg hover:bg-accent transition-colors font-medium text-base"
                >
                  <BillingSeal className="w-5 h-5 text-primary" />
                  Pricing
                </a>
              </SheetClose>
              
              <SheetClose asChild>
                <button
                  onClick={() => scrollToSection('features')}
                  className="flex items-center gap-3 w-full h-12 px-3 rounded-lg hover:bg-accent transition-colors font-medium text-base text-left"
                >
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Features
                </button>
              </SheetClose>
            </div>

            {/* CTA Section */}
            <div className="space-y-3 border-t border-[#eadfff] bg-[#E9ECE4]/60 px-6 py-4">
              <SheetClose asChild>
                <Button
                  variant="outline"
                  className="w-full h-11 text-base font-medium"
                  onClick={() => window.location.href = '/sign-in'}
                >
                  Log In
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button
                  className="w-full h-11 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  onClick={() => window.location.href = '/sign-up'}
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </SheetClose>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
