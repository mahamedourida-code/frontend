"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Building2,
  FolderUp,
  ListStart,
  PlugZap,
  ScanSearch,
} from "lucide-react"

import { DashboardShell } from "@/components/DashboardShell"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

const guideActions = [
  {
    title: "Clients",
    href: "/dashboard#clients",
    action: "Open clients",
    icon: Building2,
  },
  {
    title: "Upload documents",
    href: "/dashboard/client#upload-files",
    action: "Open upload",
    icon: FolderUp,
  },
  {
    title: "Review exceptions",
    href: "/dashboard/client",
    action: "Open review",
    icon: ScanSearch,
  },
  {
    title: "Outputs",
    href: "/dashboard/client#reviewed-outputs",
    action: "Open outputs",
    icon: PlugZap,
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
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="surface">
              <Link href="/dashboard?tour=start">
                <ListStart className="size-4" />
                Tour
              </Link>
            </Button>
          </div>
        }
      />

      <div className="max-w-2xl pb-10">
        <section
          aria-labelledby="guide-actions-title"
          className="overflow-hidden rounded-lg border border-[var(--workspace-border)] bg-card shadow-none"
        >
          <div className="border-b border-[var(--workspace-border)] px-5 py-4 sm:px-6">
            <h2 id="guide-actions-title" className="text-sm font-semibold text-[var(--workspace-ink)]">
              Actions
            </h2>
          </div>

          <div className="divide-y divide-[var(--workspace-border)]">
            {guideActions.map((action) => {
              const Icon = action.icon

              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="ax-interactive flex items-center justify-between gap-4 px-5 py-4 outline-none transition-colors hover:bg-[var(--workspace-soft)] focus-visible:bg-[var(--workspace-soft)] sm:px-6"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-[var(--workspace-border)] bg-[var(--workspace-soft)] text-black">
                      <Icon className="size-[18px] text-black" />
                    </span>
                    <h3 className="min-w-0 text-[15px] font-semibold text-[var(--workspace-ink)]">{action.title}</h3>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[var(--workspace-blue)]">
                    {action.action}
                    <ArrowRight className="size-4 text-black" />
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    </DashboardShell>
  )
}
