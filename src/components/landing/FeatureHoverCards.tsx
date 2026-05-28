"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

type SolutionCard = {
  title: string
  href: string
  asset: string
  description: string
}

/* ── Single tilt+reveal card ─────────────────────────────────── */

function HoverCard({ card, index }: { card: SolutionCard; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)
  const [isPointer, setIsPointer] = useState(true)

  useEffect(() => {
    setIsPointer(window.matchMedia("(pointer: fine)").matches)
  }, [])

  /* framer-motion tilt */
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-6, 6]), {
    stiffness: 300,
    damping: 30,
  })
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [6, -6]), {
    stiffness: 300,
    damping: 30,
  })

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !isPointer) return
    const r = cardRef.current.getBoundingClientRect()
    rawX.set((e.clientX - r.left) / r.width - 0.5)
    rawY.set((e.clientY - r.top) / r.height - 0.5)
  }

  const onMouseLeave = () => {
    rawX.set(0)
    rawY.set(0)
    setHovered(false)
  }

  /* On touch devices: overlay always visible */
  const overlayVisible = !isPointer || hovered

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 }}
    >
      <Link href={card.href} className="block outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl">
        <motion.div
          ref={cardRef}
          className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted"
          style={
            isPointer
              ? {
                  rotateX,
                  rotateY,
                  transformPerspective: 800,
                  willChange: hovered ? "transform" : "auto",
                }
              : undefined
          }
          onMouseMove={onMouseMove}
          onMouseEnter={() => isPointer && setHovered(true)}
          onMouseLeave={onMouseLeave}
        >
          {/* Background illustration / image */}
          <img
            src={card.asset}
            alt={card.title}
            className={cn(
              "absolute inset-0 h-full w-full transition-transform duration-500",
              /* SVG illustrations: contain + subtle bg tint */
              "object-contain p-6",
              hovered && "scale-[1.04]"
            )}
          />

          {/* Subtle vignette always present */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              background:
                "radial-gradient(ellipse at 50% 120%, hsl(var(--foreground)/0.12), transparent 70%)",
            }}
          />

          {/* Always-visible title chip — bottom-left */}
          <div className="absolute bottom-4 left-4 z-10">
            <span className="rounded-md border border-white/20 bg-black/40 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
              {card.title}
            </span>
          </div>

          {/* Reveal overlay — slides up on hover */}
          <motion.div
            aria-hidden={!overlayVisible}
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/64 to-transparent px-5 pb-5 pt-20"
            initial={false}
            animate={{ y: overlayVisible ? "0%" : "102%" }}
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <p className="text-[15px] font-semibold leading-snug text-white">
              {card.title}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-white/78">
              {card.description}
            </p>
            <p className="mt-3 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
              Discover
              <svg viewBox="0 0 12 12" fill="none" className="size-2.5" aria-hidden>
                <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </p>
          </motion.div>
        </motion.div>
      </Link>
    </motion.div>
  )
}

/* ── Grid wrapper ────────────────────────────────────────────── */

type FeatureHoverCardsProps = {
  cards: SolutionCard[]
  className?: string
}

export function FeatureHoverCards({ cards, className }: FeatureHoverCardsProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
    >
      {cards.map((card, i) => (
        <HoverCard key={card.title} card={card} index={i} />
      ))}
    </div>
  )
}
