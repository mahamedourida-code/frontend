"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  FolderUp,
  ListChecks,
  Play,
  type LucideIcon,
} from "lucide-react"

import { DashboardShell } from "@/components/DashboardShell"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { useMotionTokens } from "@/lib/motion"
import { cn } from "@/lib/utils"

const guideSteps = [
  {
    id: "client",
    label: "Client",
    title: "Add a client",
    description: "Keep each batch under the right business.",
    action: "Open clients",
    href: "/dashboard#clients",
    icon: Building2,
  },
  {
    id: "upload",
    label: "Upload",
    title: "Upload a batch",
    description: "Invoices, receipts, and bank statements.",
    action: "Upload files",
    href: "/dashboard/client#upload-files",
    icon: FolderUp,
  },
  {
    id: "review",
    label: "Review",
    title: "Clear exceptions",
    description: "Check flagged fields before export or publish.",
    action: "Open review",
    href: "/dashboard/client",
    icon: ListChecks,
  },
  {
    id: "publish",
    label: "QuickBooks or Xero",
    title: "Publish drafts",
    description: "Send reviewed draft bills to QuickBooks or Xero.",
    action: "Open draft bills",
    href: "/dashboard/accounts-payable",
    icon: BookOpenCheck,
  },
] satisfies Array<{
  id: string
  label: string
  title: string
  description: string
  action: string
  href: string
  icon: LucideIcon
}>

export default function GuidePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const m = useMotionTokens()
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const activeStep = guideSteps[activeStepIndex]

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/sign-in?next=%2Fdashboard%2Fguide")
    }
  }, [authLoading, router, user])

  const moveToStep = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % guideSteps.length
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + guideSteps.length) % guideSteps.length
    } else if (event.key === "Home") {
      nextIndex = 0
    } else if (event.key === "End") {
      nextIndex = guideSteps.length - 1
    }

    if (nextIndex === null) return

    event.preventDefault()
    setActiveStepIndex(nextIndex)
    tabRefs.current[nextIndex]?.focus()
  }

  if (authLoading) {
    return <DashboardRouteLoader label="Loading getting started" />
  }

  if (!user) {
    return null
  }

  const ActiveIcon = activeStep.icon

  return (
    <DashboardShell activeItem="guide" title="Start here" user={user} showBack={false}>
      <PageHeader
        title="Start here"
        description="Client to reviewed draft."
        compact
        actions={
          <Button asChild variant="surface" size="icon" aria-label="Start workspace tour" title="Start workspace tour">
            <Link href="/dashboard?tour=start">
              <Play className="size-4" />
            </Link>
          </Button>
        }
      />

      <div className="max-w-5xl pb-10">
        <section
          aria-labelledby="guide-flow-title"
          className="overflow-hidden rounded-lg border border-[var(--workspace-border)] bg-card"
        >
          <h2 id="guide-flow-title" className="sr-only">
            Accounting setup flow
          </h2>

          <div
            role="tablist"
            aria-label="Getting started steps"
            className="grid grid-cols-2 gap-1 border-b border-[var(--workspace-border)] bg-[color-mix(in_srgb,var(--workspace-soft)_55%,white)] p-1.5 lg:grid-cols-4"
          >
            {guideSteps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === activeStepIndex

              return (
                <motion.button
                  key={step.id}
                  ref={(node) => {
                    tabRefs.current[index] = node
                  }}
                  id={`guide-step-${step.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="guide-step-panel"
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveStepIndex(index)}
                  onKeyDown={(event) => moveToStep(event, index)}
                  whileTap={m.reduced ? undefined : { scale: 0.985 }}
                  transition={m.tPress}
                  className={cn(
                    "relative isolate flex min-h-11 min-w-0 items-center gap-2 rounded-md px-3 py-2 text-left outline-none transition-colors duration-[160ms] focus-visible:ring-2 focus-visible:ring-[var(--workspace-primary)] focus-visible:ring-offset-1",
                    isActive ? "text-white" : "text-[var(--workspace-muted)] hover:bg-card hover:text-[var(--workspace-ink)]",
                  )}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="guide-active-step"
                      className="absolute inset-0 -z-10 rounded-md bg-[var(--workspace-primary)]"
                      transition={m.tFast}
                    />
                  ) : null}
                  <Icon className={cn("size-4 shrink-0", isActive && "ax-on-blue-icon")} />
                  <span className="min-w-0 text-[12px] font-medium leading-4 sm:text-[13px]">
                    {step.label}
                  </span>
                </motion.button>
              )
            })}
          </div>

          <div className="min-h-[190px]">
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={activeStep.id}
                id="guide-step-panel"
                role="tabpanel"
                aria-labelledby={`guide-step-${activeStep.id}`}
                initial={m.reduced ? { opacity: 0 } : { opacity: 0, y: 7 }}
                animate={{ opacity: 1, y: 0 }}
                exit={m.reduced ? { opacity: 0 } : { opacity: 0, y: -5 }}
                transition={m.tFast}
                className="grid min-h-[190px] items-center gap-5 p-5 sm:grid-cols-[64px_minmax(0,1fr)_auto] sm:p-6"
              >
                <span className="flex size-14 items-center justify-center rounded-full border border-[var(--workspace-selection-border)] bg-[var(--workspace-blue-soft)] text-[var(--workspace-primary)] sm:size-16">
                  <ActiveIcon className="ax-blue-icon size-6 sm:size-7" />
                </span>

                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase text-[var(--workspace-muted)]">
                    {String(activeStepIndex + 1).padStart(2, "0")} / {String(guideSteps.length).padStart(2, "0")}
                  </p>
                  <h3 className="mt-1 text-[21px] font-semibold text-[var(--workspace-ink)]">
                    {activeStep.title}
                  </h3>
                  <p className="mt-1 max-w-[42ch] text-[13px] leading-5 text-[var(--workspace-muted)]">
                    {activeStep.description}
                  </p>
                </div>

                <Button
                  asChild
                  variant="glossy"
                  className="w-full sm:w-auto"
                >
                  <Link href={activeStep.href}>
                    {activeStep.action}
                    <ArrowRight className="ax-on-blue-icon size-4" />
                  </Link>
                </Button>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </div>
    </DashboardShell>
  )
}
