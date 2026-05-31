"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

/* ──────────────────────────────────────────────────────────────────
 * "Messy reality → clean reviewed entry"  (positioning prompt A2)
 *
 * The documents we WIN on — handwriting, blurry phone photos, wrinkled
 * receipts, WhatsApp screenshots, multi-language invoices — each paired
 * with the clean reviewed entry it becomes. The messy "documents" are
 * built entirely from CSS / SVG (no image assets), so nothing here
 * depends on a file that may be missing. Confidence is framed field /
 * row-level (emerald = trusted · amber = check this), never "% accuracy".
 * ────────────────────────────────────────────────────────────────── */

type CleanField = {
  label: string
  value: string
  /** "ok" = AxLiner is confident · "check" = flagged for the human */
  state?: "ok" | "check"
}

type Archetype = {
  key: string
  badge: string
  caption: string
  /** the messy-document visual treatment */
  Doc: () => React.JSX.Element
  /** the clean reviewed entry it resolves to */
  entryTitle: string
  fields: CleanField[]
}

/* ── Shared messy-paper shell ─────────────────────────────────────── */

function PaperBase({
  children,
  className,
  tint = "bg-[#fdfcf7]",
}: {
  children: React.ReactNode
  className?: string
  tint?: string
}) {
  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-lg ring-1 ring-black/[0.06]",
        tint,
        className,
      )}
    >
      {children}
    </div>
  )
}

/* A scribbled "handwriting" line — irregular baseline, ink-blue, hand feel */
function InkLine({ w, className }: { w: number; className?: string }) {
  return (
    <span
      className={cn("block h-[3px] rounded-full bg-sky-900/55", className)}
      style={{ width: `${w}%`, transform: `rotate(${(w % 5) - 2}deg)` }}
    />
  )
}

/* ── 1 · Handwritten note ─────────────────────────────────────────── */
function HandwrittenDoc() {
  return (
    <PaperBase tint="bg-[#fbf7ec]" className="-rotate-2">
      {/* faint ruled lines */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: "repeating-linear-gradient(transparent 0 21px, rgba(2,132,199,0.14) 21px 22px)",
        }}
      />
      <div className="relative space-y-[14px] px-4 pt-5">
        <InkLine w={66} />
        <InkLine w={88} className="ml-1" />
        <InkLine w={50} />
        <InkLine w={78} className="ml-2" />
        <InkLine w={40} />
      </div>
      {/* coffee-ring stain */}
      <div
        aria-hidden
        className="absolute -bottom-4 right-3 h-12 w-12 rounded-full border-[3px] border-amber-700/15"
      />
    </PaperBase>
  )
}

/* ── 2 · Blurry phone photo ───────────────────────────────────────── */
function BlurryPhotoDoc() {
  return (
    <PaperBase tint="bg-[#f3f1ea]" className="rotate-1">
      {/* the "invoice" content, then blurred + skewed like a bad photo */}
      <div className="absolute inset-0 origin-center scale-110 skew-x-[5deg] blur-[2.5px]">
        <div className="space-y-2 px-5 pt-5">
          <div className="h-2.5 w-1/2 rounded bg-neutral-800/60" />
          <div className="h-2 w-3/4 rounded bg-neutral-700/35" />
          <div className="mt-3 h-px w-full bg-neutral-500/30" />
          <div className="h-2 w-2/3 rounded bg-neutral-700/35" />
          <div className="h-2 w-1/2 rounded bg-neutral-700/35" />
          <div className="mt-3 h-3 w-2/5 rounded bg-neutral-900/55" />
        </div>
      </div>
      {/* harsh glare from the flash */}
      <div
        aria-hidden
        className="absolute -right-6 -top-8 h-24 w-24 rotate-45 bg-white/55 blur-xl"
      />
    </PaperBase>
  )
}

/* ── 3 · Wrinkled receipt ─────────────────────────────────────────── */
function WrinkledReceiptDoc() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative h-full w-[58%] rotate-3 overflow-hidden rounded-sm bg-white shadow-[0_1px_8px_rgba(0,0,0,0.10)] ring-1 ring-black/[0.05]">
        {/* crease shading */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "linear-gradient(105deg, transparent 18%, rgba(0,0,0,0.06) 22%, transparent 27%), linear-gradient(255deg, transparent 55%, rgba(0,0,0,0.05) 60%, transparent 66%)",
          }}
        />
        <div className="relative space-y-[7px] px-3 pt-4 text-center">
          <div className="mx-auto h-2 w-2/3 rounded bg-neutral-800/55" />
          <div className="mx-auto h-px w-full bg-neutral-400/40" />
          <div className="h-1.5 w-full rounded bg-neutral-600/30" />
          <div className="h-1.5 w-5/6 rounded bg-neutral-600/30" />
          <div className="h-1.5 w-full rounded bg-neutral-600/30" />
          <div className="mx-auto mt-2 h-2.5 w-1/2 rounded bg-neutral-900/50" />
        </div>
        {/* torn bottom edge */}
        <div
          aria-hidden
          className="absolute -bottom-1 left-0 right-0 h-3"
          style={{
            background:
              "radial-gradient(circle at 6px 0, transparent 4px, #fff 4px) repeat-x",
            backgroundSize: "12px 12px",
          }}
        />
      </div>
    </div>
  )
}

/* ── 4 · WhatsApp screenshot ──────────────────────────────────────── */
function WhatsAppDoc() {
  return (
    <PaperBase tint="bg-[#e7ddd3]" className="rotate-0">
      {/* chat header */}
      <div className="flex items-center gap-1.5 bg-[#075e54] px-3 py-1.5">
        <span className="size-3 rounded-full bg-white/80" />
        <span className="block h-1.5 w-14 rounded bg-white/60" />
      </div>
      <div className="space-y-2 px-3 py-3">
        {/* incoming text bubble */}
        <div className="w-3/4 rounded-lg rounded-tl-sm bg-white px-2 py-1.5 shadow-sm">
          <span className="block h-1.5 w-full rounded bg-neutral-500/40" />
          <span className="mt-1 block h-1.5 w-2/3 rounded bg-neutral-500/40" />
        </div>
        {/* image-of-invoice bubble */}
        <div className="ml-auto w-[58%] rounded-lg rounded-tr-sm bg-[#dcf8c6] p-1 shadow-sm">
          <div className="space-y-1 rounded bg-white/80 p-1.5">
            <span className="block h-1.5 w-3/4 rounded bg-neutral-600/40" />
            <span className="block h-1.5 w-full rounded bg-neutral-500/30" />
            <span className="block h-2 w-1/2 rounded bg-neutral-800/45" />
          </div>
        </div>
      </div>
    </PaperBase>
  )
}

/* ── 5 · Multi-language invoice ───────────────────────────────────── */
function MultiLangDoc() {
  return (
    <PaperBase tint="bg-white" className="-rotate-1">
      <div className="space-y-2 px-4 pt-4">
        {/* header with two scripts */}
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-bold tracking-tight text-neutral-800">FACTURE</span>
          <span className="text-[11px] font-bold tracking-tight text-neutral-800" dir="rtl">فاتورة</span>
        </div>
        <div className="h-px w-full bg-neutral-300" />
        <div className="flex justify-between">
          <span className="text-[9px] font-semibold text-neutral-500">Montant HT</span>
          <span className="h-1.5 w-10 self-center rounded bg-neutral-500/35" />
        </div>
        <div className="flex justify-between">
          <span className="text-[9px] font-semibold text-neutral-500">TVA · 税</span>
          <span className="h-1.5 w-8 self-center rounded bg-neutral-500/35" />
        </div>
        <div className="flex justify-between">
          <span className="text-[9px] font-bold text-neutral-700">Total · 合計</span>
          <span className="h-2 w-12 self-center rounded bg-neutral-800/50" />
        </div>
      </div>
    </PaperBase>
  )
}

/* ── The five archetypes ──────────────────────────────────────────── */

const ARCHETYPES: Archetype[] = [
  {
    key: "handwritten",
    badge: "Handwritten note",
    caption: "Biro on a ruled pad",
    Doc: HandwrittenDoc,
    entryTitle: "Expense note",
    fields: [
      { label: "Vendor", value: "Marlowe & Sons" },
      { label: "Date", value: "14 May 2026" },
      { label: "Total", value: "$248.00" },
      { label: "Tax", value: "—", state: "check" },
    ],
  },
  {
    key: "blurry",
    badge: "Blurry phone photo",
    caption: "Shot in bad light, on the move",
    Doc: BlurryPhotoDoc,
    entryTitle: "Invoice",
    fields: [
      { label: "Invoice #", value: "INV-2049" },
      { label: "Vendor", value: "Northwind Ltd" },
      { label: "Subtotal", value: "$1,120.00" },
      { label: "Total", value: "$1,344.00" },
    ],
  },
  {
    key: "wrinkled",
    badge: "Wrinkled receipt",
    caption: "Crumpled at the bottom of a bag",
    Doc: WrinkledReceiptDoc,
    entryTitle: "Receipt",
    fields: [
      { label: "Vendor", value: "City Cabs" },
      { label: "Date", value: "02 May 2026" },
      { label: "Total", value: "$36.50" },
      { label: "Category", value: "Travel" },
    ],
  },
  {
    key: "whatsapp",
    badge: "WhatsApp screenshot",
    caption: "Forwarded by a client mid-chat",
    Doc: WhatsAppDoc,
    entryTitle: "Invoice",
    fields: [
      { label: "Vendor", value: "Bright Supplies" },
      { label: "Invoice #", value: "BS-7781" },
      { label: "Total", value: "$612.40" },
      { label: "Due date", value: "—", state: "check" },
    ],
  },
  {
    key: "multilang",
    badge: "Multi-language invoice",
    caption: "French · Arabic · Japanese on one page",
    Doc: MultiLangDoc,
    entryTitle: "Invoice",
    fields: [
      { label: "Vendor", value: "Atlas Trading" },
      { label: "Subtotal (HT)", value: "$2,400.00" },
      { label: "VAT / TVA", value: "$480.00" },
      { label: "Total", value: "$2,880.00" },
    ],
  },
]

/* ── Clean reviewed entry card ────────────────────────────────────── */

function CleanEntry({ archetype }: { archetype: Archetype }) {
  return (
    <div className="flex h-full w-full flex-col rounded-lg bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] ring-1 ring-emerald-200/70">
      <div className="flex items-center justify-between border-b border-emerald-100 px-3.5 py-2.5">
        <span className="text-[12px] font-bold tracking-tight text-neutral-900">
          {archetype.entryTitle}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-[3px] text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-800">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Reviewed
        </span>
      </div>
      <dl className="divide-y divide-neutral-100">
        {archetype.fields.map((field) => {
          const check = field.state === "check"
          return (
            <div key={field.label} className="flex items-center justify-between px-3.5 py-[7px]">
              <dt className="text-[11px] font-semibold text-neutral-500">{field.label}</dt>
              <dd className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    check ? "bg-amber-400" : "bg-emerald-500",
                  )}
                  aria-hidden
                />
                <span
                  className={cn(
                    "text-[12px] font-bold tabular-nums",
                    check ? "text-amber-700" : "text-neutral-900",
                  )}
                >
                  {check ? "Check this" : field.value}
                </span>
              </dd>
            </div>
          )
        })}
      </dl>
    </div>
  )
}

/* ── Arrow connector ──────────────────────────────────────────────── */

function FlowArrow() {
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center text-emerald-700/70"
    >
      {/* horizontal on desktop, vertical on mobile */}
      <svg viewBox="0 0 24 24" className="hidden size-5 sm:block" fill="none">
        <path d="M3 12h16M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <svg viewBox="0 0 24 24" className="size-5 sm:hidden" fill="none">
        <path d="M12 3v16M6 13l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

/* ── Single row ───────────────────────────────────────────────────── */

function ArchetypeRow({ archetype, index }: { archetype: Archetype; index: number }) {
  const { Doc } = archetype
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 }}
      className="grid items-center gap-4 rounded-2xl bg-white/55 p-4 ring-1 ring-emerald-300/40 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.1fr)] sm:gap-5 sm:p-5"
    >
      {/* Messy document */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-800">
          {archetype.badge}
        </span>
        <div className="h-[148px] w-full">
          <Doc />
        </div>
        <span className="text-[11px] font-medium text-neutral-500">{archetype.caption}</span>
      </div>

      <FlowArrow />

      {/* Clean reviewed entry */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-800">
          Clean reviewed entry
        </span>
        <CleanEntry archetype={archetype} />
      </div>
    </motion.div>
  )
}

/* ── Section ──────────────────────────────────────────────────────── */

export function MessyRealityShowcase() {
  return (
    <section id="messy-reality" className="bg-emerald-100">
      <div className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <p className="ax-eyebrow text-emerald-700">The paperwork others demo around</p>
          <h2 className="ax-h2 mt-3 font-bold text-neutral-900">
            Built for the paperwork real businesses actually send.
          </h2>
          <p className="ax-body mt-4 font-semibold text-neutral-900">
            Not clean PDFs. The handwritten note, the blurry photo, the crumpled receipt, the
            WhatsApp forward, the invoice in three languages. AxLiner reads them, then hands you a
            reviewed entry with the uncertain fields flagged — never a black box.
          </p>
        </motion.div>

        <div className="mt-12 space-y-4 sm:mt-14 sm:space-y-5">
          {ARCHETYPES.map((archetype, i) => (
            <ArchetypeRow key={archetype.key} archetype={archetype} index={i} />
          ))}
        </div>

        {/* legend — field/row-level confidence language, not "accuracy %" */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] font-semibold text-neutral-700"
        >
          <span className="inline-flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500" />
            Read with confidence
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="size-2 rounded-full bg-amber-400" />
            Flagged for you to check
          </span>
          <span className="text-neutral-500">AxLiner prepares it. You approve it.</span>
        </motion.div>
      </div>
    </section>
  )
}

export default MessyRealityShowcase
