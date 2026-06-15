"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

type InlineActionProps = React.ComponentProps<"button"> & {
  /** Render as a child element (e.g. a Link) instead of a <button>. */
  asChild?: boolean
  /** Text-only actions. Brand is blue; semantic tones are used inside the workspace. */
  tone?: "brand" | "success" | "warning" | "danger" | "purple" | "neutral"
}

/**
 * A pressable piece of TEXT — not a filled button. Brand cyan (or red for
 * destructive), semibold, underlines on hover/focus. Use for secondary and
 * row-level actions (Edit, Add, Remove, Set, Connect…) where a full button
 * would be too heavy. Primary flow CTAs stay as <Button>.
 */
export const InlineAction = React.forwardRef<HTMLButtonElement, InlineActionProps>(
  ({ className, asChild = false, tone = "brand", type, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref as React.Ref<HTMLButtonElement>}
        data-slot="inline-action"
        // Only set a default type when we actually render a <button>.
        {...(asChild ? {} : { type: type ?? "button" })}
        className={cn(
          "ax-interactive inline-flex cursor-pointer items-center gap-1 rounded-sm text-sm font-semibold underline-offset-4 outline-none transition-colors hover:underline focus-visible:underline disabled:pointer-events-none disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4",
          tone === "brand" && "text-[var(--brand-link)] hover:text-[var(--brand-link-hover)]",
          tone === "success" && "text-[var(--workspace-success)] hover:text-[var(--workspace-success-hover)]",
          tone === "warning" && "text-[var(--workspace-warning)] hover:text-[var(--workspace-warning-hover)]",
          tone === "danger" && "text-[var(--workspace-danger)] hover:text-[var(--workspace-danger-hover)]",
          tone === "purple" && "text-[var(--workspace-purple)] hover:text-[var(--workspace-purple-hover)]",
          tone === "neutral" && "text-[var(--workspace-muted)] hover:text-[var(--workspace-ink)]",
          className,
        )}
        {...props}
      />
    )
  },
)
InlineAction.displayName = "InlineAction"
