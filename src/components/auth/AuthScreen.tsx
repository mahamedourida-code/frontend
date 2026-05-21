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
      "AxLiner gives our bookkeeping team clean Excel files from handwritten expense sheets before month-end review starts.",
    name: "Mara Ellis",
    title: "Senior Bookkeeper, Ledger North",
    avatar: "/testimonials/alex_finn.jpg",
  },
  {
    quote:
      "We upload paper invoices and field notes in one batch, then review the spreadsheet instead of rebuilding every row.",
    name: "Daniel Rowe",
    title: "Accounting Operations Lead",
    avatar: "/testimonials/jon_myers.jpg",
  },
  {
    quote:
      "For bank statement photos and handwritten logs, the team starts from structured rows instead of a blank workbook.",
    name: "Nadia Clarke",
    title: "Payroll & Reconciliation Manager",
    avatar: "/testimonials/catalin.jpg",
  },
  {
    quote:
      "The biggest win is review speed. Assistants send us corrected spreadsheets, not screenshots and manual notes.",
    name: "Oliver Grant",
    title: "Bookkeeping Partner, Northline Books",
    avatar: "/testimonials/tom_dorr.jpg",
  },
]

const floatingAvatarPositions = [
  "left-[12%] top-[14%] h-16 w-16",
  "right-[18%] top-[18%] h-12 w-12",
  "left-[18%] bottom-[18%] h-12 w-12",
  "right-[13%] bottom-[20%] h-16 w-16",
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

  const oauthRedirectTo = () => {
    if (typeof window === "undefined") return undefined
    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`
  }

  const emailRedirectTo = () => {
    if (typeof window === "undefined") return undefined
    return `${window.location.origin}/auth/confirm?next=${encodeURIComponent(nextPath)}`
  }

  const handleOAuthSignIn = async (provider: Provider) => {
    setError("")
    setNotice("")
    setProviderLoading(provider)

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: oauthRedirectTo(),
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
        emailRedirectTo: emailRedirectTo(),
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
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[minmax(480px,0.92fr)_minmax(520px,1.08fr)]">
        <section className="flex min-h-screen flex-col px-6 py-6 sm:px-10 lg:px-14">
          <header className="flex items-center justify-between">
            <Link href="/" aria-label="AxLiner home" className="text-foreground">
              <AppLogo className="h-8 w-auto" />
            </Link>
            <Link
              href={isSignUp ? `/sign-in?next=${encodeURIComponent(nextPath)}` : `/sign-up?next=${encodeURIComponent(nextPath)}`}
              className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </Link>
          </header>

          <div className="mx-auto flex w-full max-w-[410px] flex-1 flex-col justify-center py-12">
            <div>
              <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
                {isSignUp ? "Create your AxLiner account" : "Sign in to AxLiner"}
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {isSignUp
                  ? "Start converting handwritten paperwork into review-ready Excel files."
                  : "Continue to your batch conversion workspace."}
              </p>

              <div className="mt-8 space-y-4">
                <OAuthButton provider="google" loading={providerLoading} disabled={emailLoading} onClick={handleOAuthSignIn} />

                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-background px-3 font-semibold uppercase tracking-[0.16em] text-muted-foreground">or</span>
                  </div>
                </div>

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

                <form className="space-y-4" onSubmit={handleEmailSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">
                      Email address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="name@company.com"
                      autoComplete="email"
                      className="h-12 rounded-md bg-card"
                    />
                  </div>
                  <Button type="submit" className="h-12 w-full rounded-md font-semibold" disabled={emailLoading || providerLoading !== null}>
                    {emailLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isSignUp ? "Create account" : "Email me a secure link"}
                  </Button>
                </form>
              </div>

              <p className="mt-7 text-sm text-muted-foreground">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <Link
                  href={isSignUp ? `/sign-in?next=${encodeURIComponent(nextPath)}` : `/sign-up?next=${encodeURIComponent(nextPath)}`}
                  className="font-semibold text-foreground underline underline-offset-4"
                >
                  {isSignUp ? "Sign in" : "Sign up"}
                </Link>
              </p>
            </div>
          </div>
        </section>

        <aside className="relative hidden min-h-screen overflow-hidden border-l border-border bg-primary text-primary-foreground lg:flex">
          <div className="absolute inset-0 opacity-25">
            <div className="absolute left-[12%] top-[18%] h-40 w-40 rounded-full border border-current" />
            <div className="absolute right-[14%] top-[28%] h-72 w-72 rounded-full border border-current" />
            <div className="absolute bottom-[14%] left-[20%] h-56 w-56 rounded-full border border-current" />
          </div>

          {testimonialSet.map((item, index) => (
            <Image
              key={item.name}
              src={item.avatar}
              alt=""
              width={96}
              height={96}
              className={`absolute rounded-full border-4 border-background object-cover shadow-lg ${floatingAvatarPositions[index]}`}
            />
          ))}

          <div className="relative z-10 mx-auto flex w-full max-w-[560px] flex-col justify-center px-12 py-16">
            <div className="mb-12 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-current/30 bg-background/20">
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  width={44}
                  height={44}
                  className="h-10 w-10 rounded-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-semibold">{testimonial.name}</p>
                <p className="text-xs font-medium opacity-75">{testimonial.title}</p>
              </div>
            </div>

            <blockquote className="text-4xl font-semibold leading-tight tracking-normal">
              "{testimonial.quote}"
            </blockquote>

            <div className="mt-12 flex gap-2">
              {testimonialSet.slice(0, 3).map((item) => (
                <span
                  key={item.name}
                  className={`h-2.5 rounded-full bg-current ${item.name === testimonial.name ? "w-8 opacity-95" : "w-2.5 opacity-45"}`}
                />
              ))}
            </div>
          </div>
        </aside>
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
      className="h-12 w-full rounded-md border-border bg-card font-semibold"
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
