"use client"

import { ReactNode, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, ChevronLeft, Clock3, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { WorkspaceSidebar } from "@/components/WorkspaceSidebar"
import { MobileNav } from "@/components/MobileNav"
import { DashboardCreditsPill } from "@/components/DashboardCreditsPill"
import { BillingSeal } from "@/components/BillingGlyphs"
import { ThemeToggle } from "@/components/theme-toggle"
import { useBillingStatus } from "@/hooks/useBillingStatus"
import { useProcessingState } from "@/contexts/ProcessingStateContext"
import { ocrApi, type RecoverableJobSummary } from "@/lib/api-client"
import { cn } from "@/lib/utils"

type DashboardItemKey = "overview" | "process" | "workflows" | "history" | "pricing" | "settings"

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

  const availableCredits = credits?.available_credits ?? billingStatus?.credits?.available_credits ?? null
  const plan = billingStatus?.plan || "free"
  const isPaid = paidPlans.has(plan)
  const billingActionHref = isPaid ? "/dashboard/settings?section=billing" : "/pricing"
  const billingActionLabel = isPaid ? "Manage billing" : "Upgrade"

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
  const topNav = [
    { label: "Overview", href: "/dashboard", active: activeItem === "overview" },
    { label: "Convert Files", href: "/dashboard/client", active: activeItem === "process" },
    { label: "Workflows", href: "/dashboard/workflows", active: activeItem === "workflows" },
    { label: "Plans", href: "/pricing", active: activeItem === "pricing" },
  ]

  return (
    <div className="min-h-svh bg-background text-foreground md:grid md:grid-cols-[16rem_minmax(0,1fr)]">
      <WorkspaceSidebar activeItem={activeItem} user={user} />

      <div className="relative z-10 min-w-0 md:col-start-2">
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

            <nav className="hidden items-center gap-1 md:flex">
              {topNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    item.active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="me-auto min-w-0 md:hidden">
              <div className="truncate text-sm font-medium">{title}</div>
            </div>

            <div className="ms-auto flex min-w-0 items-center gap-2">
              {activeJob && (
                <Link
                  href={activeJob.href}
                  className={cn(
                    "hidden h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors sm:inline-flex",
                    activeJob.tone === "ready"
                      ? "border-border bg-background text-foreground hover:bg-accent"
                      : "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
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

              <div className="hidden h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium sm:inline-flex">
                <BillingSeal className="size-4 text-primary" />
                <span>{billingLoading && !billingStatus ? "Plan" : formatPlan(plan)}</span>
              </div>

              <DashboardCreditsPill credits={availableCredits} className="hidden sm:inline-flex" />
              <ThemeToggle />

              <Button asChild size="sm" variant={isPaid ? "outline" : "default"}>
                <Link href={billingActionHref}>{billingActionLabel}</Link>
              </Button>

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

        <main className={cn("mx-auto w-full max-w-7xl px-4 py-6 pb-24", contentClassName)}>
          {(eyebrow || title) && (
            <div className="sr-only">
              {eyebrow && <span>{eyebrow}</span>}
              <h1>{title}</h1>
            </div>
          )}
          {children}
        </main>
      </div>

      <MobileNav isAuthenticated={true} user={user} />
    </div>
  )
}
