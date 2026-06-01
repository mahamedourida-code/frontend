"use client"

import Link from "next/link"
import { Upload } from "lucide-react"

import { DashboardShell } from "@/components/DashboardShell"
import { ClientsTab } from "@/components/dashboard/ClientsTab"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { useWorkspaces } from "@/hooks/useWorkspaces"

export default function ClientsPage() {
  const { user, loading } = useAuth()
  const { activeWorkspace } = useWorkspaces(user)

  if (loading || !user) {
    return <DashboardRouteLoader label="Loading clients" />
  }

  return (
    <DashboardShell activeItem="clients" title="Clients" user={user} showBack={false}>
      <div className="max-w-6xl space-y-5">
        <PageHeader
          title="Clients"
          description="Track client intake links, recent submissions, and follow-up work."
          actions={
            <Button asChild variant="glossy" size="sm">
              <Link href="/dashboard/client">
                <Upload className="size-4" />
                Upload documents
              </Link>
            </Button>
          }
        />
        <ClientsTab workspaceId={activeWorkspace?.id} />
      </div>
    </DashboardShell>
  )
}
