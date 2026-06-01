"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarketingNavBar } from "@/components/MarketingNavBar";
import { Zap, FileSpreadsheet, Camera, Receipt, FileCheck, Table } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function ProductsPage() {
  return (
    <div className="ax-marketing-page min-h-screen bg-white text-black">
      <MarketingNavBar />

      <main className="ax-marketing-container relative z-10 pb-20 pt-32 lg:pt-36">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-14"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeUp}>
            <Badge variant="outline" className="mb-4 border-primary/50 text-primary">Products</Badge>
          </motion.div>
          <motion.h1 variants={fadeUp} className="ax-marketing-display font-bold text-black mb-6">
            Transform Images to{" "}
            <span className="bg-gradient-to-r from-primary via-chart-2 to-primary bg-clip-text text-transparent">
              Excel & CSV Files
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} className="ax-marketing-lead text-black max-w-3xl mx-auto">
            Professional OCR solutions that convert any document, screenshot, or handwritten table into structured XLSX and CSV spreadsheets.
          </motion.p>
        </motion.div>

        {/* Hero photo — person reviewing docs at laptop */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          className="relative mb-20 overflow-hidden rounded-2xl ring-1 ring-emerald-200 shadow-[0_4px_32px_rgba(16,185,129,0.10)]"
          style={{ aspectRatio: "16/7" }}
        >
          <Image
            src="/photos/istockphoto-2185212349-612x612.jpg"
            alt="Professional reviewing documents and receipts at a laptop"
            fill
            priority
            sizes="(min-width: 1280px) 1200px, 100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
          <div className="absolute inset-0 flex items-center px-8 sm:px-14">
            <div className="max-w-lg text-white">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-300 mb-3">
                Batch Review Board
              </p>
              <p className="text-2xl sm:text-3xl font-bold leading-snug">
                Throw us the whole folder. Review exceptions before export.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Key Features Section */}
        <section id="batch-processing" className="mb-20">
          <div className="text-center mb-12">
            <h2 className="ax-marketing-section-title text-black mb-4">Key Features</h2>
            <p className="ax-marketing-body text-black max-w-2xl mx-auto">
              Powerful features designed to save you hours of manual data entry
            </p>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
          >
            <motion.div variants={fadeUp}>
              <Card className="ax-glass-card hover:border-primary/50 transition-all duration-300 h-full">
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
            </motion.div>

            <motion.div variants={fadeUp} id="custom-templates">
              <Card className="ax-glass-card hover:border-primary/50 transition-all duration-300 h-full">
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
            </motion.div>

            <motion.div variants={fadeUp} id="excel-export">
              <Card className="ax-glass-card hover:border-primary/50 transition-all duration-300 h-full">
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
            </motion.div>

            <motion.div variants={fadeUp} id="accuracy">
              <Card className="ax-glass-card hover:border-primary/50 transition-all duration-300 h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <FileCheck className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>AI-Powered Accuracy</CardTitle>
                  <CardDescription>
                    Advanced OCR technology trained on millions of documents. Accurately extracts tables, forms, and structured data with field-level confidence flags.
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card className="ax-glass-card hover:border-primary/50 transition-all duration-300 h-full">
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
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card className="ax-glass-card hover:border-primary/50 transition-all duration-300 h-full">
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
            </motion.div>
          </motion.div>
        </section>

        {/* Mid-page visual accent — documents + checks */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="mb-20 grid gap-4 sm:grid-cols-2"
        >
          <div className="relative overflow-hidden rounded-2xl ring-1 ring-emerald-200 shadow-sm" style={{ aspectRatio: "4/3" }}>
            <Image
              src="/photos/istockphoto-2227797727-612x612.jpg"
              alt="Invoices and financial documents spread on a desk"
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover object-center"
            />
          </div>
          <div className="relative overflow-hidden rounded-2xl ring-1 ring-emerald-200 shadow-sm" style={{ aspectRatio: "4/3" }}>
            <Image
              src="/photos/istockphoto-2254128413-612x612.jpg"
              alt="Accountant working with spreadsheets on screen"
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover object-center"
            />
          </div>
        </motion.div>

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
