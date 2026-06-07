"use client"

import { Suspense, useEffect } from "react"
import { useRouter } from "next/navigation"

import { DashboardShell } from "@/components/DashboardShell"
import { AccountingConnectionsSection } from "@/components/dashboard/accounting-connections/AccountingConnectionsSection"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { Symbol } from "@/components/dashboard/Symbol"
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
      <PageHeader title="Integrations" />
      <div className="max-w-3xl space-y-8">
        <section className="flex flex-col items-center gap-5 px-6 pt-6 pb-2 text-center sm:pt-10">
          <Symbol name="firstsight-sources-empty" size="hero" className="h-56 w-56 sm:h-64 sm:w-64" alt="" />
          <div className="max-w-md space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand-green-fg)]">
              Connect a source
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              No sources connected yet
            </h2>
            <p className="text-sm leading-relaxed text-foreground/70">
              Connect QuickBooks to publish reviewed draft bills.
            </p>
          </div>
        </section>

        <AccountingConnectionsSection isOwner={isOwner} workspaceId={activeWorkspace?.id} />
      </div>
    </DashboardShell>
  )
}
