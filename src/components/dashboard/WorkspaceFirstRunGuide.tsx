"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowRight,
  Building2,
  FolderUp,
  ListChecks,
  X,
} from "lucide-react"

import { AddCompanyDialog } from "@/components/dashboard/companies/AddCompanyDialog"
import { Button } from "@/components/ui/button"
import { useMotionTokens } from "@/lib/motion"

type WorkspaceFirstRunGuideProps = {
  userId?: string | null
  workspaceId?: string | null
  hasClients: boolean
  onClientCreated: () => void
}

function guideStorageKey(userId: string, workspaceId: string) {
  return `axliner:first-run-guide:${userId}:${workspaceId}`
}

const primaryActionClassName =
  "border-[#1877F2] bg-[#1877F2] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_1px_2px_rgba(24,119,242,0.22),0_4px_12px_-5px_rgba(24,119,242,0.42)] hover:border-[#166FE5] hover:bg-[#166FE5] hover:text-white"

export function WorkspaceFirstRunGuide({
  userId,
  workspaceId,
  hasClients,
  onClientCreated,
}: WorkspaceFirstRunGuideProps) {
  const storageKey = userId && workspaceId ? guideStorageKey(userId, workspaceId) : null
  const m = useMotionTokens()
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

  if (!storageKey || guideState.key !== storageKey) return null

  return (
    <AnimatePresence initial={false}>
      {!guideState.dismissed ? (
        <motion.section
          aria-labelledby="workspace-first-run-title"
          variants={m.fadeUp}
          initial="hidden"
          animate="show"
          exit="exit"
          className="relative -mx-4 border-y border-[var(--workspace-border)] bg-white/80 px-4 py-3.5 shadow-none sm:-mx-5 sm:px-5 lg:-mx-6 lg:px-6"
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={hasClients ? "upload" : "client"}
              initial={m.reduced ? { opacity: 0 } : { opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={m.reduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
              transition={m.tFast}
              className="flex min-w-0 flex-col gap-3 pr-9 sm:flex-row sm:items-center"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#edf4ff] text-[#1877F2] ring-1 ring-inset ring-[#1877F2]/15">
                {hasClients ? <FolderUp className="ax-blue-icon size-5" /> : <Building2 className="ax-blue-icon size-5" />}
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium uppercase text-[var(--workspace-muted)]">
                  Next
                </p>
                <h2 id="workspace-first-run-title" className="mt-0.5 text-[15px] font-semibold text-[var(--workspace-ink)]">
                  {hasClients ? "Upload a batch" : "Add a client"}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {hasClients ? (
                  <Button asChild variant="blue" size="sm" className={primaryActionClassName}>
                    <Link href="/dashboard/client#upload-files" data-workspace-tour="upload">
                      <FolderUp className="ax-on-blue-icon size-4" />
                      Upload
                    </Link>
                  </Button>
                ) : (
                  <AddCompanyDialog
                    workspaceId={workspaceId ?? undefined}
                    onCreated={onClientCreated}
                    trigger={
                      <Button
                        variant="blue"
                        size="sm"
                        className={primaryActionClassName}
                        disabled={!workspaceId}
                        data-workspace-tour="clients"
                      >
                        <Building2 className="ax-on-blue-icon size-4" />
                        Add client
                      </Button>
                    }
                  />
                )}

                <Link
                  href="/dashboard/guide"
                  className="ax-interactive inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium text-[var(--workspace-muted)] outline-none hover:bg-[var(--workspace-soft)] hover:text-[var(--workspace-ink)] focus-visible:ring-2 focus-visible:ring-[#1877F2]"
                >
                  <ListChecks className="size-3.5" />
                  Start here
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss getting started"
            title="Dismiss getting started"
            className="ax-interactive absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-[var(--workspace-muted)] outline-none hover:bg-[var(--workspace-soft)] hover:text-[var(--workspace-ink)] focus-visible:ring-2 focus-visible:ring-[#1877F2] sm:right-5"
          >
            <X className="size-4" />
          </button>
        </motion.section>
      ) : null}
    </AnimatePresence>
  )
}
