"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { AppIcon } from "@/components/AppIcon"
import { BillingSeal, CreditStack, PlanSwitch } from "@/components/BillingGlyphs"
import { GoogleSignInModal } from "@/components/GoogleSignInModal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import { billingApi, type BillingPlanKey } from "@/lib/api-client"
import { cn } from "@/lib/utils"

type BillingMode = "monthly" | "annual"

const plans: Array<{
  name: string
  eyebrow: string
  price: string
  cadence: string
  pages: string
  detail: string
  features: Array<{ text: string; muted?: boolean }>
  planKey?: BillingPlanKey
  popular?: boolean
}> = [
  {
    name: "Free",
    eyebrow: "Start",
    price: "$0",
    cadence: "forever",
    pages: "Live free limit",
    detail: "Try the workflow before upgrading.",
    features: [
      { text: "Use the current backend free limits" },
      { text: "Single-user workspace" },
      { text: "Download Excel results" },
      { text: "Billing portal not required", muted: true },
    ],
  },
  {
    name: "Pro",
    eyebrow: "Best for operators",
    price: "$5",
    cadence: "per month",
    pages: "1,000 pages",
    detail: "For repeat document batches and weekly processing.",
    planKey: "pro_monthly",
    popular: true,
    features: [
      { text: "More batch capacity" },
      { text: "Monthly credit renewal" },
      { text: "Saved billing portal" },
      { text: "Verified webhook plan sync" },
    ],
  },
  {
    name: "Business",
    eyebrow: "Heavy workflows",
    price: "$25",
    cadence: "per month",
    pages: "5,000 pages",
    detail: "For larger batches and higher processing volume.",
    planKey: "business_monthly",
    features: [
      { text: "Highest launch credit pool" },
      { text: "Business workspace limits" },
      { text: "Customer portal management" },
      { text: "Durable credit ledger" },
    ],
  },
]

const companyLogos = [1, 2, 3, 4, 5, 6, 7, 8, 9]

function PricingFallback() {
  return (
    <main className="ax-page-bg min-h-screen">
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
  const [billingMode, setBillingMode] = useState<BillingMode>("monthly")
  const [signInOpen, setSignInOpen] = useState(false)
  const [signInRedirectPath, setSignInRedirectPath] = useState("/pricing")
  const [checkoutLoading, setCheckoutLoading] = useState<BillingPlanKey | null>(null)
  const [autoCheckoutStarted, setAutoCheckoutStarted] = useState(false)

  const getPlanKey = (planKey?: BillingPlanKey): BillingPlanKey | undefined => {
    if (!planKey) return undefined
    if (planKey === "pro_monthly" && billingMode === "annual") return "pro_yearly"
    return planKey
  }

  const startCheckout = async (planKey?: BillingPlanKey) => {
    const resolvedPlanKey = getPlanKey(planKey)
    if (!resolvedPlanKey) {
      if (!user && !loading) {
        setSignInRedirectPath("/dashboard/client")
        setSignInOpen(true)
        return
      }
      router.push("/dashboard/client")
      return
    }

    if (!user && !loading) {
      setSignInRedirectPath(`/pricing?checkout=${resolvedPlanKey}`)
      setSignInOpen(true)
      return
    }

    setCheckoutLoading(resolvedPlanKey)
    try {
      const checkout = await billingApi.createCheckout(resolvedPlanKey)
      if (checkout.checkout_url) window.location.assign(checkout.checkout_url)
    } catch (error: any) {
      toast.error(error?.detail || "Checkout is not available yet.")
    } finally {
      setCheckoutLoading(null)
    }
  }

  useEffect(() => {
    const checkoutPlan = searchParams.get("checkout") as BillingPlanKey | null
    const validPlan = ["pro_monthly", "pro_yearly", "business_monthly"].includes(checkoutPlan || "")

    if (!loading && user && checkoutPlan && validPlan && !autoCheckoutStarted) {
      setAutoCheckoutStarted(true)
      startCheckout(checkoutPlan)
    }
  }, [searchParams, user?.id, loading, autoCheckoutStarted])

  return (
    <main className="ax-page-bg min-h-screen overflow-hidden">
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-[28px] border border-[#eadfff] bg-white/60 px-4 py-3 shadow-[0_18px_55px_rgba(68,31,132,0.10)] backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#eadfff] bg-white/75">
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
          <h1 className="mx-auto max-w-3xl text-4xl font-black leading-[1.04] tracking-tight text-foreground sm:text-5xl">
            Plans for clean Excel conversion.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-muted-foreground">
            Pick the page volume that matches your batch workflow.
          </p>

          <div className="mt-7 inline-flex rounded-[18px] border border-[#e6dbff] bg-white/58 p-1 shadow-[0_16px_45px_rgba(68,31,132,0.10)] backdrop-blur">
            {(["monthly", "annual"] as BillingMode[]).map((mode) => (
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
                {mode === "monthly" ? "Monthly" : "Annual"}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl gap-5 lg:grid-cols-3">
          {plans.map((plan) => {
            const resolvedPlanKey = getPlanKey(plan.planKey)
            const isLoading = checkoutLoading === resolvedPlanKey
            const displayedPages =
              plan.planKey === "pro_monthly" && billingMode === "annual"
                ? "12,000 pages"
                : plan.pages
            const displayedPrice =
              plan.planKey === "pro_monthly" && billingMode === "annual"
                ? "$50"
                : plan.price
            const displayedCadence =
              plan.planKey === "pro_monthly" && billingMode === "annual"
                ? "per year"
                : plan.cadence

            return (
              <Card
                key={plan.name}
                className={cn(
                  "relative overflow-visible rounded-[28px] border-[#ded3f4] bg-white/72 shadow-[0_24px_70px_rgba(30,18,57,0.08)] backdrop-blur-xl",
                  plan.popular && "border-[#2f165e] shadow-[0_30px_90px_rgba(68,31,132,0.16)]"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 right-5 rounded-[12px] bg-[#151216] px-4 py-2 text-xs font-bold text-white shadow-lg">
                    Most popular
                  </div>
                )}
                <CardContent className="p-0">
                  <div className="border-b border-[#ece5fb] p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-black text-foreground">{plan.name}</p>
                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-[#7c62b1]">{plan.eyebrow}</p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-[#e6dbff] bg-white/70 text-[#2f165e]">
                        {plan.name === "Business" ? <PlanSwitch className="h-5 w-5" /> : <CreditStack className="h-5 w-5" />}
                      </div>
                    </div>
                    <div className="mt-5 flex items-end gap-2">
                      <span className="text-5xl font-black tracking-tight text-foreground">{displayedPrice}</span>
                      <span className="pb-2 text-sm font-bold text-muted-foreground">{displayedCadence}</span>
                    </div>
                    <div className="mt-5 rounded-[22px] bg-white/55 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_14px_34px_rgba(68,31,132,0.07)] backdrop-blur">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-black uppercase tracking-[0.16em] text-[#7c62b1]">Included volume</span>
                        <span className="h-2.5 w-2.5 rounded-full bg-[#2f165e]" />
                      </div>
                      <p className="mt-2 text-2xl font-black text-[#2f165e]">{displayedPages}</p>
                    </div>
                    <p className="mt-3 min-h-[48px] text-sm leading-6 text-muted-foreground">{plan.detail}</p>
                    <Button
                      className={cn(
                        "mt-6 h-12 w-full rounded-[16px] font-bold",
                        plan.popular
                          ? "bg-[#151216] text-white hover:bg-[#2f165e]"
                          : "bg-[#f1eee9] text-[#151216] hover:bg-[#e7e1d9]"
                      )}
                      disabled={isLoading}
                      onClick={() => startCheckout(plan.planKey)}
                    >
                      {isLoading ? "Opening checkout..." : plan.planKey ? "Get started" : "Start free"}
                    </Button>
                  </div>

                  <div className="p-6">
                    <div className="mb-4 flex items-center gap-2">
                      {plan.planKey ? <CreditStack className="h-5 w-5 text-[#2f165e]" /> : <BillingSeal className="h-5 w-5 text-[#2f165e]" />}
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-foreground">Features</p>
                    </div>
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature.text} className={cn("flex items-center gap-3 text-sm", feature.muted && "text-muted-foreground")}>
                          <span
                            className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-black",
                              feature.muted ? "bg-[#d8d3cf] text-white" : "bg-[#151216] text-white"
                            )}
                          >
                            {feature.muted ? "-" : <span className="h-2 w-2 rounded-full bg-white" />}
                          </span>
                          <span>{feature.text}</span>
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
