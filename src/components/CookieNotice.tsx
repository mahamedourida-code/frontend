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
          className="fixed bottom-5 left-5 z-[60] w-[min(94vw,500px)] rounded-[20px] bg-[#E8D5B5] px-7 py-9 text-black shadow-[0_16px_54px_-16px_rgba(0,0,0,0.55)]"
        >
          <p className="text-2xl font-extrabold tracking-tight text-black">Notice</p>
          <p className="mt-4 text-[17px] font-medium leading-8 text-black">
            We use cookies to keep AxLiner running smoothly, remember your preferences, and understand
            how the site is used. Some cookies are essential; others help us see how the site is used so
            we can improve it. By choosing Accept, you agree to our use of all cookies.
          </p>
          <div className="mt-8 flex items-center justify-between gap-4">
            <Link
              href="/privacy-policy"
              className="ax-interactive text-base font-semibold text-black underline decoration-black/50 underline-offset-4 hover:decoration-black"
            >
              Privacy Policy
            </Link>
            <button
              type="button"
              onClick={accept}
              className="ax-interactive rounded-full border-2 border-black bg-transparent px-9 py-3 text-base font-bold text-black transition-colors duration-150 hover:bg-black hover:text-white active:translate-y-px"
            >
              Accept
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
