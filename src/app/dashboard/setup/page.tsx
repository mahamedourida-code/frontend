"use client"

import { Suspense, useEffect } from "react"
import { useRouter } from "next/navigation"

import { DashboardShell } from "@/components/DashboardShell"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { SetupChecklist } from "@/components/dashboard/SetupChecklist"
import { useAuth } from "@/hooks/useAuth"
import { useWorkspaces } from "@/hooks/useWorkspaces"

function SetupFallback() {
  return <DashboardRouteLoader label="Loading setup" />
}

export default function SetupPage() {
  return (
    <Suspense fallback={<SetupFallback />}>
      <SetupContent />
    </Suspense>
  )
}

function SetupContent() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { activeWorkspace } = useWorkspaces(user)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/sign-in?next=%2Fdashboard%2Fsetup")
    }
  }, [authLoading, router, user])

  if (authLoading) {
    return <SetupFallback />
  }

  if (!user) {
    return null
  }

  return (
    <DashboardShell activeItem="settings" title="Setup" user={user}>
      <PageHeader
        title="Setup"
        description="Everything to configure in one place. Each item links to where it lives."
      />
      <div className="max-w-3xl text-black">
        <SetupChecklist workspace={activeWorkspace} />
      </div>
    </DashboardShell>
  )
}
