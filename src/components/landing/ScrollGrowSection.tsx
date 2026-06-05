"use client"

import { useRef } from "react"
import Image from "next/image"
import { motion, useMotionTemplate, useReducedMotion, useScroll, useTransform } from "framer-motion"

/**
 * Scroll-scrubbed hero: a single image that starts small and grows toward
 * full-bleed as the section scrolls through a sticky viewport (the reap.global
 * "Fueling growth" effect). Per Emil Kowalski's rules: transform/opacity only,
 * a full `transform` string (not the `scale` shorthand) so it stays GPU
 * accelerated, a strong ease via the scroll mapping, and a static fallback for
 * reduced motion.
 */
export function ScrollGrowSection() {
  const ref = useRef<HTMLDivElement | null>(null)
  const prefersReduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  // Small → large over the first ~70% of the scrub, then hold.
  const scale = useTransform(scrollYProgress, [0, 0.7], [0.56, 1], { clamp: true })
  const radius = useTransform(scrollYProgress, [0, 0.7], [40, 16], { clamp: true })
  const transform = useMotionTemplate`scale(${scale})`

  return (
    <section ref={ref} className="relative h-[240vh] bg-neutral-950">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* Growing image */}
        <motion.div
          style={prefersReduced ? undefined : { transform, borderRadius: radius }}
          className="relative h-[72vh] w-[min(94vw,1200px)] overflow-hidden rounded-[16px] will-change-transform"
        >
          <Image
            src="/landing/businessman-crossing.jpg"
            alt="A professional crossing a downtown street at dusk"
            fill
            sizes="(max-width: 768px) 94vw, 1200px"
            className="object-cover"
          />
          {/* Legibility scrim for the overlaid heading */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/60" />
        </motion.div>

        {/* Big overlaid heading (constant size; the image grows behind it) */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <h2 className="max-w-[16ch] text-balance text-5xl font-black leading-[0.92] tracking-tight text-white sm:text-7xl md:text-8xl">
            Built for how finance actually works
          </h2>
          <p className="mt-6 max-w-xl text-base font-medium text-white/85 sm:text-lg">
            Real invoices, real receipts, real handwriting. Reviewed and ready for your books.
          </p>
        </div>
      </div>
    </section>
  )
}
