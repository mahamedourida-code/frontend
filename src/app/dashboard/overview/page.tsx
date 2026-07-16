"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { DashboardShell } from "@/components/DashboardShell"
import { AccountingOverview } from "@/components/dashboard/AccountingOverview"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { useAuth } from "@/hooks/useAuth"
import { useWorkspaces } from "@/hooks/useWorkspaces"

export default function OverviewPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { activeWorkspace, isLoading: workspaceLoading } = useWorkspaces(user)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/sign-in?next=%2Fdashboard%2Foverview")
    }
  }, [authLoading, router, user])

  if (authLoading || workspaceLoading || !activeWorkspace) {
    return <DashboardRouteLoader label="Loading overview" />
  }

  if (!user) return null

  return (
    <DashboardShell activeItem="overview" title="Overview" user={user} showBack={false}>
      <AccountingOverview workspaceId={activeWorkspace.id} />
    </DashboardShell>
  )
}
