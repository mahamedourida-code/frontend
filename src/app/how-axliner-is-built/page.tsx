import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { MarketingNavBar } from "@/components/MarketingNavBar";
import ScrollAnimatedSection from "@/components/ScrollAnimatedSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "How AxLiner Is Built | Handwritten OCR Engine",
  description:
    "How AxLiner combines a fine-tuned vision-language model, table structure recovery, batch orchestration, and spreadsheet export logic.",
  alternates: {
    canonical: "https://www.axliner.com/how-axliner-is-built",
  },
};

const buildSteps = [
  {
    label: "Vision encoder",
    copy: "Pages are normalized into visual tokens so ruled tables, handwriting, stamps, shadows, and phone captures stay readable before extraction.",
  },
  {
    label: "Instruction tuning",
    copy: "The OCR path is shaped around Qwen2-VL and olmOCR-style document prompts, then tuned for handwritten text, table boundaries, and spreadsheet output.",
  },
  {
    label: "Schema alignment",
    copy: "Rows, headers, merged cells, totals, and column relationships are rebuilt before export so the workbook behaves like a table, not loose text.",
  },
  {
    label: "Batch orchestration",
    copy: "Redis-backed queues, durable file metadata, and retry-aware workers keep multi-file conversion recoverable when users upload real batches.",
  },
];

const telemetryRows = [
  ["Vision", "page patches, rotation, contrast cleanup", "ready"],
  ["Language", "handwriting tokens and table prompts", "tuned"],
  ["Structure", "cell graph, headers, merged regions", "mapped"],
  ["Export", "xlsx schema and corrected tables", "ready"],
];

const barSeries = [36, 58, 44, 78, 70, 96, 66, 84, 92, 74];

export default function HowAxlinerIsBuiltPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <MarketingNavBar />

      <section className="mx-auto grid max-w-[1540px] gap-10 px-4 pb-14 pt-28 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(520px,1.05fr)] lg:px-8 lg:pt-32">
        <div className="lg:pt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            How AxLiner's Built
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-normal sm:text-5xl lg:text-6xl">
            A fine-tuned document engine for handwritten tables.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground">
            AxLiner uses a 7B-class vision-language model in the Qwen2-VL and olmOCR family, then wraps it with table recovery, batch processing, durable metadata, and Excel export logic.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="rounded-md px-6">
              <Link href="/dashboard/client">Convert files</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-md px-6">
              <Link href="/benchmarks">View benchmarks</Link>
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden border-border bg-card p-2 shadow-sm">
          <Image
            src="/purchase.webp"
            alt="AxLiner document engine workspace"
            width={1100}
            height={760}
            sizes="(min-width: 1024px) 48vw, 100vw"
            className="h-[360px] w-full rounded-md object-cover object-center sm:h-[440px] lg:h-[520px]"
            priority
          />
        </Card>
      </section>

      <ScrollAnimatedSection className="mx-auto max-w-[1540px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.78fr)]">
          <Card className="overflow-hidden border-border bg-card shadow-sm" data-animate="stagger">
            <CardHeader className="border-b border-border">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Model stack
              </p>
              <CardTitle className="mt-1 text-2xl">From page pixels to Excel cells</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {buildSteps.map((step, index) => (
                <div key={step.label} className="grid gap-4 border-b border-border p-5 last:border-b-0 sm:grid-cols-[72px_1fr] sm:items-center">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background text-sm font-semibold">
                    0{index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">{step.label}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.copy}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-sm" data-animate="stagger">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-base">Extraction telemetry</CardTitle>
              <p className="text-sm text-muted-foreground">Compact operator-style signals for the conversion path.</p>
            </CardHeader>
            <CardContent className="space-y-5 p-5">
              <div className="rounded-md border border-border bg-background p-4">
                {telemetryRows.map(([label, copy, state]) => (
                  <div key={label} className="grid grid-cols-[92px_1fr_auto] gap-3 border-b border-border py-3 text-sm last:border-b-0">
                    <span className="font-semibold text-foreground">{label}</span>
                    <span className="text-muted-foreground">{copy}</span>
                    <span className="font-semibold text-foreground">{state}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-md border border-border bg-muted p-4">
                <div className="flex items-end gap-1.5">
                  {barSeries.map((height, index) => (
                    <span key={index} className="w-full rounded-sm bg-primary/75" style={{ height: `${height}px` }} />
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <span>image</span>
                  <span>tokens</span>
                  <span>xlsx</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollAnimatedSection>

      <ScrollAnimatedSection className="mx-auto max-w-[1540px] px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            ["Handwritten specialist", "The extraction prompt and review path are tuned for handwritten tables, messy notes, invoices, forms, and scanned PDF pages."],
            ["Batch-first product layer", "Jobs, files, downloads, and review states are kept together so a user can process many pages without losing track of outputs."],
            ["Spreadsheet review loop", "The output is built for correction, comparison, and final download rather than a one-shot OCR text dump."],
          ].map(([title, copy]) => (
            <Card key={title} className="border-border bg-card shadow-sm" data-animate="stagger">
              <CardContent className="p-6">
                <div className="mb-5 h-1.5 w-12 rounded-full bg-primary" />
                <h2 className="text-xl font-semibold text-foreground">{title}</h2>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">{copy}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollAnimatedSection>
    </main>
  );
}
