"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"

import { Button } from "@/components/ui/button"

export type WorkspaceWalkthroughStep = {
  target: string
  title: string
  body?: string
  placement?: "top" | "right" | "bottom" | "left"
}

export type WorkspaceWalkthroughProps = {
  userId?: string | null
  workspaceId?: string | null
  steps?: readonly WorkspaceWalkthroughStep[]
  enabled?: boolean
  restartToken?: string | number
  onFinish?: (reason: "completed" | "skipped") => void
}

type TargetRect = {
  top: number
  right: number
  bottom: number
  left: number
  width: number
  height: number
}

type CoachmarkPosition = {
  top: number
  left: number
  width: number
}

export const WORKSPACE_WALKTHROUGH_STEPS = [
  {
    target: '[data-workspace-tour="clients"], [data-workspace-tour-fallback="clients"]',
    title: "Create a client",
    placement: "right",
  },
  {
    target: '[data-workspace-tour="upload"], [data-workspace-tour-fallback="upload"]',
    title: "Upload client documents",
    placement: "right",
  },
  {
    target: '[data-workspace-tour="review"], [data-workspace-tour-fallback="review"]',
    title: "Review exceptions",
    placement: "right",
  },
  {
    target: '[data-workspace-tour="outputs"], [data-workspace-tour-fallback="outputs"]',
    title: "Export or publish",
    placement: "right",
  },
] as const satisfies readonly WorkspaceWalkthroughStep[]

const TARGET_GAP = 8
const COACHMARK_GAP = 14
const VIEWPORT_MARGIN = 16
const COACHMARK_MAX_WIDTH = 350
const COACHMARK_ESTIMATED_HEIGHT = 238

export function getWorkspaceWalkthroughStorageKey(userId: string, workspaceId: string) {
  return `axliner:workspace-walkthrough:v1:${encodeURIComponent(userId)}:${encodeURIComponent(workspaceId)}`
}

function getTarget(selector: string) {
  try {
    const targets = document.querySelectorAll<HTMLElement>(selector)
    return Array.from(targets).find((target) => {
      const rect = target.getBoundingClientRect()
      const style = window.getComputedStyle(target)
      return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden"
    }) ?? null
  } catch {
    return null
  }
}

function findAvailableStep(
  steps: readonly WorkspaceWalkthroughStep[],
  startIndex: number,
  direction: 1 | -1,
) {
  for (
    let index = startIndex;
    index >= 0 && index < steps.length;
    index += direction
  ) {
    if (getTarget(steps[index].target)) return index
  }

  return -1
}

function getPaddedRect(rect: DOMRect): TargetRect {
  const top = Math.max(0, rect.top - TARGET_GAP)
  const left = Math.max(0, rect.left - TARGET_GAP)
  const right = Math.min(window.innerWidth, rect.right + TARGET_GAP)
  const bottom = Math.min(window.innerHeight, rect.bottom + TARGET_GAP)

  return {
    top,
    right,
    bottom,
    left,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  }
}

function getCoachmarkPosition(
  target: TargetRect,
  preferredPlacement: WorkspaceWalkthroughStep["placement"],
): CoachmarkPosition {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const width = Math.min(COACHMARK_MAX_WIDTH, viewportWidth - VIEWPORT_MARGIN * 2)
  const preferred = preferredPlacement ?? "right"
  const placements = [preferred, "right", "bottom", "left", "top"].filter(
    (placement, index, values) => values.indexOf(placement) === index,
  ) as Array<NonNullable<WorkspaceWalkthroughStep["placement"]>>

  const fits = (placement: NonNullable<WorkspaceWalkthroughStep["placement"]>) => {
    if (placement === "right") {
      return viewportWidth - target.right >= width + COACHMARK_GAP + VIEWPORT_MARGIN
    }
    if (placement === "left") {
      return target.left >= width + COACHMARK_GAP + VIEWPORT_MARGIN
    }
    if (placement === "bottom") {
      return viewportHeight - target.bottom >= COACHMARK_ESTIMATED_HEIGHT + COACHMARK_GAP
    }
    return target.top >= COACHMARK_ESTIMATED_HEIGHT + COACHMARK_GAP
  }

  const placement = placements.find(fits) ?? "bottom"
  const clampLeft = (value: number) =>
    Math.min(
      Math.max(VIEWPORT_MARGIN, value),
      viewportWidth - width - VIEWPORT_MARGIN,
    )
  const clampTop = (value: number) =>
    Math.min(
      Math.max(VIEWPORT_MARGIN, value),
      viewportHeight - COACHMARK_ESTIMATED_HEIGHT - VIEWPORT_MARGIN,
    )

  if (placement === "right") {
    return {
      top: clampTop(target.top + target.height / 2 - COACHMARK_ESTIMATED_HEIGHT / 2),
      left: clampLeft(target.right + COACHMARK_GAP),
      width,
    }
  }

  if (placement === "left") {
    return {
      top: clampTop(target.top + target.height / 2 - COACHMARK_ESTIMATED_HEIGHT / 2),
      left: clampLeft(target.left - width - COACHMARK_GAP),
      width,
    }
  }

  return {
    top:
      placement === "top"
        ? clampTop(target.top - COACHMARK_ESTIMATED_HEIGHT - COACHMARK_GAP)
        : clampTop(target.bottom + COACHMARK_GAP),
    left: clampLeft(target.left + target.width / 2 - width / 2),
    width,
  }
}

export function WorkspaceWalkthrough({
  userId,
  workspaceId,
  steps = WORKSPACE_WALKTHROUGH_STEPS,
  enabled = true,
  restartToken,
  onFinish,
}: WorkspaceWalkthroughProps) {
  const shouldReduceMotion = useReducedMotion()
  const storageKey = useMemo(
    () =>
      userId && workspaceId
        ? getWorkspaceWalkthroughStorageKey(userId, workspaceId)
        : null,
    [userId, workspaceId],
  )
  const [eligibleKey, setEligibleKey] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const coachmarkRef = useRef<HTMLDivElement>(null)
  const previousRestartTokenRef = useRef<string | number | undefined>(undefined)

  const currentStep = steps[currentIndex]
  const coachmarkPosition = targetRect && currentStep
    ? getCoachmarkPosition(targetRect, currentStep.placement)
    : null

  const finish = useCallback(
    (reason: "completed" | "skipped") => {
      if (storageKey) {
        try {
          window.localStorage.setItem(storageKey, reason)
        } catch {
          // Dismissal still applies for this visit when storage is unavailable.
        }
      }

      setIsOpen(false)
      setEligibleKey(null)
      setTargetRect(null)
      onFinish?.(reason)
    },
    [onFinish, storageKey],
  )

  useEffect(() => {
    setIsOpen(false)
    setTargetRect(null)

    if (!enabled || !storageKey || steps.length === 0) {
      setEligibleKey(null)
      return
    }

    try {
      setEligibleKey(window.localStorage.getItem(storageKey) ? null : storageKey)
    } catch {
      setEligibleKey(storageKey)
    }
  }, [enabled, steps, storageKey])

  useEffect(() => {
    if (restartToken === undefined) return

    if (previousRestartTokenRef.current === restartToken) return
    previousRestartTokenRef.current = restartToken

    if (enabled && storageKey && steps.length > 0) {
      setEligibleKey(storageKey)
      setIsOpen(false)
      setTargetRect(null)
    }
  }, [enabled, restartToken, steps.length, storageKey])

  useEffect(() => {
    if (!eligibleKey || eligibleKey !== storageKey || isOpen) return

    const openAtFirstAvailableStep = () => {
      const firstAvailableIndex = findAvailableStep(steps, 0, 1)
      if (firstAvailableIndex < 0) return false

      setCurrentIndex(firstAvailableIndex)
      setIsOpen(true)
      return true
    }

    if (openAtFirstAvailableStep()) return

    const observer = new MutationObserver(() => {
      if (openAtFirstAvailableStep()) observer.disconnect()
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [eligibleKey, isOpen, steps, storageKey])

  useEffect(() => {
    if (!isOpen || !currentStep) return

    const target = getTarget(currentStep.target)
    if (!target) {
      const nextIndex = findAvailableStep(steps, currentIndex + 1, 1)
      const previousIndex = findAvailableStep(steps, currentIndex - 1, -1)

      if (nextIndex >= 0 || previousIndex >= 0) {
        setCurrentIndex(nextIndex >= 0 ? nextIndex : previousIndex)
      } else {
        setIsOpen(false)
        setTargetRect(null)
      }
      return
    }

    const initialRect = target.getBoundingClientRect()
    const isOutsideViewport =
      initialRect.bottom < VIEWPORT_MARGIN ||
      initialRect.top > window.innerHeight - VIEWPORT_MARGIN

    if (isOutsideViewport) {
      target.scrollIntoView({
        behavior: shouldReduceMotion ? "auto" : "smooth",
        block: "center",
        inline: "center",
      })
    }

    let frame = 0
    const updateTargetRect = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const activeTarget = getTarget(currentStep.target)
        if (!activeTarget) {
          setTargetRect(null)
          return
        }
        setTargetRect(getPaddedRect(activeTarget.getBoundingClientRect()))
      })
    }

    updateTargetRect()
    window.addEventListener("resize", updateTargetRect)
    window.addEventListener("scroll", updateTargetRect, true)
    const resizeObserver = new ResizeObserver(updateTargetRect)
    resizeObserver.observe(target)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", updateTargetRect)
      window.removeEventListener("scroll", updateTargetRect, true)
      resizeObserver.disconnect()
    }
  }, [currentIndex, currentStep, isOpen, shouldReduceMotion, steps])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish("skipped")
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [finish, isOpen])

  useEffect(() => {
    if (!isOpen) return
    previousFocusRef.current = document.activeElement as HTMLElement | null
    return () => previousFocusRef.current?.focus({ preventScroll: true })
  }, [isOpen])

  const hasCoachmarkPosition = coachmarkPosition !== null

  useEffect(() => {
    if (!isOpen || !hasCoachmarkPosition) return
    coachmarkRef.current?.focus({ preventScroll: true })
  }, [currentIndex, hasCoachmarkPosition, isOpen])

  if (typeof document === "undefined") return null

  const previousAvailableIndex = findAvailableStep(steps, currentIndex - 1, -1)
  const nextAvailableIndex = findAvailableStep(steps, currentIndex + 1, 1)

  const goBack = () => {
    if (previousAvailableIndex >= 0) setCurrentIndex(previousAvailableIndex)
  }

  const goForward = () => {
    if (nextAvailableIndex >= 0) {
      setCurrentIndex(nextAvailableIndex)
      return
    }

    finish("completed")
  }

  const hasPreviousStep = previousAvailableIndex >= 0
  const isLastStep = nextAvailableIndex < 0

  return createPortal(
    <AnimatePresence>
      {isOpen && currentStep && targetRect && coachmarkPosition ? (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[100]"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.16 }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-auto fixed left-0 right-0 top-0 bg-black/55"
            style={{ height: targetRect.top }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-auto fixed bottom-0 left-0 right-0 bg-black/55"
            style={{ top: targetRect.bottom }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-auto fixed left-0 bg-black/55"
            style={{
              top: targetRect.top,
              width: targetRect.left,
              height: targetRect.height,
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-auto fixed right-0 bg-black/55"
            style={{
              top: targetRect.top,
              left: targetRect.right,
              height: targetRect.height,
            }}
          />

          <motion.div
            aria-hidden="true"
            className="fixed rounded-lg border-2 border-[var(--workspace-primary)]"
            animate={{
              top: targetRect.top,
              left: targetRect.left,
              width: targetRect.width,
              height: targetRect.height,
            }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}
          />

          <motion.div
            key={currentStep.target}
            ref={coachmarkRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="workspace-walkthrough-title"
            aria-describedby={currentStep.body ? "workspace-walkthrough-body" : undefined}
            tabIndex={-1}
            className="pointer-events-auto fixed rounded-[10px] border border-[var(--workspace-topbar-border)] bg-[var(--workspace-topbar)] p-4 text-white outline-none"
            style={coachmarkPosition}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -6 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.18, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase text-[var(--workspace-blue-soft)]">
                Step {currentIndex + 1} of {steps.length}
              </p>
              <button
                type="button"
                onClick={() => finish("skipped")}
                className="ax-interactive text-xs font-semibold text-white/65 outline-none hover:text-white focus-visible:underline"
              >
                Skip tour
              </button>
            </div>

            <h2 id="workspace-walkthrough-title" className="mt-3 text-lg font-semibold">
              {currentStep.title}
            </h2>
            {currentStep.body ? (
              <p
                id="workspace-walkthrough-body"
                className="mt-1.5 text-sm leading-6 text-white/70"
              >
                {currentStep.body}
              </p>
            ) : null}

            <div className="mt-5 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="surface"
                size="sm"
                onClick={goBack}
                disabled={!hasPreviousStep}
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>
              <Button type="button" variant="glossy" size="sm" onClick={goForward}>
                {isLastStep ? (
                  <>
                    <Check className="size-4" />
                    Done
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
