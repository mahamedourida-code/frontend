"use client"

import { useRef, type MouseEvent } from "react"
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion"

/* ──────────────────────────────────────────────────────────────
   "Works with the tools you already use" — a scroll-driven
   integration showcase. Black silhouette logos on white tiles;
   the motion does the talking:
     · 3D staggered entrance (cards tilt up into place)
     · per-column scroll parallax for depth
     · a scroll-scrubbed "flow beam" — documents travelling into
       the stack as you scroll the band
     · magnetic logos + a mint definition glow + a sheen sweep on
       hover
   Tools are split live (QuickBooks / Xero / Excel / Sheets, shipped)
   vs coming-soon (the inbound capture sources). Honours
   prefers-reduced-motion by dropping every scroll/pointer effect.
   ────────────────────────────────────────────────────────────── */

const EASE = [0.22, 1, 0.36, 1] as const

type Tool = {
  src: string
  alt: string
  name: string
  status: "live" | "soon"
  blurb: string
}

const TOOLS: Tool[] = [
  { src: "/logos/quickbooks.png", alt: "QuickBooks", name: "QuickBooks", status: "live", blurb: "Publish reviewed bills" },
  { src: "/logos/xero.png", alt: "Xero", name: "Xero", status: "live", blurb: "Draft bills, ready to approve" },
  { src: "/logos/excel.png", alt: "Microsoft Excel", name: "Excel", status: "live", blurb: "Export clean rows" },
  { src: "/logos/google-sheets.png", alt: "Google Sheets", name: "Google Sheets", status: "live", blurb: "One-click export" },
  { src: "/logos/gmail.png", alt: "Gmail", name: "Gmail", status: "soon", blurb: "Forward invoices in" },
  { src: "/logos/google-drive.png", alt: "Google Drive", name: "Google Drive", status: "soon", blurb: "Auto-pull new files" },
  { src: "/logos/dropbox.png", alt: "Dropbox", name: "Dropbox", status: "soon", blurb: "Watch a folder" },
  { src: "/logos/onedrive.png", alt: "OneDrive", name: "OneDrive", status: "soon", blurb: "Sync a folder" },
  { src: "/logos/outlook.png", alt: "Outlook", name: "Outlook", status: "soon", blurb: "Forward invoices in" },
]

function ToolTile({
  tool,
  index,
  progress,
  reduce,
  showNames,
}: {
  tool: Tool
  index: number
  progress: MotionValue<number>
  reduce: boolean
  showNames: boolean
}) {
  // Per-column parallax depth — the middle column travels a touch more
  // so the grid reads as three planes rather than one flat sheet.
  const col = index % 3
  const depth = col === 1 ? 36 : 22
  const rawY = useTransform(progress, [0, 1], [depth, -depth])
  const parallaxY = useSpring(rawY, { stiffness: 120, damping: 30, mass: 0.4 })

  // Magnetic logo — the silhouette leans toward the cursor.
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

  const live = tool.status === "live"

  return (
    <motion.li
      variants={{
        hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 42, rotateX: -16, scale: 0.95 },
        show: { opacity: 1, y: 0, rotateX: 0, scale: 1, transition: { duration: 0.7, ease: EASE } },
      }}
      className="[transform-style:preserve-3d]"
    >
      <motion.div style={reduce ? undefined : { y: parallaxY }}>
        <div
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          className="group relative flex h-full min-h-[200px] flex-col overflow-hidden rounded-2xl bg-white p-5 ring-1 ring-black/[0.06] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_22px_44px_-20px_rgba(16,185,129,0.55)] hover:ring-[var(--brand-green-ring)]"
        >
          {/* sheen sweep on hover */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-[130%] bg-gradient-to-r from-transparent via-white/70 to-transparent transition-transform duration-[900ms] ease-out group-hover:translate-x-[130%]"
          />

          {/* status chip */}
          {showNames ? (
          <div className="relative z-10">
            {live ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-green)] px-2.5 py-1 text-[11px] font-bold text-[var(--brand-green-fg)]">
                <span className="relative flex size-1.5">
                  {!reduce ? (
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500/70" />
                  ) : null}
                  <span className="relative inline-flex size-1.5 rounded-full bg-emerald-600" />
                </span>
                Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.05] px-2.5 py-1 text-[11px] font-bold text-black ring-1 ring-black/[0.06]">
                <span className="size-1.5 rounded-full bg-black/30" />
                Coming soon
              </span>
            )}
          </div>
          ) : null}

          {/* logo */}
          <div className="relative z-10 flex flex-1 items-center justify-center py-7">
            <motion.div style={reduce ? undefined : { x: magX, y: magY }} className="will-change-transform">
              <img
                src={tool.src}
                alt={tool.alt}
                loading="lazy"
                draggable={false}
                className={`max-h-12 w-auto max-w-[180px] object-contain transition-[transform,opacity] duration-300 group-hover:scale-[1.07] ${
                  live ? "opacity-100" : "opacity-50 group-hover:opacity-100"
                }`}
              />
            </motion.div>
          </div>

          {/* name + blurb */}
          {showNames ? (
          <div className="relative z-10">
            <p className="text-[15px] font-bold tracking-tight text-black">{tool.name}</p>
            <p className="mt-0.5 text-[13px] font-medium text-black">{tool.blurb}</p>
          </div>
          ) : null}

          {/* mint corner glow on hover */}
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -right-16 size-32 rounded-full bg-[var(--brand-green)] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-70"
          />
        </div>
      </motion.div>
    </motion.li>
  )
}

export function IntegrationsLogos({ showNames = true }: { showNames?: boolean }) {
  const reduce = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  // Scroll-scrubbed flow beam: a glowing dot + filling gradient that
  // tracks document flow as the band passes through the viewport.
  const beamLeft = useTransform(scrollYProgress, [0.05, 0.55], ["0%", "100%"])
  const beamWidth = useTransform(scrollYProgress, [0.05, 0.55], ["0%", "100%"])
  // Faint background dot-grid drifts for parallax depth.
  const gridY = useTransform(scrollYProgress, [0, 1], [-44, 44])
  // Heading accent line draws in on scroll.
  const lineScale = useTransform(scrollYProgress, [0.05, 0.32], [0, 1])

  return (
    <section ref={sectionRef} className="relative z-10 overflow-hidden bg-[#FDFBF7] py-20 sm:py-28">
      {/* drifting dot grid */}
      <motion.div
        aria-hidden
        style={reduce ? undefined : { y: gridY }}
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_center,rgba(0,0,0,0.06)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
      </motion.div>

      <div className="relative mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        {/* header */}
        {showNames ? (
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.span
            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}
            className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-[0.16em] text-black ring-1 ring-black/[0.06]"
          >
            <span className="size-1.5 rounded-full bg-[var(--brand-green-ring)]" />
            Integrations
          </motion.span>
          <motion.h2
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
            className="ax-h2 mt-5 font-bold tracking-tight text-black text-balance"
          >
            Works with the tools you already use
          </motion.h2>
          <motion.div
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.5 } } }}
            className="mx-auto mt-5 h-[3px] w-28 overflow-hidden rounded-full bg-black/[0.06]"
          >
            <motion.div
              style={reduce ? { scaleX: 1 } : { scaleX: lineScale }}
              className="h-full w-full origin-left rounded-full bg-[var(--brand-green-ring)]"
            />
          </motion.div>
          <motion.p
            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}
            className="mt-5 text-[15px] font-medium text-black sm:text-base"
          >
            Pull documents in, push clean records out. Live with QuickBooks &amp; Xero today — more on the way.
          </motion.p>
        </motion.div>
        ) : null}

        {/* scroll-scrubbed flow beam */}
        {showNames ? (
        <div className="relative mx-auto mt-12 h-px w-full max-w-3xl bg-black/[0.07]">
          <motion.div
            style={reduce ? { width: "100%" } : { width: beamWidth }}
            className="absolute left-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--brand-green-ring)] to-transparent"
          />
          {!reduce ? (
            <motion.span
              style={{ left: beamLeft }}
              className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--brand-green-ring)] shadow-[0_0_14px_3px_rgba(16,185,129,0.6)]"
            />
          ) : null}
        </div>
        ) : null}

        {/* tile grid */}
        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } }}
          style={{ perspective: "1200px" }}
          className="mt-12 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
        >
          {TOOLS.map((tool, index) => (
            <ToolTile key={tool.alt} tool={tool} index={index} progress={scrollYProgress} reduce={!!reduce} showNames={showNames} />
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
