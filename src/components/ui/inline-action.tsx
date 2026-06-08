"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

type InlineActionProps = React.ComponentProps<"button"> & {
  /** Render as a child element (e.g. a Link) instead of a <button>. */
  asChild?: boolean
  /** brand = our cyan; danger = red (Remove / Delete style). */
  tone?: "brand" | "danger"
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
          tone === "danger"
            ? "text-red-600 hover:text-red-700"
            : "text-[var(--brand-link)] hover:text-[var(--brand-link-hover)]",
          className,
        )}
        {...props}
      />
    )
  },
)
InlineAction.displayName = "InlineAction"
