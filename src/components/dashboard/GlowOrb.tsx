"use client"

import * as React from "react"
import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"

type GlowOrbProps = {
  /** Diameter in pixels (also drives float amplitude proportionally). */
  size?: number
  /** Opacity multiplier; default 0.55. Spec uses 0.6/0.3/0.25 per placement. */
  opacity?: number
  /** Tailwind positioning utilities (top-0 left-0, bottom-4 right-4, etc.). */
  className?: string
  /** Use the bundled C1 glow-orb.png when available. Defaults to true. */
  useAsset?: boolean
  /** Color override for the CSS fallback gradient. */
  color?: string
}

/**
 * Decorative ambient orb. Renders the bundled /fx/glow-orb.png with a soft
 * multiply blend when `useAsset` is true; otherwise falls back to a blurred
 * radial-gradient div. Animates with a gentle 7s float loop, respects
 * `prefers-reduced-motion`, and is `pointer-events-none` + `aria-hidden`.
 */
export function GlowOrb({
  size = 100,
  opacity = 0.55,
  className,
  useAsset = true,
  color = "hsl(var(--primary) / 0.25)",
}: GlowOrbProps) {
  const prefersReducedMotion = useReducedMotion()

  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    opacity,
  }

  const animation = prefersReducedMotion
    ? undefined
    : {
        animate: { y: [0, -14, 0], x: [0, 6, 0], scale: [1, 1.04, 1] },
        transition: { repeat: Infinity, duration: 7, ease: "easeInOut" as const },
      }

  return (
    <motion.div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute rounded-full",
        useAsset ? "mix-blend-multiply" : "blur-[60px]",
        className,
      )}
      style={
        useAsset
          ? baseStyle
          : { ...baseStyle, background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }
      }
      {...animation}
    >
      {useAsset ? (
        <Image
          src="/fx/glow-orb.png"
          alt=""
          width={size}
          height={size}
          aria-hidden="true"
          className="h-full w-full select-none object-contain"
          draggable={false}
          priority={false}
        />
      ) : null}
    </motion.div>
  )
}
