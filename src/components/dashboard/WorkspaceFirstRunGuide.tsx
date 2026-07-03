"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import {
  Building2,
  FolderUp,
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
          variants={m.panel}
          initial="hidden"
          animate="show"
          exit="exit"
          className="relative -mx-4 border-y border-[var(--workspace-border)] bg-white/[0.78] px-4 py-4 shadow-none sm:-mx-5 sm:px-5 lg:-mx-6 lg:px-6"
        >
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss workspace guide"
            title="Dismiss workspace guide"
            className="ax-interactive absolute right-3 top-3 flex size-8 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-white hover:text-foreground focus-visible:ring-2 focus-visible:ring-[var(--workspace-primary)] sm:right-5"
          >
            <X className="size-4" />
          </button>

          <div className="flex flex-col gap-3 pr-10 sm:flex-row sm:items-center sm:justify-between">
            <h2 id="workspace-first-run-title" className="text-[15px] font-semibold text-[var(--workspace-ink)]">
              Workspace actions
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              {hasClients ? (
                <>
                  <Button asChild variant="glossy" size="sm">
                    <Link href="/dashboard/client#upload-files" data-workspace-tour="upload">
                      <FolderUp className="size-4" />
                      Upload a stack
                    </Link>
                  </Button>
                  <AddCompanyDialog
                    workspaceId={workspaceId ?? undefined}
                    onCreated={onClientCreated}
                    trigger={
                      <Button variant="surface" size="sm" disabled={!workspaceId} data-workspace-tour="clients">
                        <Building2 className="size-4" />
                        Add client
                      </Button>
                    }
                  />
                </>
              ) : (
                <>
                  <AddCompanyDialog
                    workspaceId={workspaceId ?? undefined}
                    onCreated={onClientCreated}
                    trigger={
                      <Button variant="glossy" size="sm" disabled={!workspaceId} data-workspace-tour="clients">
                        <Building2 className="size-4" />
                        Add a client
                      </Button>
                    }
                  />
                  <Button asChild variant="surface" size="sm">
                    <Link href="/dashboard/client#upload-files" data-workspace-tour="upload">
                      <FolderUp className="size-4" />
                      Upload files
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  )
}
