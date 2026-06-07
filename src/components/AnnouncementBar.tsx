"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { X } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

const STORAGE_KEY = "axliner-announce-dismissed"
const BAR_H = "36px"

/**
 * Thin top-of-page announcement bar (brown brand band). It is `fixed` at the very
 * top and publishes its height to `--axn-bar` on the document, which the fixed
 * MarketingNavBar reads for its `top` offset — so the bar sits ABOVE the nav
 * instead of overlapping it. On dismiss (remembered in localStorage) the var
 * goes back to 0 and the nav returns to the top. Reduced-motion safe.
 */
export function AnnouncementBar() {
  const [visible, setVisible] = useState(false)
  const reduce = useReducedMotion()

  useEffect(() => {
    let show = true
    try {
      show = !window.localStorage.getItem(STORAGE_KEY)
    } catch {}
    setVisible(show)
    document.documentElement.style.setProperty("--axn-bar", show ? BAR_H : "0px")
    return () => {
      document.documentElement.style.setProperty("--axn-bar", "0px")
    }
  }, [])

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1")
    } catch {}
    document.documentElement.style.setProperty("--axn-bar", "0px")
    setVisible(false)
  }

  return (
    <AnimatePresence initial={false}>
      {visible ? (
        <motion.div
          initial={reduce ? false : { y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: -40, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="fixed inset-x-0 top-0 z-[60] flex h-9 items-center justify-center bg-[var(--brand-brown)] text-black"
        >
          <div className="flex items-center gap-3 px-10">
            <p className="truncate text-[13.5px] font-semibold text-black">
              New in AxLiner: batch review board + one-click publishing to QuickBooks & Xero.
            </p>
            <Link
              href="/whats-new"
              className="ax-interactive inline-flex shrink-0 items-center rounded-md bg-black px-3 py-1 text-[12.5px] font-bold text-white transition-colors hover:bg-white hover:text-black hover:underline hover:decoration-1 hover:underline-offset-4"
            >
              Learn more
            </Link>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss announcement"
            className="ax-interactive absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-black/70 hover:bg-black/10 hover:text-black"
          >
            <X className="size-4" />
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
