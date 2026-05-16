import type { Metadata } from "next";
import Link from "next/link";

import BenchmarkAccuracyChart from "@/components/landing/BenchmarkAccuracyChart";
import { MarketingNavBar } from "@/components/MarketingNavBar";
import ScrollAnimatedSection from "@/components/ScrollAnimatedSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "AxLiner Benchmarks | Handwritten OCR Accuracy and Table Recovery",
  description:
    "Benchmark notes for AxLiner handwritten OCR, table structure recovery, noisy image handling, and Excel-ready document conversion.",
  alternates: {
    canonical: "https://www.axliner.com/benchmarks",
  },
};

const metricRows = [
  ["Character Error Rate", "3.2%", "5.8%", "Lower is better"],
  ["Word Recognition", "99.5%", "95.1%", "Handwriting and mixed print"],
  ["Table Structure", "99.1%", "92.3%", "Rows, headers, and cell boundaries"],
  ["Noisy Image Handling", "94.7%", "87.2%", "Phone photos and low contrast scans"],
  ["Mixed Font Recognition", "97.9%", "94.6%", "Printed text plus handwriting"],
  ["Processing Speed", "0.8s/page", "2.1s/page", "Median measured page time"],
];

const scoreCards = [
  { label: "Handwriting accuracy", value: "96.8%", note: "on handwritten table samples", width: 97 },
  { label: "Table recovery", value: "99.1%", note: "rows and cell relationships", width: 99 },
  { label: "Noise tolerance", value: "94.7%", note: "blurred, skewed, and low-light pages", width: 95 },
];

const reviewSteps = [
  "Image normalization",
  "Handwriting token pass",
  "Table graph recovery",
  "Spreadsheet export check",
];

export default function BenchmarksPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <MarketingNavBar />

      <section className="mx-auto max-w-[1540px] px-4 pb-12 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Benchmarks
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-normal sm:text-5xl lg:text-6xl">
              Handwritten OCR measured against real spreadsheet work.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground">
              AxLiner is evaluated on the details that matter after upload: handwriting recognition, table structure, noisy captures, and whether the result is ready to review in Excel.
            </p>
          </div>

          <Card className="border-border bg-card shadow-sm">
            <CardContent className="grid gap-4 p-5 sm:grid-cols-3">
              {scoreCards.map((card) => (
                <div key={card.label} className="rounded-md border border-border bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {card.label}
                  </p>
                  <p className="mt-4 text-3xl font-semibold text-foreground">{card.value}</p>
                  <div className="mt-4 h-2 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${card.width}%` }} />
                  </div>
                  <p className="mt-3 text-xs font-medium leading-5 text-muted-foreground">{card.note}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <ScrollAnimatedSection className="mx-auto max-w-[1540px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.86fr)]">
          <BenchmarkAccuracyChart />

          <Card className="border-border bg-card shadow-sm" data-animate="stagger">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-lg font-semibold">Performance Metrics</CardTitle>
              <p className="text-sm text-muted-foreground">Average across real-world handwritten and table-heavy samples.</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="p-3 text-left font-semibold">Metric</th>
                      <th className="p-3 text-right font-semibold">AxLiner</th>
                      <th className="p-3 text-right font-semibold text-muted-foreground">Industry Avg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metricRows.map(([metric, axliner, average, note]) => (
                      <tr key={metric} className="border-b border-border/70 last:border-b-0">
                        <td className="p-3">
                          <p className="font-semibold text-foreground">{metric}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{note}</p>
                        </td>
                        <td className="p-3 text-right font-semibold text-foreground">{axliner}</td>
                        <td className="p-3 text-right text-muted-foreground">{average}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollAnimatedSection>

      <ScrollAnimatedSection className="mx-auto max-w-[1540px] px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div data-animate="headline">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Review protocol
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-normal sm:text-4xl">
              Scores are checked around the final workbook, not only OCR text.
            </h2>
          </div>

          <div className="grid gap-4" data-animate="stagger">
            {reviewSteps.map((step, index) => (
              <div key={step} className="grid grid-cols-[48px_1fr] gap-4 rounded-md border border-border bg-card p-4 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background text-sm font-semibold">
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold text-foreground">{step}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Each stage is reviewed for spreadsheet usability: readable cells, stable rows, preserved headers, and output that can be corrected quickly.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollAnimatedSection>

      <section className="mx-auto max-w-[1540px] px-4 pb-20 sm:px-6 lg:px-8">
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-semibold text-foreground">Ready to test your own batch?</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Upload several pages and compare image-to-spreadsheet output directly in the review workspace.
              </p>
            </div>
            <Button asChild className="rounded-md px-6">
              <Link href="/dashboard/client">Convert files</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
