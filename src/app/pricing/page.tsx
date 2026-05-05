"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { AppIcon } from "@/components/AppIcon"
import { BillingSeal, CreditStack, PlanSwitch } from "@/components/BillingGlyphs"
import { GoogleSignInModal } from "@/components/GoogleSignInModal"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import { billingApi, type BillingPlan, type BillingPlanKey, type BillingStatusResponse } from "@/lib/api-client"
import { cn } from "@/lib/utils"

type BillingMode = "month" | "year"

const companyLogos = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const paidPlanKeys: BillingPlanKey[] = ["pro_monthly", "pro_yearly", "business_monthly", "business_yearly"]

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

  const visiblePlans = useMemo(() => {
    const free = plans.find((plan) => plan.key === "free")
    const pro = plans.find((plan) => plan.plan === "pro" && plan.interval === billingMode)
    const business = plans.find((plan) => plan.plan === "enterprise" && plan.interval === billingMode)
    return [free, pro, business].filter(Boolean) as BillingPlan[]
  }, [plans, billingMode])

  const findCheckoutPlan = (planKey: BillingPlanKey) => {
    return plans.find((plan) => plan.checkout_key === planKey)
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
  }, [plans, searchParams, user?.id, loading, autoCheckoutStarted])

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

  return (
    <main className="min-h-screen overflow-hidden bg-[#E9ECE4]">
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-[28px] border border-[#eadfff] bg-[#E9ECE4]/90 px-4 py-3 shadow-[0_18px_55px_rgba(68,31,132,0.10)] backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#eadfff] bg-white/65">
              <AppIcon size={28} />
            </span>
            <span className="text-lg font-black text-foreground">AxLiner</span>
          </Link>
          <Button
            variant="outline"
            className="rounded-2xl border-[#d9c9fb] bg-white/65"
            onClick={() => router.push(user ? "/dashboard/settings?section=billing" : "/")}
          >
            {user ? "Billing settings" : "Try it"}
          </Button>
        </nav>

        <div className="mx-auto mt-10 max-w-4xl text-center">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-[#eadfff] bg-white/60 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#5d3d91] backdrop-blur">
            <BillingSeal className="h-4 w-4" />
            Pricing
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-black leading-[1.04] tracking-tight text-foreground sm:text-5xl">
            Pick the page volume that matches your batch workflow.
          </h1>

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

        <div className="mx-auto mt-12 grid max-w-6xl gap-5 lg:grid-cols-3">
          {plansLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="h-[520px] rounded-[28px] border-[#ded3f4] bg-white/48 shadow-[0_24px_70px_rgba(30,18,57,0.08)] backdrop-blur-xl">
                  <CardContent className="h-full animate-pulse p-6">
                    <div className="h-5 w-24 rounded-full bg-[#eadfff]" />
                    <div className="mt-10 h-12 w-36 rounded-2xl bg-[#eadfff]" />
                    <div className="mt-8 h-24 rounded-[22px] bg-[#eadfff]/70" />
                    <div className="mt-8 h-12 rounded-2xl bg-[#eadfff]" />
                  </CardContent>
                </Card>
              ))
            : visiblePlans.map((plan) => {
                const isPaid = Boolean(plan.checkout_key)
                const isLoading = checkoutLoading === plan.checkout_key
                const isPopular = plan.plan === "pro"
                const intervalLabel =
                  plan.interval === "year"
                    ? "per year"
                    : plan.interval === "month"
                      ? "per month"
                      : "forever"
                const features = [
                  plan.included_volume,
                  `${plan.max_files_per_batch} files per batch`,
                  `${plan.max_file_size_mb}MB max file size`,
                  plan.plan === "anonymous"
                    ? "No account needed for the trial"
                    : `${plan.daily_image_limit.toLocaleString()} daily image limit`,
                ]

                return (
                  <Card
                    key={plan.key}
                    className={cn(
                      "relative overflow-visible rounded-[28px] border-[#ded3f4] bg-white/72 shadow-[0_24px_70px_rgba(30,18,57,0.08)] backdrop-blur-xl",
                      isPopular && "border-[#2f165e] shadow-[0_30px_90px_rgba(68,31,132,0.16)]"
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
                      <div className="border-b border-[#ece5fb] p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-black text-foreground">{plan.name}</p>
                            <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-[#7c62b1]">
                              {plan.interval === "year" ? "Annual plan" : plan.interval === "month" ? "Monthly plan" : "Trial"}
                            </p>
                          </div>
                          <div className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-[#e6dbff] bg-white/70 text-[#2f165e]">
                            {plan.plan === "enterprise" ? <PlanSwitch className="h-5 w-5" /> : <CreditStack className="h-5 w-5" />}
                          </div>
                        </div>
                        <div className="mt-5 flex items-end gap-2">
                          <span className="text-5xl font-black tracking-tight text-foreground">{plan.price_formatted}</span>
                          <span className="pb-2 text-sm font-bold text-muted-foreground">{intervalLabel}</span>
                        </div>
                        <div className="mt-5 rounded-[22px] bg-white/55 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_14px_34px_rgba(68,31,132,0.07)] backdrop-blur">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-black uppercase tracking-[0.16em] text-[#7c62b1]">Included volume</span>
                            <span className="h-2.5 w-2.5 rounded-full bg-[#2f165e]" />
                          </div>
                          <p className="mt-2 text-2xl font-black text-[#2f165e]">{plan.included_volume}</p>
                        </div>
                        <Button
                          className={cn(
                            "mt-6 h-12 w-full rounded-[16px] font-bold",
                            isPopular
                              ? "bg-[#151216] text-white hover:bg-[#2f165e]"
                              : "bg-[#f1eee9] text-[#151216] hover:bg-[#e7e1d9]"
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

                      <div className="p-6">
                        <div className="mb-4 flex items-center gap-2">
                          {isPaid ? <CreditStack className="h-5 w-5 text-[#2f165e]" /> : <BillingSeal className="h-5 w-5 text-[#2f165e]" />}
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-foreground">Plan limits</p>
                        </div>
                        <ul className="space-y-3">
                          {features.map((feature) => (
                            <li key={feature} className="flex items-center gap-3 text-sm">
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#151216] text-[11px] font-black text-white">
                                <span className="h-2 w-2 rounded-full bg-white" />
                              </span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
        </div>

        <section className="mx-auto mt-14 max-w-6xl overflow-hidden">
          <div className="mb-6 text-center">
            <p className="text-sm font-semibold text-muted-foreground">Chosen by experts at top organizations</p>
          </div>
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
                    className="h-[80px] w-[120px] flex-shrink-0 border border-[#ded3f4] bg-white/78 shadow-[0_14px_35px_rgba(68,31,132,0.08)] transition-all duration-300 hover:border-[#A78BFA]/50 hover:shadow-md"
                  >
                    <CardContent className="flex h-full w-full items-center justify-center p-2">
                      <img
                        src={`/${imgNum}.jpeg`}
                        alt={`Company ${imgNum}`}
                        className="h-[60px] w-[100px] object-contain opacity-60 grayscale transition-opacity duration-300 hover:opacity-100 hover:grayscale-0"
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
