"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarketingNavBar } from "@/components/MarketingNavBar";
import { Layers, FileText, Zap, Shield, Clock, Upload, FileSpreadsheet, CheckCircle, Sparkles, Camera, Receipt, FileCheck, Table } from "lucide-react";
import Link from "next/link";

export default function ProductsPage() {
  return (
    <div className="ax-marketing-page min-h-screen bg-white text-black">
      <MarketingNavBar />

      <main className="ax-marketing-container relative z-10 pb-20 pt-32 lg:pt-36">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-primary/50 text-primary">Products</Badge>
          <h1 className="ax-marketing-display font-bold text-black mb-6">
            Transform Images to <span className="bg-gradient-to-r from-primary via-chart-2 to-primary bg-clip-text text-transparent">Excel & CSV Files</span>
          </h1>
          <p className="ax-marketing-lead text-black max-w-3xl mx-auto">
            Professional OCR solutions that convert any document, screenshot, or handwritten table into structured XLSX and CSV spreadsheets.
          </p>
        </div>

        {/* Key Features Section */}
        <section id="batch-processing" className="mb-20">
          <div className="text-center mb-12">
            <h2 className="ax-marketing-section-title text-black mb-4">Key Features</h2>
            <p className="ax-marketing-body text-black max-w-2xl mx-auto">
              Powerful features designed to save you hours of manual data entry
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="ax-glass-card hover:border-primary/50 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Camera className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Batch Screenshot Processing</CardTitle>
                <CardDescription>
                  Upload and process batches of screenshots with limits matched to your plan. Convert tables, forms, and structured data to Excel/CSV in one click.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card id="custom-templates" className="ax-glass-card hover:border-primary/50 transition-all duration-300">
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

            <Card id="excel-export" className="ax-glass-card hover:border-primary/50 transition-all duration-300">
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

            <Card id="accuracy" className="ax-glass-card hover:border-primary/50 transition-all duration-300">
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

            <Card className="ax-glass-card hover:border-primary/50 transition-all duration-300">
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

            <Card className="ax-glass-card hover:border-primary/50 transition-all duration-300">
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
        <section className="ax-marketing-band-mint rounded-2xl bg-[#d1fae5] p-12 text-center">
          <h2 className="ax-marketing-section-title text-black mb-4">
            Ready to Automate Your Data Entry?
          </h2>
          <p className="ax-marketing-lead text-black mb-8 max-w-2xl mx-auto">
            Start converting images to Excel and CSV files in seconds. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="glossy" asChild className="text-lg px-8 py-6 h-auto">
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
