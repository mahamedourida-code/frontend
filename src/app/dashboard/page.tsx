"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { DashboardShell } from "@/components/DashboardShell"
import { CompaniesTable } from "@/components/dashboard/companies/CompaniesTable"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { HomeOverview } from "@/components/dashboard/home/HomeOverview"
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
    return <DashboardRouteLoader label="Loading workspace" />
  }

  return (
    <DashboardShell activeItem="companies" title="Clients" user={user} showBack={false}>
      <div className="space-y-8">
        <HomeOverview
          user={user}
          workspaceId={activeWorkspace?.id}
          workspaceName={activeWorkspace?.name}
        />

        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--workspace-ink)]">
            Your clients
          </h2>
          <CompaniesTable workspaceId={activeWorkspace?.id} />
        </section>
      </div>
    </DashboardShell>
  )
}
