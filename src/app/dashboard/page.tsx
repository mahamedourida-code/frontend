"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { DashboardShell } from "@/components/DashboardShell"
import { CompaniesTable } from "@/components/dashboard/companies/CompaniesTable"
import type { CompanySummary } from "@/components/dashboard/companies/company-types"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { WorkspaceFirstRunGuide } from "@/components/dashboard/WorkspaceFirstRunGuide"
import { WorkspaceOverview, type ActivityPoint } from "@/components/dashboard/WorkspaceOverview"
import { WorkspaceWalkthrough } from "@/components/dashboard/WorkspaceWalkthrough"
import { useAuth } from "@/hooks/useAuth"
import { useWorkspaces } from "@/hooks/useWorkspaces"
import { ocrApi } from "@/lib/api-client"

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { activeWorkspace } = useWorkspaces(user)
  const [clientsRefreshKey, setClientsRefreshKey] = useState(0)
  const [hasClients, setHasClients] = useState<boolean | null>(null)
  const [companies, setCompanies] = useState<CompanySummary[]>([])
  const [activity, setActivity] = useState<ActivityPoint[]>([])
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

  useEffect(() => {
    if (!user) return
    let mounted = true
    ocrApi.getDashboard("30d")
      .then((summary) => {
        if (!mounted) return
        setActivity(summary.chart.map((point) => ({
          date: point.timestamp,
          label: point.formattedDate || point.formattedTime || point.timestamp,
          count: point.count,
        })))
      })
      .catch(() => undefined)
    return () => {
      mounted = false
    }
  }, [user?.id])

  if (loading || !user) {
    return <DashboardRouteLoader label="Loading workspace" />
  }

  return (
    <DashboardShell activeItem="companies" title="Clients" user={user} showBack={false}>
      <div className="space-y-3">
        <PageHeader
          title={activeWorkspace?.name ?? "Clients"}
          compact
          className="mb-0"
        />
        {hasClients === false ? (
          <WorkspaceFirstRunGuide
            userId={user.id}
            workspaceId={activeWorkspace?.id}
            hasClients={hasClients}
            onClientCreated={handleClientCreated}
          />
        ) : null}
        {hasClients !== null ? (
          <WorkspaceWalkthrough
            userId={user.id}
            workspaceId={activeWorkspace?.id}
            enabled={Boolean(tourRequest)}
            restartToken={tourRequest}
            onFinish={handleTourFinish}
          />
        ) : null}
        <WorkspaceOverview companies={companies} activity={activity} />
        <CompaniesTable
          workspaceId={activeWorkspace?.id}
          refreshKey={clientsRefreshKey}
          onCompanyCountChange={handleCompanyCountChange}
          onCompaniesLoaded={setCompanies}
          mode="home"
        />
      </div>
    </DashboardShell>
  )
}
