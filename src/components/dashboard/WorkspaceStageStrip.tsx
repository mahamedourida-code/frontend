import Link from "next/link"
import { ArrowDown, ArrowRight, FileOutput, ListChecks, Upload } from "lucide-react"

import { cn } from "@/lib/utils"

type WorkspaceStage = "collect" | "review" | "output"

const stages = [
  {
    key: "collect",
    label: "Collect",
    detail: "Upload a mixed batch",
    href: "/dashboard/client#upload-files",
    icon: Upload,
  },
  {
    key: "review",
    label: "Review",
    detail: "Correct flagged fields",
    href: "/dashboard/client",
    icon: ListChecks,
  },
  {
    key: "output",
    label: "Output",
    detail: "Excel/CSV or draft bills",
    href: "/dashboard/accounts-payable",
    icon: FileOutput,
  },
] as const

interface WorkspaceStageStripProps {
  activeStage?: WorkspaceStage
  className?: string
}

/** A compact route map for first-use states inside the workspace. */
export function WorkspaceStageStrip({ activeStage, className }: WorkspaceStageStripProps) {
  return (
    <nav
      aria-label="Document workflow"
      className={cn("w-full border-y border-border py-3.5", className)}
    >
      <ol className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center sm:gap-3">
        {stages.map((stage, index) => {
          const Icon = stage.icon
          const active = activeStage === stage.key

          return (
            <li key={stage.key} className="contents">
              <Link
                href={stage.href}
                aria-current={active ? "step" : undefined}
                className="ax-interactive group flex min-w-0 items-start gap-3 rounded-md px-2 py-1.5 text-left focus-visible:ring-2 focus-visible:ring-ring/45"
              >
                <Icon
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    active ? "text-[var(--workspace-primary)]" : "text-muted-foreground",
                  )}
                  aria-hidden="true"
                />
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-[13px] font-semibold leading-4",
                      active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
                    )}
                  >
                    {stage.label}
                  </span>
                  <span className="mt-0.5 block text-xs leading-4 text-muted-foreground">
                    {stage.detail}
                  </span>
                </span>
              </Link>
              {index < stages.length - 1 ? (
                <span className="flex items-center justify-center text-slate-300" aria-hidden="true">
                  <ArrowDown className="size-3.5 sm:hidden" />
                  <ArrowRight className="hidden size-3.5 sm:block" />
                </span>
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
