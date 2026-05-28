"use client"

import * as React from "react"
import Image from "next/image"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

type PublishSuccessBurstProps = {
  show: boolean
  /** Pixel coordinates of the burst center, relative to the viewport. */
  origin: { x: number; y: number } | null
}

const RAY_COUNT = 6
const RING_COUNT = 4

/**
 * Calm radial burst that fires after a successful QuickBooks publish. Six
 * primary-coloured rays fan out, then four concentric rings expand behind
 * them. The whole thing is positioned to the supplied viewport origin so
 * it visually anchors on the actual Publish button. Skipped under
 * `prefers-reduced-motion`.
 */
export function PublishSuccessBurst({ show, origin }: PublishSuccessBurstProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion || !origin) return null

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="publish-burst"
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-50"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.18 } }}
        >
          <div
            className="absolute"
            style={{
              left: origin.x,
              top: origin.y,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Rays */}
            {Array.from({ length: RAY_COUNT }).map((_, i) => (
              <motion.div
                key={`ray-${i}`}
                className="absolute left-1/2 top-1/2 h-5 w-[2px] rounded-[1px] bg-primary"
                style={{
                  transformOrigin: "50% 100%",
                  rotate: `${i * 60}deg`,
                  translateX: "-50%",
                  translateY: "-100%",
                }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{ duration: 0.55, delay: i * 0.04, ease: "easeOut" }}
              />
            ))}

            {/* Concentric rings — use bundled success-rings.png */}
            {Array.from({ length: RING_COUNT }).map((_, i) => (
              <motion.div
                key={`ring-${i}`}
                className="absolute left-1/2 top-1/2"
                style={{
                  width: 28,
                  height: 28,
                  translateX: "-50%",
                  translateY: "-50%",
                }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 1.4 + i * 0.25, opacity: 0 }}
                transition={{ duration: 0.7 + i * 0.1, delay: 0.1 + i * 0.06, ease: "easeOut" }}
              >
                <Image
                  src="/fx/success-rings.png"
                  alt=""
                  width={28}
                  height={28}
                  className="h-full w-full select-none object-contain"
                  draggable={false}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
