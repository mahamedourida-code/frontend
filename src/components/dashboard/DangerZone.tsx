import * as React from "react"

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
    <section
      className={cn(
        "rounded-xl border border-red-200 bg-white p-4 shadow-none sm:p-5",
        className,
      )}
    >
      <h3 className="text-sm font-bold text-foreground">{title}</h3>
      {description ? (
        <p className="mt-1 text-sm leading-6 text-foreground">{description}</p>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-3">{children}</div>
    </section>
  )
}
