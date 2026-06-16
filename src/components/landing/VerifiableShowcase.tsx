"use client"

import Image from "next/image"
import { motion } from "framer-motion"

/* ──────────────────────────────────────────────────────────────
   A3 — "Verifiable, not invisible."
   A calm, visual contrast: opaque black-box AI vs AxLiner, where
   every field carries a confidence dot, every value points to its
   spot on the source, and every flag explains itself.
   Legend: High (emerald) · Review (amber) · Flagged (rose).
   ────────────────────────────────────────────────────────────── */

const easeOut = [0.22, 1, 0.36, 1] as const

/* The black-box side — opaque values with no provenance */
const FIELDS: { label: string; value: string }[] = [
  { label: "Vendor", value: "Acme Supplies Ltd" },
  { label: "Total", value: "$1,240.00" },
  { label: "VAT", value: "$206.67" },
  { label: "Due date", value: "May 30, 2026" },
]

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
        </motion.div>

        {/* ── Side-by-side contrast ── */}
        <div className="mt-14 grid items-start gap-5 lg:mt-16 lg:grid-cols-2 lg:gap-6">
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

          {/* RIGHT — AxLiner Review Board (raw screenshot) */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: easeOut, delay: 0.08 }}
            className="relative overflow-hidden rounded-3xl ring-1 ring-black/10"
          >
            <Image
              src="/review-board.png"
              alt="AxLiner Review Board — extracted fields beside the source document"
              width={1583}
              height={686}
              className="h-auto w-full"
              priority={false}
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
