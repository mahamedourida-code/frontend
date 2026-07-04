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
  type LucideIcon,
} from "lucide-react"

import { DashboardShell } from "@/components/DashboardShell"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { WorkspaceVisualCard } from "@/components/dashboard/WorkspaceVisualCard"
import type { WorkspaceVisualName } from "@/components/dashboard/workspace-visuals"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

const guideActions = [
  {
    title: "Clients",
    href: "/dashboard#clients",
    action: "Open",
    icon: Building2,
    visual: "portalStack",
  },
  {
    title: "Upload",
    href: "/dashboard/client#upload-files",
    action: "Open",
    icon: FolderUp,
    visual: "folderDropSquare",
  },
  {
    title: "Review",
    href: "/dashboard/client",
    action: "Open",
    icon: ScanSearch,
    visual: "reviewLensWide",
  },
  {
    title: "Outputs",
    href: "/dashboard/client#reviewed-outputs",
    action: "Open",
    icon: PlugZap,
    visual: "publishBridgeWide",
  },
] satisfies Array<{
  title: string
  href: string
  action: string
  icon: LucideIcon
  visual: WorkspaceVisualName
}>

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

      <div className="max-w-6xl pb-10">
        <section
          aria-labelledby="guide-actions-title"
          className="space-y-3"
        >
          <h2 id="guide-actions-title" className="sr-only">
            Actions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {guideActions.map((action) => {
              const Icon = action.icon

              return (
                <WorkspaceVisualCard
                  key={action.title}
                  visual={action.visual}
                  title={action.title}
                  action={
                    <Button asChild variant="surface" size="sm" className="w-full justify-between">
                      <Link href={action.href}>
                        <span className="inline-flex items-center gap-1.5">
                          <Icon className="size-3.5" />
                          {action.action}
                        </span>
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </Button>
                  }
                />
              )
            })}
          </div>
        </section>
      </div>
    </DashboardShell>
  )
}
