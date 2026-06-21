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
import { TypewriterWord } from "@/components/landing/TypewriterWord"

/* "Works with the tools you already use" — a raw animated logo wall.
   Black silhouette logos on white tiles, with a 3D staggered entrance,
   per-column scroll parallax, and a magnetic + sheen hover. No names, no
   status, no copy. The marketing page passes `showTitle` to add the heading;
   the pricing page renders it bare. */

const EASE = [0.22, 1, 0.36, 1] as const

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

function ToolTile({
  tool,
  index,
  progress,
  reduce,
}: {
  tool: Tool
  index: number
  progress: MotionValue<number>
  reduce: boolean
}) {
  // Per-column parallax depth so the wall reads as three planes.
  const col = index % 3
  const depth = col === 1 ? 36 : 22
  const rawY = useTransform(progress, [0, 1], [depth, -depth])
  const parallaxY = useSpring(rawY, { stiffness: 120, damping: 30, mass: 0.4 })

  // Magnetic logo — leans toward the cursor.
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
      </motion.div>
    </motion.li>
  )
}

export function IntegrationsLogos({ showTitle = false }: { showTitle?: boolean }) {
  const reduce = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  return (
    <section ref={sectionRef} className="relative z-10 overflow-hidden bg-[#FDFBF7] py-16 sm:py-20">
      <div className="relative mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        {showTitle ? (
          <motion.h2
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="ax-h2 mb-12 text-center font-bold tracking-tight text-black text-balance sm:mb-14"
          >
            Works with the{" "}
            <TypewriterWord
              words={["tools", "apps", "software", "spreadsheets"]}
              className="rounded-md border border-black bg-black px-2 font-bold text-white"
              caretClassName="bg-white"
            />{" "}
            you already use
          </motion.h2>
        ) : null}

        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } }}
          style={{ perspective: "1200px" }}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5"
        >
          {TOOLS.map((tool, index) => (
            <ToolTile key={tool.alt} tool={tool} index={index} progress={scrollYProgress} reduce={!!reduce} />
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
