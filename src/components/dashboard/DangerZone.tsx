import * as React from "react"
import { ChevronDown, TriangleAlert } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * The "Danger zone" block (Lindy / GitHub pattern): a softly red-bordered
 * section that fences off irreversible actions — Leave workspace, Delete
 * workspace, Delete account, Delete client. Drop `dangerOutline` <Button>s (or
 * a danger <InlineAction>) as children; each action is responsible for its own
 * typed-confirmation modal before it fires.
 */
export function DangerZone({
  title = "Danger zone",
  description,
  children,
  className,
}: {
  title?: string
  description?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <details
      className={cn(
        "group rounded-lg border border-red-200 bg-white shadow-none",
        className,
      )}
    >
      <summary className="ax-interactive flex cursor-pointer list-none items-center gap-3 rounded-lg px-4 py-3 outline-none marker:hidden focus-visible:ring-2 focus-visible:ring-red-500/20 [&::-webkit-details-marker]:hidden">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-700">
          <TriangleAlert className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold text-foreground">{title}</span>
          {description ? (
            <span className="mt-0.5 block text-[12px] leading-5 text-[var(--workspace-muted)]">{description}</span>
          ) : null}
        </span>
        <ChevronDown className="size-4 shrink-0 text-black transition-transform group-open:rotate-180" />
      </summary>
      <div className="flex flex-wrap items-center gap-3 border-t border-red-100 px-4 py-3">{children}</div>
    </details>
  )
}
