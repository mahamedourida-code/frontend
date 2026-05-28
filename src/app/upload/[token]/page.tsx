"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { FileText, Loader2, UploadCloud, X } from "lucide-react"
import { AppLogo } from "@/components/AppIcon"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { clientIntakeApi } from "@/lib/api-client"
import { cn } from "@/lib/utils"

const acceptedTypes = ".pdf,.png,.jpg,.jpeg,.webp,.heic,.heif"

export default function ClientUploadPage() {
  const params = useParams<{ token: string }>()
  const token = String(params.token || "")
  const [context, setContext] = useState<{ label: string; workspace_name: string; expires_at: string } | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    clientIntakeApi.getPublicContext(token)
      .then(setContext)
      .catch(() => setError("This upload link is unavailable or has expired."))
      .finally(() => setLoading(false))
  }, [token])

  const expiresLabel = useMemo(() => {
    if (!context?.expires_at) return ""
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(context.expires_at))
  }, [context])

  const addFiles = (incoming: FileList | File[]) => {
    setFiles(current => [...current, ...Array.from(incoming)])
    setError(null)
  }

  const submit = async () => {
    if (!files.length) return
    setSubmitting(true)
    setError(null)
    try {
      await clientIntakeApi.submitPublicFiles(token, files)
      setSubmitted(true)
      setFiles([])
    } catch (submissionError: any) {
      setError(submissionError?.detail || "Your files could not be submitted. Ask for a new link or try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-5">
          <AppLogo className="text-foreground" />
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-5 py-12 sm:py-16">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" />
            Opening secure upload
          </div>
        ) : error && !context ? (
          <Card className="py-0">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">{error}</CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-7">
              <p className="text-sm font-medium text-muted-foreground">{context?.workspace_name}</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{context?.label || "Send documents"}</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Upload invoice, receipt, statement, table image, or PDF files for review. This secure link expires {expiresLabel}.
              </p>
            </div>
            {submitted ? (
              <Card className="py-0">
                <CardContent className="p-8 text-center">
                  <p className="text-base font-semibold text-foreground">Files received</p>
                  <p className="mt-2 text-sm text-muted-foreground">Your documents were sent to the workspace review inbox.</p>
                  <Button className="mt-6" variant="outline" onClick={() => setSubmitted(false)}>Send another batch</Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="gap-0 py-0">
                <CardContent className="p-5">
                  <label
                    className={cn(
                      "flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/20 px-6 text-center transition-colors hover:bg-muted/40",
                      dragging && "border-primary bg-primary/5",
                    )}
                    onDragOver={event => {
                      event.preventDefault()
                      setDragging(true)
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={event => {
                      event.preventDefault()
                      setDragging(false)
                      addFiles(event.dataTransfer.files)
                    }}
                  >
                    <UploadCloud className="size-7 text-muted-foreground" />
                    <span className="mt-4 text-sm font-medium text-foreground">Drop files here or browse</span>
                    <span className="mt-1 text-xs text-muted-foreground">PDF, PNG, JPEG, WebP, HEIC or HEIF</span>
                    <input className="sr-only" type="file" accept={acceptedTypes} multiple onChange={event => event.target.files && addFiles(event.target.files)} />
                  </label>

                  {files.length ? (
                    <div className="mt-4 space-y-2">
                      {files.map((file, index) => (
                        <div key={`${file.name}-${index}`} className="flex items-center gap-3 rounded-md border border-border px-3 py-2">
                          <FileText className="size-4 text-muted-foreground" />
                          <p className="min-w-0 flex-1 truncate text-sm text-foreground">{file.name}</p>
                          <button type="button" onClick={() => setFiles(current => current.filter((_, fileIndex) => fileIndex !== index))} className="text-muted-foreground hover:text-foreground">
                            <X className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
                  <div className="mt-5 flex justify-end">
                    <Button variant="glossy" size="lg" onClick={() => void submit()} disabled={!files.length || submitting}>
                      {submitting ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
                      {submitting ? "Submitting" : "Send files"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </main>
  )
}
