'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, FileSpreadsheet, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import NextLink from 'next/link';

export default function ScreenshotToExcel() {

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Screenshot to Excel  Converter
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform screenshots to Excel spreadsheets instantly with AI-powered OCR. Free, accurate, and no signup required.
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
            <Card>
              <CardHeader>
                <Camera className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>Capture & Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Take a screenshot of any table or upload an existing screenshot image. We support PNG, JPG, and more.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>AI Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Our advanced AI model analyzes your screenshot and extracts table data with high accuracy in seconds.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileSpreadsheet className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>Download Excel</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get your data in a clean, editable XLSX file ready to use in Excel, Google Sheets, or any spreadsheet software.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-16 text-left">
            <CardHeader>
              <CardTitle className="text-2xl">Why Convert Screenshots to Excel?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Save Time</h3>
                  <p className="text-muted-foreground">No need to manually type data from screenshots. Convert in seconds instead of hours.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">High Accuracy</h3>
                  <p className="text-muted-foreground">AI-powered OCR ensures accurate data extraction from your screenshots.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Free to Use</h3>
                  <p className="text-muted-foreground">No signup, no credit card, no hidden fees. Just upload and convert.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Secure & Private</h3>
                  <p className="text-muted-foreground">Your files are processed securely and deleted after conversion.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-16">
            <Button size="lg" asChild className="text-lg px-12">
              <NextLink href="/#upload">
                Convert Your Screenshot Now <ArrowRight className="ml-2 h-5 w-5" />
              </NextLink>
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t mt-24 py-8">
        <div className="container text-center text-muted-foreground">
          <p>&copy; 2025 AxLiner. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
