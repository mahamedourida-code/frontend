"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BookCheck, FileSpreadsheet, PlugZap, ReceiptText, Upload } from "lucide-react"

import { DashboardShell } from "@/components/DashboardShell"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"

const workflow = [
  {
    title: "Upload a mixed stack",
    description: "Add invoices, receipts, statements, or scans together. AxLiner keeps the source documents grouped for review.",
    icon: Upload,
  },
  {
    title: "Clear review exceptions",
    description: "Check flagged fields and rows first, then confirm the records that are ready for accounting output.",
    icon: BookCheck,
  },
  {
    title: "Export or publish drafts",
    description: "Download reviewed Excel or CSV files, or send approved invoice records to QuickBooks or Xero as draft bills.",
    icon: FileSpreadsheet,
  },
]

const controls = [
  "Accounting publishing creates draft bills only. AxLiner does not pay or auto-approve them.",
  "Vendor memory can suggest coding defaults, but review remains part of the workflow.",
  "Use the Draft bills queue to check approval state before publishing accounting drafts.",
]

export default function GuidePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/sign-in?next=%2Fdashboard%2Fguide")
    }
  }, [authLoading, router, user])

  if (authLoading) {
    return <DashboardRouteLoader label="Loading guide" />
  }

  if (!user) {
    return null
  }

  return (
    <DashboardShell activeItem="guide" title="Guide" user={user} showBack={false}>
      <PageHeader
        title="Accountant guide"
        description="Run each document stack from intake to reviewed accounting output."
        actions={(
          <Button asChild variant="glossy">
            <Link href="/dashboard/client#upload-files">
              <Upload className="size-4" />
              Upload documents
            </Link>
          </Button>
        )}
      />

      <div className="max-w-5xl space-y-6">
        <Card className="gap-0 overflow-hidden rounded-xl py-0">
          <CardHeader className="border-b border-border p-5 sm:p-6">
            <CardTitle className="text-lg">Daily stack workflow</CardTitle>
            <CardDescription className="mt-1 leading-5">
              Keep the routine simple: upload, review exceptions, then export or publish.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-0 p-0 md:grid-cols-3">
            {workflow.map((step, index) => {
              const Icon = step.icon
              return (
                <section key={step.title} className="border-b border-border p-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 sm:p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      Step {index + 1}
                    </span>
                  </div>
                  <h2 className="text-base">{step.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
                </section>
              )
            })}
          </CardContent>
        </Card>

        <Card className="gap-0 overflow-hidden rounded-xl py-0">
          <CardHeader className="border-b border-border p-5 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ReceiptText className="size-5 text-primary" />
              Accounting controls
            </CardTitle>
            <CardDescription className="mt-1 leading-5">
              Review stays explicit before anything reaches the accounting system.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 p-5 sm:p-6">
            <ul className="space-y-3">
              {controls.map((control) => (
                <li key={control} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  <span>{control}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2 border-t border-border pt-5">
              <Button asChild variant="warm" size="sm">
                <Link href="/dashboard/client">Open review board</Link>
              </Button>
              <Button asChild variant="surface" size="sm">
                <Link href="/dashboard/accounts-payable">Open draft bills</Link>
              </Button>
              <Button asChild variant="surface" size="sm">
                <Link href="/dashboard/integrations">
                  <PlugZap className="size-4" />
                  Manage integration
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
