"use client"

import { useRef } from "react"
import Image from "next/image"
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion"

/**
 * Scroll-scrubbed hero. The image grows from a left-anchored panel to a
 * full-bleed, edge-to-edge image as the section scrolls through a sticky
 * viewport (origin-left keeps the left side — where the text sits — always
 * covered). The headline lives in its own layer (not inside the scaling image),
 * is visible the whole time, left-aligned, and drifts up as you scroll: quick
 * but smooth. White section background; white text with the final word + the
 * subtitle in brand aqua. transform/opacity only; reduced-motion = end state.
 */
export function ScrollGrowSection() {
  const ref = useRef<HTMLDivElement | null>(null)
  const prefersReduced = useReducedMotion()

  // `start end` -> `start start`: the scrub runs while the section RISES into
  // view — from its first partial appearance at the bottom of the screen until
  // its top reaches the top — so the image is already growing the moment it
  // appears, no boring pinned wait.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start start"],
  })

  // Smooth the raw scroll progress so the scrub feels fluid, not jumpy.
  const p = useSpring(scrollYProgress, { stiffness: 130, damping: 28, mass: 0.3 })

  // Starts clearly SMALL the moment the section first peeks in at the bottom
  // (a little centered card), then grows to full-bleed (scale 1, edge-to-edge).
  // The grow finishes by ~0.85 of the scrub so it's at full-bleed slightly
  // before the section settles — no awkward dead hold at the top of travel.
  const scale = useTransform(p, [0, 0.85], [0.34, 1], { clamp: true })
  const radius = useTransform(p, [0, 0.85], [40, 0], { clamp: true })
  const transform = useMotionTemplate`scale(${scale})`

  // The headline is always visible and rises up as the image grows in.
  const textY = useTransform(p, [0, 1], [52, -14], { clamp: true })

  return (
    <section ref={ref} className="relative h-[150vh] bg-white">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Growing image: left-anchored panel -> full-bleed */}
        <motion.div
          style={prefersReduced ? undefined : { transform, borderRadius: radius }}
          className="absolute inset-0 origin-center overflow-hidden rounded-[40px] will-change-transform"
        >
          <Image
            src="/landing/businessman-crossing.jpg"
            alt="A professional crossing a downtown street at dusk"
            fill
            sizes="100vw"
            className="object-cover"
          />
          {/* Left-weighted scrim keeps the left-aligned white text legible. */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-black/5" />
        </motion.div>

        {/* Headline layer (separate from the scaling image) */}
        <motion.div
          style={prefersReduced ? undefined : { y: textY }}
          className="pointer-events-none absolute inset-y-0 left-[6vw] z-10 flex max-w-[640px] flex-col items-start justify-center text-left [text-shadow:0_2px_28px_rgba(0,0,0,0.45)]"
        >
          <h2 className="text-balance text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-7xl md:text-8xl">
            Built for how finance actually{" "}
            <span className="text-[var(--brand-green)]">works</span>
          </h2>
          <p className="mt-6 max-w-md text-lg font-semibold text-[var(--brand-green)] sm:text-xl">
            Real invoices, real receipts, real handwriting. Reviewed and ready for your books.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
