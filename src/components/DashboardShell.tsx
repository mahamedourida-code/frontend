"use client"

import { type ReactNode, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronLeft, Clock3, Loader2, Plus, Search, Upload } from "lucide-react"

import { AccountMenu } from "@/components/AccountMenu"
import { CommandPalette } from "@/components/CommandPalette"
import { ShortcutCheatsheet } from "@/components/dashboard/ShortcutCheatsheet"
import { MobileNav } from "@/components/MobileNav"
import { NotificationsBell } from "@/components/NotificationsBell"
import { OrgSwitcher } from "@/components/OrgSwitcher"
import { Button } from "@/components/ui/button"
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

const paidPlans = new Set(["pro", "max", "mega", "business", "enterprise"])

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
  const isPaid = paidPlans.has(plan)

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
        <header className="ax-workspace-header sticky top-0 z-40 h-14 border-b border-white/10 bg-[var(--workspace-topbar)] text-white [&_svg]:text-white">
          <div className="flex h-full min-w-0 items-center gap-2 px-3 sm:px-4 lg:px-5">
            {showBack ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                aria-label="Go back"
                className="size-9 text-white/80 hover:bg-white/10 hover:text-white [&_svg]:text-white"
              >
                <ChevronLeft className="size-[18px]" />
              </Button>
            ) : null}

            <OrgSwitcher user={user} />

            <div className="me-auto min-w-0 md:hidden">
              <p className="truncate text-[14px] font-semibold text-white">{title}</p>
            </div>

            <div className="me-auto hidden min-w-0 flex-1 px-1 md:flex lg:px-3">
              <button
                type="button"
                onClick={() => setCmdOpen(true)}
                aria-label="Open command palette"
                className="ax-interactive inline-flex h-9 w-full max-w-[440px] items-center gap-2 rounded-full border border-white/14 bg-white/[0.07] px-3.5 text-[13px] font-medium text-white/68 hover:border-white/28 hover:bg-white/[0.11] hover:text-white"
              >
                <Search className="size-4 shrink-0" />
                <span className="truncate">Find a client, batch, or action</span>
                <kbd className="ms-auto hidden h-5 shrink-0 items-center rounded border border-white/12 bg-black/10 px-1.5 font-sans text-[10px] font-semibold text-white/56 lg:inline-flex">
                  Ctrl K
                </kbd>
              </button>
            </div>

            <div className="ms-auto flex min-w-0 items-center gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={() => setCmdOpen(true)}
                aria-label="Search workspace"
                className="ax-interactive inline-flex size-9 items-center justify-center rounded-full text-white/84 hover:bg-white/10 hover:text-white md:hidden"
              >
                <Search className="size-[18px]" />
              </button>

              {activeJob && pathname !== "/dashboard/client" ? (
                <Link
                  href={activeJob.href}
                  className="ax-interactive hidden h-8 items-center gap-1.5 rounded-full border border-white/14 bg-white/[0.07] px-2.5 text-[11px] font-semibold text-white/86 hover:border-white/24 hover:bg-white/12 lg:inline-flex"
                >
                  {activeJob.ready ? <Clock3 className="size-3.5" /> : <Loader2 className="size-3.5 animate-spin" />}
                  <span className="max-w-28 truncate">{activeJob.label}</span>
                  <span className="tabular-nums text-white/60">{activeJob.progress}</span>
                </Link>
              ) : null}

              <Button
                type="button"
                variant="glossy"
                size="sm"
                onClick={startBatch}
                aria-label="Start a new batch"
                className="h-9 px-3 text-[12px] font-semibold max-sm:size-9 max-sm:px-0 [&_svg]:text-[var(--brand-green-fg)]"
              >
                <Plus className="hidden size-4 sm:block" />
                <Upload className="size-4 sm:hidden" />
                <span className="hidden sm:inline">New batch</span>
              </Button>

              <NotificationsBell />

              {!isPaid ? (
                <Button asChild variant="lime" size="sm" className="hidden h-9 px-4 xl:inline-flex">
                  <Link href="/pricing">Upgrade</Link>
                </Button>
              ) : null}

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
