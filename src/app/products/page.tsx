"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileNavigation } from "@/components/MobileNavigation";
import { Layers, FileText, Zap, Shield, Clock, Upload, FileSpreadsheet, CheckCircle, Sparkles, Camera, Receipt, FileCheck, Table } from "lucide-react";
import Link from "next/link";

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-foreground">
              Litt Up
            </Link>
            
            {/* Mobile Navigation */}
            <MobileNavigation />
            
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
          <Badge variant="outline" className="mb-4 border-primary/50 text-primary">Products</Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6">
            Transform Images to <span className="bg-gradient-to-r from-primary via-green-600 to-emerald-500 bg-clip-text text-transparent">Excel & CSV Files</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Professional OCR solutions that convert any document, screenshot, or handwritten table into structured XLSX and CSV spreadsheets.
          </p>
        </div>

        {/* Key Features Section */}
        <section id="batch-processing" className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Key Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to save you hours of manual data entry
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Camera className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Batch Screenshot Processing</CardTitle>
                <CardDescription>
                  Upload and process up to 100 screenshots simultaneously. Convert tables, forms, and structured data to Excel/CSV in one click. Perfect for bulk data extraction tasks.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card id="custom-templates" className="bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Receipt className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Custom Template Processing</CardTitle>
                <CardDescription>
                  Create custom templates for invoices, tickets, receipts, and forms. Train the AI on your specific document layouts for consistent, accurate XLSX extraction.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card id="excel-export" className="bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <FileSpreadsheet className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Excel & CSV Export</CardTitle>
                <CardDescription>
                  Export to XLSX or CSV with formatting preserved. Compatible with Microsoft Excel, Google Sheets, LibreOffice, and all spreadsheet applications.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card id="accuracy" className="bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <FileCheck className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>AI-Powered Accuracy</CardTitle>
                <CardDescription>
                  Advanced OCR technology trained on millions of documents. Accurately extracts tables, forms, and structured data with 99%+ accuracy for typed text.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Table className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Table Structure Detection</CardTitle>
                <CardDescription>
                  Automatically detects table rows, columns, headers, and cell boundaries. Maintains relationships and formatting in the exported Excel file.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Lightning Fast Processing</CardTitle>
                <CardDescription>
                  Process images in seconds, not minutes. Our cloud infrastructure handles large batches efficiently, delivering results 60x faster than manual entry.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-background rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Automate Your Data Entry?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start converting images to Excel and CSV files in seconds. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8 py-6 h-auto">
              <Link href="/sign-up">Start Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 h-auto">
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
