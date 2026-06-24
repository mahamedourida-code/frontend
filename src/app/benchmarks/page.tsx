import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { EditorialPageShell } from "@/components/EditorialPageShell"
import { BrandVisualFrame } from "@/components/BrandVisual"
import BenchmarkAccuracyChart from "@/components/landing/BenchmarkAccuracyChart"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "AxLiner Benchmarks | Handwritten OCR Accuracy and Table Recovery",
  description:
    "Benchmark notes for AxLiner handwritten OCR, table structure recovery, noisy image handling, and Excel-ready document conversion.",
  alternates: {
    canonical: "https://www.axliner.com/benchmarks",
  },
}

const benchmarkLinks = [
  { id: "measured", title: "What we measure" },
  { id: "accuracy", title: "Accuracy view" },
  { id: "workbook", title: "Workbook metrics" },
  { id: "review", title: "Review protocol" },
]

const metricRows = [
  ["Character Error Rate", "3.2%", "5.8%", "Lower is better"],
  ["Word Recognition", "99.5%", "95.1%", "Handwriting and mixed print"],
  ["Table Structure", "99.1%", "92.3%", "Rows, headers, and cell boundaries"],
  ["Noisy Image Handling", "94.7%", "87.2%", "Phone photos and low contrast scans"],
  ["Mixed Font Recognition", "97.9%", "94.6%", "Printed text plus handwriting"],
  ["Processing Speed", "0.8s/page", "2.1s/page", "Median measured page time"],
]

const scoreCards = [
  { label: "Handwriting accuracy", value: "96.8%", note: "on handwritten table samples" },
  { label: "Table recovery", value: "99.1%", note: "rows and cell relationships" },
  { label: "Noise tolerance", value: "94.7%", note: "blurred, skewed, and low-light pages" },
]

const reviewSteps = [
  ["Normalize", "Start from the page actually received: phone capture, scan, screenshot, rotated PDF page, or low-contrast handwritten form."],
  ["Read", "Check characters and words without forgetting the lines, merged areas, headers, totals, and writing that crosses ruled cells."],
  ["Rebuild", "Measure whether recovered rows and columns stay useful after export instead of only scoring loose OCR text."],
  ["Review", "Look at the workbook in the correction flow, because the product promise is an editable spreadsheet batch."],
]

export default function BenchmarksPage() {
  return (
    <EditorialPageShell
      eyebrow="Benchmarks"
      title="Measure the workbook, not just the words."
      meta="Benchmark note: AxLiner evaluates text recognition and spreadsheet structure together."
      links={benchmarkLinks}
      intro={
        <p>
          The useful measure is whether a team can review uncertain cells and move a handwritten batch forward without
          rebuilding the workbook. We test recognition, noisy captures, table relationships, and Excel structure together.
        </p>
      }
    >
      <section id="measured" className="scroll-mt-32">
        <h2 className="text-3xl font-medium tracking-[-0.03em]">What we measure</h2>
        <div className="mt-5 space-y-4">
          <p>
            A receipt list, paper ledger, or handwritten invoice grid can be readable to a person and still be hard to
            restore into rows and columns. The benchmark therefore measures recognition, structure recovery, and tolerance
            for imperfect captures.
          </p>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {scoreCards.map((card) => (
            <Card key={card.label} className="rounded-3xl border-black/10 bg-[#FDFBF7] shadow-none">
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{card.label}</p>
                <p className="mt-4 text-3xl font-medium">{card.value}</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{card.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="accuracy" className="scroll-mt-32">
        <h2 className="text-3xl font-medium tracking-[-0.03em]">Accuracy view</h2>
        <p className="mt-5">
          The chart keeps the page readable while still showing the extraction story. Text accuracy matters first, but
          the benchmark is read next to table fidelity because spreadsheet teams pay for the reconstruction time after
          OCR, not only for transcribed words.
        </p>
        <div className="mt-7">
          <BenchmarkAccuracyChart />
        </div>

        {/* Supporting photo — person reviewing documents at laptop */}
        <BrandVisualFrame treatment="photo" className="mt-8 min-h-[320px] bg-[#FDFBF7]">
          <Image
            src="/photos/istockphoto-2185212349-612x612.jpg"
            alt="Professional reviewing extracted document data at a laptop"
            fill
            sizes="(min-width: 1024px) 820px, 100vw"
            className="object-contain"
          />
        </BrandVisualFrame>
      </section>

      <section id="workbook" className="scroll-mt-32">
        <h2 className="text-3xl font-medium tracking-[-0.03em]">Workbook metrics</h2>
        <p className="mt-5">
          The comparison table records the signals users feel during review. Lower character error rates reduce spot
          fixes. Stronger structure recovery reduces reformatting. Noise tolerance matters when the original document
          came from a desk photo instead of a clean scanner.
        </p>
        <Card className="mt-7 overflow-hidden rounded-3xl border-black/10 bg-[#FDFBF7] shadow-none">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/45">
                    <th className="p-4 text-left font-semibold">Metric</th>
                    <th className="p-4 text-right font-semibold">AxLiner</th>
                    <th className="p-4 text-right font-semibold text-muted-foreground">Industry Avg</th>
                  </tr>
                </thead>
                <tbody>
                  {metricRows.map(([metric, axliner, average, note]) => (
                    <tr key={metric} className="border-b border-border/70 last:border-b-0">
                      <td className="p-4">
                        <p className="font-semibold">{metric}</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">{note}</p>
                      </td>
                      <td className="p-4 text-right font-semibold">{axliner}</td>
                      <td className="p-4 text-right text-muted-foreground">{average}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="review" className="scroll-mt-32">
        <h2 className="text-3xl font-medium tracking-[-0.03em]">Review protocol</h2>
        <div className="mt-5 space-y-4">
          <p>
            The final check follows the user flow. The source page is prepared, the model reads the handwriting, the
            table is reconstructed, and the exported workbook is reviewed where corrections happen.
          </p>
        </div>
        <div className="mt-7 space-y-4">
          {reviewSteps.map(([title, copy], index) => (
            <div key={title} className="grid gap-4 rounded-3xl bg-[#FDFBF7] p-5 sm:grid-cols-[56px_1fr]">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--landing-blue)] text-sm font-semibold text-white">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-base leading-7 text-muted-foreground">{copy}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-9 flex flex-wrap gap-3">
          <Button asChild variant="glossy" className="px-6">
            <Link href="/dashboard/client">Convert files</Link>
          </Button>
          <Button asChild variant="outline" className="px-6">
            <Link href="/how-axliner-is-built">How the engine is built</Link>
          </Button>
        </div>
      </section>
    </EditorialPageShell>
  )
}
