"use client";

/**
 * Shared motion vocabulary for AxLiner.
 *
 * Mirrors the CSS tokens in globals.css (--ax-motion-fast/base, --ax-motion-ease) so
 * framer-motion animations feel identical to the CSS transitions already in the app.
 * Every consumer should pull variants/transitions from `useMotionTokens()` so the whole
 * surface collapses to instant/opacity-only under `prefers-reduced-motion`.
 *
 * framer-motion only — never `motion/react`.
 */

import { useReducedMotion, type Variants, type Transition } from "framer-motion";

/** Matches --ax-motion-ease: cubic-bezier(0.2, 0, 0, 1) — a calm ease-out. */
export const EASE_OUT = [0.2, 0, 0, 1] as const;
export const EASE_IN_OUT = [0.4, 0, 0.2, 1] as const;
/** A restrained spring for drag/scale affordances (no overshoot wobble). */
export const SPRING_SOFT: Transition = { type: "spring", stiffness: 320, damping: 32, mass: 0.7 };

/** Seconds — mirror of the CSS duration tokens. */
export const DUR = {
  fast: 0.18, // --ax-motion-fast
  base: 0.32, // --ax-motion-base
  slow: 0.5,
} as const;

const tFast: Transition = { duration: DUR.fast, ease: EASE_OUT };
const tBase: Transition = { duration: DUR.base, ease: EASE_OUT };

/** Reduced-motion: opacity-only, effectively instant. */
const tReduced: Transition = { duration: 0.001 };

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: tBase },
  exit: { opacity: 0, y: 4, transition: tFast },
};

const fadeScale: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  show: { opacity: 1, scale: 1, transition: tBase },
  exit: { opacity: 0, scale: 0.98, transition: tFast },
};

const staggerParent = (childDelay = 0.03): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: childDelay, delayChildren: 0.02 } },
  exit: {},
});

/** Opacity-only variants used when the user prefers reduced motion. */
const fadeOnly: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: tReduced },
  exit: { opacity: 0, transition: tReduced },
};

export interface MotionTokens {
  reduced: boolean;
  ease: typeof EASE_OUT;
  dur: typeof DUR;
  spring: Transition;
  tFast: Transition;
  tBase: Transition;
  fadeUp: Variants;
  fadeScale: Variants;
  staggerParent: (childDelay?: number) => Variants;
}

/**
 * Returns the motion vocabulary, automatically degraded when the user prefers reduced motion.
 * Callers never branch on reduced-motion themselves — just spread the returned variants.
 */
export function useMotionTokens(): MotionTokens {
  const reduced = useReducedMotion() ?? false;
  if (reduced) {
    return {
      reduced,
      ease: EASE_OUT,
      dur: DUR,
      spring: tReduced,
      tFast: tReduced,
      tBase: tReduced,
      fadeUp: fadeOnly,
      fadeScale: fadeOnly,
      staggerParent: () => ({ hidden: {}, show: { transition: { staggerChildren: 0 } }, exit: {} }),
    };
  }
  return {
    reduced,
    ease: EASE_OUT,
    dur: DUR,
    spring: SPRING_SOFT,
    tFast,
    tBase,
    fadeUp,
    fadeScale,
    staggerParent,
  };
}
