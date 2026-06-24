"use client"

import { type MouseEvent } from "react"
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion"

/* "Works with the tools you already use" — a compact logo wall. Black
   silhouette logos sit in the same #efefef rounded cards as the use-cases
   bento ("From folder to books"), just smaller. A magnetic + sheen hover
   lifts a tile to white with a blue (--landing-blue) ring + corner glow.
   No scroll animation, no cycling word. */

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
        className="group relative flex h-20 items-center justify-center overflow-hidden rounded-2xl bg-[#efefef] p-4 transition-[transform,background-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:bg-white hover:shadow-[0_16px_34px_-20px_rgba(49,124,255,0.55)] hover:ring-1 hover:ring-[var(--landing-blue)] sm:h-24"
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
            className="max-h-8 w-auto max-w-[120px] object-contain transition-transform duration-300 group-hover:scale-[1.06] sm:max-h-9"
          />
        </motion.div>
        {/* blue corner glow on hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-12 -right-12 size-24 rounded-full bg-[var(--landing-blue)] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
        />
      </div>
    </li>
  )
}

export function IntegrationsLogos({ showTitle = false }: { showTitle?: boolean }) {
  const reduce = useReducedMotion()

  return (
    <section className="relative z-10 overflow-hidden bg-[#FDFBF7] py-16 sm:py-20">
      <div className="relative mx-auto max-w-[960px] px-4 sm:px-6 lg:px-8">
        {showTitle ? (
          <h2 className="ax-h2 ax-marketing-section-title mb-12 text-center text-black text-balance sm:mb-14">
            Works with the{" "}
            <span className="text-[var(--landing-blue)]">tools</span>{" "}
            you already use
          </h2>
        ) : null}

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {TOOLS.map((tool) => (
            <ToolTile key={tool.alt} tool={tool} reduce={!!reduce} />
          ))}
        </ul>
      </div>
    </section>
  )
}
