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

/** Matches --ax-motion-ease: a strong, responsive ease-out. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
/** Restrained springs for active indicators and tiny press/hover affordances. */
export const SPRING_SOFT: Transition = { type: "spring", stiffness: 320, damping: 34, mass: 0.72 };
export const SPRING_SNAPPY: Transition = { type: "spring", stiffness: 560, damping: 38, mass: 0.62 };

/** Seconds — mirror of the CSS duration tokens. */
export const DUR = {
  press: 0.12,
  fast: 0.16, // fast feedback: hover, press, count swaps
  base: 0.28, // normal UI entry
  route: 0.22,
  slow: 0.52, // larger workspace/panel context
  ambient: 0.72,
} as const;

const tPress: Transition = { duration: DUR.press, ease: EASE_OUT };
const tFast: Transition = { duration: DUR.fast, ease: EASE_OUT };
const tBase: Transition = { duration: DUR.base, ease: EASE_OUT };
const tRoute: Transition = { duration: DUR.route, ease: EASE_OUT };
const tSlow: Transition = { duration: DUR.slow, ease: EASE_OUT };
const tInOut: Transition = { duration: DUR.base, ease: EASE_IN_OUT };

/** Reduced-motion: opacity-only, effectively instant. */
const tReduced: Transition = { duration: 0.001 };

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: tBase },
  exit: { opacity: 0, y: 4, transition: tFast },
};

const fadeDown: Variants = {
  hidden: { opacity: 0, y: -8 },
  show: { opacity: 1, y: 0, transition: tBase },
  exit: { opacity: 0, y: -5, transition: tFast },
};

const fadeScale: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  show: { opacity: 1, scale: 1, transition: tBase },
  exit: { opacity: 0, scale: 0.98, transition: tFast },
};

const route: Variants = {
  hidden: { opacity: 0, y: 10, filter: "blur(3px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: tRoute },
  exit: { opacity: 0, y: -6, filter: "blur(1px)", transition: tFast },
};

const panel: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.992, filter: "blur(3px)" },
  show: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: tSlow },
  exit: { opacity: 0, y: 8, scale: 0.994, filter: "blur(1px)", transition: tFast },
};

const listItem: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: tBase },
  exit: { opacity: 0, y: 4, transition: tFast },
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
  easeInOut: typeof EASE_IN_OUT;
  dur: typeof DUR;
  spring: Transition;
  springSnappy: Transition;
  tPress: Transition;
  tFast: Transition;
  tBase: Transition;
  tRoute: Transition;
  tSlow: Transition;
  tInOut: Transition;
  fadeUp: Variants;
  fadeDown: Variants;
  fadeScale: Variants;
  route: Variants;
  panel: Variants;
  listItem: Variants;
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
      easeInOut: EASE_IN_OUT,
      dur: DUR,
      spring: tReduced,
      springSnappy: tReduced,
      tPress: tReduced,
      tFast: tReduced,
      tBase: tReduced,
      tRoute: tReduced,
      tSlow: tReduced,
      tInOut: tReduced,
      fadeUp: fadeOnly,
      fadeDown: fadeOnly,
      fadeScale: fadeOnly,
      route: fadeOnly,
      panel: fadeOnly,
      listItem: fadeOnly,
      staggerParent: () => ({ hidden: {}, show: { transition: { staggerChildren: 0 } }, exit: {} }),
    };
  }
  return {
    reduced,
    ease: EASE_OUT,
    easeInOut: EASE_IN_OUT,
    dur: DUR,
    spring: SPRING_SOFT,
    springSnappy: SPRING_SNAPPY,
    tPress,
    tFast,
    tBase,
    tRoute,
    tSlow,
    tInOut,
    fadeUp,
    fadeDown,
    fadeScale,
    route,
    panel,
    listItem,
    staggerParent,
  };
}
