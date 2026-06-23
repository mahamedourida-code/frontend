"use client"

import { useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Building2,
  FileCheck2,
  FileSpreadsheet,
  FolderUp,
  PlugZap,
  ScanSearch,
} from "lucide-react"

import { DashboardShell } from "@/components/DashboardShell"
import { AxLinerWorkflowDiagram } from "@/components/dashboard/AxLinerWorkflowDiagram"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

const firstTasks = [
  {
    title: "Add a client workspace",
    description: "Keep each client's source files, review history, and outputs together.",
    href: "/dashboard/clients",
    action: "View clients",
    icon: Building2,
  },
  {
    title: "Upload a mixed batch",
    description: "Add invoices, receipts, statements, PDFs, scans, or phone photos in one go.",
    href: "/dashboard/client#upload-files",
    action: "Upload files",
    icon: FolderUp,
  },
  {
    title: "Review flagged exceptions",
    description: "Correct uncertain fields and rows on the Batch Review Board before output.",
    href: "/dashboard/client",
    action: "Open review",
    icon: ScanSearch,
  },
  {
    title: "Choose where reviewed work goes",
    description: "Export Excel or CSV, or connect QuickBooks or Xero for reviewed draft bills.",
    href: "/dashboard/integrations",
    action: "Choose output",
    icon: PlugZap,
  },
]

const nextActions = [
  {
    title: "Upload documents",
    description: "Start a batch with mixed file types and let AxLiner classify each document.",
    href: "/dashboard/client#upload-files",
    action: "Upload a batch",
    icon: FolderUp,
    iconClassName: "bg-[#e8f2ff] text-[#1877f2]",
  },
  {
    title: "Review exceptions",
    description: "Work through flagged fields first, then confirm the records that are ready.",
    href: "/dashboard/client",
    action: "Open review board",
    icon: FileCheck2,
    iconClassName: "bg-[#fff4d8] text-[#a86500]",
  },
  {
    title: "Export reviewed files",
    description: "Download the reviewed batch as Excel or CSV for the next accounting step.",
    href: "/dashboard/batches",
    action: "View batches",
    icon: FileSpreadsheet,
    iconClassName: "bg-[#eaf8ef] text-[#168349]",
  },
  {
    title: "Connect accounting",
    description: "Publish reviewed draft bills to QuickBooks or Xero. AxLiner never pays or auto-approves them.",
    href: "/dashboard/integrations",
    action: "Manage connections",
    icon: PlugZap,
    iconClassName: "bg-[#f1edff] text-[#6d4bd1]",
  },
]

export default function GuidePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/sign-in?next=%2Fdashboard%2Fguide")
    }
  }, [authLoading, router, user])

  if (authLoading) {
    return <DashboardRouteLoader label="Loading getting started" />
  }

  if (!user) {
    return null
  }

  return (
    <DashboardShell activeItem="guide" title="Getting started" user={user} showBack={false}>
      <PageHeader
        title="Getting started"
        description="Set up the path from a folder of source documents to reviewed accounting output."
        actions={(
          <Button asChild variant="glossy">
            <Link href="/dashboard/client#upload-files">
              <FolderUp className="size-4" />
              Upload documents
            </Link>
          </Button>
        )}
      />

      <div className="max-w-[1120px] space-y-10 pb-10">
        <section aria-labelledby="welcome-title">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase text-[var(--workspace-primary)]">
                Welcome to AxLiner
              </p>
              <h2 id="welcome-title" className="mt-2 text-2xl font-bold text-[var(--workspace-ink)]">
                Your first reviewed batch starts here
              </h2>
              <p className="mt-2 text-[15px] leading-6 text-muted-foreground">
                Upload the whole folder, correct only what needs attention, then export clean files or publish reviewed draft bills.
              </p>
            </div>
            <Button asChild variant="surface" size="sm">
              <Link href="/dashboard/setup">
                Open full setup
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="overflow-hidden rounded-md border border-[var(--workspace-border)] bg-[#dbe7fb]">
            <Image
              src="/helpdoc-banner.png"
              alt="An illustrated AxLiner help workspace with documents, review cards, and connected steps"
              width={913}
              height={451}
              sizes="(max-width: 1280px) 100vw, 1120px"
              className="h-auto w-full object-cover"
              priority
            />
          </div>
        </section>

        <section
          aria-labelledby="first-steps-title"
          className="overflow-hidden rounded-md border border-[var(--workspace-border)] bg-card"
        >
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--workspace-border)] px-5 py-5 sm:px-6">
            <div>
              <h2 id="first-steps-title" className="text-lg font-bold text-[var(--workspace-ink)]">
                Complete your first workflow
              </h2>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Follow these four steps in order. Each action opens the place where the work happens.
              </p>
            </div>
            <span className="rounded-full border border-[var(--workspace-border)] bg-[var(--workspace-soft)] px-3 py-1 text-xs font-semibold text-[var(--workspace-ink)]">
              4 first steps
            </span>
          </div>

          <ol className="divide-y divide-[var(--workspace-border)]">
            {firstTasks.map((task, index) => {
              const Icon = task.icon

              return (
                <li
                  key={task.title}
                  className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full border border-[#b7cff5] bg-[#edf5ff] text-[#1769c2]">
                      <Icon className="size-[18px]" />
                      <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full border border-white bg-[#1769c2] text-[10px] font-bold text-white">
                        {index + 1}
                      </span>
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-[15px] font-semibold text-[var(--workspace-ink)]">{task.title}</h3>
                      <p className="mt-1 text-sm leading-5 text-muted-foreground">{task.description}</p>
                    </div>
                  </div>
                  <Button asChild variant="surface" size="sm" className="self-start sm:self-auto">
                    <Link href={task.href}>
                      {task.action}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </li>
              )
            })}
          </ol>
        </section>

        <section aria-labelledby="workflow-title">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase text-[var(--workspace-primary)]">How it works</p>
            <h2 id="workflow-title" className="mt-2 text-xl font-bold text-[var(--workspace-ink)]">
              From source files to reviewed output
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              The review step stays visible between extraction and every export or accounting destination.
            </p>
          </div>
          <div className="mt-5 overflow-x-auto py-2">
            <AxLinerWorkflowDiagram />
          </div>
        </section>

        <section aria-labelledby="actions-title">
          <div className="mb-5">
            <h2 id="actions-title" className="text-xl font-bold text-[var(--workspace-ink)]">
              Continue in AxLiner
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Go directly to the part of the workflow you need next.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {nextActions.map((action) => {
              const Icon = action.icon

              return (
                <article
                  key={action.title}
                  className="flex min-h-[190px] flex-col rounded-md border border-[var(--workspace-border)] bg-card p-5 sm:p-6"
                >
                  <span className={`flex size-10 items-center justify-center rounded-full ${action.iconClassName}`}>
                    <Icon className="size-[18px]" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-[var(--workspace-ink)]">{action.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{action.description}</p>
                  <Link
                    href={action.href}
                    className="ax-interactive mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-[var(--workspace-blue)] hover:underline"
                  >
                    {action.action}
                    <ArrowRight className="size-4" />
                  </Link>
                </article>
              )
            })}
          </div>
        </section>
      </div>
    </DashboardShell>
  )
}
