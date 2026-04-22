'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileImage, FileSpreadsheet, Zap, CheckCircle, ArrowRight, Upload } from 'lucide-react';
import NextLink from 'next/link';

export default function ImageToExcel() {
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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Image to Excel Converter  
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Convert any image containing  tables to Excel instantly with AI-powered OCR. Free, fast, and accurate - no signup required.
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
              <CardTitle className="text-2xl">Perfect For</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Scanned Documents</h3>
                  <p className="text-muted-foreground">Convert scanned paper documents with tables into editable Excel spreadsheets.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Photos from Phone</h3>
                  <p className="text-muted-foreground">Take a photo of any table with your smartphone and convert it to Excel instantly.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">PDF Tables</h3>
                  <p className="text-muted-foreground">Extract tables from PDF images or convert PDF screenshots to Excel format.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Financial Reports</h3>
                  <p className="text-muted-foreground">Digitize financial statements, invoices, and reports from image format.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="ax-glass-card mt-8 text-left">
            <CardHeader>
              <CardTitle className="text-2xl">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">1</div>
                <p>Upload your image containing a table (JPG, PNG, etc.)</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">2</div>
                <p>Our AI analyzes and extracts the table structure and data</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">3</div>
                <p>Download your formatted Excel file ready for editing</p>
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
        <div className="container text-center text-muted-foreground">
          <p>&copy; 2025 AxLiner. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
