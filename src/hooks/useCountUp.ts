"use client"

import { useEffect, useRef, useState } from "react"

type Easing = "linear" | "easeOut" | "easeInOut"

type UseCountUpOptions = {
  duration?: number
  ease?: Easing
  startOnView?: boolean
  enabled?: boolean
}

const easingFns: Record<Easing, (t: number) => number> = {
  linear: (t) => t,
  easeOut: (t) => 1 - Math.pow(1 - t, 3),
  easeInOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
}

export function useCountUp(
  target: number,
  {
    duration = 1.2,
    ease = "easeOut",
    startOnView = true,
    enabled = true,
  }: UseCountUpOptions = {},
) {
  const nodeRef = useRef<HTMLElement | null>(null)
  const [value, setValue] = useState<number>(startOnView ? 0 : target)
  const previousTargetRef = useRef<number>(0)
  const hasStartedRef = useRef<boolean>(!startOnView)

  useEffect(() => {
    if (!enabled) {
      setValue(target)
      previousTargetRef.current = target
      return
    }

    let raf = 0

    const run = (from: number, to: number) => {
      const totalMs = Math.max(0, duration) * 1000
      if (totalMs === 0 || from === to) {
        setValue(to)
        previousTargetRef.current = to
        return
      }

      const startedAt = performance.now()
      const easingFn = easingFns[ease] || easingFns.easeOut

      const step = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / totalMs)
        const eased = easingFn(progress)
        setValue(from + (to - from) * eased)
        if (progress < 1) {
          raf = requestAnimationFrame(step)
        } else {
          previousTargetRef.current = to
        }
      }

      raf = requestAnimationFrame(step)
    }

    const begin = () => {
      hasStartedRef.current = true
      run(previousTargetRef.current, target)
    }

    if (!startOnView) {
      begin()
    } else if (hasStartedRef.current) {
      // Already visible; animate from the last value to the new target.
      run(previousTargetRef.current, target)
    } else {
      const node = nodeRef.current
      if (!node || typeof IntersectionObserver === "undefined") {
        begin()
      } else {
        const observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                begin()
                observer.disconnect()
                break
              }
            }
          },
          { threshold: 0.2 },
        )
        observer.observe(node)
        return () => {
          observer.disconnect()
          if (raf) cancelAnimationFrame(raf)
        }
      }
    }

    return () => {
      if (raf) cancelAnimationFrame(raf)
    }
  }, [target, duration, ease, startOnView, enabled])

  return { value, ref: nodeRef }
}
