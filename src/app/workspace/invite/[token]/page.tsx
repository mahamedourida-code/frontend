"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import { AppLogo } from "@/components/AppIcon"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import { workspaceApi } from "@/lib/api-client"

export default function WorkspaceInvitePage() {
  const params = useParams<{ token: string }>()
  const token = String(params.token || "")
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [status, setStatus] = useState<"idle" | "accepting" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace(`/sign-in?next=${encodeURIComponent(`/workspace/invite/${token}`)}`)
      return
    }
    if (status !== "idle") return
    setStatus("accepting")
    workspaceApi.acceptInvite(token)
      .then(() => setStatus("success"))
      .catch((err: any) => {
        setErrorMessage(err?.response?.data?.detail || "This invite link is invalid or has already been used.")
        setStatus("error")
      })
  }, [authLoading, user, token, status, router])

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-5">
          <AppLogo className="text-foreground" />
        </div>
      </header>
      <div className="mx-auto max-w-md px-5 py-16">
        <Card className="py-0">
          <CardContent className="p-8 text-center">
            {authLoading || status === "idle" || status === "accepting" ? (
              <>
                <Loader2 className="mx-auto size-8 animate-spin text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">Accepting workspace invite…</p>
              </>
            ) : status === "success" ? (
              <>
                <CheckCircle2 className="mx-auto size-8 text-green-500" />
                <p className="mt-4 text-base font-semibold text-foreground">You joined the workspace</p>
                <p className="mt-2 text-sm text-muted-foreground">You now have reviewer access. You can review, edit, and export batches.</p>
                <Button className="mt-6" variant="glossy" onClick={() => router.replace("/dashboard")}>
                  Go to dashboard
                </Button>
              </>
            ) : (
              <>
                <XCircle className="mx-auto size-8 text-destructive" />
                <p className="mt-4 text-base font-semibold text-foreground">Invite not accepted</p>
                <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
                <Button className="mt-6" variant="surface" onClick={() => router.replace("/dashboard")}>
                  Back to dashboard
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
