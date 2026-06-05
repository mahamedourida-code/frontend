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
 * Scroll-scrubbed hero: a single image that starts as a small centered card and
 * grows to a full-bleed, edge-to-edge image as the section scrolls through a
 * sticky viewport. The scroll progress is spring-smoothed so the scrub feels
 * fluid. Right-aligned headline rises in over the image (white, with the final
 * word + subtitle in the brand aqua). White section background. Reduced-motion
 * renders the end state statically. (transform/opacity only, GPU-accelerated.)
 */
export function ScrollGrowSection() {
  const ref = useRef<HTMLDivElement | null>(null)
  const prefersReduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  // Smooth the raw scroll progress so the scrub is fluid, not jumpy.
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 })

  // Small centered card -> full-bleed by ~85% of the scrub, then hold.
  const scale = useTransform(p, [0, 0.85], [0.46, 1], { clamp: true })
  const radius = useTransform(p, [0, 0.85], [40, 0], { clamp: true })
  const transform = useMotionTemplate`scale(${scale})`

  // Headline rises in once the image is large enough to sit behind it.
  const textOpacity = useTransform(p, [0.42, 0.72], [0, 1], { clamp: true })
  const textY = useTransform(p, [0.42, 0.85], [56, 0], { clamp: true })

  return (
    <section ref={ref} className="relative h-[280vh] bg-white">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Growing image: small centered card -> full-bleed */}
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
          {/* Scrim weighted to the right so the right-aligned text stays legible. */}
          <div className="absolute inset-0 bg-gradient-to-l from-black/75 via-black/35 to-black/10" />
        </motion.div>

        {/* Right-aligned headline that rises in */}
        <motion.div
          style={prefersReduced ? undefined : { opacity: textOpacity, y: textY }}
          className="pointer-events-none absolute inset-y-0 right-[6vw] flex max-w-[680px] flex-col items-end justify-center text-right"
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
