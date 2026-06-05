"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

const STORAGE_KEY = "axliner-cookie-consent"

/**
 * First-visit cookie notice: a fixed bottom-left aqua card that slides up once,
 * persists the choice in localStorage, and animates out on Accept. Modelled on
 * the reap.global pattern; AxLiner brand + copy. Reduced-motion safe.
 */
export function CookieNotice() {
  const [visible, setVisible] = useState(false)
  const reduce = useReducedMotion()

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  const accept = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1")
    } catch {}
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 28 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1], delay: 0.5 }}
          role="dialog"
          aria-label="Cookie notice"
          className="fixed bottom-4 left-4 z-[60] w-[min(92vw,500px)] rounded-[20px] bg-[var(--brand-green)] p-6 text-[#052b2b] shadow-[0_12px_44px_-14px_rgba(0,0,0,0.5)]"
        >
          <p className="text-sm font-bold tracking-tight">Notice</p>
          <p className="mt-2 text-sm leading-6 text-[#06403b]">
            We use cookies to keep AxLiner running smoothly, remember your preferences, and learn how the
            site is used. Some are essential; others help us improve your experience. By choosing Accept,
            you agree to our use of cookies.
          </p>
          <div className="mt-5 flex items-center justify-between gap-3">
            <Link
              href="/privacy-policy"
              className="ax-interactive text-sm font-semibold underline decoration-[#052b2b]/40 underline-offset-4 hover:decoration-[#052b2b]"
            >
              Privacy Policy
            </Link>
            <button
              type="button"
              onClick={accept}
              className="ax-interactive rounded-full bg-white px-7 py-2 text-sm font-bold text-[#052b2b] shadow-sm transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
            >
              Accept
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
