"use client"

import { motion } from "framer-motion"

/* ──────────────────────────────────────────────────────────────
   A3 — "Verifiable, not invisible."
   A calm, visual contrast: opaque black-box AI vs AxLiner, where
   every field carries a confidence dot, every value points to its
   spot on the source, and every flag explains itself.
   Legend: High (emerald) · Review (amber) · Flagged (rose).
   ────────────────────────────────────────────────────────────── */

const easeOut = [0.22, 1, 0.36, 1] as const

/* Confidence states — one shared visual language */
const CONFIDENCE = {
  high: { dot: "bg-emerald-500", ring: "ring-emerald-500/30", text: "text-emerald-700" },
  review: { dot: "bg-amber-500", ring: "ring-amber-500/30", text: "text-amber-700" },
  flagged: { dot: "bg-rose-500", ring: "ring-rose-500/30", text: "text-rose-700" },
} as const

type Confidence = keyof typeof CONFIDENCE

/* The AxLiner side — fields that point to a spot on the document */
const FIELDS: { label: string; value: string; confidence: Confidence; why: string }[] = [
  { label: "Vendor", value: "Acme Supplies Ltd", confidence: "high", why: "matched header logo" },
  { label: "Total", value: "$1,240.00", confidence: "high", why: "matched “Total TTC” label" },
  { label: "VAT", value: "$206.67", confidence: "review", why: "no clear VAT line found" },
  { label: "Due date", value: "May 30, 2026", confidence: "flagged", why: "two dates on document" },
]

function LegendChip({ confidence, label }: { confidence: Confidence; label: string }) {
  const c = CONFIDENCE[confidence]
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[13px] font-semibold text-neutral-700 shadow-[0_1px_2px_0_rgba(0,0,0,0.06)] ring-1 ring-neutral-200">
      <span className={`size-2.5 rounded-full ${c.dot}`} aria-hidden />
      {label}
    </span>
  )
}

export function VerifiableShowcase() {
  return (
    <section
      aria-labelledby="verifiable-heading"
      className="relative overflow-hidden bg-white py-20 lg:py-28"
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 id="verifiable-heading" className="ax-h2 font-bold text-neutral-950">
            See where every number came from.
          </h2>
          <p className="ax-body mt-4 font-semibold text-neutral-700">
            Other tools hand you an answer and ask you to trust it. AxLiner shows its work. Every
            field carries a confidence dot, every value points to its spot on the document, and every
            flag explains itself.
          </p>
        </motion.div>

        {/* ── Side-by-side contrast ── */}
        <div className="mt-14 grid items-stretch gap-5 lg:mt-16 lg:grid-cols-2 lg:gap-6">
          {/* LEFT — Black-box AI (opaque, no provenance) */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: easeOut }}
            className="relative flex flex-col overflow-hidden rounded-3xl bg-[#f7f3e9] p-8 ring-1 ring-black/10"
          >
            <div className="flex items-center gap-2.5">
              <span className="size-2.5 rounded-full bg-neutral-500" aria-hidden />
              <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-neutral-700">
                Black-box AI
              </p>
            </div>
            <p className="mt-3 text-[16px] font-semibold leading-relaxed text-neutral-800">
              An answer with no provenance. You re-check everything by hand.
            </p>

            {/* Opaque rows — values with no confidence, no source */}
            <div className="mt-7 space-y-2.5">
              {FIELDS.map((f) => (
                <div
                  key={f.label}
                  className="flex items-center justify-between rounded-xl bg-white px-4 py-3 ring-1 ring-black/10"
                >
                  <span className="text-[13px] font-medium text-neutral-600">{f.label}</span>
                  <span className="font-mono text-[13px] font-semibold text-neutral-950">{f.value}</span>
                  {/* No provenance — a blank where the proof should be */}
                  <span
                    className="flex size-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-neutral-500 ring-1 ring-black/10"
                    aria-hidden
                  >
                    ?
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-auto pt-7 text-[14px] font-semibold text-neutral-700">
              Was the VAT right? You can&apos;t tell without opening the file.
            </p>
          </motion.div>

          {/* RIGHT — AxLiner (every value points to its spot on the source) */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: easeOut, delay: 0.08 }}
            className="relative flex flex-col overflow-hidden rounded-3xl bg-[var(--brand-green)] p-8 ring-1 ring-black/10"
          >
            <div className="flex items-center gap-2.5">
              <span className="size-2.5 rounded-full bg-emerald-600" aria-hidden />
              <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-neutral-950">
                AxLiner
              </p>
            </div>
            <p className="mt-3 text-[16px] font-semibold leading-relaxed text-neutral-800">
              Every field sourced, scored, and explained before it touches your books.
            </p>

            {/* Source + fields, visually linked */}
            <div className="mt-7 grid grid-cols-[auto_1fr] gap-4">
              {/* The source document — with a highlighted "spot" */}
              <div className="relative w-[88px] shrink-0 rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-black/10">
                <div className="space-y-1.5" aria-hidden>
                  <div className="h-1.5 w-3/4 rounded-full bg-neutral-200" />
                  <div className="h-1.5 w-1/2 rounded-full bg-neutral-200" />
                  {/* highlighted region = where a value came from */}
                  <div className="mt-2 h-3 w-full rounded bg-emerald-200 ring-1 ring-emerald-500/60" />
                  <div className="h-1.5 w-2/3 rounded-full bg-neutral-200" />
                  <div className="h-1.5 w-3/5 rounded-full bg-neutral-200" />
                  {/* a flagged region = ambiguous date */}
                  <div className="mt-2 h-3 w-4/5 rounded bg-rose-100 ring-1 ring-rose-400/60" />
                  <div className="h-1.5 w-1/2 rounded-full bg-neutral-200" />
                </div>
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-neutral-950 ring-1 ring-black/10">
                  Source
                </span>
              </div>

              {/* Extracted fields — each a confidence dot + a "why" */}
              <div className="space-y-2">
                {FIELDS.map((f) => {
                  const c = CONFIDENCE[f.confidence]
                  return (
                    <div
                      key={f.label}
                      className={`rounded-xl bg-white px-3.5 py-2.5 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] ring-1 ${c.ring}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12px] font-semibold text-neutral-500">{f.label}</span>
                        <span className={`size-2.5 shrink-0 rounded-full ${c.dot}`} aria-hidden />
                      </div>
                      <div className="mt-0.5 font-mono text-[13px] font-bold text-neutral-900">
                        {f.value}
                      </div>
                      {/* the flag explains itself */}
                      <div className={`mt-1 text-[11px] font-semibold ${c.text}`}>Reason: {f.why}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Legend ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: easeOut, delay: 0.1 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <span className="text-[13px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
            Confidence
          </span>
          <LegendChip confidence="high" label="High" />
          <LegendChip confidence="review" label="Review" />
          <LegendChip confidence="flagged" label="Flagged" />
        </motion.div>
      </div>
    </section>
  )
}
