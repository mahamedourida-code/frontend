"use client"

import { motion } from "framer-motion"

/* ──────────────────────────────────────────────────────────────────
 * "Built for the paperwork real businesses actually send."
 *
 * Minimal, restrained: a white band, black type, one quiet mint accent.
 * A simple grid of separate cards — one document type each, just a label
 * and a one-line caption. No brown, no before/after stage, no tabs.
 * Line-art icons sit in a small mint tile; that's the only colour.
 * ────────────────────────────────────────────────────────────────── */

type Paper = {
  label: string
  caption: string
  Icon: (props: { className?: string }) => React.JSX.Element
}

/* ── Minimal line-art icons (single stroke, currentColor) ─────────── */

function PenIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 20c2-1 3-3 5-7s4-7 6-8M14 5l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function CameraIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="7" width="18" height="13" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 7l1.5-2.5h5L15 7" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="13.5" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}
function ReceiptIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M6 3v18l2-1.2L10 21l2-1.2L14 21l2-1.2L18 21V3l-2 1.2L14 3l-2 1.2L10 3 8 4.2 6 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 9h6M9 13h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function ChatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 3v-3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}
function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}
function StatementIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

const PAPERS: Paper[] = [
  { label: "Handwritten notes", caption: "Biro on a ruled pad", Icon: PenIcon },
  { label: "Blurry phone photos", caption: "Shot in bad light", Icon: CameraIcon },
  { label: "Wrinkled receipts", caption: "Crumpled in a bag", Icon: ReceiptIcon },
  { label: "WhatsApp screenshots", caption: "Forwarded mid-chat", Icon: ChatIcon },
  { label: "Multi-language invoices", caption: "Three scripts, one page", Icon: GlobeIcon },
  { label: "Bank statements", caption: "Dense rows and columns", Icon: StatementIcon },
]

const easeOut = [0.22, 1, 0.36, 1] as const

export function MessyRealityShowcase() {
  return (
    <section id="messy-reality" className="bg-white">
      <div className="mx-auto max-w-[1180px] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        {/* ── Header — minimal ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="max-w-2xl"
        >
          <h2 className="ax-h2 font-bold text-neutral-950">
            Built for the paperwork real businesses actually send.
          </h2>
          <p className="ax-body mt-4 font-semibold text-neutral-500">
            Not clean PDFs. AxLiner reads the messy stuff and flags what to check.
          </p>
        </motion.div>

        {/* ── Simple card grid ── */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
          {PAPERS.map((paper, i) => (
            <motion.div
              key={paper.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, ease: easeOut, delay: i * 0.05 }}
              className="group rounded-2xl border border-neutral-200 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-[#d1fae5] text-neutral-950">
                <paper.Icon className="size-5" />
              </span>
              <h3 className="mt-5 text-[16px] font-bold tracking-tight text-neutral-950">
                {paper.label}
              </h3>
              <p className="mt-1 text-[13.5px] font-medium text-neutral-500">{paper.caption}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default MessyRealityShowcase
