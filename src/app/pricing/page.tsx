"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { MobileNav } from "@/components/MobileNav";
import { CheckCircle, Zap, Users, Building, Star, MessageCircle, Mail, Phone, Shield, Sparkles, Trophy } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-muted/80">
      {/* Header */}
      <header className="border-b border-border bg-muted/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-foreground">
              Exceletto
            </Link>
            
            {/* Theme Toggle (Mobile uses bottom nav) */}
            <div className="lg:hidden">
              {/* Empty - using bottom nav */}
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/">Back to Home</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-primary/50 text-primary">Pricing</Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6">
            Simple, <span className="bg-gradient-to-r from-primary via-green-600 to-emerald-500 bg-clip-text text-transparent">Free for Everyone</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Get 80 free image conversions every month. Perfect for converting tables from images to Excel spreadsheets.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="flex justify-center max-w-md mx-auto mb-16">
          <Card className="border-2 border-primary shadow-xl w-full">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
              <Star className="w-3 h-3 mr-1" />
              Free Forever
            </Badge>
            <CardHeader className="text-center pt-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Free Plan</CardTitle>
              <CardDescription>Perfect for everyone</CardDescription>
              <div className="mt-4">
                <span className="text-5xl font-bold text-foreground">
                  $0
                </span>
                <span className="text-muted-foreground">
                  /month
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="font-semibold">80 image conversions/month</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Excel & CSV export</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Batch processing</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span>High accuracy OCR</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span>History & downloads</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span>No credit card required</span>
              </div>
              <Button
                className="w-full mt-6"
                size="lg"
                asChild
              >
                <Link href="/sign-up">Get Started Free</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ or Additional Info */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-background rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to convert your images to Excel?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sign up now and get 80 free conversions every month. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8 py-6 h-auto">
              <Link href="/sign-up">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 h-auto">
              <Link href="/">Learn More</Link>
            </Button>
          </div>
        </section>
      </main>
      
      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}
