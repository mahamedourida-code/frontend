"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { X } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

const STORAGE_KEY = "axliner-announce-dismissed"

/**
 * Top-of-page announcement bar (above the nav). Brown brand band, clear black
 * text, a squared "Learn more" button → /whats-new, and a dismiss that's
 * remembered in localStorage. Slides down on first visit. Reduced-motion safe.
 */
export function AnnouncementBar() {
  const [visible, setVisible] = useState(false)
  const reduce = useReducedMotion()

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1")
    } catch {}
    setVisible(false)
  }

  return (
    <AnimatePresence initial={false}>
      {visible ? (
        <motion.div
          initial={reduce ? false : { height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
          className="relative z-[60] overflow-hidden bg-[var(--brand-brown)] text-black"
        >
          <div className="mx-auto flex max-w-[1480px] items-center justify-center gap-4 px-5 py-2.5 sm:px-7 lg:px-12">
            <p className="text-center text-[15px] font-semibold leading-snug text-black">
              New in AxLiner: batch review board + one-click publishing to QuickBooks.
            </p>
            <Link
              href="/whats-new"
              className="ax-interactive inline-flex shrink-0 items-center rounded-md bg-black px-4 py-1.5 text-[13px] font-bold text-white transition-colors hover:bg-white hover:text-black hover:underline hover:decoration-1 hover:underline-offset-4"
            >
              Learn more
            </Link>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss announcement"
            className="ax-interactive absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-black/70 hover:bg-black/10 hover:text-black"
          >
            <X className="size-4" />
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
