"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { DashboardShell } from "@/components/DashboardShell"
import { CompaniesTable } from "@/components/dashboard/companies/CompaniesTable"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { PageHeader } from "@/components/dashboard/PageHeader"
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
    return <DashboardRouteLoader label="Loading companies" />
  }

  return (
    <DashboardShell activeItem="companies" title="Companies" user={user} showBack={false}>
      <div className="space-y-5">
        <PageHeader
          title="Companies"
          description="Keep every client company, mixed document batch, and accounting handoff in one place."
        />
        <CompaniesTable workspaceId={activeWorkspace?.id} />
      </div>
    </DashboardShell>
  )
}
