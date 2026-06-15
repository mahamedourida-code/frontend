"use client"

import { Suspense, useEffect } from "react"
import { useRouter } from "next/navigation"

import { DashboardShell } from "@/components/DashboardShell"
import { BatchesQueue } from "@/components/dashboard/BatchesQueue"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { useAuth } from "@/hooks/useAuth"

function BatchesFallback() {
  return <DashboardRouteLoader label="Loading batches" />
}

export default function BatchesPage() {
  return (
    <Suspense fallback={<BatchesFallback />}>
      <BatchesContent />
    </Suspense>
  )
}

function BatchesContent() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/sign-in?next=%2Fdashboard%2Fbatches")
    }
  }, [authLoading, router, user])

  if (authLoading) {
    return <BatchesFallback />
  }

  if (!user) {
    return null
  }

  return (
    <DashboardShell activeItem="batches" title="Batches" user={user}>
      <PageHeader
        title="Batches"
        description="Today's queue at a glance. Scan what's processing or needs review, then open one to drill into the full review board."
      />
      <BatchesQueue />
    </DashboardShell>
  )
}
