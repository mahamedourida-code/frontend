"use client"

import * as React from "react"
import { motion, useReducedMotion, type Variants } from "framer-motion"

import { cn } from "@/lib/utils"

type AnimatedPageTitleProps = {
  title: string
  className?: string
  /** HTML element to render. Defaults to h1 so page semantics stay intact. */
  as?: "h1" | "h2" | "h3"
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
}

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
  },
}

export function AnimatedPageTitle({
  title,
  className,
  as: Tag = "h1",
}: AnimatedPageTitleProps) {
  const prefersReducedMotion = useReducedMotion()
  const words = React.useMemo(() => title.split(/\s+/).filter(Boolean), [title])

  if (prefersReducedMotion) {
    return (
      <Tag className={cn("text-[24px] font-semibold tracking-normal text-foreground", className)}>
        {title}
      </Tag>
    )
  }

  // Stable key so revisiting the same title doesn't replay; switching titles does.
  const replayKey = title

  return (
    <Tag className={cn("text-[24px] font-semibold tracking-normal text-foreground", className)}>
      <motion.span
        key={replayKey}
        className="inline-block"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10px" }}
      >
        {words.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            variants={wordVariants}
            style={{ display: "inline-block", marginRight: "0.25em" }}
          >
            {word}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  )
}
