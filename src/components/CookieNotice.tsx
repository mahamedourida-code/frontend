"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

const STORAGE_KEY = "axliner-cookie-consent"

/**
 * First-visit cookie notice: a fixed bottom-left aqua card that slides up once,
 * persists the choice in localStorage, and animates out on Accept. Sized to
 * match the reap.global card (≈500×356, 24px padding, 20px radius, 20px bold
 * heading) with AxLiner brand + copy. All text is pure black. Reduced-motion safe.
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
          className="fixed bottom-5 left-5 z-[60] w-[min(94vw,500px)] rounded-[20px] bg-[var(--brand-green)] p-6 text-black shadow-[0_16px_54px_-16px_rgba(0,0,0,0.55)]"
        >
          <p className="text-xl font-extrabold tracking-tight text-black">Notice</p>
          <p className="mt-3 text-[17px] font-medium leading-7 text-black">
            We use cookies to keep AxLiner running smoothly, remember your preferences, and understand
            how the site is used. Some cookies are essential; others help us see how the site is used so
            we can improve it. By choosing Accept, you agree to our use of all cookies.
          </p>
          <div className="mt-6 flex items-center justify-between gap-4">
            <Link
              href="/privacy-policy"
              className="ax-interactive text-base font-semibold text-black underline decoration-black/50 underline-offset-4 hover:decoration-black"
            >
              Privacy Policy
            </Link>
            <button
              type="button"
              onClick={accept}
              className="ax-interactive rounded-full bg-white px-9 py-3.5 text-base font-bold text-black shadow-sm transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
            >
              Accept
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
