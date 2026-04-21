"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileNavigation } from "@/components/MobileNavigation";
import { FileText, Workflow, Database, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PaperFormsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background relative">
      {/* Duplo30 Background */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <img
          src="/duplo30.jpg"
          alt="Background pattern"
          className="w-full h-full object-cover object-top"
        />
      </div>

      <header className="border-b border-border bg-background/20 backdrop-blur-md sticky top-0 z-50 relative">
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
            Automate Paper Forms to <span className="bg-gradient-to-r from-primary via-[#9C3DEB] to-[#CBB7EE] bg-clip-text text-transparent">CSV</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Digitize secretary paperwork, manual forms, and administrative documents into structured CSV and Excel files automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-card/50 border border-border/50">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Form Recognition</CardTitle>
              <CardDescription>
                Automatically identifies form fields, checkboxes, and data entry areas. Extracts information accurately from any paper form layout.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/50 border border-border/50">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Workflow className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Batch Processing</CardTitle>
              <CardDescription>
                Process hundreds of forms at once. Perfect for digitizing archives, daily paperwork, or recurring administrative tasks.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/50 border border-border/50">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Structured Output</CardTitle>
              <CardDescription>
                Export to CSV or Excel with each form field mapped to the correct column. Ready for database import or analysis.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="bg-white dark:bg-card border border-border rounded-2xl shadow-sm">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Eliminate Manual Data Entry</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Convert paper forms to digital spreadsheets automatically. Save time and reduce errors.
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
