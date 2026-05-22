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
      title="The model reads the document. The product layer makes it a batch a user can trust."
      meta="Technical note: AxLiner is designed around handwritten document extraction and spreadsheet review."
      links={engineLinks}
      hero={
        <BrandVisualFrame treatment="photo" className="mt-9 aspect-[16/9]">
          <Image
            src="/purchase.webp"
            alt="AxLiner document engine workflow"
            fill
            priority
            sizes="(min-width: 1024px) 820px, 100vw"
            className="rounded-md object-cover object-center"
          />
        </BrandVisualFrame>
      }
      intro={
        <>
          <p>
            AxLiner is not only an OCR prompt. It combines a document-reading model path with table reconstruction,
            durable jobs, and reviewable Excel output so a user can send several handwritten files through one flow.
          </p>
          <p>
            The architecture is shaped around the moment after extraction: the page needs a clear owner, the files need
            recoverable state, and the result needs to behave like a spreadsheet instead of an OCR transcript.
          </p>
        </>
      }
    >
      <section id="model" className="scroll-mt-32 border-t border-border pt-9">
        <h2 className="text-3xl font-semibold tracking-normal">Model path</h2>
        <div className="mt-5 space-y-4">
          <p>
            The extraction path starts with a vision-language model in the Qwen2-VL and olmOCR direction: document
            pixels are turned into a representation the model can read, and the prompt path is narrowed toward page
            reading instead of general conversation.
          </p>
          <p>
            That distinction matters for handwriting. A messy paper table is visual, linguistic, and structural at the
            same time. AxLiner needs the reader to notice characters, but it also needs the product to keep the reading
            attached to a file, page, row, and output that a user can inspect.
          </p>
        </div>
        <div className="mt-7 space-y-4">
          {buildSteps.map(([title, copy], index) => (
            <div key={title} className="grid gap-4 border-t border-border pt-4 sm:grid-cols-[64px_1fr]">
              <span className="text-sm font-semibold text-muted-foreground">0{index + 1}</span>
              <div>
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-base leading-7 text-muted-foreground">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="structure" className="scroll-mt-32 border-t border-border pt-9">
        <h2 className="text-3xl font-semibold tracking-normal">Table structure</h2>
        <div className="mt-5 space-y-4">
          <p>
            A workbook is more demanding than plain OCR text. The pipeline has to preserve the idea of a header, detect
            when writing belongs to the next row, keep totals attached to their column, and avoid turning a ruled table
            into a paragraph.
          </p>
          <p>
            AxLiner therefore treats structure recovery as a separate product concern. The result preview, editable
            cells, corrected downloads, and batch comparison cards all depend on a consistent table schema after the
            reading step.
          </p>
        </div>
        <Card className="mt-7 border-border bg-card shadow-sm">
          <CardContent className="p-5">
            {telemetryRows.map(([label, copy, state]) => (
              <div
                key={label}
                className="grid gap-2 border-b border-border py-4 text-sm last:border-b-0 sm:grid-cols-[110px_1fr_auto] sm:items-center"
              >
                <span className="font-semibold">{label}</span>
                <span className="leading-6 text-muted-foreground">{copy}</span>
                <span className="w-fit rounded-md border border-border bg-background px-2.5 py-1 font-semibold">
                  {state}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section id="batch" className="scroll-mt-32 border-t border-border pt-9">
        <h2 className="text-3xl font-semibold tracking-normal">Batch layer</h2>
        <div className="mt-5 space-y-4">
          <p>
            Batch upload is where the model becomes software. The web request should not own the whole run. Queue
            admission, workers, storage metadata, file ownership, and retry-safe outputs need to carry the job while
            the user navigates, reloads, or downloads several results.
          </p>
          <p>
            That layer protects the experience from a common OCR failure mode: one file works in a demo, but five files
            become unclear in production. AxLiner keeps job state, result files, and review actions together because the
            time saved comes from handling the group, not only the first image.
          </p>
        </div>
      </section>

      <section id="export" className="scroll-mt-32 border-t border-border pt-9">
        <h2 className="text-3xl font-semibold tracking-normal">Excel review</h2>
        <div className="mt-5 space-y-4">
          <p>
            Output is finished when it is usable. The comparison view lets a user see the source beside the table,
            correct cells inline, mark reviewed files, and download the corrected batch. That review loop is the bridge
            between model output and finance, operations, or reporting work.
          </p>
          <p>
            For teams that spend money on manual data entry, this is the practical target: fewer repeated keystrokes,
            faster batch review, and spreadsheets that remain editable once they leave AxLiner.
          </p>
        </div>
        <div className="mt-9 flex flex-wrap gap-3">
          <Button asChild className="rounded-md px-6">
            <Link href="/dashboard/client">Convert files</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-md px-6">
            <Link href="/benchmarks">Read benchmarks</Link>
          </Button>
        </div>
      </section>
    </EditorialPageShell>
  )
}
