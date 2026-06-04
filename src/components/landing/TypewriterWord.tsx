"use client"

import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

type TypewriterWordProps = {
  /** Words to cycle through, typed out one character at a time. */
  words: string[]
  className?: string
  /** ms per character while typing in. */
  typingSpeed?: number
  /** ms per character while deleting. */
  deletingSpeed?: number
  /** ms to hold on a fully-typed word before deleting. */
  pause?: number
  /** Caret colour (defaults to the warm clay brown). */
  caretClassName?: string
}

/**
 * Veryfi-style cycling typewriter: types a word, holds, deletes, then types the
 * next — looping forever. Respects prefers-reduced-motion (shows the first word
 * statically, no caret). framer-motion drives only the blinking caret.
 */
export function TypewriterWord({
  words,
  className,
  typingSpeed = 78,
  deletingSpeed = 38,
  pause = 1500,
  caretClassName,
}: TypewriterWordProps) {
  const reduceMotion = useReducedMotion()
  const [text, setText] = useState("")
  const [wordIndex, setWordIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (reduceMotion) {
      setText(words[0] ?? "")
      return
    }

    const current = words[wordIndex % words.length] ?? ""

    // Fully typed → hold, then start deleting.
    if (!deleting && text === current) {
      const hold = setTimeout(() => setDeleting(true), pause)
      return () => clearTimeout(hold)
    }

    // Fully deleted → advance to the next word.
    if (deleting && text === "") {
      setDeleting(false)
      setWordIndex((i) => (i + 1) % words.length)
      return
    }

    const next = deleting
      ? current.slice(0, text.length - 1)
      : current.slice(0, text.length + 1)
    const step = setTimeout(() => setText(next), deleting ? deletingSpeed : typingSpeed)
    return () => clearTimeout(step)
  }, [text, deleting, wordIndex, words, reduceMotion, typingSpeed, deletingSpeed, pause])

  return (
    <span className={cn("inline-flex items-baseline whitespace-nowrap", className)}>
      {/* aria-live so screen readers announce the changing word */}
      <span aria-live="polite">{text || "​"}</span>
      {!reduceMotion && (
        <motion.span
          aria-hidden
          className={cn(
            "ml-[0.06em] inline-block h-[0.92em] w-[0.07em] translate-y-[0.08em] rounded-full bg-[#8a5a2b]",
            caretClassName,
          )}
          animate={{ opacity: [1, 1, 0, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, times: [0, 0.5, 0.5, 1], ease: "linear" }}
        />
      )}
    </span>
  )
}
