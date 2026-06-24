"use client"

import { Suspense, useEffect } from "react"
import { useRouter } from "next/navigation"

import { DashboardShell } from "@/components/DashboardShell"
import { AccountingConnectionsSection } from "@/components/dashboard/accounting-connections/AccountingConnectionsSection"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { useAuth } from "@/hooks/useAuth"
import { useWorkspaces } from "@/hooks/useWorkspaces"

function IntegrationsFallback() {
  return <DashboardRouteLoader label="Loading integrations" />
}

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<IntegrationsFallback />}>
      <IntegrationsContent />
    </Suspense>
  )
}

function IntegrationsContent() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { activeWorkspace } = useWorkspaces(user)
  const isOwner = !activeWorkspace || activeWorkspace.role === "owner"

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/sign-in?next=%2Fdashboard%2Fintegrations")
    }
  }, [authLoading, router, user])

  if (authLoading) {
    return <IntegrationsFallback />
  }

  if (!user) {
    return null
  }

  return (
    <DashboardShell activeItem="integrations" title="Integrations" user={user}>
      <PageHeader
        title="Integrations"
      />
      <div className="max-w-3xl space-y-6">
        <AccountingConnectionsSection isOwner={isOwner} workspaceId={activeWorkspace?.id} />
      </div>
    </DashboardShell>
  )
}
