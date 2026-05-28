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

/* Pastel card backgrounds — one per solution. Sit against the dark section bg. */
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

  /* 3D tilt — applied to the whole cell */
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
        style={{ rotateX, rotateY, transformPerspective: 900 }}
        className="group relative h-[580px] overflow-hidden"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        {/* ── Text — sits on the SECTION background (visible because image card is below it) ── */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 px-6 pt-7">
          {/* Title — always visible */}
          <h3 className="text-[24px] font-bold leading-tight text-white">
            {card.title}
          </h3>

          {/* Description — expands DOWN from below the title on hover */}
          <div className={cn(
            "grid grid-rows-[0fr] group-hover:grid-rows-[1fr]",
            "transition-[grid-template-rows] duration-[340ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
          )}>
            <div className="min-h-0 overflow-hidden">
              <p className="pt-3 text-[14px] font-medium leading-relaxed text-white/80">
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

        {/* ── Image card — sits below title initially, slides DOWN + shrinks on hover ──
             Pushed down → reveals more of the section bg above where text appears.        */}
        <div className={cn(
          "absolute inset-x-0 bottom-0 top-[88px] rounded-2xl",
          tint,
          "transition-transform duration-[440ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
          "origin-top group-hover:translate-y-[72px] group-hover:scale-[0.94]",
        )}>
          <div className="flex h-full w-full items-center justify-center p-8">
            <img
              src={card.asset}
              alt={card.title}
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        {/* Full-card link */}
        <Link href={card.href} className="absolute inset-0 z-20" aria-label={`Discover ${card.title}`} />
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
