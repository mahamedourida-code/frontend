import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ParticlesBackground from "@/components/ParticlesBackground";
import { AppLogo } from "@/components/AppIcon";

export const metadata = {
  title: "How to Convert Invoice Images to Excel Spreadsheets | AxLiner",
  description: "Learn how to automatically extract invoice data from images and convert them into structured Excel files using AI-powered OCR technology.",
};

export default function ConvertInvoiceToExcelPost() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <ParticlesBackground />
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-100"
          style={{ backgroundImage: 'url(/duplo30.jpg)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 pt-3 lg:pt-4">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-[35px] border-2 border-[#2BAAD8] shadow-lg shadow-[#2BAAD8]/10 backdrop-blur-md p-2 lg:p-3 flex items-center justify-between" style={{ backgroundColor: '#fbfdfc' }}>
              <div className="flex-shrink-0">
                <AppLogo />
              </div>
              <div className="flex items-center gap-3">
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/blogs">
                    ← Back to Blogs
                  </Link>
                </Button>
                <Button asChild className="rounded-full">
                  <Link href="/dashboard">Try Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article className="container mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="max-w-4xl mx-auto">
            {/* Article Header */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Badge variant="secondary">Tutorial</Badge>
                <Badge variant="outline">Invoice Processing</Badge>
                <Badge variant="outline">OCR</Badge>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                How to Convert Invoice Images to Excel Spreadsheets
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span>November 9, 2025</span>
                <span>•</span>
                <span>5 min read</span>
              </div>
            </div>

            {/* Article Body */}
            <div className="space-y-8">
              {/* Introduction */}
              <Card className="bg-white dark:bg-card border border-border shadow-sm">
                <CardContent className="p-8">
                  <p className="text-lg leading-relaxed">
                    Processing invoices manually is time-consuming and error-prone. Whether you're dealing with supplier invoices, customer bills, or expense reports, converting invoice images to Excel can save hours of data entry work. In this guide, we'll show you how to automate this process using AI-powered OCR technology.
                  </p>
                </CardContent>
              </Card>

              {/* Why Convert Invoices to Excel */}
              <Card className="bg-white dark:bg-card border border-border shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-6">
                    Why Convert Invoices to Excel?
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Eliminate Manual Data Entry</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Automatically extract invoice numbers, dates, amounts, vendor names, and line items without typing a single character.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Improve Accuracy</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Reduce human errors in data transcription. AI-powered OCR achieves 96.8% accuracy even with complex invoice layouts.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Enable Financial Analysis</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Once in Excel, you can sort, filter, create pivot tables, and generate reports for better financial insights.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Integrate with Accounting Software</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Export Excel files to QuickBooks, Xero, SAP, or other accounting systems for seamless workflow integration.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step-by-Step Guide */}
              <Card className="bg-white dark:bg-card border border-border shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-6">Step-by-Step: Convert Invoice to Excel</h2>
                  
                  <div className="space-y-8">
                    {/* Step 1 */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                          1
                        </div>
                        <h3 className="text-2xl font-semibold">Prepare Your Invoice Images</h3>
                      </div>
                      <p className="text-muted-foreground ml-13">
                        Scan or photograph your invoices. AxLiner supports JPG, PNG, and PDF formats. For best results, ensure the image is well-lit and the text is clearly visible. The AI can handle various invoice layouts including multi-column formats and complex tables.
                      </p>
                    </div>

                    {/* Step 2 */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                          2
                        </div>
                        <h3 className="text-2xl font-semibold">Upload to AxLiner</h3>
                      </div>
                      <p className="text-muted-foreground ml-13">
                        Go to <Link href="/dashboard" className="text-primary hover:underline">AxLiner Dashboard</Link> and upload your invoice images. You can upload multiple invoices at once for batch processing. The system supports up to 10 files per batch.
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                          3
                        </div>
                        <h3 className="text-2xl font-semibold">AI Processing</h3>
                      </div>
                      <p className="text-muted-foreground ml-13">
                        AxLiner's 7B parameter Llama 3-based model processes your invoices using advanced OCR technology. It recognizes invoice headers, line items, totals, tax amounts, and vendor information. Processing typically takes 15-30 seconds per invoice.
                      </p>
                    </div>

                    {/* Step 4 */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                          4
                        </div>
                        <h3 className="text-2xl font-semibold">Download Your Excel File</h3>
                      </div>
                      <p className="text-muted-foreground ml-13">
                        Once processing is complete, download your Excel file. The data is structured with proper column headers, making it immediately usable for analysis or import into accounting software.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Use Cases */}
              <Card className="bg-white dark:bg-card border border-border shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-6">Common Use Cases</h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Accounts Payable</h3>
                      <p className="text-muted-foreground">
                        Process vendor invoices quickly for payment approval and record-keeping.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Expense Management</h3>
                      <p className="text-muted-foreground">
                        Convert receipts and expense reports to Excel for reimbursement tracking.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Financial Audits</h3>
                      <p className="text-muted-foreground">
                        Digitize historical invoices for audit trails and compliance documentation.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Data Analytics</h3>
                      <p className="text-muted-foreground">
                        Analyze spending patterns, vendor performance, and cost trends in Excel.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CTA */}
              <Card className="bg-primary text-primary-foreground border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <h2 className="text-3xl font-bold mb-4">Ready to Automate Your Invoice Processing?</h2>
                  <p className="text-lg mb-6 opacity-90">
                    Try AxLiner today and convert your first invoice in under a minute
                  </p>
                  <Button asChild size="lg" variant="secondary" className="rounded-full">
                    <Link href="/dashboard">Start Converting Now - Free Trial</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
