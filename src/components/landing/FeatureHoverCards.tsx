"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

type SolutionCard = {
  title: string
  href: string
  asset: string
  description: string
}

/* one per card — matches solutionCards order */
const CARD_TINTS = [
  "bg-emerald-100",   // Accounting
  "bg-blue-100",      // Banking
  "bg-slate-200",     // Backoffice
  "bg-amber-100",     // Construction
  "bg-rose-100",      // CPG Brands
  "bg-violet-100",    // FinTech
  "bg-teal-100",      // Healthcare
  "bg-orange-100",    // Real Estate
]

/* ── Single card ──────────────────────────────────────────────── */

function HoverCard({ card, index, tint }: { card: SolutionCard; index: number; tint: string }) {
  const ref = useRef<HTMLDivElement>(null)

  /* framer-motion 3D tilt */
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-5, 5]), { stiffness: 280, damping: 28 })
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [5, -5]), { stiffness: 280, damping: 28 })

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    rawX.set((e.clientX - r.left) / r.width - 0.5)
    rawY.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = () => { rawX.set(0); rawY.set(0) }

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1], delay: index * 0.055 }}
    >
      <motion.div
        ref={ref}
        className={cn("group relative h-[520px] overflow-hidden rounded-2xl", tint)}
        style={{ rotateX, rotateY, transformPerspective: 900 }}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        {/* ── Illustration ── */}
        <div className="absolute inset-0 flex items-center justify-center px-8 pb-20 pt-8">
          <img
            src={card.asset}
            alt={card.title}
            className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.07]"
          />
        </div>

        {/* ── Always-visible: gradient + big title ── */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/48 to-transparent px-6 pb-6 pt-28">
          <h3 className="text-[22px] font-bold leading-snug text-white">
            {card.title}
          </h3>
        </div>

        {/* ── Hover reveal: slides UP from below ──
             starts translate-y-full (100% of this div's own height below the card bottom)
             → on group-hover slides to translate-y-0 (fully visible)
             overflow-hidden on parent clips it until revealed             */}
        <div className={cn(
          "absolute inset-x-0 bottom-0",
          "translate-y-full group-hover:translate-y-0",
          "transition-transform duration-[300ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
          "bg-black/90 px-6 py-6",
        )}>
          <h3 className="text-[22px] font-bold leading-snug text-white">
            {card.title}
          </h3>
          <p className="mt-3 text-[15px] leading-relaxed text-white/82">
            {card.description}
          </p>
          <p className="mt-4 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
            Discover
            <svg viewBox="0 0 10 10" fill="none" className="size-2.5" aria-hidden>
              <path d="M1 5h8M6 2l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </p>
        </div>

        {/* ── Invisible full-card link ── */}
        <Link href={card.href} className="absolute inset-0 z-10" aria-label={`Discover ${card.title}`} />
      </motion.div>
    </motion.div>
  )
}

/* ── Grid ──────────────────────────────────────────────────────── */

type FeatureHoverCardsProps = {
  cards: SolutionCard[]
  className?: string
}

export function FeatureHoverCards({ cards, className }: FeatureHoverCardsProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", className)}>
      {cards.map((card, i) => (
        <HoverCard
          key={card.title}
          card={card}
          index={i}
          tint={CARD_TINTS[i % CARD_TINTS.length]}
        />
      ))}
    </div>
  )
}
