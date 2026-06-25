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
import { testimonialSet } from "@/lib/testimonials"

type AuthMode = "sign-in" | "sign-up"

function AuthFallback() {
  return (
    <main className="ax-page-bg flex min-h-screen items-center justify-center px-4">
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
  const [emailLoading, setEmailLoading] = useState(false)
  const [testimonialIndex] = useState(() => Math.floor(Math.random() * testimonialSet.length))
  const testimonial = testimonialSet[testimonialIndex]

  useEffect(() => {
    if (!loading && user) {
      router.replace(nextPath)
    }
  }, [loading, nextPath, router, user])

  const emailRedirectTo = () => {
    if (typeof window === "undefined") return undefined
    return `${window.location.origin}/auth/confirm?next=${encodeURIComponent(nextPath)}`
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
    <main className="ax-page-bg min-h-screen text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[minmax(560px,1.08fr)_minmax(460px,0.92fr)]">
        <section className="flex min-h-screen flex-col px-6 py-6 sm:px-10 lg:px-16">
          <header className="flex items-center justify-between">
            <Link href="/" aria-label="AxLiner home" className="text-foreground">
              <AppLogo className="h-11 w-auto" />
            </Link>
            <Link
              href={isSignUp ? `/sign-in?next=${encodeURIComponent(nextPath)}` : `/sign-up?next=${encodeURIComponent(nextPath)}`}
              className="text-sm font-semibold text-foreground underline-offset-4 transition-colors hover:underline"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </Link>
          </header>

          <div className="mx-auto flex w-full max-w-[410px] flex-1 flex-col justify-center py-12">
            <div>
              <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-foreground">
                {isSignUp ? "Create your AxLiner account" : "Sign in to AxLiner"}
              </h1>

              <div className="mt-8 space-y-5">
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

                <form className="space-y-5" onSubmit={handleEmailSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[14px] font-semibold">
                      Email address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="name@company.com"
                      autoComplete="email"
                      className="h-12 rounded-lg border-black/15 bg-card text-[15px]"
                    />
                  </div>
                  <Button type="submit" className="h-12 w-full rounded-lg text-[15px] font-semibold" disabled={emailLoading}>
                    {emailLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isSignUp ? "Create account" : "Email me a secure link"}
                  </Button>
                </form>
              </div>

              <p className="mt-8 text-sm text-foreground">
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

        <aside className="ax-immersive-backdrop hidden min-h-screen border-l border-border text-white lg:flex">
          <Image
            src="/signin.png"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 46vw, 0vw"
            className="object-cover object-center"
          />
          <div className="ax-immersive-overlay" />
          <div className="relative z-10 mx-auto flex w-full max-w-[430px] flex-col justify-end px-10 py-16">
            <Image
              src={testimonial.avatar}
              alt={testimonial.name}
              width={64}
              height={64}
              className="h-16 w-16 rounded-full border border-white/35 object-cover shadow-lg"
            />

            <blockquote className="mt-7 max-w-[380px] text-lg font-semibold leading-snug tracking-normal text-white">
              "{testimonial.quote}"
            </blockquote>

            <div className="mt-5 border-t border-white/20 pt-4">
              <p className="text-sm font-semibold text-white">{testimonial.name}</p>
              <p className="mt-1 text-xs font-medium text-white/75">{testimonial.title}</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}

