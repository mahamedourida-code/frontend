"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BookCheck, FileSpreadsheet, LayoutDashboard, PlugZap, ReceiptText, Upload } from "lucide-react"
import { motion, useReducedMotion, type Variants } from "framer-motion"

import { DashboardShell } from "@/components/DashboardShell"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"

const workflow = [
  {
    title: "Upload a mixed stack",
    description: "Add invoices, receipts, statements, or scans together. AxLiner keeps the source documents grouped for review.",
    icon: Upload,
    accent: "bg-[#dbeafe] text-[#1877F2]",
  },
  {
    title: "Clear review exceptions",
    description: "Check flagged fields and rows first, then confirm the records that are ready for accounting output.",
    icon: BookCheck,
    accent: "bg-[#fef3c7] text-[#d97706]",
  },
  {
    title: "Export or publish drafts",
    description: "Download reviewed Excel or CSV files, or send approved invoice records to QuickBooks or Xero as draft bills.",
    icon: FileSpreadsheet,
    accent: "bg-[#dcfce7] text-[#16a34a]",
  },
]

const controls = [
  "Accounting publishing creates draft bills only. AxLiner does not pay or auto-approve them.",
  "Vendor memory can suggest coding defaults, but review remains part of the workflow.",
  "Use the Draft bills queue to check approval state before publishing accounting drafts.",
]

export default function GuidePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/sign-in?next=%2Fdashboard%2Fguide")
    }
  }, [authLoading, router, user])

  if (authLoading) {
    return <DashboardRouteLoader label="Loading guide" />
  }

  if (!user) {
    return null
  }

  const heroVariants: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  }

  return (
    <DashboardShell activeItem="guide" title="Guide" user={user} showBack={false}>
      <PageHeader
        title="Accountant guide"
        description="Run each document stack from intake to reviewed accounting output."
        actions={(
          <Button asChild variant="glossy">
            <Link href="/dashboard/client#upload-files">
              <Upload className="size-4" />
              Upload documents
            </Link>
          </Button>
        )}
      />

      <div className="max-w-5xl space-y-6">

        {/* Hero card — help center banner */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={heroVariants}
        >
          <Card className="overflow-hidden rounded-xl border border-[var(--workspace-border)] bg-[var(--workspace-soft)] py-0">
            <CardContent className="p-0">
              <div className="flex flex-col gap-0 md:flex-row">

                {/* Text side */}
                <div className="flex flex-1 flex-col justify-center gap-5 p-6 sm:p-8">
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--workspace-primary)]">
                      Learning center
                    </p>
                    <h2 className="text-2xl font-bold leading-tight text-[var(--workspace-ink)]">
                      Get the most out of AxLiner
                    </h2>
                    <p className="max-w-sm text-sm leading-6 text-[var(--workspace-ink)]">
                      Upload any mix of invoices, receipts, or statements. Review exceptions on the board, then publish clean draft bills straight to QuickBooks or Xero.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    <Button asChild variant="glossy" size="sm">
                      <Link href="/dashboard/client#upload-files">
                        <Upload className="size-4" />
                        Upload a stack
                      </Link>
                    </Button>
                    <Button asChild variant="surface" size="sm">
                      <Link href="/dashboard/client">
                        <LayoutDashboard className="size-4" />
                        Open review board
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Banner image side */}
                <div className="flex items-center justify-center bg-[#eaf4fb] p-6 md:w-[340px] md:shrink-0 md:p-8">
                  <img
                    src="/helpdoc-banner.png"
                    alt="AxLiner learning center illustration — an open book with browser cards, a chart, and a speech bubble joined by dashed lines"
                    width={300}
                    height={220}
                    className="h-auto w-full max-w-[300px] rounded-lg object-contain drop-shadow-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily stack workflow */}
        <Card className="gap-0 overflow-hidden rounded-xl py-0">
          <CardHeader className="border-b border-[var(--workspace-border)] p-5 sm:p-6">
            <CardTitle className="text-lg text-[var(--workspace-ink)]">Daily stack workflow</CardTitle>
            <CardDescription className="mt-1 leading-5 text-[var(--workspace-ink)]">
              Keep the routine simple: upload, review exceptions, then export or publish.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-0 p-0 md:grid-cols-3">
            {workflow.map((step, index) => {
              const Icon = step.icon
              return (
                <section
                  key={step.title}
                  className="border-b border-[var(--workspace-border)] p-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 sm:p-6"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className={`flex size-9 items-center justify-center rounded-full ${step.accent}`}>
                      <Icon className="size-4" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--workspace-primary)]">
                      Step {index + 1}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-[var(--workspace-ink)]">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--workspace-ink)]">{step.description}</p>
                </section>
              )
            })}
          </CardContent>
        </Card>

        {/* Accounting controls */}
        <Card className="gap-0 overflow-hidden rounded-xl py-0">
          <CardHeader className="border-b border-[var(--workspace-border)] p-5 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg text-[var(--workspace-ink)]">
              <ReceiptText className="size-5 text-[var(--workspace-primary)]" />
              Accounting controls
            </CardTitle>
            <CardDescription className="mt-1 leading-5 text-[var(--workspace-ink)]">
              Review stays explicit before anything reaches the accounting system.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 p-5 sm:p-6">
            <ul className="space-y-3">
              {controls.map((control) => (
                <li key={control} className="flex gap-3 text-sm leading-6 text-[var(--workspace-ink)]">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--workspace-primary)]" aria-hidden="true" />
                  <span>{control}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2 border-t border-[var(--workspace-border)] pt-5">
              <Button asChild variant="warm" size="sm">
                <Link href="/dashboard/client">Open review board</Link>
              </Button>
              <Button asChild variant="surface" size="sm">
                <Link href="/dashboard/accounts-payable">Open draft bills</Link>
              </Button>
              <Button asChild variant="surface" size="sm">
                <Link href="/dashboard/integrations">
                  <PlugZap className="size-4" />
                  Manage integration
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </DashboardShell>
  )
}
