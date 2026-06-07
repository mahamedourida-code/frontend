"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { DashboardShell } from "@/components/DashboardShell"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { WorkflowGraph } from "@/components/dashboard/WorkflowGraph"
import { useAuth } from "@/hooks/useAuth"

export default function StartPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/sign-in?next=%2Fdashboard%2Fstart")
    }
  }, [authLoading, router, user])

  if (authLoading) {
    return <DashboardRouteLoader label="Loading workspace" />
  }

  if (!user) {
    return null
  }

  return (
    <DashboardShell activeItem="overview" title="Workspace" user={user} showBack={false}>
      <PageHeader
        title="Where do you want to go?"
      />
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <WorkflowGraph />
      </div>
    </DashboardShell>
  )
}
