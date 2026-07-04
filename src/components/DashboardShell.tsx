"use client"

import { ReactNode, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { ChevronLeft, Clock3, Keyboard, Loader2, Search, Upload } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { WorkspaceSidebar, type WorkspaceSidebarItemKey } from "@/components/WorkspaceSidebar"
import { NotificationsBell } from "@/components/NotificationsBell"
import { MobileNav } from "@/components/MobileNav"
import { CommandPalette } from "@/components/CommandPalette"
import { ShortcutCheatsheet } from "@/components/dashboard/ShortcutCheatsheet"
import { AccountMenu } from "@/components/AccountMenu"
import { OrgSwitcher } from "@/components/OrgSwitcher"
import { useBillingStatus } from "@/hooks/useBillingStatus"
import { useProcessingState } from "@/contexts/ProcessingStateContext"
import { ocrApi, type RecoverableJobSummary } from "@/lib/api-client"
import { useMotionTokens } from "@/lib/motion"
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
  if (plan === "mega" || plan === "enterprise") return "Enterprise"
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
  const m = useMotionTokens()
  const [cmdOpen, setCmdOpen] = useState(false)
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false)
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
    document.body.classList.add("ax-workspace")
    return () => document.body.classList.remove("ax-workspace")
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCmdOpen(prev => !prev)
        return
      }
      // "?" opens the shortcut cheatsheet — but never while typing.
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement | null
        const tag = target?.tagName
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable) return
        e.preventDefault()
        setCheatsheetOpen(prev => !prev)
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
        label: "Reading documents",
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
        label: recoverableJob.status === "queued" ? "Unfinished stack" : "Resume stack",
        href: "/dashboard/client",
        progress: getProgressLabel(recoverableJob, 0),
        tone: "active" as const,
      }
    }

    return null
  }, [processingState, recoverableJob])

  return (
    <div className="ax-page-bg min-h-svh text-foreground">
      <WorkspaceSidebar activeItem={activeItem} user={user} />

      <div className="ax-dashboard-content relative z-10 min-w-0">
        <motion.header
          initial={m.reduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
          animate={m.reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={m.reduced ? m.tFast : { duration: m.dur.base, ease: m.ease }}
          className="sticky top-0 z-40 h-16 border-b border-white/10 bg-[#213445] text-white shadow-[0_1px_0_rgba(255,255,255,0.05)] will-change-transform"
        >
          <div className="relative flex h-full items-center gap-3 px-3.5 sm:px-4 lg:px-5">
            {showBack && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                  className="size-9 text-black hover:bg-white/10 hover:text-black"
                >
                  <ChevronLeft className="size-[18px] text-black" />
                </Button>
                <Separator orientation="vertical" className="h-7 bg-white/12" />
              </>
            )}

            {/* LEFT: organisation switcher (desktop) — the org you're working in, always visible */}
            <OrgSwitcher user={user} />

            {/* Mobile: page title only */}
            <div className="me-auto min-w-0 md:hidden">
              <div className="truncate text-[15px] font-semibold">{title}</div>
            </div>

            {/* CENTER (the bar's main element): global ⌘K search */}
            <div className="me-auto hidden min-w-0 flex-1 justify-start px-2 md:flex lg:px-5">
              <button
                onClick={() => setCmdOpen(true)}
                aria-label="Open command palette"
                className="ax-interactive group inline-flex h-10 w-full max-w-[520px] cursor-pointer items-center gap-2.5 rounded-full border border-white/14 bg-white/[0.07] px-4 text-[15px] font-medium text-white/68 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:-translate-y-0.5 hover:border-white/28 hover:bg-white/[0.11] hover:text-white active:translate-y-0"
              >
                <Search className="size-[18px] shrink-0 text-black" />
                <span className="truncate">Search clients, documents, pages...</span>
                <kbd className="ms-auto hidden h-6 shrink-0 items-center rounded-full border border-white/12 bg-black/10 px-2 font-sans text-[11px] font-semibold text-white/56 sm:inline-flex">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* RIGHT: calm cluster — job pill, notifications, help, upgrade, account */}
            <div className="ms-auto flex min-w-0 items-center gap-2 sm:gap-2.5">
              {/* Mobile: compact ⌘K search trigger (full bar lives on md+) */}
              <button
                onClick={() => setCmdOpen(true)}
                aria-label="Open command palette"
                className="ax-interactive inline-flex size-10 cursor-pointer items-center justify-center rounded-full border border-white/14 bg-white/[0.07] text-black hover:-translate-y-0.5 hover:bg-white/12 active:translate-y-0 md:hidden"
              >
                <Search className="size-5 text-black" />
              </button>

              {activeJob && pathname !== "/dashboard/client" && (
                <Link
                  href={activeJob.href}
                  className={cn(
                    "ax-interactive hidden h-8 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 text-[12px] font-semibold shadow-none sm:inline-flex",
                    activeJob.tone === "ready"
                      ? "border-white/14 bg-white/[0.07] text-white/86 hover:border-white/24 hover:bg-white/12 hover:text-white"
                      : "border-white/14 bg-white/[0.07] text-white/86 hover:border-white/24 hover:bg-white/12 hover:text-white"
                  )}
                >
                  {activeJob.tone === "ready" ? (
                    <Clock3 className="size-3.5 text-black" />
                  ) : (
                    <Loader2 className="size-3.5 animate-spin text-black" />
                  )}
                  <span className="hidden max-w-[8.5rem] truncate lg:inline">{activeJob.label}</span>
                  <span className="tabular-nums opacity-75">{activeJob.progress}</span>
                </Link>
              )}

              <button
                type="button"
                aria-label="Upload"
                onClick={() => {
                  // On the review page, pop the upload sheet directly instead of
                  // doing a no-op navigation; elsewhere, route in with the hash
                  // so the page opens the sheet on arrival.
                  if (pathname === "/dashboard/client") {
                    window.dispatchEvent(new CustomEvent("axliner:open-upload"))
                    return
                  }
                  // Carry the client you're working in (a client hub) or your
                  // last-used one, so the batch isn't silently filed under the
                  // default client.
                  const hubMatch = pathname.match(/^\/dashboard\/companies\/([^/]+)/)
                  const companyId =
                    hubMatch?.[1] ||
                    (typeof window !== "undefined" ? window.localStorage.getItem("axliner:selectedCompanyId") || "" : "")
                  router.push(`/dashboard/client${companyId ? `?company_id=${encodeURIComponent(companyId)}` : ""}#upload-files`)
                }}
                className="ax-interactive relative inline-flex size-10 items-center justify-center rounded-full text-black outline-none transition-colors hover:bg-white/8 hover:text-black focus-visible:ring-2 focus-visible:ring-white/35"
              >
                <Upload className="size-5 text-black" />
              </button>

              <button
                type="button"
                aria-label="Keyboard shortcuts"
                title="Keyboard shortcuts"
                onClick={() => setCheatsheetOpen(true)}
                className="ax-interactive relative hidden size-10 items-center justify-center rounded-full text-black outline-none transition-colors hover:bg-white/8 hover:text-black focus-visible:ring-2 focus-visible:ring-white/35 sm:inline-flex"
              >
                <Keyboard className="size-5 text-black" />
              </button>

              <NotificationsBell />
              {!isPaid && (
                <Button asChild variant="lime" size="default" className="hidden h-10 px-5 sm:inline-flex">
                  <Link href="/pricing">Upgrade</Link>
                </Button>
              )}
              <AccountMenu
                user={user}
                planLabel={billingLoading && !billingStatus ? "Plan" : formatPlan(plan)}
                credits={availableCredits}
                billingLoading={billingLoading && !billingStatus}
              />

              {actions}
            </div>
          </div>
        </motion.header>

        <main className={cn("mx-auto min-h-[calc(100svh-4rem)] w-full max-w-[1400px] bg-white/[0.68] px-5 py-8 pb-24 sm:px-6 lg:px-9 xl:px-10", contentClassName)}>
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
              variants={m.route}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <MobileNav isAuthenticated={true} user={user} />
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
      <ShortcutCheatsheet open={cheatsheetOpen} onOpenChange={setCheatsheetOpen} />
    </div>
  )
}
