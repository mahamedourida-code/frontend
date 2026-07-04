"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import {
  Building2,
  FolderUp,
  ListChecks,
  X,
} from "lucide-react"

import { AddCompanyDialog } from "@/components/dashboard/companies/AddCompanyDialog"
import { WorkspaceVisualCard } from "@/components/dashboard/WorkspaceVisualCard"
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
          className="relative -mx-4 border-y border-[var(--workspace-border)] bg-white/[0.78] px-4 py-5 shadow-none sm:-mx-5 sm:px-5 lg:-mx-6 lg:px-6"
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

          <div className="grid gap-4 pr-10 lg:grid-cols-[0.72fr_1.6fr] lg:items-stretch">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--workspace-muted)]">
                Workspace
              </p>
              <h2 id="workspace-first-run-title" className="mt-1 text-[15px] font-semibold text-[var(--workspace-ink)]">
                Actions
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {hasClients ? (
                <>
                  <WorkspaceVisualCard
                    compact
                    visual="folderDropSquare"
                    title="Upload"
                    action={
                      <Button asChild variant="glossy" size="sm" className="w-full">
                        <Link href="/dashboard/client#upload-files" data-workspace-tour="upload">
                          <FolderUp className="size-4" />
                          Stack
                        </Link>
                      </Button>
                    }
                  />
                  <WorkspaceVisualCard
                    compact
                    visual="portalStack"
                    title="Clients"
                    action={
                      <AddCompanyDialog
                        workspaceId={workspaceId ?? undefined}
                        onCreated={onClientCreated}
                        trigger={
                          <Button variant="surface" size="sm" className="w-full" disabled={!workspaceId} data-workspace-tour="clients">
                            <Building2 className="size-4" />
                            Add
                          </Button>
                        }
                      />
                    }
                  />
                  <WorkspaceVisualCard
                    compact
                    visual="reviewLensWide"
                    title="Review"
                    action={
                      <Button asChild variant="surface" size="sm" className="w-full">
                        <Link href="/dashboard/guide">
                          <ListChecks className="size-4" />
                          Guide
                        </Link>
                      </Button>
                    }
                  />
                </>
              ) : (
                <>
                  <WorkspaceVisualCard
                    compact
                    visual="portalStack"
                    title="Clients"
                    action={
                      <AddCompanyDialog
                        workspaceId={workspaceId ?? undefined}
                        onCreated={onClientCreated}
                        trigger={
                          <Button variant="glossy" size="sm" className="w-full" disabled={!workspaceId} data-workspace-tour="clients">
                            <Building2 className="size-4" />
                            Add
                          </Button>
                        }
                      />
                    }
                  />
                  <WorkspaceVisualCard
                    compact
                    visual="folderDropSquare"
                    title="Upload"
                    action={
                      <Button asChild variant="surface" size="sm" className="w-full">
                        <Link href="/dashboard/client#upload-files" data-workspace-tour="upload">
                          <FolderUp className="size-4" />
                          Files
                        </Link>
                      </Button>
                    }
                  />
                  <WorkspaceVisualCard
                    compact
                    visual="reviewLensWide"
                    title="Review"
                    action={
                      <Button asChild variant="surface" size="sm" className="w-full">
                        <Link href="/dashboard/guide">
                          <ListChecks className="size-4" />
                          Guide
                        </Link>
                      </Button>
                    }
                  />
                </>
              )}
            </div>
          </div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  )
}
