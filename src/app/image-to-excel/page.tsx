'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketingNavBar } from '@/components/MarketingNavBar';
import { FileImage, FileSpreadsheet, Zap, CheckCircle, ArrowRight, Upload } from 'lucide-react';
import NextLink from 'next/link';

export default function ImageToExcel() {
  return (
    <div className="ax-marketing-page min-h-screen bg-white text-black">
      <MarketingNavBar />

      <main className="ax-marketing-container relative z-10 pb-20 pt-32 lg:pt-36">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="ax-marketing-section-title text-black">
              Image to Excel Converter
            </h1>
            <p className="ax-marketing-lead text-black max-w-2xl mx-auto">
              Convert any image containing tables to Excel instantly with AI-powered OCR. Free, fast, and accurate - no signup required.
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
                <Upload className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>Upload Any Image</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Support for JPG, PNG, WebP, and more. Upload images from your phone, camera, or computer.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="ax-glass-card">
              <CardHeader>
                <Zap className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>AI-Powered OCR</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Advanced AI extracts tables from your images with high precision, handling complex layouts and formats.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="ax-glass-card">
              <CardHeader>
                <FileSpreadsheet className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>Excel Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Download formatted XLSX files compatible with Excel, Google Sheets, LibreOffice, and other spreadsheet tools.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <Card className="ax-glass-card mt-16 text-left">
            <CardHeader>
              <CardTitle className="ax-marketing-subtitle">Perfect For</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Scanned Documents</h3>
                  <p className="ax-marketing-card-copy">Convert scanned paper documents with tables into editable Excel spreadsheets.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Photos from Phone</h3>
                  <p className="ax-marketing-card-copy">Take a photo of any table with your smartphone and convert it to Excel instantly.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">PDF Tables</h3>
                  <p className="ax-marketing-card-copy">Extract tables from PDF images or convert PDF screenshots to Excel format.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Financial Reports</h3>
                  <p className="ax-marketing-card-copy">Digitize financial statements, invoices, and reports from image format.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="ax-glass-card mt-8 text-left">
            <CardHeader>
              <CardTitle className="ax-marketing-subtitle">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">1</div>
                <p className="ax-marketing-card-copy">Upload your image containing a table (JPG, PNG, etc.)</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">2</div>
                <p className="ax-marketing-card-copy">Our AI analyzes and extracts the table structure and data</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">3</div>
                <p className="ax-marketing-card-copy">Download your formatted Excel file ready for editing</p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-16">
            <Button size="lg" asChild className="text-lg px-12">
              <NextLink href="/#upload">
                Convert Your Image Now <ArrowRight className="ml-2 h-5 w-5" />
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
