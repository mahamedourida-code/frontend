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
  ListStart,
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
    href: "/dashboard#clients",
    action: "Open clients",
    icon: Building2,
  },
  {
    title: "Upload a mixed batch",
    href: "/dashboard/client#upload-files",
    action: "Upload files",
    icon: FolderUp,
  },
  {
    title: "Review flagged exceptions",
    href: "/dashboard/client",
    action: "Open review",
    icon: ScanSearch,
  },
  {
    title: "Choose where work goes",
    href: "/dashboard/client#reviewed-outputs",
    action: "Open outputs",
    icon: PlugZap,
  },
]

const nextActions = [
  {
    title: "Upload documents",
    href: "/dashboard/client#upload-files",
    action: "Upload a batch",
    icon: FolderUp,
    iconClassName: "bg-[#e8f2ff] text-[#1877f2]",
  },
  {
    title: "Review exceptions",
    href: "/dashboard/client",
    action: "Open review board",
    icon: FileCheck2,
    iconClassName: "bg-[#fff4d8] text-[#a86500]",
  },
  {
    title: "Export reviewed files",
    href: "/dashboard/client#reviewed-outputs",
    action: "Open review board",
    icon: FileSpreadsheet,
    iconClassName: "bg-[#eaf8ef] text-[#168349]",
  },
  {
    title: "Connect accounting",
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
        actions={(
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="surface">
              <Link href="/dashboard?tour=start">
                <ListStart className="size-4" />
                Take a quick tour
              </Link>
            </Button>
            <Button asChild variant="glossy">
              <Link href="/dashboard/client#upload-files">
                <FolderUp className="size-4" />
                Upload documents
              </Link>
            </Button>
          </div>
        )}
      />

      <div className="max-w-[1120px] space-y-10 pb-10">
        <section aria-labelledby="welcome-title">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="welcome-title" className="text-2xl font-bold text-[var(--workspace-ink)]">
              Welcome to AxLiner
            </h2>
            <Button asChild variant="surface" size="sm">
              <Link href="/dashboard/setup">
                Full setup
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section
          aria-labelledby="first-steps-title"
          className="overflow-hidden rounded-md border border-[var(--workspace-border)] bg-card"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--workspace-border)] px-5 py-5 sm:px-6">
            <h2 id="first-steps-title" className="text-lg font-bold text-[var(--workspace-ink)]">
              First workflow
            </h2>
            <span className="rounded-full border border-[var(--workspace-border)] bg-[var(--workspace-soft)] px-3 py-1 text-xs font-semibold text-[var(--workspace-ink)]">
              4 steps
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
                    <h3 className="min-w-0 text-[15px] font-semibold text-[var(--workspace-ink)]">{task.title}</h3>
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

        <section aria-label="AxLiner help overview" className="mx-auto w-full max-w-[280px]">
          <div className="overflow-hidden rounded-md border border-[var(--workspace-border)] bg-[#dbe7fb]">
            <Image
              src="/helpdoc-banner.png"
              alt="An illustrated AxLiner help workspace with documents, review cards, and connected steps"
              width={913}
              height={451}
              sizes="280px"
              className="h-auto w-full object-cover"
            />
          </div>
        </section>

        <section aria-labelledby="workflow-title">
          <h2 id="workflow-title" className="text-xl font-bold text-[var(--workspace-ink)]">
            How it works
          </h2>
          <div className="mt-5 overflow-x-auto py-2">
            <AxLinerWorkflowDiagram />
          </div>
        </section>

        <section aria-labelledby="actions-title">
          <h2 id="actions-title" className="mb-5 text-xl font-bold text-[var(--workspace-ink)]">
            Continue
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {nextActions.map((action) => {
              const Icon = action.icon

              return (
                <article
                  key={action.title}
                  className="flex flex-col rounded-md border border-[var(--workspace-border)] bg-card p-5 sm:p-6"
                >
                  <span className={`flex size-10 items-center justify-center rounded-full ${action.iconClassName}`}>
                    <Icon className="size-[18px]" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-[var(--workspace-ink)]">{action.title}</h3>
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
