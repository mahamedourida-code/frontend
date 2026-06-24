"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Building2,
  FileCheck2,
  FileOutput,
  FolderUp,
  X,
} from "lucide-react"

import { AddCompanyDialog } from "@/components/dashboard/companies/AddCompanyDialog"
import { Button } from "@/components/ui/button"

type WorkspaceFirstRunGuideProps = {
  userId?: string | null
  workspaceId?: string | null
  onClientCreated: () => void
}

const steps = [
  {
    title: "Add or select a client",
    detail: "Give every stack a clear home.",
    icon: Building2,
  },
  {
    title: "Upload a mixed stack",
    detail: "Combine PDFs, scans, and photos.",
    icon: FolderUp,
  },
  {
    title: "Review exceptions",
    detail: "Correct flagged fields and rows.",
    icon: FileCheck2,
  },
  {
    title: "Export or publish",
    detail: "Excel/CSV, or draft bills to QuickBooks or Xero.",
    icon: FileOutput,
  },
]

function guideStorageKey(userId: string, workspaceId: string) {
  return `axliner:first-run-guide:${userId}:${workspaceId}`
}

export function WorkspaceFirstRunGuide({
  userId,
  workspaceId,
  onClientCreated,
}: WorkspaceFirstRunGuideProps) {
  const storageKey = userId && workspaceId ? guideStorageKey(userId, workspaceId) : null
  const [guideState, setGuideState] = useState<{ key: string | null; dismissed: boolean }>({
    key: null,
    dismissed: false,
  })

  useEffect(() => {
    if (!storageKey) {
      setGuideState({ key: null, dismissed: false })
      return
    }

    try {
      setGuideState({ key: storageKey, dismissed: window.localStorage.getItem(storageKey) === "1" })
    } catch {
      setGuideState({ key: storageKey, dismissed: false })
    }
  }, [storageKey])

  const dismiss = () => {
    if (!storageKey) return

    try {
      window.localStorage.setItem(storageKey, "1")
    } catch {
      // The guide can still be dismissed for this visit when storage is unavailable.
    }
    setGuideState({ key: storageKey, dismissed: true })
  }

  if (!storageKey || guideState.key !== storageKey || guideState.dismissed) return null

  return (
    <section
      aria-labelledby="workspace-first-run-title"
      className="relative -mx-4 border-y border-[var(--workspace-border)] bg-[#f5f8fc] px-4 py-5 sm:-mx-5 sm:px-5 lg:-mx-6 lg:px-6"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss workspace guide"
        title="Dismiss workspace guide"
        className="ax-interactive absolute right-3 top-3 flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-white hover:text-foreground focus-visible:ring-2 focus-visible:ring-[var(--workspace-primary)] sm:right-5"
      >
        <X className="size-4" />
      </button>

      <div className="pr-10">
        <p className="text-xs font-semibold uppercase text-[var(--workspace-primary)]">First run</p>
        <h2 id="workspace-first-run-title" className="mt-1 text-lg font-semibold text-[var(--workspace-ink)]">
          Take one stack from files to reviewed output
        </h2>
        <p className="mt-1 text-sm leading-5 text-muted-foreground">
          AxLiner keeps collection, review, and accounting output in one client workflow.
        </p>
      </div>

      <ol className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4" aria-label="Workspace workflow">
        {steps.map((step, index) => {
          const Icon = step.icon

          return (
            <li key={step.title} className="relative flex min-w-0 gap-3 pr-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-[var(--workspace-border)] bg-white text-[var(--workspace-primary)]">
                <Icon className="size-[18px]" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--workspace-ink)]">
                  <span className="mr-1.5 font-mono text-xs font-semibold text-[var(--workspace-primary)]">
                    {index + 1}
                  </span>
                  {step.title}
                </p>
                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{step.detail}</p>
              </div>
              {index < steps.length - 1 ? (
                <ArrowRight className="absolute -right-1 top-2.5 hidden size-4 text-slate-300 xl:block" aria-hidden="true" />
              ) : null}
            </li>
          )
        })}
      </ol>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <AddCompanyDialog
          workspaceId={workspaceId ?? undefined}
          onCreated={onClientCreated}
          trigger={
            <Button variant="glossy" size="sm" disabled={!workspaceId}>
              <Building2 className="size-4" />
              Add a client
            </Button>
          }
        />
        <Button asChild variant="surface" size="sm">
          <Link href="/dashboard/client#upload-files">
            <FolderUp className="size-4" />
            Upload for an existing client
          </Link>
        </Button>
      </div>
    </section>
  )
}
