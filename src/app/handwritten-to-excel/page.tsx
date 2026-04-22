'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PenTool, FileSpreadsheet, Zap, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import NextLink from 'next/link';

export default function HandwrittenToExcel() {
  return (
    <div className="ax-page-bg min-h-screen">
      <header className="ax-glass-header sticky top-0 z-50 w-full border-b">
        <div className="container flex h-16 items-center justify-between">
          <NextLink href="/" className="flex items-center space-x-2">
            <FileSpreadsheet className="h-6 w-6" />
            <span className="font-bold text-xl">AxLiner</span>
          </NextLink>
          <Button asChild>
            <NextLink href="/#upload">Get Started</NextLink>
          </Button>
        </div>
      </header>

      <main className="container relative z-10 mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-yellow-500" />
              <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-500 uppercase tracking-wide">7B AI Model</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Handwritten Table  to Excel
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Convert handwritten tables to Excel with our specialized 7B parameter AI model. Advanced OCR technology for accurate handwriting recognition.
            </p>
          </div>

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
              <CardTitle className="text-2xl">Perfect For Handwritten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Paper Forms & Surveys</h3>
                  <p className="text-muted-foreground">Digitize handwritten forms, surveys, and questionnaires filled out on paper.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Research Notes & Data</h3>
                  <p className="text-muted-foreground">Convert handwritten research notes, lab data, and field observations into Excel.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Meeting Notes & Lists</h3>
                  <p className="text-muted-foreground">Transform handwritten meeting notes, action items, and lists into organized spreadsheets.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Financial Records</h3>
                  <p className="text-muted-foreground">Digitize handwritten expense logs, receipts, and financial tracking sheets.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="ax-glass-card mt-8 text-left">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-yellow-500" />
                Why 7B AI Model?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">
                Handwriting recognition is significantly more complex than printed text. Our 7 billion parameter AI model has been trained on millions of handwriting samples, enabling it to:
              </p>
              <ul className="space-y-2 text-muted-foreground ml-4">
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
              <CardTitle className="text-2xl">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">1</div>
                <p>Upload or photograph your handwritten table</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">2</div>
                <p>Our 7B AI model analyzes and recognizes the handwriting</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">3</div>
                <p>Download your digitized Excel file with extracted data</p>
              </div>
            </CardContent>
          </Card>

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
        <div className="container text-center text-muted-foreground">
          <p>&copy; 2025 AxLiner. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
