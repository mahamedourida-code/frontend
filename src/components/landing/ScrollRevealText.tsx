"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  MotionValue,
} from "framer-motion";

interface WordProps {
  word: string;
  scrollYProgress: MotionValue<number>;
  start: number;
  end: number;
}

function RevealWord({ word, scrollYProgress, start, end }: WordProps) {
  // Dim state stays partially visible (~45%), then fills to fully solid as it
  // scrolls into view — a gentle "fill in", never appear-from-nothing.
  const opacity = useTransform(scrollYProgress, [start, end], [0.45, 1]);

  return (
    <motion.span
      style={{ opacity }}
      className="inline-block will-change-[opacity]"
    >
      {word}
    </motion.span>
  );
}

interface ScrollRevealTextProps {
  children: string;
  className?: string;
}

export function ScrollRevealText({ children, className }: ScrollRevealTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.25"],
  });

  const words = children.split(/(\s+)/);
  // Filter to actual words and spaces so we can reconstruct the sentence.
  // We'll track only the non-whitespace tokens for animation index.
  const wordTokens = words.filter((t) => t.trim().length > 0);
  const N = wordTokens.length;

  if (prefersReduced) {
    return (
      <p
        ref={ref}
        className={
          className ??
          "text-3xl font-bold tracking-tight text-[#0a0a0a] sm:text-4xl lg:text-5xl"
        }
      >
        {children}
      </p>
    );
  }

  // Rebuild tokens array with animation data for word tokens.
  let wordIndex = 0;
  const renderedTokens = words.map((token, i) => {
    if (!token.trim()) {
      // Whitespace — render as a literal space span.
      return (
        <span key={i} aria-hidden="true">
          {token}
        </span>
      );
    }

    const idx = wordIndex;
    wordIndex++;

    // Word i lights from i/N (dim) to (i+1)/N (solid).
    const start = idx / N;
    const end = Math.min((idx + 1) / N, 1);

    return (
      <RevealWord
        key={i}
        word={token}
        scrollYProgress={scrollYProgress}
        start={start}
        end={end}
      />
    );
  });

  return (
    <p
      ref={ref}
      className={
        className ??
        "text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
      }
      style={{ color: "#0a0a0a" }}
    >
      {renderedTokens}
    </p>
  );
}
