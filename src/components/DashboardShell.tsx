"use client"

import { ReactNode, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { ArrowRight, ChevronLeft, ChevronRight, Clock3, Loader2, Search } from "lucide-react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { WorkspaceSidebar } from "@/components/WorkspaceSidebar"
import { GlobalTopicMenus } from "@/components/GlobalTopicMenus"
import { NotificationsBell } from "@/components/NotificationsBell"
import { HelpMenu } from "@/components/HelpMenu"
import { MobileNav } from "@/components/MobileNav"
import { CommandPalette } from "@/components/CommandPalette"
import { DashboardCreditsPill } from "@/components/DashboardCreditsPill"
import { BillingSeal } from "@/components/BillingGlyphs"
import { ThemeToggle } from "@/components/theme-toggle"
import { useBillingStatus } from "@/hooks/useBillingStatus"
import { useProcessingState } from "@/contexts/ProcessingStateContext"
import { ocrApi, type RecoverableJobSummary } from "@/lib/api-client"
import { cn } from "@/lib/utils"

type DashboardItemKey = "overview" | "process" | "inbox" | "accounts_payable" | "integrations" | "history" | "pricing" | "settings"

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

  const nextActionHref = activeItem === "process" ? "/history" : "/dashboard/client"
  const nextActionLabel = activeItem === "process" ? "History" : "Convert Files"

  const breadcrumb = useMemo(() => {
    const PAGE_LABELS: Record<string, string> = {
      "": "Overview",
      client: "Convert Files",
      inbox: "Inbox",
      "accounts-payable": "Accounts Payable",
      integrations: "Integrations",
      settings: "Settings",
      "auto-detect": "Auto Detect",
      "bank-statements": "Bank Statements",
      invoices: "Invoices",
      receipts: "Receipts",
      notes: "Notes",
      workflows: "Workflows",
      "upload-type": "Upload",
    }
    if (pathname.startsWith("/dashboard")) {
      const slug = pathname.split("/")[2] || ""
      return { parent: "Dashboard", current: PAGE_LABELS[slug] || title }
    }
    return { parent: null, current: title }
  }, [pathname, title])

  return (
    <div className="ax-page-bg min-h-svh text-foreground">
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

            {/* Desktop LEFT: breadcrumb — "where in my workspace" */}
            <div className="hidden min-w-0 items-center md:flex">
              <div className="flex items-center gap-1.5 text-[15px]">
                {breadcrumb.parent && (
                  <>
                    <span className="text-muted-foreground">{breadcrumb.parent}</span>
                    <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" />
                  </>
                )}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={pathname}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="font-semibold text-foreground"
                  >
                    {breadcrumb.current}
                  </motion.span>
                </AnimatePresence>
              </div>

              {/* ── B2: global topic mega-menus ──────────────────────────────
                  Automations · Insights · Connections — compact grouped panels
                  of shortcuts into existing routes (not new features). Sits
                  right after the breadcrumb so it reads as global shortcuts,
                  not workspace nav. */}
              <nav aria-label="Global topics" className="ms-3 hidden items-center lg:flex">
                <GlobalTopicMenus />
              </nav>
            </div>

            {/* CENTER: global ⌘K search — "find anything, anywhere" */}
            <div className="ms-auto me-auto hidden min-w-0 flex-1 justify-center px-2 md:flex lg:max-w-sm">
              <button
                onClick={() => setCmdOpen(true)}
                aria-label="Open command palette"
                className="ax-interactive group inline-flex h-9 w-full max-w-xs items-center gap-2 rounded-full border border-border bg-muted/40 px-3.5 text-sm text-muted-foreground transition-colors hover:border-border hover:bg-muted/70 hover:text-foreground"
              >
                <Search className="size-4 shrink-0 opacity-70" />
                <span className="truncate">Search…</span>
                <kbd className="ms-auto hidden shrink-0 rounded-md border border-border bg-background px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground sm:inline-flex">
                  ⌘K
                </kbd>
              </button>
            </div>

            <div className="ms-auto flex min-w-0 items-center gap-2">
              {/* Mobile: compact ⌘K search trigger (full bar lives on md+) */}
              <button
                onClick={() => setCmdOpen(true)}
                aria-label="Open command palette"
                className="ax-interactive inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground md:hidden"
              >
                <Search className="size-4" />
              </button>

              {/* ── B3 MOUNT POINT: notifications bell + panel ──────────────
                  Drop the bell trigger (with unread badge) + dropdown here.
                  Keep it a single rounded-full icon button to match the cluster. */}
              <NotificationsBell />

              {/* ── B4 MOUNT POINT: help & "what's new" menu ────────────────
                  Drop the "?" menu trigger + dropdown here (shortcuts, docs,
                  contact, changelog dot). Single rounded-full icon button. */}
              <HelpMenu />

              {activeJob && (
                <Link
                  href={activeJob.href}
                  className={cn(
                    "ax-interactive hidden h-9 items-center gap-2 rounded-full border px-3 text-sm font-medium sm:inline-flex",
                    activeJob.tone === "ready"
                      ? "border-border bg-background text-foreground hover:bg-accent"
                      : "border-foreground bg-foreground text-background hover:bg-foreground/88"
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

              <div className="hidden h-9 items-center gap-2 rounded-full border border-border bg-card px-3.5 text-sm font-semibold text-foreground sm:inline-flex">
                <BillingSeal className="size-4 text-foreground" />
                <span>{billingLoading && !billingStatus ? "Plan" : formatPlan(plan)}</span>
              </div>

              <DashboardCreditsPill credits={availableCredits} className="hidden sm:inline-flex" />
              <ThemeToggle />

              {isPaid ? (
                <Button asChild size="sm" variant="outline">
                  <Link href="/dashboard/settings?section=billing">Manage billing</Link>
                </Button>
              ) : (
                <Button asChild variant="lime" className="h-9 px-5 text-[13px] font-bold">
                  <Link href="/pricing">Upgrade</Link>
                </Button>
              )}

              <Button asChild size="sm" variant="outline" className="hidden lg:inline-flex">
                <Link href={nextActionHref}>
                  {nextActionLabel}
                  <ArrowRight className="ms-2 size-4" />
                </Link>
              </Button>

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
