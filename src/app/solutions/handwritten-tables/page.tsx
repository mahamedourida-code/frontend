"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileNavigation } from "@/components/MobileNavigation";
import { PenTool, Zap, CheckCircle, Clock, Shield, Upload, FileText, Sparkles, Target, FileSpreadsheet, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HandwrittenTablesPage() {
  const router = useRouter()

  return (
    <div className="ax-page-bg min-h-screen relative">
      <header className="ax-glass-header sticky top-0 z-50 relative border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-1 lg:gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <Link href="/" className="text-2xl font-bold text-foreground">AxLiner</Link>
            </div>
            
            {/* Mobile Navigation */}
            <MobileNavigation />
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-4">
              <Button variant="ghost" asChild><Link href="/">Home</Link></Button>
              <Button asChild><Link href="/sign-up">Get Started</Link></Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-primary/50 text-primary">Solutions</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Handwritten Tables to <span className="bg-gradient-to-r from-primary via-[#A78BFA] to-[#A78BFA] bg-clip-text text-transparent">Excel</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transform handwritten tables, forms, and notes into structured Excel spreadsheets with our advanced OCR technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="ax-glass-card">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <PenTool className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Handwriting Recognition</CardTitle>
              <CardDescription>
                Our AI accurately reads handwritten text in tables, converting it to editable Excel cells with proper row and column structure.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="ax-glass-card">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Table Detection</CardTitle>
              <CardDescription>
                Automatically identifies table boundaries, rows, and columns even in hand-drawn grids and informal table layouts.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="ax-glass-card">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Excel Export</CardTitle>
              <CardDescription>
                Export to XLSX or CSV with all data organized into proper cells, ready for immediate use in Excel or Google Sheets.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="ax-glass-card rounded-2xl">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Start Digitizing Handwritten Tables</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Save hours of manual typing. Convert handwritten tables to Excel in seconds.
            </p>
            <Button size="lg" asChild className="text-lg px-8 py-6 h-auto">
              <Link href="/sign-up">Try for Free</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
