"use client"

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { AppIcon } from "@/components/AppIcon"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/useAuth"
import { signInWithPassword } from "@/lib/auth-helpers"
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client"

type Provider = "google" | "github" | "facebook"

function AuthFallback() {
  return (
    <main className="ax-page-bg flex min-h-screen items-center justify-center px-4">
      <div className="h-12 w-12 rounded-full border-4 border-[#d9c9fb] border-t-[#2f165e] animate-spin" />
    </main>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <SignInContent />
    </Suspense>
  )
}

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()
  const supabase = createClient()

  const nextPath = useMemo(() => {
    const next = searchParams.get("next")
    return next?.startsWith("/") ? next : "/dashboard/client"
  }, [searchParams])

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [providerLoading, setProviderLoading] = useState<Provider | null>(null)

  useEffect(() => {
    if (!loading && user) {
      router.replace(nextPath)
    }
  }, [loading, user, router, nextPath])

  const handlePasswordSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      await signInWithPassword(email.trim(), password)
      router.replace(nextPath)
      router.refresh()
    } catch (err: any) {
      const message = err?.message || "Could not sign in. Check your email and password."
      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleOAuthSignIn = async (provider: Provider) => {
    setError("")
    setProviderLoading(provider)

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    })

    if (error) {
      setProviderLoading(null)
      setError(error.message)
      toast.error("Sign in failed", { description: error.message })
    }
  }

  return (
    <main className="ax-page-bg min-h-screen px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <Card className="w-full max-w-[440px] overflow-hidden rounded-[28px] border border-[#eadfff] bg-white/72 shadow-[0_26px_90px_rgba(68,31,132,0.12)] backdrop-blur-xl">
          <CardContent className="p-6 sm:p-8">
            <Link href="/" className="mb-8 flex items-center justify-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#eadfff] bg-white/75">
                <AppIcon size={30} />
              </span>
              <span className="text-xl font-black text-foreground">AxLiner</span>
            </Link>

            <div className="mb-7 text-center">
              <h1 className="text-2xl font-black text-foreground">Sign in</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Continue to your conversions, history, and billing.
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-5">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form className="space-y-4" onSubmit={handlePasswordSignIn}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="h-12 rounded-2xl border-[#eadfff] bg-white/65"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-xs font-semibold text-[#2f165e] hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="h-12 rounded-2xl border-[#eadfff] bg-white/65"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting || providerLoading !== null}
                className="h-12 w-full rounded-2xl bg-[#2f165e] font-bold text-white hover:bg-[#24114a]"
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign in
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">or</span>
              <Separator className="flex-1" />
            </div>

            <div className="space-y-3">
              <OAuthButton provider="google" loading={providerLoading} onClick={handleOAuthSignIn} />
              <OAuthButton provider="github" loading={providerLoading} onClick={handleOAuthSignIn} />
              <OAuthButton provider="facebook" loading={providerLoading} onClick={handleOAuthSignIn} />
            </div>

            <p className="mt-7 text-center text-sm text-muted-foreground">
              New to AxLiner?{" "}
              <Link href={`/sign-up?next=${encodeURIComponent(nextPath)}`} className="font-bold text-[#2f165e] hover:underline">
                Create an account
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

function OAuthButton({
  provider,
  loading,
  onClick,
}: {
  provider: Provider
  loading: Provider | null
  onClick: (provider: Provider) => void
}) {
  const labels: Record<Provider, string> = {
    google: "Continue with Google",
    github: "Continue with GitHub",
    facebook: "Continue with Facebook",
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="h-12 w-full rounded-2xl border-[#eadfff] bg-white/65 font-semibold"
      disabled={loading !== null}
      onClick={() => onClick(provider)}
    >
      {loading === provider ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ProviderMark provider={provider} />}
      {labels[provider]}
    </Button>
  )
}

function ProviderMark({ provider }: { provider: Provider }) {
  if (provider === "google") {
    return (
      <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
    )
  }

  return (
    <span
      className={cn(
        "mr-2 flex h-5 w-5 items-center justify-center rounded-full text-xs font-black",
        provider === "github" ? "bg-[#151216] text-white" : "bg-[#1877F2] text-white"
      )}
      aria-hidden="true"
    >
      {provider === "github" ? "G" : "f"}
    </span>
  )
}
