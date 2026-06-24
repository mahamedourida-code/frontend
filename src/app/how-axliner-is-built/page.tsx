import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { BrandVisualFrame } from "@/components/BrandVisual"
import { EditorialPageShell } from "@/components/EditorialPageShell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "How AxLiner Is Built | Handwritten OCR Engine",
  description:
    "How AxLiner combines a fine-tuned vision-language model, table structure recovery, batch orchestration, and spreadsheet export logic.",
  alternates: {
    canonical: "https://www.axliner.com/how-axliner-is-built",
  },
}

const engineLinks = [
  { id: "model", title: "Model path" },
  { id: "structure", title: "Table structure" },
  { id: "batch", title: "Batch layer" },
  { id: "export", title: "Excel review" },
]

const buildSteps = [
  ["Vision pass", "Document pages become visual tokens after rotation, contrast, patch, and page-shape preparation."],
  ["Document prompt", "A 7B-class Qwen2-VL and olmOCR-style extraction path is guided toward handwriting, forms, and tables."],
  ["Cell graph", "Headers, rows, totals, merged areas, and column relationships are rebuilt before export."],
  ["Owned job flow", "Queue state, file metadata, retries, and downloads sit around the model so a batch can survive real use."],
]

const telemetryRows = [
  ["Vision", "page patches, rotation, low contrast", "prepared"],
  ["Reading", "handwriting tokens and table prompts", "tuned"],
  ["Structure", "cells, headers, merged regions", "mapped"],
  ["Export", "workbook schema and review state", "ready"],
]

export default function HowAxlinerIsBuiltPage() {
  return (
    <EditorialPageShell
      eyebrow="How AxLiner is built"
      title="Built for the whole batch, not the perfect demo."
      meta="Technical note: AxLiner is designed around handwritten document extraction and spreadsheet review."
      links={engineLinks}
      hero={
        <BrandVisualFrame treatment="photo" className="mt-9 min-h-[420px] bg-white">
          <Image
            src="/purchase.webp"
            alt="AxLiner document engine workflow"
            fill
            priority
            sizes="(min-width: 1024px) 820px, 100vw"
            className="object-contain"
          />
        </BrandVisualFrame>
      }
      intro={
        <p>
          AxLiner combines document reading, table reconstruction, durable batch jobs, and reviewable Excel output. Each
          page keeps an owner and recoverable state, and each result behaves like a spreadsheet instead of an OCR transcript.
        </p>
      }
    >
      <section id="model" className="scroll-mt-32">
        <h2 className="text-3xl font-medium tracking-[-0.03em]">Model path</h2>
        <div className="mt-5 space-y-4">
          <p>
            The extraction path starts with a vision-language model in the Qwen2-VL and olmOCR direction: document
            pixels are turned into a representation the model can read, and the prompt path is narrowed toward page
            reading. The result stays attached to a file, page, row, and reviewable output.
          </p>
        </div>
        <div className="mt-7 space-y-4">
          {buildSteps.map(([title, copy], index) => (
            <div key={title} className="grid gap-4 rounded-3xl bg-[#FDFBF7] p-5 sm:grid-cols-[64px_1fr]">
              <span className="text-sm font-semibold text-[var(--landing-blue)]">0{index + 1}</span>
              <div>
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-base leading-7 text-muted-foreground">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="structure" className="scroll-mt-32">
        <h2 className="text-3xl font-medium tracking-[-0.03em]">Table structure</h2>
        <div className="mt-5 space-y-4">
          <p>
            A workbook is more demanding than plain OCR text. The pipeline has to preserve the idea of a header, detect
            when writing belongs to the next row, keep totals attached to their column, and avoid turning a ruled table
            into a paragraph. Preview, editable cells, corrected downloads, and batch comparison all depend on that
            consistent schema.
          </p>
        </div>
        <Card className="mt-7 rounded-3xl border-black/10 bg-[#FDFBF7] shadow-none">
          <CardContent className="p-5">
            {telemetryRows.map(([label, copy, state]) => (
              <div
                key={label}
                className="grid gap-2 border-b border-border py-4 text-sm last:border-b-0 sm:grid-cols-[110px_1fr_auto] sm:items-center"
              >
                <span className="font-semibold">{label}</span>
                <span className="leading-6 text-muted-foreground">{copy}</span>
                <span className="w-fit rounded-full border border-black/10 bg-white px-3 py-1 font-semibold text-[var(--landing-blue)]">
                  {state}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section id="batch" className="scroll-mt-32">
        <h2 className="text-3xl font-medium tracking-[-0.03em]">Batch layer</h2>
        <div className="mt-5 space-y-4">
          <p>
            Queue admission, workers, storage metadata, file ownership, and retry-safe outputs carry the run beyond one
            web request. Job state, result files, and review actions stay together because the time saved comes from the
            whole group, not only the first image.
          </p>
        </div>

        {/* Team / engineering accent photo */}
        <BrandVisualFrame treatment="photo" className="mt-8 min-h-[340px] bg-[#FDFBF7]">
          <Image
            src="/photos/austin-distel-mpN7xjKQ_Ns-unsplash.jpg"
            alt="Engineering team designing the AxLiner batch processing layer"
            fill
            sizes="(min-width: 1024px) 820px, 100vw"
            className="object-contain"
          />
        </BrandVisualFrame>
      </section>

      <section id="export" className="scroll-mt-32">
        <h2 className="text-3xl font-medium tracking-[-0.03em]">Excel review</h2>
        <div className="mt-5 space-y-4">
          <p>
            The comparison view puts the source beside the table so teams can correct cells, mark reviewed files, and
            download the batch. The target is fewer repeated keystrokes and editable spreadsheets that remain useful
            after they leave AxLiner.
          </p>
        </div>

        {/* Product / developer build photo */}
        <BrandVisualFrame treatment="photo" className="mt-8 min-h-[340px] bg-[#FDFBF7]">
          <Image
            src="/photos/pexels-mikhail-nilov-8297034.jpg"
            alt="Developer building the AxLiner review board interface"
            fill
            sizes="(min-width: 1024px) 820px, 100vw"
            className="object-contain"
          />
        </BrandVisualFrame>

        <div className="mt-9 flex flex-wrap gap-3">
          <Button asChild variant="glossy" className="px-6">
            <Link href="/dashboard/client">Convert files</Link>
          </Button>
          <Button asChild variant="outline" className="px-6">
            <Link href="/benchmarks">Read benchmarks</Link>
          </Button>
        </div>
      </section>
    </EditorialPageShell>
  )
}
