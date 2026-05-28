"use client"

import { useEffect, useRef, useState } from "react"
import { animate, motion, useMotionValue, useSpring } from "framer-motion"

const INTERACTIVE_SELECTOR = 'button, a, [role="button"]'
const MAGNET_SELECTOR = '[data-variant="glossy"]'

function isCoarsePointer() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return true
  }
  return window.matchMedia("(pointer: coarse)").matches
}

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false)
  const [hovering, setHovering] = useState(false)

  const innerX = useMotionValue(-100)
  const innerY = useMotionValue(-100)
  const outerX = useMotionValue(-100)
  const outerY = useMotionValue(-100)

  const innerSpringX = useSpring(innerX, { stiffness: 650, damping: 42 })
  const innerSpringY = useSpring(innerY, { stiffness: 650, damping: 42 })
  const outerSpringX = useSpring(outerX, { stiffness: 140, damping: 20 })
  const outerSpringY = useSpring(outerY, { stiffness: 140, damping: 20 })

  const magnetActiveRef = useRef<HTMLElement | null>(null)
  const lastPointerRef = useRef({ x: -100, y: -100 })

  useEffect(() => {
    if (isCoarsePointer()) return
    setEnabled(true)
    document.body.classList.add("custom-cursor-active")
    return () => {
      document.body.classList.remove("custom-cursor-active")
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    const handlePointerMove = (event: PointerEvent) => {
      lastPointerRef.current = { x: event.clientX, y: event.clientY }
      outerX.set(event.clientX)
      outerY.set(event.clientY)

      // Magnetic pull: if hovering a glossy CTA, ease inner dot toward its center
      const magnetTarget = magnetActiveRef.current
      if (magnetTarget) {
        const rect = magnetTarget.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        // 35% pull from cursor toward button center
        innerX.set(event.clientX + (cx - event.clientX) * 0.35)
        innerY.set(event.clientY + (cy - event.clientY) * 0.35)
      } else {
        innerX.set(event.clientX)
        innerY.set(event.clientY)
      }
    }

    const handlePointerOver = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) return
      const interactive = target.closest(INTERACTIVE_SELECTOR) as HTMLElement | null
      const magnetic = target.closest(MAGNET_SELECTOR) as HTMLElement | null

      setHovering(Boolean(interactive))

      if (magnetic && magnetic !== magnetActiveRef.current) {
        magnetActiveRef.current = magnetic
        const rect = magnetic.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        animate(innerX, cx, { type: "spring", stiffness: 320, damping: 24 })
        animate(innerY, cy, { type: "spring", stiffness: 320, damping: 24 })
      }
    }

    const handlePointerOut = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) return
      const leavingMagnet = target.closest(MAGNET_SELECTOR)
      if (leavingMagnet && leavingMagnet === magnetActiveRef.current) {
        magnetActiveRef.current = null
        animate(innerX, lastPointerRef.current.x, { type: "spring", stiffness: 480, damping: 32 })
        animate(innerY, lastPointerRef.current.y, { type: "spring", stiffness: 480, damping: 32 })
      }
    }

    const handlePointerLeaveWindow = () => {
      innerX.set(-100)
      innerY.set(-100)
      outerX.set(-100)
      outerY.set(-100)
      setHovering(false)
      magnetActiveRef.current = null
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerover", handlePointerOver)
    window.addEventListener("pointerout", handlePointerOut)
    window.addEventListener("blur", handlePointerLeaveWindow)
    document.addEventListener("mouseleave", handlePointerLeaveWindow)

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerover", handlePointerOver)
      window.removeEventListener("pointerout", handlePointerOut)
      window.removeEventListener("blur", handlePointerLeaveWindow)
      document.removeEventListener("mouseleave", handlePointerLeaveWindow)
    }
  }, [enabled, innerX, innerY, outerX, outerY])

  if (!enabled) return null

  return (
    <>
      {/* Outer ring — slow spring */}
      <motion.div
        aria-hidden="true"
        style={{
          x: outerSpringX,
          y: outerSpringY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: hovering ? 44 : 34,
          height: hovering ? 44 : 34,
          opacity: hovering ? 0.8 : 1,
        }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full border-[1.5px] border-primary/40"
      />
      {/* Inner dot — fast spring */}
      <motion.div
        aria-hidden="true"
        style={{
          x: innerSpringX,
          y: innerSpringY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: hovering ? 0 : 1,
        }}
        transition={{ duration: 0.16, ease: "easeOut" }}
        className="pointer-events-none fixed left-0 top-0 z-[9999] size-2 rounded-full bg-primary"
      />
    </>
  )
}
