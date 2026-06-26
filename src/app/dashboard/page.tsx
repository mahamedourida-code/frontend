"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { DashboardShell } from "@/components/DashboardShell"
import { CompaniesTable } from "@/components/dashboard/companies/CompaniesTable"
import type { CompanySummary } from "@/components/dashboard/companies/company-types"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { HomeAttention } from "@/components/dashboard/HomeAttention"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { WorkspaceFirstRunGuide } from "@/components/dashboard/WorkspaceFirstRunGuide"
import { WorkspaceOverview } from "@/components/dashboard/WorkspaceOverview"
import { WorkspaceWalkthrough } from "@/components/dashboard/WorkspaceWalkthrough"
import { useAuth } from "@/hooks/useAuth"
import { useWorkspaces } from "@/hooks/useWorkspaces"

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { activeWorkspace } = useWorkspaces(user)
  const [clientsRefreshKey, setClientsRefreshKey] = useState(0)
  const [hasClients, setHasClients] = useState<boolean | null>(null)
  const [companies, setCompanies] = useState<CompanySummary[]>([])
  const [tourRequest, setTourRequest] = useState<string | undefined>(undefined)

  const handleClientCreated = useCallback(() => {
    setHasClients(true)
    setClientsRefreshKey((current) => current + 1)
  }, [])
  const handleCompanyCountChange = useCallback((count: number) => {
    setHasClients(count > 0)
  }, [])
  const handleTourFinish = useCallback(() => {
    if (tourRequest) router.replace("/dashboard")
  }, [router, tourRequest])

  useEffect(() => {
    if (!loading && !user) router.replace("/sign-in?next=%2Fdashboard")
  }, [loading, router, user])

  useEffect(() => {
    setTourRequest(new URLSearchParams(window.location.search).get("tour") ?? undefined)
  }, [])

  if (loading || !user) {
    return <DashboardRouteLoader label="Loading clients" />
  }

  return (
    <DashboardShell activeItem="companies" title="Clients" user={user} showBack={false}>
      <div className="space-y-8">
        <PageHeader
          title="Clients"
          className="mb-0"
        />
        {hasClients !== null ? (
          <>
            <WorkspaceFirstRunGuide
              userId={user.id}
              workspaceId={activeWorkspace?.id}
              hasClients={hasClients}
              onClientCreated={handleClientCreated}
            />
            <WorkspaceWalkthrough
              userId={user.id}
              workspaceId={activeWorkspace?.id}
              restartToken={tourRequest}
              onFinish={handleTourFinish}
            />
          </>
        ) : null}
        <HomeAttention companies={companies} />
        <WorkspaceOverview companies={companies} />
        <CompaniesTable
          workspaceId={activeWorkspace?.id}
          refreshKey={clientsRefreshKey}
          onCompanyCountChange={handleCompanyCountChange}
          onCompaniesLoaded={setCompanies}
        />
      </div>
    </DashboardShell>
  )
}
