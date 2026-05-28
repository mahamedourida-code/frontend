"use client"

import * as React from "react"
import { motion, type Transition } from "framer-motion"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ButtonProps = React.ComponentProps<typeof Button>

type MotionButtonProps = ButtonProps & {
  wrapperClassName?: string
}

const SPRING: Transition = { type: "spring", stiffness: 500, damping: 28 }

type GestureRules = {
  hover: Record<string, number | string>
  tap: Record<string, number | string>
}

function rulesFor(variant: ButtonProps["variant"], size: ButtonProps["size"]): GestureRules | null {
  if (size === "icon") return null

  switch (variant) {
    case "glossy":
      return {
        hover: { scale: 1.025, boxShadow: "0 4px 20px hsl(var(--primary) / 0.35)" },
        tap: { scale: 0.96 },
      }
    case "lime":
      return {
        hover: { scale: 1.025 },
        tap: { scale: 0.96 },
      }
    case "surface":
    case "ink":
    case "reviewed":
      return {
        hover: { scale: 1.015 },
        tap: { scale: 0.96 },
      }
    case "destructive":
      return {
        hover: { scale: 1.015 },
        tap: { scale: 0.95, filter: "brightness(1.08)" },
      }
    default:
      return {
        hover: { scale: 1.015 },
        tap: { scale: 0.96 },
      }
  }
}

const MotionButton = React.forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ wrapperClassName, variant, size, asChild, disabled, ...buttonProps }, ref) => {
    const rules = rulesFor(variant, size)

    if (!rules || disabled) {
      return (
        <Button
          ref={ref}
          variant={variant}
          size={size}
          asChild={asChild}
          disabled={disabled}
          {...buttonProps}
        />
      )
    }

    return (
      <motion.div
        className={cn("inline-flex max-w-full", wrapperClassName)}
        whileHover={rules.hover}
        whileTap={rules.tap}
        transition={SPRING}
      >
        <Button
          ref={ref}
          variant={variant}
          size={size}
          asChild={asChild}
          {...buttonProps}
        />
      </motion.div>
    )
  },
)
MotionButton.displayName = "MotionButton"

export { MotionButton }
