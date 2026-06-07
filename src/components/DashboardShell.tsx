"use client"

import { ReactNode, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { ChevronLeft, Clock3, Loader2, Search } from "lucide-react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { WorkspaceSidebar, type WorkspaceSidebarItemKey } from "@/components/WorkspaceSidebar"
import { NotificationsBell } from "@/components/NotificationsBell"
import { HelpMenu } from "@/components/HelpMenu"
import { MobileNav } from "@/components/MobileNav"
import { CommandPalette } from "@/components/CommandPalette"
import { AccountMenu } from "@/components/AccountMenu"
import { useBillingStatus } from "@/hooks/useBillingStatus"
import { useProcessingState } from "@/contexts/ProcessingStateContext"
import { ocrApi, type RecoverableJobSummary } from "@/lib/api-client"
import { cn } from "@/lib/utils"

type DashboardItemKey = WorkspaceSidebarItemKey

type DashboardShellProps = {
  activeItem: DashboardItemKey
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
  if (plan === "mega" || plan === "enterprise") return "Max"
  return plan.charAt(0).toUpperCase() + plan.slice(1)
}

function getProgressLabel(job: RecoverableJobSummary | null, fallbackProgress: number) {
  if (job?.total_images) {
    return `${job.processed_images || 0}/${job.total_images}`
  }
  if (job?.percentage || fallbackProgress) {
    return `${Math.round(job?.percentage || fallbackProgress)}%`
  }
  return "active"
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
  const prefersReducedMotion = useReducedMotion()
  const [cmdOpen, setCmdOpen] = useState(false)
  const { state: processingState } = useProcessingState()
  const [recoverableJob, setRecoverableJob] = useState<RecoverableJobSummary | null>(null)
  const {
    billingStatus,
    credits,
    isLoading: billingLoading,
  } = useBillingStatus({
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
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCmdOpen(prev => !prev)
      }
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
        label: "Job running",
        href: "/dashboard/client",
        progress: getProgressLabel(null, processingState.progress),
        tone: "active" as const,
      }
    }

    if (processingState.processingComplete && processingState.processedFiles.length > 0) {
      return {
        label: "Results ready",
        href: "/dashboard/client",
        progress: `${processingState.processedFiles.length}`,
        tone: "ready" as const,
      }
    }

    if (recoverableJob) {
      return {
        label: recoverableJob.status === "queued" ? "Queued job" : "Resume job",
        href: "/dashboard/client",
        progress: getProgressLabel(recoverableJob, 0),
        tone: "active" as const,
      }
    }

    return null
  }, [processingState, recoverableJob])

  return (
    <div className="min-h-svh bg-white text-foreground">
      <WorkspaceSidebar activeItem={activeItem} user={user} />

      <div className="ax-dashboard-content relative z-10 min-w-0">
        <header className="sticky top-0 z-40 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="relative flex h-full items-center gap-3 px-4 sm:gap-4">
            {showBack && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => router.back()}
                  className="size-8"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Separator orientation="vertical" className="h-6" />
              </>
            )}

            {/* Mobile: page title only */}
            <div className="me-auto min-w-0 md:hidden">
              <div className="truncate text-[15px] font-semibold">{title}</div>
            </div>

            {/* CENTER (the bar's main element): global ⌘K search */}
            <div className="me-auto hidden min-w-0 flex-1 justify-center px-2 md:flex">
              <button
                onClick={() => setCmdOpen(true)}
                aria-label="Open command palette"
                className="ax-interactive group inline-flex h-10 w-full max-w-xl cursor-pointer items-center gap-2.5 rounded-md border-2 border-black bg-white px-4 text-sm font-semibold text-black transition-colors hover:bg-black hover:text-white"
              >
                <Search className="size-4 shrink-0 opacity-70" />
                <span className="truncate">Search companies, documents, batches...</span>
                <kbd className="ms-auto hidden shrink-0 rounded-md border border-border bg-background px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground sm:inline-flex">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* RIGHT: calm cluster — job pill, notifications, help, upgrade, account */}
            <div className="ms-auto flex min-w-0 items-center gap-3">
              {/* Mobile: compact ⌘K search trigger (full bar lives on md+) */}
              <button
                onClick={() => setCmdOpen(true)}
                aria-label="Open command palette"
                className="ax-interactive inline-flex size-9 cursor-pointer items-center justify-center rounded-md border-2 border-black bg-white text-black hover:bg-black hover:text-white md:hidden"
              >
                <Search className="size-4" />
              </button>

              {activeJob && (
                <Link
                  href={activeJob.href}
                  className={cn(
                    "ax-interactive hidden h-9 cursor-pointer items-center gap-2 rounded-md border-2 px-3 text-sm font-medium shadow-none sm:inline-flex",
                    activeJob.tone === "ready"
                      ? "border-black bg-white text-black hover:bg-black hover:text-white"
                      : "border-black bg-black text-white hover:bg-white hover:text-black hover:underline hover:decoration-1 hover:underline-offset-4"
                  )}
                >
                  {activeJob.tone === "ready" ? (
                    <Clock3 className="size-4" />
                  ) : (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  <span>{activeJob.label}</span>
                  <span className="text-xs opacity-75">{activeJob.progress}</span>
                </Link>
              )}

              <NotificationsBell />
              <HelpMenu />

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

        <main className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 pb-24", contentClassName)}>
          {(eyebrow || title) && (
            <div className="sr-only">
              {eyebrow && <span>{eyebrow}</span>}
              <h1>{title}</h1>
            </div>
          )}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              className="flex flex-1 flex-col min-h-0"
              initial={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 8, filter: "blur(2px)" }
              }
              animate={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : { opacity: 1, y: 0, filter: "blur(0px)" }
              }
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: -6, filter: "blur(1px)" }
              }
              transition={
                prefersReducedMotion
                  ? { duration: 0.1 }
                  : { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
              }
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <MobileNav isAuthenticated={true} user={user} />
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
    </div>
  )
}
