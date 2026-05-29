"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useParams } from "next/navigation"
import {
  Camera,
  Check,
  FileText,
  Image as ImageIcon,
  Loader2,
  Upload,
  X,
} from "lucide-react"

import { AppLogo } from "@/components/AppIcon"
import { clientIntakeApi } from "@/lib/api-client"
import { cn } from "@/lib/utils"

const ACCEPTED_MIME = "image/*,application/pdf"
const ACCEPTED_EXTENSIONS = ".pdf,.png,.jpg,.jpeg,.webp,.heic,.heif"

type PreviewKind = "image" | "pdf" | "other"

type StagedFile = {
  id: string
  file: File
  previewUrl: string | null
  kind: PreviewKind
}

function classifyFile(file: File): PreviewKind {
  if (file.type.startsWith("image/")) return "image"
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) return "pdf"
  return "other"
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export default function ClientUploadPage() {
  const params = useParams<{ token: string }>()
  const token = String(params.token || "")

  const [context, setContext] = useState<{ label: string; workspace_name: string; expires_at: string } | null>(null)
  const [staged, setStaged] = useState<StagedFile[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const libraryInputRef = useRef<HTMLInputElement | null>(null)
  const cameraInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!token) return
    clientIntakeApi.getPublicContext(token)
      .then(setContext)
      .catch(() => setError("This upload link is unavailable or has expired."))
      .finally(() => setLoading(false))
  }, [token])

  // Revoke object URLs when the component unmounts or files are removed.
  useEffect(() => {
    return () => {
      staged.forEach((entry) => {
        if (entry.previewUrl) URL.revokeObjectURL(entry.previewUrl)
      })
    }
    // We intentionally only run cleanup on unmount; the per-file revoke on
    // removal is handled inside `removeFile`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const expiresLabel = useMemo(() => {
    if (!context?.expires_at) return ""
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(context.expires_at))
  }, [context])

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const next: StagedFile[] = []
    for (const file of Array.from(incoming)) {
      const kind = classifyFile(file)
      next.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        previewUrl: kind === "image" ? URL.createObjectURL(file) : null,
        kind,
      })
    }
    if (next.length) {
      setStaged((current) => [...current, ...next])
      setError(null)
    }
  }, [])

  const removeFile = useCallback((id: string) => {
    setStaged((current) => {
      const entry = current.find((row) => row.id === id)
      if (entry?.previewUrl) URL.revokeObjectURL(entry.previewUrl)
      return current.filter((row) => row.id !== id)
    })
  }, [])

  const clearAll = useCallback(() => {
    setStaged((current) => {
      current.forEach((entry) => entry.previewUrl && URL.revokeObjectURL(entry.previewUrl))
      return []
    })
  }, [])

  const submit = useCallback(async () => {
    if (!staged.length) return
    setSubmitting(true)
    setError(null)
    try {
      const files = staged.map((entry) => entry.file)
      await clientIntakeApi.submitPublicFiles(token, files)
      setSubmitted(true)
      clearAll()
    } catch (submissionError: any) {
      setError(submissionError?.detail || "Your files could not be submitted. Ask for a new link or try again.")
    } finally {
      setSubmitting(false)
    }
  }, [staged, token, clearAll])

  const totalSize = useMemo(
    () => staged.reduce((sum, entry) => sum + entry.file.size, 0),
    [staged],
  )

  // ── Render states ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-background px-6 text-sm font-medium text-muted-foreground">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Opening secure upload…
      </main>
    )
  }

  if (error && !context) {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <X className="size-7" />
        </div>
        <p className="mt-5 text-lg font-semibold text-foreground">Link unavailable</p>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{error}</p>
      </main>
    )
  }

  if (submitted) {
    return (
      <main
        className="flex min-h-[100dvh] flex-col bg-background"
        style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <header className="px-6 pt-6">
          <AppLogo className="h-7 w-auto" />
        </header>
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Check className="size-10" strokeWidth={2.5} />
          </div>
          <p className="mt-6 text-2xl font-bold tracking-tight text-foreground">Files received</p>
          <p className="mt-3 max-w-sm text-base leading-7 text-muted-foreground">
            Your documents were sent to{" "}
            <span className="font-semibold text-foreground">{context?.workspace_name}</span>. The bookkeeper will pick
            them up from the review inbox.
          </p>
        </div>
        <div className="px-6 pb-8 pt-4">
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="ax-interactive flex h-14 w-full items-center justify-center rounded-2xl border-2 border-border bg-card text-base font-bold text-foreground"
          >
            Send another batch
          </button>
        </div>
      </main>
    )
  }

  return (
    <main
      className="flex min-h-[100dvh] flex-col bg-background"
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Hidden inputs — keyed off refs so the same staging code path
          handles both "library" and "camera" sources. */}
      <input
        ref={libraryInputRef}
        type="file"
        accept={`${ACCEPTED_MIME},${ACCEPTED_EXTENSIONS}`}
        multiple
        className="sr-only"
        onChange={(event) => {
          if (event.target.files) addFiles(event.target.files)
          event.target.value = ""
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        // The capture attribute is honoured on mobile browsers — it opens the
        // device camera directly instead of the photo library.
        capture="environment"
        className="sr-only"
        onChange={(event) => {
          if (event.target.files) addFiles(event.target.files)
          event.target.value = ""
        }}
      />

      {/* Header */}
      <header className="px-5 pb-3 pt-5 sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between">
          <AppLogo className="h-6 w-auto sm:h-7" />
          {expiresLabel ? (
            <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
              Expires {expiresLabel}
            </span>
          ) : null}
        </div>
        <div className="mt-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {context?.workspace_name || "Document upload"}
          </p>
          <h1 className="mt-1.5 text-[26px] font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
            {context?.label || "Send your documents"}
          </h1>
          <p className="mt-2 text-[15px] font-medium leading-6 text-muted-foreground">
            Take photos of receipts, invoices, statements, or upload PDFs. Everything is encrypted in transit.
          </p>
        </div>
      </header>

      {/* Content — scrolls when files are added */}
      <section className="flex-1 px-5 pb-[180px] pt-2 sm:px-6">
        {staged.length === 0 ? (
          <div className="mt-4 flex flex-col gap-3">
            {/* Primary mobile CTA — full-bleed tap target */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="ax-interactive flex min-h-[148px] w-full flex-col items-center justify-center gap-3 rounded-3xl bg-foreground px-6 py-7 text-background shadow-lg shadow-foreground/20 active:scale-[0.98]"
            >
              <Camera className="size-9" strokeWidth={2} />
              <span className="text-lg font-bold tracking-tight">Take a photo</span>
              <span className="text-[13px] font-medium opacity-80">Opens your phone camera</span>
            </button>
            {/* Secondary CTA — pick from library / browse files */}
            <button
              type="button"
              onClick={() => libraryInputRef.current?.click()}
              className="ax-interactive flex min-h-[112px] w-full flex-col items-center justify-center gap-2 rounded-3xl border-2 border-border bg-card px-6 py-6 text-foreground active:scale-[0.98]"
            >
              <ImageIcon className="size-7 text-muted-foreground" strokeWidth={2} />
              <span className="text-base font-bold tracking-tight">Tap to select files</span>
              <span className="text-[12px] font-medium text-muted-foreground">
                Photos, PDFs from your phone
              </span>
            </button>
            <p className="mt-2 text-center text-[12px] font-medium leading-5 text-muted-foreground">
              Tip: you can take multiple shots — one per page works best.
            </p>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-bold text-foreground">
                {staged.length} {staged.length === 1 ? "file" : "files"} ready
              </p>
              <button
                type="button"
                onClick={clearAll}
                className="text-xs font-semibold text-muted-foreground underline-offset-2 hover:underline"
              >
                Clear all
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {staged.map((entry) => (
                <div
                  key={entry.id}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-card"
                >
                  {entry.kind === "image" && entry.previewUrl ? (
                    <img
                      src={entry.previewUrl}
                      alt={entry.file.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-center">
                      <FileText className="size-8 text-primary" />
                      <p className="line-clamp-2 text-[11px] font-semibold text-foreground">
                        {entry.file.name}
                      </p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(entry.id)}
                    aria-label={`Remove ${entry.file.name}`}
                    className="absolute right-1.5 top-1.5 inline-flex size-7 items-center justify-center rounded-full bg-foreground/85 text-background shadow-md backdrop-blur active:scale-95"
                  >
                    <X className="size-3.5" strokeWidth={2.5} />
                  </button>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-2 pt-6">
                    <p className="truncate text-[11px] font-semibold text-white">{entry.file.name}</p>
                    <p className="text-[10px] font-medium text-white/80">{formatBytes(entry.file.size)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add more — two compact buttons on the same row */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="ax-interactive flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-border bg-card text-sm font-bold text-foreground active:scale-[0.98]"
              >
                <Camera className="size-4" />
                Take photo
              </button>
              <button
                type="button"
                onClick={() => libraryInputRef.current?.click()}
                className="ax-interactive flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-border bg-card text-sm font-bold text-foreground active:scale-[0.98]"
              >
                <ImageIcon className="size-4" />
                Add more
              </button>
            </div>
          </div>
        )}

        {error ? (
          <p className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm font-semibold text-destructive">
            {error}
          </p>
        ) : null}
      </section>

      {/* Sticky bottom action bar — sits above iOS home indicator */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-3 backdrop-blur supports-[backdrop-filter]:bg-background/85 sm:px-6",
          staged.length === 0 && "hidden",
        )}
      >
        <div className="mb-2 flex items-center justify-between text-[12px] font-semibold">
          <span className="text-muted-foreground">
            {staged.length} {staged.length === 1 ? "file" : "files"} · {formatBytes(totalSize)}
          </span>
        </div>
        <button
          type="button"
          onClick={() => void submit()}
          disabled={!staged.length || submitting}
          className={cn(
            "ax-interactive inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-foreground text-base font-bold text-background shadow-lg shadow-foreground/25 active:scale-[0.99]",
            (submitting || !staged.length) && "opacity-60",
          )}
        >
          {submitting ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <Upload className="size-5" strokeWidth={2.5} />
              Send {staged.length} {staged.length === 1 ? "file" : "files"}
            </>
          )}
        </button>
      </div>
    </main>
  )
}
