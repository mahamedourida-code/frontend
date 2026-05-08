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
    <div className="ax-page-bg min-h-screen lg:flex lg:gap-4 lg:p-4">
      <WorkspaceSidebar activeItem={activeItem} user={user} />

      <div className="relative z-10 min-w-0 flex-1">
        <header className="sticky top-0 z-40 px-3 pt-3 lg:static lg:px-0 lg:pt-0">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-[24px] border border-[#e3d7f5] bg-[#FFFEEC]/88 px-3 py-3 shadow-[0_18px_48px_rgba(68,31,132,0.10)] backdrop-blur-xl sm:px-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  {showBack && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.back()}
                      className="h-9 rounded-xl border border-[#eadfff] bg-white/55 px-3 text-[#5b3f92] hover:bg-white hover:text-[#2f165e]"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="min-w-0">
                    {eyebrow && (
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#6d579f]">
                        {eyebrow}
                      </p>
                    )}
                    <h1 className="truncate text-xl font-black tracking-tight text-black sm:text-2xl">
                      {title}
                    </h1>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                  {activeJob ? (
                    <Link
                      href={activeJob.href}
                      className={cn(
                        "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-bold shadow-[0_12px_30px_rgba(47,22,94,0.12)] transition hover:translate-y-[-1px]",
                        activeJob.tone === "ready"
                          ? "border-[#c7b9df] bg-white text-[#2f165e]"
                          : "border-[#2f165e] bg-[#2f165e] text-white"
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
                    <div className="inline-flex h-10 items-center gap-2 rounded-full border border-[#e5daf8] bg-white/60 px-4 text-sm font-bold text-[#5f5374]">
                      <span className="h-2 w-2 rounded-full bg-[#b8aacd]" />
                      No active job
                    </div>
                  )}

                  <div className="inline-flex h-10 items-center gap-2 rounded-full border border-[#eadfff] bg-white/70 px-4 text-sm font-bold text-black">
                    <BillingSeal className="h-5 w-5 text-[#2f165e]" />
                    <span>{billingLoading && !billingStatus ? "Plan" : formatPlan(plan)}</span>
                  </div>

                  <DashboardCreditsPill credits={availableCredits} />

                  <Button
                    asChild
                    className="h-10 rounded-full bg-[#2f165e] px-4 text-white shadow-[0_14px_32px_rgba(68,31,132,0.18)] hover:bg-[#24104b]"
                  >
                    <Link href={billingActionHref}>{billingActionLabel}</Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="h-10 rounded-full border-[#d9c9fb] bg-white/65 px-4 text-[#2f165e] hover:bg-white"
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
