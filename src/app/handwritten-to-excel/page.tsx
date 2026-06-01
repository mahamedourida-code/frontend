'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketingNavBar } from '@/components/MarketingNavBar';
import { PenTool, FileSpreadsheet, Zap, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import NextLink from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function HandwrittenToExcel() {
  return (
    <div className="ax-marketing-page min-h-screen bg-white text-black">
      <MarketingNavBar />

      <main className="ax-marketing-container relative z-10 pb-20 pt-32 lg:pt-36">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-emerald-700" />
              <span className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">7B AI Model</span>
            </div>
            <h1 className="ax-marketing-section-title text-black">
              Handwritten Table to Excel
            </h1>
            <p className="ax-marketing-lead text-black max-w-2xl mx-auto">
              Convert handwritten tables to Excel with our specialized 7B parameter AI model. Advanced OCR technology for accurate handwriting recognition.
            </p>
          </div>

          {/* Hero image */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="mx-auto max-w-2xl overflow-hidden rounded-2xl shadow-md ring-1 ring-emerald-300/40"
          >
            <Image
              src="/photos/kelly-sikkema-M98NRBuzbpc-unsplash.jpg"
              alt="Handwritten receipts and paperwork ready to be digitised"
              width={800}
              height={533}
              className="w-full object-cover"
              priority
            />
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8">
              <NextLink href="/#upload">
                Start Converting <ArrowRight className="ml-2 h-5 w-5" />
              </NextLink>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8">
              <NextLink href="/#features">Learn More</NextLink>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card className="ax-glass-card">
              <CardHeader>
                <PenTool className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>Handwriting Recognition</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Our AI model is specifically trained to recognize and extract handwritten text from table images with high accuracy.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="ax-glass-card">
              <CardHeader>
                <Zap className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>7B AI Model</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Powered by a 7 billion parameter AI model, delivering superior accuracy for complex handwritten table structures.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="ax-glass-card">
              <CardHeader>
                <FileSpreadsheet className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>Excel Output</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get clean, editable XLSX files preserving your table structure and data, ready for analysis and editing.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <Card className="ax-glass-card mt-16 text-left">
            <CardHeader>
              <CardTitle className="ax-marketing-subtitle">Perfect For Handwritten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Paper Forms & Surveys</h3>
                  <p className="ax-marketing-card-copy">Digitize handwritten forms, surveys, and questionnaires filled out on paper.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Research Notes & Data</h3>
                  <p className="ax-marketing-card-copy">Convert handwritten research notes, lab data, and field observations into Excel.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Meeting Notes & Lists</h3>
                  <p className="ax-marketing-card-copy">Transform handwritten meeting notes, action items, and lists into organized spreadsheets.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Financial Records</h3>
                  <p className="ax-marketing-card-copy">Digitize handwritten expense logs, receipts, and financial tracking sheets.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section accent — handwritten notes close-up */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="mx-auto max-w-xl overflow-hidden rounded-2xl shadow-sm ring-1 ring-emerald-300/40"
          >
            <Image
              src="/photos/kelly-sikkema-SiOW0btU0zk-unsplash.jpg"
              alt="Close-up of handwritten notes being processed"
              width={800}
              height={533}
              className="w-full object-cover"
            />
          </motion.div>

          <Card className="ax-glass-card mt-8 text-left">
            <CardHeader>
              <CardTitle className="ax-marketing-subtitle flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-emerald-700" />
                Why 7B AI Model?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="ax-marketing-card-copy">
                Handwriting recognition is significantly more complex than printed text. Our 7 billion parameter AI model has been trained on millions of handwriting samples, enabling it to:
              </p>
              <ul className="ax-marketing-card-copy space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Recognize diverse handwriting styles and variations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Handle messy or unclear handwritten text</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Accurately extract complex table structures</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Maintain high accuracy even with challenging inputs</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="ax-glass-card mt-8 text-left">
            <CardHeader>
              <CardTitle className="ax-marketing-subtitle">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">1</div>
                <p className="ax-marketing-card-copy">Upload or photograph your handwritten table</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">2</div>
                <p className="ax-marketing-card-copy">Our 7B AI model analyzes and recognizes the handwriting</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">3</div>
                <p className="ax-marketing-card-copy">Download your digitized Excel file with extracted data</p>
              </div>
            </CardContent>
          </Card>

          {/* Section accent — manual bookkeeping cost visual */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="mx-auto max-w-xl overflow-hidden rounded-2xl shadow-sm ring-1 ring-emerald-300/40"
          >
            <Image
              src="/photos/The-Real-Cost-of-DIY-Bookkeeping-scaled.jpg"
              alt="The real cost of manual bookkeeping"
              width={800}
              height={533}
              className="w-full object-cover"
            />
          </motion.div>

          <div className="mt-16">
            <Button size="lg" asChild className="text-lg px-12">
              <NextLink href="/#upload">
                Convert Handwritten Table Now <ArrowRight className="ml-2 h-5 w-5" />
              </NextLink>
            </Button>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t mt-24 py-8">
        <div className="ax-marketing-container text-center text-neutral-900">
          <p>&copy; 2026 AxLiner. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
