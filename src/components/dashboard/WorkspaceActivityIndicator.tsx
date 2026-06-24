import { FileSearch } from "lucide-react"

import { ShimmerText } from "@/components/ui/ShimmerText"
import { cn } from "@/lib/utils"

type WorkspaceActivityIndicatorProps = {
  title: string
  detail?: string
  done?: number
  total?: number
  scope?: "page" | "section"
  className?: string
}

export function WorkspaceActivityIndicator({
  title,
  detail,
  done,
  total,
  scope = "section",
  className,
}: WorkspaceActivityIndicatorProps) {
  const showProgress = typeof done === "number" && typeof total === "number" && total > 0

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex w-full items-center gap-4 border border-[color-mix(in_srgb,var(--text-working)_24%,var(--workspace-border))] bg-[color-mix(in_srgb,var(--workspace-blue-soft)_72%,white)] px-5",
        scope === "page" ? "min-h-32 rounded-lg py-7" : "min-h-20 rounded-md py-4",
        className,
      )}
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--text-working)_28%,transparent)] bg-white text-[var(--text-working)]">
        <FileSearch className="size-6" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <ShimmerText
          tone="working"
          className={cn("block font-bold", scope === "page" ? "text-xl" : "text-lg")}
        >
          {title}
        </ShimmerText>
        {detail ? <p className="mt-1 text-sm font-medium text-[var(--workspace-muted)]">{detail}</p> : null}
      </div>
      {showProgress ? (
        <span className="shrink-0 font-mono text-sm font-bold tabular-nums text-[var(--text-working)]">
          {Math.min(done, total)} of {total}
        </span>
      ) : null}
    </div>
  )
}
