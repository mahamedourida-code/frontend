"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import {
  Building2,
  FolderUp,
  ListChecks,
  X,
} from "lucide-react"

import { AddCompanyDialog } from "@/components/dashboard/companies/AddCompanyDialog"
import { Button } from "@/components/ui/button"
import { useMotionTokens } from "@/lib/motion"
import { cn } from "@/lib/utils"

type WorkspaceFirstRunGuideProps = {
  userId?: string | null
  workspaceId?: string | null
  hasClients: boolean
  onClientCreated: () => void
}

function guideStorageKey(userId: string, workspaceId: string) {
  return `axliner:first-run-guide:${userId}:${workspaceId}`
}

function WorkspaceActionCard({
  icon,
  title,
  action,
}: {
  icon: ReactNode
  title: string
  action: ReactNode
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-lg bg-white px-3 py-3 shadow-[0_14px_34px_-30px_rgba(15,23,42,0.42)]">
      <span className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--workspace-soft)] text-black ring-1 ring-inset ring-[color-mix(in_srgb,var(--workspace-border)_58%,transparent)]",
        "[&_svg]:size-5 [&_svg]:text-black",
      )}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[14px] font-semibold tracking-normal text-foreground">{title}</h3>
        <div className="mt-2">{action}</div>
      </div>
    </div>
  )
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
              <p className="text-[11px] font-semibold uppercase tracking-normal text-[var(--workspace-muted)]">
                Workspace
              </p>
              <h2 id="workspace-first-run-title" className="mt-1 text-[15px] font-semibold text-[var(--workspace-ink)]">
                Actions
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {hasClients ? (
                <>
                  <WorkspaceActionCard
                    icon={<FolderUp />}
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
                  <WorkspaceActionCard
                    icon={<Building2 />}
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
                  <WorkspaceActionCard
                    icon={<ListChecks />}
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
                  <WorkspaceActionCard
                    icon={<Building2 />}
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
                  <WorkspaceActionCard
                    icon={<FolderUp />}
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
                  <WorkspaceActionCard
                    icon={<ListChecks />}
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
