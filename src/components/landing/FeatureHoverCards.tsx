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

/* Pastel card backgrounds — one per solution */
const CARD_TINTS = [
  "bg-emerald-200",
  "bg-sky-200",
  "bg-stone-200",
  "bg-amber-200",
  "bg-rose-200",
  "bg-violet-200",
  "bg-teal-200",
  "bg-orange-200",
]

/* ── Single card ──────────────────────────────────────────────── */

function HoverCard({ card, index, tint }: { card: SolutionCard; index: number; tint: string }) {
  const ref = useRef<HTMLDivElement>(null)

  /* framer-motion 3D tilt */
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-4, 4]), { stiffness: 260, damping: 26 })
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [4, -4]), { stiffness: 260, damping: 26 })

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
        className={cn("group relative h-[560px] overflow-hidden rounded-2xl", tint)}
        style={{ rotateX, rotateY, transformPerspective: 900 }}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        {/* ── Illustration: fills card by default, shrinks DOWN + scales on hover ── */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center px-7 pb-7 pt-28",
          "transition-transform duration-[420ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
          "group-hover:scale-[0.78] group-hover:translate-y-[20%]",
        )}>
          <img
            src={card.asset}
            alt={card.title}
            className="h-full w-full object-contain"
          />
        </div>

        {/* ── Persistent dark gradient at TOP ── */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-black/85 via-black/45 to-transparent" />

        {/* ── Text area at TOP — title always visible, description expands down ── */}
        <div className="absolute inset-x-0 top-0 px-6 pt-6">
          {/* Title — always visible */}
          <h3 className="text-[22px] font-bold leading-snug text-white">
            {card.title}
          </h3>

          {/* Description — expands downward from below title on hover */}
          <div className={cn(
            "grid overflow-hidden",
            "grid-rows-[0fr] group-hover:grid-rows-[1fr]",
            "transition-[grid-template-rows] duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
          )}>
            <div className="min-h-0">
              <p className="pt-3 text-[14px] font-medium leading-relaxed text-white/85">
                {card.description}
              </p>
              <p className="mt-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
                Discover
                <svg viewBox="0 0 10 10" fill="none" className="size-2.5" aria-hidden>
                  <path d="M1 5h8M6 2l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </p>
            </div>
          </div>
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
    <div className={cn("grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", className)}>
      {cards.map((card, i) => (
        <HoverCard key={card.title} card={card} index={i} tint={CARD_TINTS[i % CARD_TINTS.length]} />
      ))}
    </div>
  )
}
