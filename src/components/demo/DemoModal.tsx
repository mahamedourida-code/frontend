"use client"

import { useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { X } from "lucide-react"

import { DemoFlow } from "@/components/demo/DemoFlow"

/**
 * Global "Request a demo" modal. Opens whenever the URL carries `?demo=1`, so
 * any link/button can trigger it in place (the page behind blurs; just the card
 * stays sharp). Closes on the backdrop, the X, or Escape by stripping the param.
 */
export function DemoModal() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const reduce = useReducedMotion()
  const open = params.get("demo") === "1"

  const close = () => {
    const next = new URLSearchParams(params.toString())
    next.delete("demo")
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100] overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.22 }}
          role="dialog"
          aria-modal="true"
          aria-label="Request a demo"
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md" aria-hidden />
          <div className="relative flex min-h-full items-center justify-center p-4 sm:p-6" onClick={close}>
            <motion.div
              className="relative w-full max-w-5xl"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.985 }}
              transition={{ duration: reduce ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="ax-interactive absolute right-3.5 top-3.5 z-20 flex size-9 items-center justify-center rounded-full bg-white/90 text-black shadow-sm ring-1 ring-black/10 transition-colors hover:bg-white"
              >
                <X className="size-5" />
              </button>
              <DemoFlow />
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
