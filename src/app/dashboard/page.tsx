"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { DashboardShell } from "@/components/DashboardShell"
import { CompaniesTable } from "@/components/dashboard/companies/CompaniesTable"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { WorkspaceFirstRunGuide } from "@/components/dashboard/WorkspaceFirstRunGuide"
import { useAuth } from "@/hooks/useAuth"
import { useWorkspaces } from "@/hooks/useWorkspaces"

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { activeWorkspace } = useWorkspaces(user)

  useEffect(() => {
    if (!loading && !user) router.replace("/sign-in?next=%2Fdashboard")
  }, [loading, router, user])

  if (loading || !user) {
    return <DashboardRouteLoader label="Loading clients" />
  }

  return (
    <DashboardShell activeItem="companies" title="Clients" user={user} showBack={false}>
      <div className="space-y-8">
        <PageHeader
          title="Clients"
          description="Start with a client, then upload a stack for review."
          className="mb-0"
        />
        <WorkspaceFirstRunGuide userId={user.id} workspaceId={activeWorkspace?.id} />
        <CompaniesTable workspaceId={activeWorkspace?.id} />
      </div>
    </DashboardShell>
  )
}
