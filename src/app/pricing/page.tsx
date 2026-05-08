"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { AppLogo } from "@/components/AppIcon"
import { CreditStack, PlanSwitch } from "@/components/BillingGlyphs"
import { GoogleSignInModal } from "@/components/GoogleSignInModal"
import { MobileNav } from "@/components/MobileNav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import { billingApi, type BillingPlan, type BillingPlanKey, type BillingStatusResponse } from "@/lib/api-client"
import { cn } from "@/lib/utils"

type BillingMode = "month" | "year"

const companyLogos = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const paidPlanKeys: BillingPlanKey[] = ["pro_monthly", "pro_yearly", "max_monthly", "max_yearly", "mega_monthly", "mega_yearly"]

const planBaseNames: Record<string, string> = {
  anonymous: "Free Trial",
  free: "Free Trial",
  pro: "Pro Plan",
  max: "Max Plan",
  mega: "Mega Plan",
}

const launchFreePlan: BillingPlan = {
  key: "free",
  checkout_key: null,
  name: "Free",
  plan: "anonymous",
  interval: "forever",
  price_cents: 0,
  price_formatted: "$0",
  currency: "USD",
  credits: 10,
  included_volume: "10 images",
  max_files_per_batch: 10,
  daily_image_limit: 10,
  max_file_size_mb: 10,
  annual_discount_percent: 0,
  checkout_available: false,
}

const launchPaidPlans: Record<BillingPlanKey, BillingPlan> = {
  pro_monthly: {
    key: "pro_monthly",
    checkout_key: "pro_monthly",
    name: "Pro",
    plan: "pro",
    interval: "month",
    price_cents: 700,
    price_formatted: "$7",
    currency: "USD",
    credits: 500,
    included_volume: "500 images",
    max_files_per_batch: 25,
    daily_image_limit: 500,
    max_file_size_mb: 10,
    annual_discount_percent: 0,
    checkout_available: false,
  },
  pro_yearly: {
    key: "pro_yearly",
    checkout_key: "pro_yearly",
    name: "Pro",
    plan: "pro",
    interval: "year",
    price_cents: 7000,
    price_formatted: "$70",
    currency: "USD",
    credits: 6000,
    included_volume: "6,000 images/year",
    max_files_per_batch: 25,
    daily_image_limit: 500,
    max_file_size_mb: 10,
    annual_discount_percent: 17,
    checkout_available: false,
  },
  max_monthly: {
    key: "max_monthly",
    checkout_key: "max_monthly",
    name: "Max",
    plan: "max",
    interval: "month",
    price_cents: 2000,
    price_formatted: "$20",
    currency: "USD",
    credits: 2000,
    included_volume: "2,000 images",
    max_files_per_batch: 50,
    daily_image_limit: 2000,
    max_file_size_mb: 10,
    annual_discount_percent: 0,
    checkout_available: false,
  },
  max_yearly: {
    key: "max_yearly",
    checkout_key: "max_yearly",
    name: "Max",
    plan: "max",
    interval: "year",
    price_cents: 19000,
    price_formatted: "$190",
    currency: "USD",
    credits: 24000,
    included_volume: "24,000 images/year",
    max_files_per_batch: 50,
    daily_image_limit: 2000,
    max_file_size_mb: 10,
    annual_discount_percent: 21,
    checkout_available: false,
  },
  mega_monthly: {
    key: "mega_monthly",
    checkout_key: "mega_monthly",
    name: "Mega",
    plan: "mega",
    interval: "month",
    price_cents: 5000,
    price_formatted: "$50",
    currency: "USD",
    credits: 7000,
    included_volume: "7,000 images",
    max_files_per_batch: 100,
    daily_image_limit: 7000,
    max_file_size_mb: 10,
    annual_discount_percent: 0,
    checkout_available: false,
  },
  mega_yearly: {
    key: "mega_yearly",
    checkout_key: "mega_yearly",
    name: "Mega",
    plan: "mega",
    interval: "year",
    price_cents: 53000,
    price_formatted: "$530",
    currency: "USD",
    credits: 84000,
    included_volume: "84,000 images/year",
    max_files_per_batch: 100,
    daily_image_limit: 7000,
    max_file_size_mb: 10,
    annual_discount_percent: 12,
    checkout_available: false,
  },
}

function imagesLabel(count: number) {
  return `${count.toLocaleString()} image${count === 1 ? "" : "s"}`
}

function normalizePlanCatalog(plans: BillingPlan[]) {
  const backendByKey = new Map(plans.map((plan) => [plan.key, plan]))
  const backendFree = backendByKey.get("free")
  const freePlan: BillingPlan = {
    ...launchFreePlan,
    checkout_available: false,
    credits: backendFree?.credits || launchFreePlan.credits,
    included_volume: backendFree?.included_volume || launchFreePlan.included_volume,
    max_files_per_batch: backendFree?.max_files_per_batch || launchFreePlan.max_files_per_batch,
    daily_image_limit: backendFree?.daily_image_limit || launchFreePlan.daily_image_limit,
    max_file_size_mb: backendFree?.max_file_size_mb || launchFreePlan.max_file_size_mb,
  }

  const paidPlans = paidPlanKeys.map((key) => {
    const backendPlan = backendByKey.get(key)
    return {
      ...launchPaidPlans[key],
      ...(backendPlan || {}),
      checkout_available: Boolean(backendPlan?.checkout_available),
    }
  })

  return [freePlan, ...paidPlans]
}

function planPresentation(plan: BillingPlan) {
  const monthlyAllowance =
    plan.interval === "year" && plan.credits > 0
      ? Math.round(plan.credits / 12)
      : plan.credits
  const baseName = planBaseNames[plan.plan] || `${plan.name.replace(/\s+Plan$/i, "")} Plan`
  const name = plan.interval === "year" && plan.checkout_key ? `${baseName} (Yearly)` : baseName
  const included =
    plan.checkout_key
      ? `${imagesLabel(monthlyAllowance)} / month`
      : imagesLabel(plan.credits)

  return { name, included }
}

function PricingFallback() {
  return (
    <main className="min-h-screen bg-[#E9ECE4]">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4">
        <div className="h-12 w-12 rounded-full border-4 border-[#d9c9fb] border-t-[#2f165e] animate-spin" />
      </div>
    </main>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={<PricingFallback />}>
      <PricingContent />
    </Suspense>
  )
}

function PricingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()
  const [billingMode, setBillingMode] = useState<BillingMode>("month")
  const [plans, setPlans] = useState<BillingPlan[]>([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [billingStatus, setBillingStatus] = useState<BillingStatusResponse | null>(null)
  const [signInOpen, setSignInOpen] = useState(false)
  const [signInRedirectPath, setSignInRedirectPath] = useState("/pricing")
  const [checkoutLoading, setCheckoutLoading] = useState<BillingPlanKey | null>(null)
  const [autoCheckoutStarted, setAutoCheckoutStarted] = useState(false)

  const checkoutStatus = searchParams.get("checkout_status") || searchParams.get("billing")

  useEffect(() => {
    let mounted = true
    billingApi.getPlans()
      .then((data) => {
        if (mounted) setPlans(data.plans || [])
      })
      .catch(() => {
        if (mounted) toast.error("Pricing is temporarily unavailable.")
      })
      .finally(() => {
        if (mounted) setPlansLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!user || loading) return
    billingApi.getStatus()
      .then(setBillingStatus)
      .catch(() => undefined)
  }, [user?.id, loading])

  useEffect(() => {
    if (checkoutStatus === "success") {
      toast.success("Checkout complete. Your plan will activate as soon as the webhook confirms it.")
    } else if (checkoutStatus === "cancelled" || checkoutStatus === "canceled") {
      toast.message("Checkout cancelled. No charge was made.")
    } else if (checkoutStatus === "pending") {
      toast.message("Subscription pending. Refresh billing settings in a moment.")
    }
  }, [checkoutStatus])

  const normalizedPlans = useMemo(() => normalizePlanCatalog(plans), [plans])

  const visiblePlans = useMemo(() => {
    const free = normalizedPlans.find((plan) => plan.key === "free")
    const pro = normalizedPlans.find((plan) => plan.plan === "pro" && plan.interval === billingMode)
    const max = normalizedPlans.find((plan) => plan.plan === "max" && plan.interval === billingMode)
    const mega = normalizedPlans.find((plan) => plan.plan === "mega" && plan.interval === billingMode)
    return [free, pro, max, mega].filter(Boolean) as BillingPlan[]
  }, [normalizedPlans, billingMode])

  const findCheckoutPlan = (planKey: BillingPlanKey) => {
    return normalizedPlans.find((plan) => plan.checkout_key === planKey)
  }

  const startCheckout = async (plan: BillingPlan) => {
    const checkoutKey = plan.checkout_key

    if (!checkoutKey) {
      if (!user && !loading) {
        setSignInRedirectPath("/dashboard/client")
        setSignInOpen(true)
        return
      }
      router.push("/dashboard/client")
      return
    }

    if (!user && !loading) {
      setSignInRedirectPath(`/pricing?checkout=${checkoutKey}`)
      setSignInOpen(true)
      return
    }

    if (!plan.checkout_available) {
      toast.error("Checkout is not configured yet.")
      return
    }

    setCheckoutLoading(checkoutKey)
    try {
      const checkout = await billingApi.createCheckout(checkoutKey)
      if (checkout.checkout_url) window.location.assign(checkout.checkout_url)
    } catch (error: any) {
      toast.error(error?.detail || "Checkout is not available yet.")
    } finally {
      setCheckoutLoading(null)
    }
  }

  useEffect(() => {
    const checkoutPlan = searchParams.get("checkout") as BillingPlanKey | null
    const isValid = paidPlanKeys.includes(checkoutPlan as BillingPlanKey)
    const plan = checkoutPlan ? findCheckoutPlan(checkoutPlan) : null

    if (!loading && user && checkoutPlan && isValid && plan && !autoCheckoutStarted) {
      setAutoCheckoutStarted(true)
      startCheckout(plan)
    }
  }, [normalizedPlans, searchParams, user?.id, loading, autoCheckoutStarted])

  const statusPanel = (() => {
    if (checkoutStatus === "success") {
      const isActive = billingStatus?.plan && billingStatus.plan !== "free"
      return {
        title: isActive ? "Subscription active" : "Subscription pending",
        text: isActive
          ? "Your plan and credits are active on your workspace."
          : "Checkout finished. Lemon Squeezy can take a moment to send the webhook, so your credits may appear shortly.",
        tone: "border-[#d8c7ff] bg-white/66",
      }
    }

    if (checkoutStatus === "cancelled" || checkoutStatus === "canceled") {
      return {
        title: "Checkout cancelled",
        text: "No charge was made. You can restart checkout whenever you are ready.",
        tone: "border-[#e8d7c3] bg-white/66",
      }
    }

    if (checkoutStatus === "pending") {
      return {
        title: "Subscription pending",
        text: "Billing is being confirmed. Keep using the current plan until the webhook updates your workspace.",
        tone: "border-[#d8c7ff] bg-white/66",
      }
    }

    return null
  })()
  const isFreeAccount = Boolean(user && billingStatus?.plan === "free")
  const accountCredits = billingStatus?.credits?.available_credits ?? 0

  return (
    <main className="min-h-screen overflow-hidden bg-[#E9ECE4]">
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-[35px] border border-black/10 bg-neutral-100/55 p-2 shadow-[0_18px_45px_rgba(20,20,20,0.08)] ring-1 ring-white/35 backdrop-blur-2xl lg:p-3">
          <Link href="/" aria-label="AxLiner home">
            <AppLogo />
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            <Link className="rounded-full px-4 py-2 text-sm font-semibold text-black hover:bg-white/50" href="/#features">
              Solutions
            </Link>
            <Link className="rounded-full bg-white/60 px-4 py-2 text-sm font-semibold text-[#2f165e]" href="/pricing">
              Pricing
            </Link>
            <Link className="rounded-full px-4 py-2 text-sm font-semibold text-black hover:bg-white/50" href="/blogs">
              Blogs
            </Link>
            <Link className="rounded-full px-4 py-2 text-sm font-semibold text-black hover:bg-white/50" href="/#benchmarks">
              Benchmarks
            </Link>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            {user ? (
              <Button
                className="rounded-full bg-[#2f165e] px-5 font-semibold text-white hover:bg-[#24104b]"
                onClick={() => router.push("/dashboard")}
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="rounded-full border-[#d9c9fb] bg-white/65 px-5 font-semibold"
                  onClick={() => {
                    setSignInRedirectPath("/dashboard")
                    setSignInOpen(true)
                  }}
                >
                  Sign in
                </Button>
                <Button
                  className="rounded-full bg-[#2f165e] px-5 font-semibold text-white hover:bg-[#24104b]"
                  onClick={() => {
                    setSignInRedirectPath("/dashboard/client")
                    setSignInOpen(true)
                  }}
                >
                  Sign up
                </Button>
              </>
            )}
          </div>
          <MobileNav />
        </nav>

        <div className="mx-auto mt-14 max-w-4xl text-center">
          <h1 className="mx-auto text-6xl font-semibold leading-none tracking-normal text-foreground sm:text-7xl lg:text-8xl">
            Pricing
          </h1>

          {!user && !loading && (
            <div className="mx-auto mt-8 inline-flex flex-wrap items-center justify-center gap-3 rounded-[24px] border border-[#e5d9fb] bg-white/64 px-5 py-3 text-sm font-semibold text-black shadow-[0_18px_45px_rgba(47,22,94,0.08)] backdrop-blur-xl">
              <span>Create a free account to get <span className="text-[#2f165e]">10 credits</span>.</span>
              <Button
                size="sm"
                className="rounded-full bg-[#2f165e] px-5 text-white hover:bg-[#24104b]"
                onClick={() => {
                  setSignInRedirectPath("/dashboard/client")
                  setSignInOpen(true)
                }}
              >
                Create account
              </Button>
            </div>
          )}

          {isFreeAccount && (
            <div className="mx-auto mt-8 flex max-w-xl flex-wrap items-center justify-center gap-4 rounded-[28px] border border-[#e5d9fb] bg-white/68 px-5 py-4 shadow-[0_20px_55px_rgba(47,22,94,0.10)] backdrop-blur-xl">
              <CreditStack className="h-8 w-8 text-[#2f165e]" />
              <div className="text-left">
                <p className="text-2xl font-semibold text-[#2f165e]">{accountCredits.toLocaleString()}</p>
                <p className="text-sm font-semibold text-[#6b7280]">credits left</p>
              </div>
              <Button
                className="rounded-full bg-[#2f165e] px-6 text-white hover:bg-[#24104b]"
                onClick={() => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth", block: "start" })}
              >
                Upgrade
              </Button>
            </div>
          )}

          <div className="mt-7 inline-flex rounded-[18px] border border-[#e6dbff] bg-white/58 p-1 shadow-[0_16px_45px_rgba(68,31,132,0.10)] backdrop-blur">
            {(["month", "year"] as BillingMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setBillingMode(mode)}
                className={cn(
                  "rounded-[14px] px-6 py-2 text-sm font-bold transition",
                  billingMode === mode
                    ? "bg-[#2f165e] text-white shadow-[0_10px_28px_rgba(68,31,132,0.24)]"
                    : "text-[#5d4a83] hover:bg-white/70"
                )}
              >
                {mode === "month" ? "Monthly" : "Annual"}
              </button>
            ))}
          </div>
        </div>

        {statusPanel && (
          <div className={cn("mx-auto mt-8 max-w-4xl rounded-[24px] border p-5 text-center shadow-[0_18px_55px_rgba(68,31,132,0.08)] backdrop-blur-xl", statusPanel.tone)}>
            <p className="text-base font-black text-[#2f165e]">{statusPanel.title}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{statusPanel.text}</p>
          </div>
        )}

        <div id="plans" className="mx-auto mt-20 grid max-w-[1500px] gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plansLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="h-[570px] rounded-[30px] border-[#ded3f4] bg-white/48 shadow-[0_24px_70px_rgba(30,18,57,0.08)] backdrop-blur-xl">
                  <CardContent className="h-full animate-pulse p-7">
                    <div className="h-5 w-24 rounded-full bg-[#eadfff]" />
                    <div className="mt-10 h-12 w-36 rounded-2xl bg-[#eadfff]" />
                    <div className="mt-8 h-24 rounded-[22px] bg-[#eadfff]/70" />
                    <div className="mt-8 h-12 rounded-2xl bg-[#eadfff]" />
                  </CardContent>
                </Card>
              ))
            : visiblePlans.map((plan) => {
                const isPaid = Boolean(plan.checkout_key)
                const isLoading = Boolean(plan.checkout_key && checkoutLoading === plan.checkout_key)
                const isPopular = plan.plan === "max"
                const presentation = planPresentation(plan)
                const intervalLabel =
                  plan.interval === "year"
                    ? "per year"
                    : plan.interval === "month"
                      ? "per month"
                      : "forever"
                const features = [
                  plan.plan === "anonymous"
                    ? { value: "10", label: "credits after account creation" }
                    : { value: presentation.included, label: "available in this plan" },
                  { value: `${plan.max_files_per_batch}`, label: "files per batch" },
                  { value: `${plan.max_file_size_mb}MB`, label: "max file size" },
                  plan.plan === "anonymous"
                    ? { value: "Free", label: "trial access before upgrade" }
                    : { value: "Completed", label: "images charge credits only after success" },
                ]

                return (
                  <Card
                    key={plan.key}
                    className={cn(
                      "relative overflow-visible rounded-[30px] border-[#ded3f4] bg-white/70 shadow-[0_18px_55px_rgba(30,18,57,0.07)] backdrop-blur-xl",
                      isPopular && "border-[#2f165e] bg-white/82 shadow-[0_24px_70px_rgba(68,31,132,0.14)]"
                    )}
                  >
                    {isPopular && (
                      <div className="absolute -top-4 right-5 rounded-[12px] bg-[#151216] px-4 py-2 text-xs font-bold text-white shadow-lg">
                        Most popular
                      </div>
                    )}
                    {plan.annual_discount_percent > 0 && (
                      <div className="absolute -top-4 left-5 rounded-[12px] bg-[#2f165e] px-4 py-2 text-xs font-bold text-white shadow-lg">
                        Save {plan.annual_discount_percent}%
                      </div>
                    )}
                    <CardContent className="p-0">
                      <div className="p-7">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xl font-semibold text-foreground">{presentation.name}</p>
                          </div>
                          {plan.plan === "mega" ? <PlanSwitch className="h-7 w-7 text-[#2f165e]" /> : <CreditStack className="h-7 w-7 text-[#2f165e]" />}
                        </div>
                        <div className="mt-10 flex items-end gap-3">
                          <span className="text-5xl font-semibold tracking-normal text-[#2f165e]">{plan.price_formatted}</span>
                          <span className="pb-1.5 text-sm font-semibold text-[#6b7280]">{intervalLabel}</span>
                        </div>
                        <div className="mt-8 rounded-[22px] bg-[#2f165e] p-5 text-white shadow-[0_16px_40px_rgba(47,22,94,0.18)]">
                          <p className="text-3xl font-semibold">{presentation.included}</p>
                        </div>
                        <Button
                          className={cn(
                            "mt-8 h-14 w-full rounded-[18px] text-base font-bold",
                            isPopular
                              ? "bg-[#2f165e] text-white hover:bg-[#24104b]"
                              : "bg-[#151216] text-white hover:bg-[#2f165e]"
                          )}
                          disabled={Boolean(isLoading || (isPaid && !plan.checkout_available))}
                          onClick={() => startCheckout(plan)}
                        >
                          {isLoading
                            ? "Opening checkout..."
                            : isPaid && !plan.checkout_available
                              ? "Checkout setup pending"
                              : isPaid
                                ? "Get started"
                                : "Start free"}
                        </Button>
                      </div>

                      <div className="border-t border-[#ece5fb] p-7">
                        <ul className="space-y-4">
                          {features.map((feature) => (
                            <li key={`${feature.value}-${feature.label}`} className="flex items-baseline gap-3 text-[15px] leading-6">
                              <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#2f165e]" />
                              <span className="font-semibold text-[#2f165e]">{feature.value}</span>
                              <span className="text-[#6b7280]">{feature.label}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
        </div>

        <section className="mx-auto mt-16 max-w-6xl overflow-hidden">
          <div className="relative z-10 overflow-hidden">
            <div
              className="flex items-center gap-8"
              style={{
                animation: "scroll-left 60s linear infinite",
                width: "max-content",
                willChange: "transform",
              }}
            >
              {Array.from({ length: 10 }, (_, setIndex) =>
                companyLogos.map((imgNum) => (
                  <Card
                    key={`${setIndex}-${imgNum}`}
                    className="h-[80px] w-[120px] flex-shrink-0 border border-[#ded3f4] bg-white shadow-[0_14px_35px_rgba(68,31,132,0.08)] transition-all duration-300 hover:border-[#A78BFA]/50 hover:shadow-md"
                  >
                    <CardContent className="flex h-full w-full items-center justify-center p-2">
                      <img
                        src={`/${imgNum}.jpeg`}
                        alt={`Company ${imgNum}`}
                        className="h-[60px] w-[100px] object-contain opacity-70 grayscale transition-opacity duration-300 hover:opacity-100 hover:grayscale-0"
                      />
                    </CardContent>
                  </Card>
                ))
              ).flat()}
            </div>
          </div>
        </section>
      </section>

      <GoogleSignInModal open={signInOpen} onOpenChange={setSignInOpen} redirectPath={signInRedirectPath} />
    </main>
  )
}
