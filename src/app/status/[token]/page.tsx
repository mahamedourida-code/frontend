"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { Check, FileText, Loader2, RefreshCw } from "lucide-react"

import { AppLogo } from "@/components/AppIcon"
import { clientIntakeApi, type ClientStatusStage, type ClientStatusView } from "@/lib/api-client"
import { cn } from "@/lib/utils"

const STAGES: Array<{ key: ClientStatusStage; label: string }> = [
  { key: "received", label: "Received" },
  { key: "processing", label: "Processing" },
  { key: "reviewed", label: "Reviewed" },
  { key: "done", label: "Done" },
]

const STAGE_INDEX: Record<ClientStatusStage, number> = {
  received: 0,
  processing: 1,
  reviewed: 2,
  done: 3,
}

function stageSentence(stage: ClientStatusStage, filename: string, submittedAt: string) {
  const dateLabel = (() => {
    try {
      return new Intl.DateTimeFormat(undefined, { month: "long", day: "numeric" }).format(new Date(submittedAt))
    } catch {
      return "recently"
    }
  })()
  const name = filename || "Your document"
  switch (stage) {
    case "done":
      return `${name} from ${dateLabel} has been reviewed and posted to your accounting software.`
    case "reviewed":
      return `${name} from ${dateLabel} has been reviewed and is being posted to your accounting software.`
    case "processing":
      return `${name} from ${dateLabel} was received and is being processed.`
    default:
      return `${name} from ${dateLabel} has been received.`
  }
}

function StageTimeline({ stage }: { stage: ClientStatusStage }) {
  const current = STAGE_INDEX[stage]
  return (
    <div className="flex items-center">
      {STAGES.map((step, index) => {
        const reached = index <= current
        const isCurrent = index === current
        const isLast = index === STAGES.length - 1
        return (
          <div key={step.key} className={cn("flex items-center", !isLast && "flex-1")}>
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "inline-flex size-7 items-center justify-center rounded-full border-2 text-[11px] font-bold transition-colors",
                  reached
                    ? "border-emerald-700 bg-emerald-700 text-white"
                    : "border-border bg-card text-muted-foreground",
                  isCurrent && "ring-2 ring-emerald-700/25 ring-offset-1 ring-offset-background",
                )}
              >
                {reached ? <Check className="size-3.5" strokeWidth={3} /> : index + 1}
              </span>
              <span
                className={cn(
                  "mt-1.5 text-[11px] font-semibold",
                  reached ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
            {!isLast ? (
              <span
                className={cn(
                  "mx-1.5 mb-5 h-[3px] flex-1 rounded-full transition-colors",
                  index < current ? "bg-emerald-700" : "bg-border",
                )}
              />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export default function ClientStatusPage() {
  const params = useParams<{ token: string }>()
  const token = String(params.token || "")
  const [view, setView] = useState<ClientStatusView | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useMemo(
    () => async (isRefresh = false) => {
      if (!token) return
      if (isRefresh) setRefreshing(true)
      try {
        const data = await clientIntakeApi.getPublicStatus(token)
        setView(data)
        setError(null)
      } catch {
        setError("This status link is unavailable or has expired.")
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [token],
  )

  useEffect(() => {
    void load()
  }, [load])

  if (loading) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-background px-6 text-sm font-medium text-muted-foreground">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Loading status…
      </main>
    )
  }

  if (error && !view) {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 text-center">
        <p className="text-lg font-semibold text-foreground">Status unavailable</p>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{error}</p>
      </main>
    )
  }

  const submissions = view?.submissions ?? []

  return (
    <main
      className="min-h-[100dvh] bg-background"
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto max-w-2xl px-5 py-6 sm:px-6 sm:py-10">
        <header className="flex items-center justify-between border-b-2 border-foreground/10 pb-4">
          <AppLogo className="h-6 w-auto sm:h-7" />
          <button
            type="button"
            onClick={() => void load(true)}
            className="ax-interactive inline-flex h-9 items-center gap-1.5 rounded-lg border-2 border-border bg-card px-3 text-xs font-bold text-foreground hover:border-emerald-700/40 hover:text-emerald-700"
          >
            <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />
            Refresh
          </button>
        </header>

        <div className="mt-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">
            {view?.workspace_name}
          </p>
          <h1 className="mt-1.5 text-[26px] font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
            {view?.label || "Document status"}
          </h1>
          <p className="mt-2 text-[15px] font-semibold leading-6 text-muted-foreground">
            Track where your documents are. This page updates as they are reviewed — no login needed.
          </p>
        </div>

        {submissions.length === 0 ? (
          <div className="mt-10 rounded-2xl border-2 border-border bg-card p-8 text-center">
            <p className="text-base font-bold text-foreground">Nothing here yet</p>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">
              Once documents are sent through this link, their status appears here.
            </p>
          </div>
        ) : (
          <div className="mt-7 space-y-4">
            {submissions.map((submission) =>
              submission.documents.map((doc, docIndex) => {
                const done = doc.stage === "done"
                return (
                <article
                  key={`${submission.id}-${docIndex}`}
                  className={cn(
                    "rounded-2xl border-2 p-5 shadow-sm transition-colors",
                    done ? "border-emerald-700/30 bg-emerald-50/60 dark:bg-emerald-950/20" : "border-border bg-card",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                      <FileText className="size-4.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-bold text-foreground">{doc.filename}</p>
                        <span
                          className={cn(
                            "shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                            done
                              ? "border-emerald-700/30 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                              : doc.stage === "reviewed"
                                ? "border-emerald-700/20 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                                : "border-border bg-muted/50 text-muted-foreground",
                          )}
                        >
                          {STAGES.find((s) => s.key === doc.stage)?.label}
                        </span>
                      </div>
                      <p className="mt-1 text-[13px] font-semibold leading-5 text-muted-foreground">
                        {stageSentence(doc.stage, doc.filename, submission.submitted_at)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5">
                    <StageTimeline stage={doc.stage} />
                  </div>
                </article>
                )
              }),
            )}
          </div>
        )}

        <p className="mt-8 text-center text-[11px] font-semibold text-muted-foreground">
          Powered by <span className="text-emerald-700">AxLiner</span> · This link is private to your documents
        </p>
      </div>
    </main>
  )
}
