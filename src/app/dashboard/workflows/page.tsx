"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DashboardShell } from "@/components/DashboardShell"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

const workflowIdeas = [
  {
    title: "Reviewed batch workbook",
    status: "Available",
    tone: "ready",
    description: "Review each handwritten result, edit cells, then download one final workbook with clean sheet names from the original files.",
    details: ["Smart file names", "Edited cells included", "One reviewed batch export"],
  },
  {
    title: "Column cleanup rules",
    status: "Next",
    tone: "next",
    description: "Save rules like date format, currency columns, empty-row removal, and header normalization so repeated invoice batches need less review.",
    details: ["Template rules", "Excel-safe formatting", "Reusable per workflow"],
  },
  {
    title: "Merge or split exports",
    status: "Next",
    tone: "next",
    description: "Choose whether a batch becomes one workbook, one sheet per input, or separate XLSX files grouped by document type.",
    details: ["One workbook", "Separate files", "Document grouping"],
  },
  {
    title: "Accounting handoff",
    status: "Planned",
    tone: "planned",
    description: "Push reviewed tables into Google Sheets, Airtable, QuickBooks, or a webhook after approval instead of downloading every time.",
    details: ["Google Sheets", "Webhook", "Accounting export"],
  },
  {
    title: "Confidence review queue",
    status: "Planned",
    tone: "planned",
    description: "Send only uncertain rows to review. High-confidence rows stay ready, which keeps big handwritten batches fast.",
    details: ["Low-confidence rows", "Review first", "Fewer clicks"],
  },
  {
    title: "Recurring inbox",
    status: "Planned",
    tone: "planned",
    description: "Drop files into a watched folder or email inbox and let AxLiner prepare the batch while the team keeps working.",
    details: ["Folder intake", "Email intake", "Team routing"],
  },
]

function WorkflowMark({ tone }: { tone: string }) {
  return (
    <span
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-md border",
        tone === "ready"
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-muted text-primary"
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path d="M6 7h5m2 10h5M10 7c3 0 1 10 5 10" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        <circle cx="6" cy="7" r="2" fill="currentColor" />
        <circle cx="18" cy="17" r="2" fill="currentColor" />
      </svg>
    </span>
  )
}

export default function WorkflowsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push("/sign-in")
  }, [loading, user, router])

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 rounded-full border-4 border-border border-t-primary animate-spin" />
      </div>
    )
  }

  return (
    <DashboardShell activeItem="workflows" title="Workflows" user={user}>
      <div className="grid gap-5">
        <section className="rounded-md border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Batch features</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Build repeatable Excel workflows</h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Keep conversion simple, then add only the features that save review time: naming, cleanup, merged exports, and handoff integrations.
              </p>
            </div>
            <Button asChild className="rounded-md">
              <Link href="/dashboard/client">Convert files</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {workflowIdeas.map((item) => (
            <Card key={item.title} className="rounded-md border-border bg-card shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <WorkflowMark tone={item.tone} />
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-md",
                      item.tone === "ready"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-muted text-muted-foreground"
                    )}
                  >
                    {item.status}
                  </Badge>
                </div>
                <h2 className="mt-5 text-lg font-semibold text-foreground">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {item.details.map((detail) => (
                    <span key={detail} className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                      {detail}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </DashboardShell>
  )
}
