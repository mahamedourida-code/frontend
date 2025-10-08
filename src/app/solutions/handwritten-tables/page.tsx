"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileNavigation } from "@/components/MobileNavigation";
import { PenTool, Zap, CheckCircle, Clock, Shield, Upload, FileText, Sparkles, Target, FileSpreadsheet } from "lucide-react";
import Link from "next/link";

export default function HandwrittenTablesPage() {
  return (
    <div className="min-h-screen bg-muted/80">
      <header className="border-b border-border bg-muted/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-foreground">Exceletto</Link>
            
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

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-primary/50 text-primary">Solutions</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Handwritten Tables to <span className="bg-gradient-to-r from-primary via-green-600 to-emerald-500 bg-clip-text text-transparent">Excel</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transform handwritten tables, forms, and notes into structured Excel spreadsheets with our advanced OCR technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-card/50 border border-border/50">
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

          <Card className="bg-card/50 border border-border/50">
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

          <Card className="bg-card/50 border border-border/50">
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

        <section className="bg-gradient-to-br from-primary/10 via-background to-background rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Start Digitizing Handwritten Tables</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Save hours of manual typing. Convert handwritten tables to Excel in seconds.
          </p>
          <Button size="lg" asChild className="text-lg px-8 py-6 h-auto">
            <Link href="/sign-up">Try It Free</Link>
          </Button>
        </section>
      </main>
    </div>
  );
}
