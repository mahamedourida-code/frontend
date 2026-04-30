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

const paidPlans: Array<{
  key: BillingPlanKey
  name: string
  cadence: string
  credits: string
  note: string
  tone: string
  featured?: boolean
}> = [
  {
    key: "pro_monthly",
    name: "Pro",
    cadence: "Monthly",
    credits: "1,000 credits",
    note: "For steady weekly document batches.",
    tone: "from-[#2f165e] to-[#7147c5]",
    featured: true,
  },
  {
    key: "pro_yearly",
    name: "Pro Annual",
    cadence: "Yearly",
    credits: "12,000 credits",
    note: "Same Pro workflow with annual billing.",
    tone: "from-[#3a236e] to-[#8b5cf6]",
  },
  {
    key: "business_monthly",
    name: "Business",
    cadence: "Monthly",
    credits: "5,000 credits",
    note: "For larger teams and heavier batch work.",
    tone: "from-[#1f163c] to-[#5b3da8]",
  },
]

const trustBadges: Array<{
  label: string
  Icon: typeof BillingSeal
}> = [
  { label: "Secure checkout", Icon: BillingSeal },
  { label: "Credit ledger", Icon: CreditStack },
  { label: "Plan sync", Icon: PlanSwitch },
]

function PricingFallback() {
  return (
    <main className="ax-page-bg min-h-screen">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between rounded-[28px] border border-[#eadfff] bg-white/55 px-4 py-3 shadow-[0_18px_55px_rgba(68,31,132,0.10)] backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#eadfff] bg-white/70">
              <AppIcon size={28} />
            </span>
            <span className="text-lg font-bold text-foreground">AxLiner</span>
          </Link>
        </nav>
        <div className="grid flex-1 place-items-center">
          <div className="h-12 w-12 rounded-full border-4 border-[#d9c9fb] border-t-[#2f165e] animate-spin" />
        </div>
      </section>
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
  const [signInOpen, setSignInOpen] = useState(false)
  const [signInRedirectPath, setSignInRedirectPath] = useState("/pricing")
  const [checkoutLoading, setCheckoutLoading] = useState<BillingPlanKey | null>(null)
  const [autoCheckoutStarted, setAutoCheckoutStarted] = useState(false)

  const startCheckout = async (planKey: BillingPlanKey) => {
    if (!user && !loading) {
      setSignInRedirectPath(`/pricing?checkout=${planKey}`)
      setSignInOpen(true)
      return
    }

    setCheckoutLoading(planKey)
    try {
      const checkout = await billingApi.createCheckout(planKey)
      if (checkout.checkout_url) {
        window.location.assign(checkout.checkout_url)
      }
    } catch (error: any) {
      toast.error(error?.detail || "Checkout is not available yet.")
    } finally {
      setCheckoutLoading(null)
    }
  }

  useEffect(() => {
    const checkoutPlan = searchParams.get("checkout") as BillingPlanKey | null
    const validPlan = paidPlans.some((plan) => plan.key === checkoutPlan)

    if (!loading && user && checkoutPlan && validPlan && !autoCheckoutStarted) {
      setAutoCheckoutStarted(true)
      startCheckout(checkoutPlan)
    }
  }, [searchParams, user?.id, loading, autoCheckoutStarted])

  return (
    <main className="ax-page-bg min-h-screen">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between rounded-[28px] border border-[#eadfff] bg-white/55 px-4 py-3 shadow-[0_18px_55px_rgba(68,31,132,0.10)] backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#eadfff] bg-white/70">
              <AppIcon size={28} />
            </span>
            <span className="text-lg font-bold text-foreground">AxLiner</span>
          </Link>
          <Button
            variant="outline"
            className="rounded-2xl border-[#d9c9fb] bg-white/60"
            onClick={() => router.push(user ? "/dashboard/settings?section=billing" : "/")}
          >
            {user ? "Billing settings" : "Try it"}
          </Button>
        </nav>

        <div className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Badge className="mb-5 rounded-full border border-[#d8c7fb] bg-white/55 px-4 py-1.5 text-[#4b2d82] shadow-sm backdrop-blur">
              Billing handled by Lemon Squeezy
            </Badge>
            <h1 className="max-w-2xl text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Upgrade when batches become real work.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
              Pick a plan, confirm in Lemon Squeezy checkout, and AxLiner updates your credits from verified billing webhooks.
            </p>

            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
              {trustBadges.map(({ label, Icon }) => (
                <div key={label} className="rounded-[24px] border border-[#eadfff] bg-white/45 p-4 text-[#4b2d82] backdrop-blur">
                  <Icon className="mb-3 h-6 w-6" />
                  <p className="text-sm font-bold text-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <Card className="ax-glass-card rounded-[32px]">
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#7c62b1]">Free</p>
                    <h2 className="mt-1 text-2xl font-black text-foreground">Start with live free limits</h2>
                  </div>
                  <Button className="rounded-2xl" onClick={() => router.push("/dashboard/client")}>
                    Open workspace
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-3">
              {paidPlans.map((plan) => (
                <Card
                  key={plan.key}
                  className={cn(
                    "relative overflow-hidden rounded-[32px] border-[#eadfff] bg-white/48 shadow-[0_22px_70px_rgba(68,31,132,0.12)] backdrop-blur-xl",
                    plan.featured && "ring-2 ring-[#7c3aed]/35"
                  )}
                >
                  <div className={cn("h-2 bg-gradient-to-r", plan.tone)} />
                  <CardContent className="flex min-h-[320px] flex-col p-5">
                    {plan.featured && (
                      <Badge className="mb-4 w-fit rounded-full bg-[#2f165e] text-white">Most direct</Badge>
                    )}
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#7c62b1]">{plan.cadence}</p>
                    <h3 className="mt-2 text-2xl font-black text-foreground">{plan.name}</h3>
                    <div className="mt-5 rounded-[24px] border border-[#eadfff] bg-white/55 p-4">
                      <CreditStack className="mb-3 h-7 w-7 text-[#4b2d82]" />
                      <p className="text-xl font-black text-foreground">{plan.credits}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{plan.note}</p>
                    </div>
                    <Button
                      className="mt-auto h-12 rounded-2xl bg-[#2f165e] text-white hover:bg-[#42207c]"
                      disabled={checkoutLoading === plan.key}
                      onClick={() => startCheckout(plan.key)}
                    >
                      {checkoutLoading === plan.key ? "Opening checkout..." : "Continue"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <GoogleSignInModal open={signInOpen} onOpenChange={setSignInOpen} redirectPath={signInRedirectPath} />
    </main>
  )
}
