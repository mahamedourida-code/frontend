"use client"

import { type ReactNode, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronLeft, Clock3, Loader2, Search, Upload } from "lucide-react"

import { AccountMenu } from "@/components/AccountMenu"
import { CommandPalette } from "@/components/CommandPalette"
import { ShortcutCheatsheet } from "@/components/dashboard/ShortcutCheatsheet"
import { MobileNav } from "@/components/MobileNav"
import { NotificationsBell } from "@/components/NotificationsBell"
import { OrgSwitcher } from "@/components/OrgSwitcher"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { WorkspaceSidebar, type WorkspaceSidebarItemKey } from "@/components/WorkspaceSidebar"
import { useProcessingState } from "@/contexts/ProcessingStateContext"
import { useBillingStatus } from "@/hooks/useBillingStatus"
import { ocrApi, type RecoverableJobSummary } from "@/lib/api-client"
import { cn } from "@/lib/utils"

type DashboardShellProps = {
  activeItem: WorkspaceSidebarItemKey
  title: string
  eyebrow?: string
  user?: any
  children: ReactNode
  actions?: ReactNode
  contentClassName?: string
  showBack?: boolean
}

function formatPlan(plan?: string | null) {
  if (!plan) return "Free"
  if (plan === "pro") return "Standard"
  if (plan === "max" || plan === "business") return "Pro"
  if (plan === "mega" || plan === "enterprise") return "Enterprise"
  return plan.charAt(0).toUpperCase() + plan.slice(1)
}

function getProgressLabel(job: RecoverableJobSummary | null, fallbackProgress: number) {
  if (job?.total_images) return `${job.processed_images || 0}/${job.total_images}`
  if (job?.percentage || fallbackProgress) return `${Math.round(job?.percentage || fallbackProgress)}%`
  return "Active"
}

export function DashboardShell({
  activeItem,
  title,
  eyebrow,
  user,
  children,
  actions,
  contentClassName,
  showBack = true,
}: DashboardShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [cmdOpen, setCmdOpen] = useState(false)
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false)
  const { state: processingState } = useProcessingState()
  const [recoverableJob, setRecoverableJob] = useState<RecoverableJobSummary | null>(null)
  const { billingStatus, credits, isLoading: billingLoading } = useBillingStatus({
    enabled: Boolean(user),
    loadStatus: true,
    loadLimits: true,
  })

  useEffect(() => {
    if (!user) return

    let mounted = true
    ocrApi.getLatestRecoverableJob()
      .then((data) => {
        if (!mounted) return
        const job = data.job
        setRecoverableJob(job?.active ? job : null)
      })
      .catch(() => undefined)

    return () => {
      mounted = false
    }
  }, [user?.id])

  useEffect(() => {
    document.body.classList.add("ax-workspace")
    return () => document.body.classList.remove("ax-workspace")
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault()
        setCmdOpen((open) => !open)
        return
      }

      if (event.key !== "?" || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName || "") || target?.isContentEditable) return
      event.preventDefault()
      setCheatsheetOpen((open) => !open)
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const availableCredits = credits?.available_credits ?? billingStatus?.credits?.available_credits ?? null
  const plan = billingStatus?.plan || "free"

  const activeJob = useMemo(() => {
    if (processingState.status === "processing") {
      return {
        label: "Reading batch",
        href: "/dashboard/client",
        progress: getProgressLabel(null, processingState.progress),
        ready: false,
      }
    }

    if (processingState.processingComplete && processingState.processedFiles.length > 0) {
      return {
        label: "Batch ready",
        href: "/dashboard/client",
        progress: `${processingState.processedFiles.length}`,
        ready: true,
      }
    }

    if (recoverableJob) {
      return {
        label: recoverableJob.status === "queued" ? "Queued batch" : "Resume batch",
        href: "/dashboard/client",
        progress: getProgressLabel(recoverableJob, 0),
        ready: false,
      }
    }

    return null
  }, [processingState, recoverableJob])

  const startBatch = () => {
    if (pathname === "/dashboard/client") {
      window.dispatchEvent(new CustomEvent("axliner:open-upload"))
      return
    }

    const hubMatch = pathname.match(/^\/dashboard\/companies\/([^/]+)/)
    const companyId = hubMatch?.[1] || window.localStorage.getItem("axliner:selectedCompanyId") || ""
    router.push(`/dashboard/client${companyId ? `?company_id=${encodeURIComponent(companyId)}` : ""}#upload-files`)
  }

  return (
    <div className="ax-page-bg min-h-dvh text-foreground">
      <WorkspaceSidebar activeItem={activeItem} user={user} />

      <div className="ax-dashboard-content relative z-10 min-w-0">
        <header className="ax-workspace-header sticky top-0 z-40 h-14 border-b border-[var(--workspace-topbar-border)] bg-[var(--workspace-topbar)] text-white [&_svg]:text-white">
          <div className="flex h-full min-w-0 items-center gap-2 px-3 sm:px-4 lg:px-5">
            {showBack ? (
              <Tooltip delayDuration={350}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    aria-label="Go back"
                    className="size-9 border-transparent bg-transparent text-white/80 hover:border-transparent hover:bg-white/10 hover:text-white [&_svg]:text-white"
                  >
                    <ChevronLeft className="size-[18px]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={8}>Back</TooltipContent>
              </Tooltip>
            ) : null}

            <OrgSwitcher user={user} />

            <div className="me-auto min-w-0">
              <p className="truncate text-[14px] font-semibold text-white">{title}</p>
            </div>

            <div className="ms-auto flex min-w-0 items-center gap-1 sm:gap-1.5">
              <Tooltip delayDuration={350}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setCmdOpen(true)}
                    aria-label="Search workspace"
                    className="ax-interactive inline-flex size-9 items-center justify-center rounded-md text-white/84 hover:bg-white/10 hover:text-white"
                  >
                    <Search className="size-[18px]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={8}>Search (Ctrl K)</TooltipContent>
              </Tooltip>

              {activeJob && pathname !== "/dashboard/client" ? (
                <Tooltip delayDuration={350}>
                  <TooltipTrigger asChild>
                    <Link
                      href={activeJob.href}
                      aria-label={`${activeJob.label}, ${activeJob.progress}`}
                      className="ax-interactive relative hidden size-9 items-center justify-center rounded-md text-white/84 hover:bg-white/10 hover:text-white lg:inline-flex"
                    >
                      {activeJob.ready ? <Clock3 className="size-[17px]" /> : <Loader2 className="size-[17px] animate-spin" />}
                      <span
                        aria-hidden="true"
                        className="absolute right-1 top-1 size-1.5 rounded-full bg-[var(--workspace-indicator)] ring-2 ring-[var(--workspace-topbar)]"
                      />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={8}>
                    {activeJob.label}: {activeJob.progress}
                  </TooltipContent>
                </Tooltip>
              ) : null}

              <Button
                type="button"
                variant="glossy"
                size="sm"
                onClick={startBatch}
                data-workspace-tour="upload"
                aria-label="Upload source documents"
                className="hidden h-9 px-3.5 text-[13px] font-semibold sm:inline-flex [&_svg]:text-white"
              >
                <Upload className="size-4" />
                <span>Upload</span>
              </Button>

              <NotificationsBell />

              <AccountMenu
                user={user}
                planLabel={billingLoading && !billingStatus ? "Plan" : formatPlan(plan)}
                credits={availableCredits}
                billingLoading={billingLoading && !billingStatus}
              />
              {actions}
            </div>
          </div>
        </header>

        <main
          className={cn(
            "mx-auto min-h-[calc(100dvh-3.5rem)] w-full max-w-[1480px] px-4 py-5 pb-20 sm:px-5 sm:py-6 lg:px-7 xl:px-8",
            contentClassName,
          )}
        >
          {eyebrow || title ? (
            <div className="sr-only">
              {eyebrow ? <span>{eyebrow}</span> : null}
              <h1>{title}</h1>
            </div>
          ) : null}
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </main>
      </div>

      <MobileNav isAuthenticated user={user} />
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
      <ShortcutCheatsheet open={cheatsheetOpen} onOpenChange={setCheatsheetOpen} />
    </div>
  )
}
