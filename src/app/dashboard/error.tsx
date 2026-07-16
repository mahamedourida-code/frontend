"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("wasProcessing")
      sessionStorage.removeItem("uploadedFilesCache")
    }
  }, [error])

  return (
    <main className="min-h-svh bg-background px-5 py-20">
      <section className="mx-auto max-w-lg border-t-2 border-red-300 pt-6">
        <span className="inline-flex size-9 items-center justify-center rounded-md bg-red-50 text-red-700">
          <AlertTriangle className="size-4.5" />
        </span>
        <h1 className="mt-4 text-xl font-bold text-foreground">Workspace unavailable</h1>
        <p className="mt-2 max-w-md text-[13px] leading-5 text-[var(--workspace-muted)]">
          This view did not finish loading. Retry it, or return to the client queue.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Button variant="glossy" size="sm" onClick={reset}>
            <RefreshCw className="size-4" />
            Try again
          </Button>
          <Button variant="surface" size="sm" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="size-4" />
            Back to clients
          </Button>
        </div>
        {error.digest ? <p className="mt-5 font-mono text-[10px] text-[var(--workspace-muted)]">Reference {error.digest}</p> : null}
      </section>
    </main>
  )
}
