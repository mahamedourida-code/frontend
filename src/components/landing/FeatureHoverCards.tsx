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

const CARD_TINTS = [
  "bg-emerald-100",
  "bg-blue-100",
  "bg-slate-200",
  "bg-amber-100",
  "bg-rose-100",
  "bg-violet-100",
  "bg-teal-100",
  "bg-orange-100",
]

/* ── Single card ──────────────────────────────────────────────── */

function HoverCard({ card, index, tint }: { card: SolutionCard; index: number; tint: string }) {
  const ref = useRef<HTMLDivElement>(null)

  /* 3D tilt */
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
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: index * 0.055 }}
    >
      <motion.div
        ref={ref}
        className={cn("group relative h-[520px] overflow-hidden rounded-2xl", tint)}
        style={{ rotateX, rotateY, transformPerspective: 900 }}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        {/* ── Illustration: zooms out + moves down on hover ── */}
        <div className="absolute inset-0 flex items-center justify-center px-8 pb-28 pt-8">
          <img
            src={card.asset}
            alt={card.title}
            className={cn(
              "h-full w-full object-contain",
              "transition-transform duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
              "group-hover:scale-[0.82] group-hover:translate-y-[12%]",
            )}
          />
        </div>

        {/* ── Persistent gradient at bottom ── */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* ── Text area: description expands from 0 height above title ── */}
        <div className="absolute inset-x-0 bottom-0 px-5 pb-5">

          {/* Description — grid-rows expand from 0 to full height on hover */}
          <div className={cn(
            "grid overflow-hidden",
            "grid-rows-[0fr] group-hover:grid-rows-[1fr]",
            "transition-[grid-template-rows] duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
          )}>
            <div className="min-h-0">
              <p className="pb-3 pt-0 text-[15px] font-medium leading-relaxed text-white/85">
                {card.description}
              </p>
              <p className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
                Discover
                <svg viewBox="0 0 10 10" fill="none" className="size-2.5" aria-hidden>
                  <path d="M1 5h8M6 2l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </p>
            </div>
          </div>

          {/* Title — always visible */}
          <h3 className="text-[22px] font-bold leading-snug text-white">
            {card.title}
          </h3>
        </div>

        {/* Full-card link */}
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
    <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", className)}>
      {cards.map((card, i) => (
        <HoverCard key={card.title} card={card} index={i} tint={CARD_TINTS[i % CARD_TINTS.length]} />
      ))}
    </div>
  )
}
