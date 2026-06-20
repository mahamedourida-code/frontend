"use client"

import type { Ref } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { useCountUp } from "@/hooks/useCountUp"

/* ──────────────────────────────────────────────────────────────
   A5 — Outcome stat band (Nanonets / Stampli "lead with the
   automation number" moment). Four outcomes count up when the
   band scrolls into view, reusing the dashboard's useCountUp hook.

   ⚠️ MARKETING FIGURES — these are tasteful static targets, not a
   live aggregate. The marketing page is public (no auth), so real
   per-user/per-account aggregate data isn't available client-side.
   Numbers are kept consistent with the hero proof strip so they
   never contradict (1.2M docs · 38k duplicates · 60k hours). To
   wire real aggregates later, see manual_setup_requirements.md.
   ────────────────────────────────────────────────────────────── */

const easeOut = [0.22, 1, 0.36, 1] as const

type Stat = {
  /** the value the counter animates toward */
  target: number
  /** how to render the animated value */
  format: (value: number) => string
  label: string
  caption: string
}

/* Compact suffix formatting that matches the hero strip ("1.2M+", "60k+"). */
function compact(value: number, suffix = "+"): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M${suffix}`
  }
  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}k${suffix}`
  }
  return `${Math.round(value)}${suffix}`
}

const STATS: Stat[] = [
  {
    target: 1_200_000,
    format: (v) => compact(v),
    label: "Invoices reviewed",
    caption: "checked before posting",
  },
  {
    target: 78,
    format: (v) => `${Math.round(v)}%`,
    label: "Pre-coded by memory",
    caption: "vendor, account, and tax filled in",
  },
  {
    target: 38_000,
    format: (v) => compact(v),
    label: "Duplicates caught",
    caption: "stopped before they hit your books",
  },
  {
    target: 60_000,
    format: (v) => compact(v),
    label: "Hours saved",
    caption: "less manual data entry for your team",
  },
]

function OutcomeStat({
  stat,
  index,
  animate,
}: {
  stat: Stat
  index: number
  animate: boolean
}) {
  const { value, ref } = useCountUp(stat.target, {
    duration: 1.6,
    ease: "easeOut",
    startOnView: true,
    enabled: animate,
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: easeOut, delay: index * 0.08 }}
      className="text-center lg:text-left"
    >
      <dd
        ref={ref as Ref<HTMLDivElement>}
        className="text-4xl font-bold leading-none tracking-tight tabular-nums text-white sm:text-5xl"
      >
        {stat.format(value)}
      </dd>
      <dt className="mt-3 text-[15px] font-bold text-white">{stat.label}</dt>
    </motion.div>
  )
}

export function OutcomeStats() {
  // Respect reduced-motion: disable the count-up so values render at
  // their final target immediately (the hook snaps to target when
  // `enabled` is false).
  const prefersReducedMotion = useReducedMotion()
  const animate = !prefersReducedMotion

  return (
    <section
      aria-label="AxLiner outcomes"
      className="relative overflow-hidden bg-[#FDFBF7] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {/* ── The four outcome counters — monochrome proof band ── */}
        <dl className="grid grid-cols-1 gap-y-12 rounded-3xl bg-neutral-950 px-8 py-12 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07)] ring-1 ring-white/10 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4 lg:gap-x-6 lg:px-12 lg:py-14">
          {STATS.map((stat, index) => (
            <OutcomeStat key={stat.label} stat={stat} index={index} animate={animate} />
          ))}
        </dl>
      </div>
    </section>
  )
}
