"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { AppLogo } from "@/components/AppIcon"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"
import { createClient } from "@/utils/supabase/client"

type AuthMode = "sign-in" | "sign-up"
type Provider = "google"

const testimonialSet = [
  {
    quote:
      "We clear handwritten expense sheets and supplier notes before close without rebuilding every row manually.",
    name: "Mara Ellis",
    title: "Senior Bookkeeper, Ledger North",
    avatar: "/testimonials/alex_finn.jpg",
    features: ["Month-end review", "Receipt batches", "Cleaner Excel"],
  },
  {
    quote:
      "The useful part is speed. Our team uploads the paper stack, reviews the tables, then sends corrected workbooks to accounting.",
    name: "Daniel Rowe",
    title: "Accounting Operations Lead",
    avatar: "/testimonials/jon_myers.jpg",
    features: ["Batch intake", "Audit trail", "Spreadsheet handoff"],
  },
  {
    quote:
      "For bank statement photos and handwritten logs, AxLiner gives our reviewers a structured starting point instead of a blank spreadsheet.",
    name: "Nadia Clarke",
    title: "Payroll & Reconciliation Manager",
    avatar: "/testimonials/catalin.jpg",
    features: ["Bank statements", "Manual notes", "Review workflow"],
  },
]

const trustItems = [
  { value: "30", label: "free account credits" },
  { value: "3", label: "trial runs before signup" },
  { value: "xlsx", label: "review-ready output" },
]

function AuthFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary" />
    </main>
  )
}

export function AuthScreen({ mode }: { mode: AuthMode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()
  const supabase = createClient()
  const isSignUp = mode === "sign-up"

  const nextPath = useMemo(() => {
    const next = searchParams.get("next")
    return next?.startsWith("/") ? next : "/dashboard/client"
  }, [searchParams])

  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [providerLoading, setProviderLoading] = useState<Provider | null>(null)
  const [emailLoading, setEmailLoading] = useState(false)
  const testimonial = testimonialSet[isSignUp ? 1 : 0]

  useEffect(() => {
    if (!loading && user) {
      router.replace(nextPath)
    }
  }, [loading, nextPath, router, user])

  const redirectTo = () => {
    if (typeof window === "undefined") return undefined
    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`
  }

  const handleOAuthSignIn = async (provider: Provider) => {
    setError("")
    setNotice("")
    setProviderLoading(provider)

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectTo(),
      },
    })

    if (error) {
      setProviderLoading(null)
      setError(error.message)
      toast.error(isSignUp ? "Sign up failed" : "Sign in failed", { description: error.message })
    }
  }

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail) {
      setError("Enter your work email to continue.")
      return
    }

    setError("")
    setNotice("")
    setEmailLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: redirectTo(),
        shouldCreateUser: isSignUp,
      },
    })

    setEmailLoading(false)

    if (error) {
      setError(error.message)
      toast.error("Email link failed", { description: error.message })
      return
    }

    setNotice(`Check ${normalizedEmail} for your secure AxLiner sign-in link.`)
    toast.success("Check your email", {
      description: "Open the secure link to continue to your workspace.",
    })
  }

  if (loading) return <AuthFallback />

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-[1180px] flex-col">
        <header className="flex items-center justify-between">
          <Link href="/" aria-label="AxLiner home" className="text-foreground">
            <AppLogo className="h-8 w-auto" />
          </Link>
          <Button asChild variant="ghost" className="rounded-md px-4 text-sm font-semibold">
            <Link href={isSignUp ? `/sign-in?next=${encodeURIComponent(nextPath)}` : `/sign-up?next=${encodeURIComponent(nextPath)}`}>
              {isSignUp ? "Sign in" : "Create account"}
            </Link>
          </Button>
        </header>

        <section className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.78fr)] lg:gap-14">
          <aside className="hidden lg:block">
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Built for spreadsheet operators
              </p>
              <blockquote className="mt-7 text-3xl font-semibold leading-tight tracking-normal text-foreground">
                "{testimonial.quote}"
              </blockquote>

              <div className="mt-7 flex items-center gap-4">
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  width={54}
                  height={54}
                  className="h-14 w-14 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">{testimonial.title}</p>
                </div>
              </div>

              <div className="mt-9">
                <p className="text-sm font-semibold text-muted-foreground">Favorite workflow gains</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {testimonial.features.map((feature) => (
                    <span key={feature} className="rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold shadow-sm">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
                {trustItems.map((item) => (
                  <div key={item.label} className="rounded-md border border-border bg-card p-4 shadow-sm">
                    <p className="text-2xl font-semibold text-foreground">{item.value}</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className="mx-auto w-full max-w-[430px]">
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
              <div className="text-center">
                <div className="mx-auto mb-7 flex h-11 w-fit items-center rounded-md border border-border bg-background px-4 shadow-sm">
                  <AppLogo className="h-7 w-auto" />
                </div>
                <h1 className="text-2xl font-semibold tracking-normal text-foreground">
                  {isSignUp ? "Create your AxLiner workspace" : "Welcome back"}
                </h1>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {isSignUp
                    ? "Start with email or Google. No password to remember."
                    : "Sign in with email or Google to continue your batch conversions."}
                </p>
              </div>

              <div className="mt-7 space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {notice && (
                  <Alert className="border-primary/30 bg-primary/10 text-foreground">
                    <AlertDescription>{notice}</AlertDescription>
                  </Alert>
                )}

                <form className="space-y-3" onSubmit={handleEmailSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="name@company.com"
                      autoComplete="email"
                      className="h-12 rounded-md bg-background"
                    />
                  </div>
                  <Button type="submit" className="h-11 w-full rounded-md font-semibold" disabled={emailLoading || providerLoading !== null}>
                    {emailLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isSignUp ? "Create account with email" : "Email me a secure link"}
                  </Button>
                </form>

                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-3 font-semibold tracking-[0.16em] text-muted-foreground">or</span>
                  </div>
                </div>

                <OAuthButton provider="google" loading={providerLoading} disabled={emailLoading} onClick={handleOAuthSignIn} />
              </div>

              <p className="mt-7 text-center text-sm text-muted-foreground">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <Link
                  href={isSignUp ? `/sign-in?next=${encodeURIComponent(nextPath)}` : `/sign-up?next=${encodeURIComponent(nextPath)}`}
                  className="font-semibold text-foreground underline underline-offset-4"
                >
                  {isSignUp ? "Sign in" : "Sign up"}
                </Link>
              </p>
            </div>

            <div className="mt-5 rounded-md border border-border bg-card/70 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                <p className="text-sm leading-6 text-muted-foreground">
                  {isSignUp
                    ? "Create a free account to get 30 credits, saved batches, and reload-safe downloads."
                    : "Your files, credits, and previous batches stay tied to your workspace after sign in."}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function OAuthButton({
  provider,
  loading,
  disabled,
  onClick,
}: {
  provider: Provider
  loading: Provider | null
  disabled?: boolean
  onClick: (provider: Provider) => void
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className="h-12 w-full rounded-md border-border bg-background font-semibold"
      disabled={disabled || loading !== null}
      onClick={() => onClick(provider)}
    >
      {loading === provider ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleMark />}
      Continue with Google
    </Button>
  )
}

function GoogleMark() {
  return (
    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}
