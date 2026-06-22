"use client"

import { type MouseEvent } from "react"
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion"
import { TypewriterWord } from "@/components/landing/TypewriterWord"

/* "Works with the tools you already use" — a raw logo wall. Black silhouette
   logos on white tiles with a magnetic + sheen hover. No scroll animation:
   tiles render in place (no parallax, no scroll-triggered entrance) so the
   section stays still as you scroll. Hover interactions are kept. */

type Tool = { src: string; alt: string }

const TOOLS: Tool[] = [
  { src: "/logos/quickbooks.png", alt: "QuickBooks" },
  { src: "/logos/xero.png", alt: "Xero" },
  { src: "/logos/excel.png", alt: "Microsoft Excel" },
  { src: "/logos/google-sheets.png", alt: "Google Sheets" },
  { src: "/logos/gmail.png", alt: "Gmail" },
  { src: "/logos/google-drive.png", alt: "Google Drive" },
  { src: "/logos/dropbox.png", alt: "Dropbox" },
  { src: "/logos/onedrive.png", alt: "OneDrive" },
  { src: "/logos/outlook.png", alt: "Outlook" },
]

function ToolTile({ tool, reduce }: { tool: Tool; reduce: boolean }) {
  // Magnetic logo — leans toward the cursor. (Hover only, not scroll.)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const magX = useSpring(mx, { stiffness: 220, damping: 18, mass: 0.5 })
  const magY = useSpring(my, { stiffness: 220, damping: 18, mass: 0.5 })

  function handleMove(event: MouseEvent<HTMLDivElement>) {
    if (reduce) return
    const rect = event.currentTarget.getBoundingClientRect()
    mx.set((event.clientX - rect.left - rect.width / 2) * 0.18)
    my.set((event.clientY - rect.top - rect.height / 2) * 0.18)
  }
  function handleLeave() {
    mx.set(0)
    my.set(0)
  }

  return (
    <li>
      <div
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="group relative flex h-28 items-center justify-center overflow-hidden rounded-2xl bg-white p-5 ring-1 ring-black/[0.06] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_22px_44px_-20px_rgba(16,185,129,0.45)] hover:ring-[var(--brand-green-ring)] sm:h-32"
      >
        {/* sheen sweep on hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-[130%] bg-gradient-to-r from-transparent via-white/70 to-transparent transition-transform duration-[900ms] ease-out group-hover:translate-x-[130%]"
        />
        <motion.div style={reduce ? undefined : { x: magX, y: magY }} className="will-change-transform">
          <img
            src={tool.src}
            alt={tool.alt}
            loading="lazy"
            draggable={false}
            className="max-h-10 w-auto max-w-[150px] object-contain transition-transform duration-300 group-hover:scale-[1.07] sm:max-h-12"
          />
        </motion.div>
        {/* mint corner glow on hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -right-16 size-32 rounded-full bg-[var(--brand-green)] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-70"
        />
      </div>
    </li>
  )
}

export function IntegrationsLogos({ showTitle = false }: { showTitle?: boolean }) {
  const reduce = useReducedMotion()

  return (
    <section className="relative z-10 overflow-hidden bg-[#FDFBF7] py-16 sm:py-20">
      <div className="relative mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        {showTitle ? (
          <h2 className="ax-h2 ax-marketing-section-title mb-12 text-center text-black text-balance sm:mb-14">
            Works with the{" "}
            <TypewriterWord
              words={["tools", "apps", "software", "spreadsheets"]}
              className="rounded-md border border-black bg-black px-2 font-bold text-white"
              caretClassName="bg-white"
            />{" "}
            you already use
          </h2>
        ) : null}

        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
          {TOOLS.map((tool) => (
            <ToolTile key={tool.alt} tool={tool} reduce={!!reduce} />
          ))}
        </ul>
      </div>
    </section>
  )
}
