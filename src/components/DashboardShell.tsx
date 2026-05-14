"use client"

import { ReactNode, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, ChevronLeft, Clock3, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WorkspaceSidebar } from "@/components/WorkspaceSidebar"
import { MobileNav } from "@/components/MobileNav"
import { DashboardCreditsPill } from "@/components/DashboardCreditsPill"
import { BillingSeal } from "@/components/BillingGlyphs"
import { useBillingStatus } from "@/hooks/useBillingStatus"
import { useProcessingState } from "@/contexts/ProcessingStateContext"
import { ocrApi, type RecoverableJobSummary } from "@/lib/api-client"
import { cn } from "@/lib/utils"

type DashboardItemKey = "overview" | "process" | "history" | "pricing" | "settings"

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
  const nextActionLabel = activeItem === "process" ? "History" : "Process Images"

  return (
    <div className="min-h-screen bg-[#f7faf7] text-[#111827] lg:flex lg:gap-4 lg:p-4">
      <WorkspaceSidebar activeItem={activeItem} user={user} />

      <div className="relative z-10 min-w-0 flex-1">
        <header className="sticky top-0 z-40 px-3 pt-3 lg:static lg:px-0 lg:pt-0">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-2xl border border-[#dfe8df] bg-white px-3 py-3 shadow-sm sm:px-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  {showBack && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.back()}
                      className="h-9 rounded-lg border border-[#dfe8df] bg-[#f7faf7] px-3 text-[#166534] hover:bg-white hover:text-[#14532d]"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="min-w-0">
                    {eyebrow && (
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#15803d]">
                        {eyebrow}
                      </p>
                    )}
                    <h1 className="truncate text-xl font-semibold tracking-tight text-[#111827] sm:text-2xl">
                      {title}
                    </h1>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                  {activeJob ? (
                    <Link
                      href={activeJob.href}
                      className={cn(
                        "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium shadow-sm transition hover:translate-y-[-1px]",
                        activeJob.tone === "ready"
                          ? "border-[#dfe8df] bg-white text-[#166534]"
                          : "border-[#166534] bg-[#166534] text-white"
                      )}
                    >
                      {activeJob.tone === "ready" ? (
                        <Clock3 className="h-4 w-4" />
                      ) : (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      <span>{activeJob.label}</span>
                      <span className="rounded-full bg-white/16 px-2 py-0.5 text-xs">{activeJob.progress}</span>
                    </Link>
                  ) : (
                    <div className="inline-flex h-10 items-center gap-2 rounded-full border border-[#dfe8df] bg-white px-4 text-sm font-medium text-[#667085] shadow-sm">
                      <span className="h-2 w-2 rounded-full bg-[#98a2b3]" />
                      No active job
                    </div>
                  )}

                  <div className="inline-flex h-10 items-center gap-2 rounded-full border border-[#dfe8df] bg-white px-4 text-sm font-medium text-[#111827] shadow-sm">
                    <BillingSeal className="h-5 w-5 text-[#166534]" />
                    <span>{billingLoading && !billingStatus ? "Plan" : formatPlan(plan)}</span>
                  </div>

                  <DashboardCreditsPill credits={availableCredits} />

                  <Button
                    asChild
                    className="h-10 rounded-full bg-[#166534] px-4 text-white shadow-sm hover:bg-[#14532d]"
                  >
                    <Link href={billingActionHref}>{billingActionLabel}</Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="h-10 rounded-full border-[#dfe8df] bg-white px-4 text-[#166534] shadow-sm hover:bg-[#f7faf7]"
                  >
                    <Link href={nextActionHref}>
                      {nextActionLabel}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>

                  {actions}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className={cn("mx-auto max-w-7xl px-3 py-4 pb-24 sm:px-4 lg:px-4 lg:py-6", contentClassName)}>
          {children}
        </main>
      </div>

      <MobileNav isAuthenticated={true} user={user} />
    </div>
  )
}
