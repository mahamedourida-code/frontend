"use client"

import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { AppLogo } from "@/components/AppIcon"
import { CreditStack } from "@/components/BillingGlyphs"
import { IndustrySolutionsMenuGrid } from "@/components/IndustrySolutionsMenuGrid"
import { MobileNav } from "@/components/MobileNav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { useAuth } from "@/hooks/useAuth"
import { useBillingStatus } from "@/hooks/useBillingStatus"
import { billingApi, type BillingPlan, type BillingPlanKey } from "@/lib/api-client"
import { cn } from "@/lib/utils"

type BillingMode = "month" | "year"

const companyLogos = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const paidPlanKeys: BillingPlanKey[] = ["pro_monthly", "pro_yearly", "max_monthly", "max_yearly", "mega_monthly", "mega_yearly"]

const planDisplayOverrides: Record<string, { credits: number; priceFormatted: string; included: string }> = {
  pro_monthly: { credits: 1000, priceFormatted: "$10", included: "1,000 files" },
  pro_yearly: { credits: 12000, priceFormatted: "$100", included: "12,000 files" },
  max_monthly: { credits: 2500, priceFormatted: "$20", included: "2,500 files" },
  max_yearly: { credits: 30000, priceFormatted: "$190", included: "30,000 files" },
  mega_monthly: { credits: 7000, priceFormatted: "$50", included: "7,000 files" },
  mega_yearly: { credits: 84000, priceFormatted: "$530", included: "84,000 files" },
}

const displayNameByPlan: Record<string, string> = {
  anonymous: "Free",
  free: "Free",
  pro: "Standard",
  max: "Pro",
  mega: "Max",
}

const descriptionByPlan: Record<string, string> = {
  anonymous: "Try the workflow before creating a workspace.",
  free: "For light handwritten conversions and saved history.",
  pro: "For regular accounting and admin document batches.",
  max: "For teams processing larger monthly paperwork volume.",
  mega: "For high-volume document teams and operations workflows.",
}

function filesLabel(count: number) {
  return `${count.toLocaleString()} file${count === 1 ? "" : "s"}`
}

function parsePrice(price: string) {
  const value = Number(price.replace(/[^\d.]/g, ""))
  return Number.isFinite(value) ? value : null
}

function planPresentation(plan: BillingPlan) {
  const override = planDisplayOverrides[plan.key]
  const credits = override?.credits ?? plan.credits
  const monthlyAllowance = plan.interval === "year" && credits > 0 ? Math.round(credits / 12) : credits
  const name = displayNameByPlan[plan.plan] || plan.name || "Plan"
  const included = !plan.checkout_key
    ? plan.included_volume || `${filesLabel(plan.credits)} included`
    : override?.included || `${filesLabel(monthlyAllowance)} included`

  return {
    name,
    description: descriptionByPlan[plan.plan] || "Convert handwritten files into review-ready spreadsheets.",
    included,
    credits,
    monthlyAllowance,
    priceFormatted: override?.priceFormatted || plan.price_formatted,
  }
}

function AnimatedPrice({ formatted }: { formatted: string }) {
  const target = parsePrice(formatted)
  const [displayValue, setDisplayValue] = useState(target ?? 0)
  const previousValue = useRef(target ?? 0)

  useEffect(() => {
    if (target === null) return

    const from = previousValue.current
    const to = target
    previousValue.current = to
    const startedAt = performance.now()
    let frame = 0

    const animate = (time: number) => {
      const progress = Math.min((time - startedAt) / 520, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(from + (to - from) * eased)

      if (progress < 1) {
        frame = requestAnimationFrame(animate)
      }
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [target])

  if (target === null) {
    return <span>{formatted}</span>
  }

  return (
    <span className="inline-flex items-start gap-1">
      <span className="mt-2 text-2xl font-semibold">$</span>
      <span>{Math.round(displayValue).toLocaleString()}</span>
    </span>
  )
}

function PricingFallback() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary" />
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
  const [checkoutLoading, setCheckoutLoading] = useState<BillingPlanKey | null>(null)
  const [autoCheckoutStarted, setAutoCheckoutStarted] = useState(false)
  const [checkoutMessage, setCheckoutMessage] = useState<"success" | "pending" | "cancelled" | "failed" | null>(null)
  const {
    billingStatus,
    plans,
    isLoading: billingLoading,
    checkoutSyncState,
    setCheckoutSyncState,
    refresh: refreshBilling,
    pollBillingStatus,
  } = useBillingStatus({
    enabled: true,
    loadPlans: true,
    loadStatus: Boolean(user && !loading),
  })

  const checkoutStatus = searchParams.get("checkout_status") || searchParams.get("billing")

  useEffect(() => {
    if (checkoutStatus === "success") {
      setCheckoutMessage("pending")
      if (!user || loading) return
      toast.message("Payment received. Confirming your credits...")
      pollBillingStatus().then(({ state }) => {
        if (state === "active") {
          setCheckoutMessage("success")
          toast.success("Plan active. Credits are ready.")
        } else if (state === "failed") {
          setCheckoutMessage("failed")
          toast.error("Payment needs attention. Open billing or contact support.")
        } else {
          setCheckoutMessage("pending")
          toast.message("Payment is still confirming. Your plan will update shortly.")
        }
      })
    } else if (checkoutStatus === "cancelled" || checkoutStatus === "canceled") {
      setCheckoutSyncState("cancelled")
      setCheckoutMessage("cancelled")
      toast.message("Checkout cancelled. No charge was made.")
    } else if (checkoutStatus === "pending") {
      setCheckoutSyncState("pending")
      setCheckoutMessage("pending")
      if (user && !loading) void refreshBilling({ includeStatus: true, includeLimits: true })
      toast.message("Subscription pending. Billing is still confirming.")
    }
  }, [checkoutStatus, loading, pollBillingStatus, refreshBilling, setCheckoutSyncState, user])

  const backendByKey = useMemo(() => new Map(plans.map((plan) => [plan.key, plan])), [plans])

  const visiblePlans = useMemo(() => {
    const free = backendByKey.get("free")
    const standard = plans.find((plan) => plan.plan === "pro" && plan.interval === billingMode)
    const pro = plans.find((plan) => plan.plan === "max" && plan.interval === billingMode)
    const max = plans.find((plan) => plan.plan === "mega" && plan.interval === billingMode)
    return [free, standard, pro, max].filter(Boolean) as BillingPlan[]
  }, [backendByKey, billingMode, plans])

  const findCheckoutPlan = (planKey: BillingPlanKey) => {
    return plans.find((plan) => plan.checkout_key === planKey)
  }

  const startCheckout = async (plan: BillingPlan) => {
    const checkoutKey = plan.checkout_key

    if (!checkoutKey) {
      if (!user && !loading) {
        router.push(`/sign-up?next=${encodeURIComponent("/dashboard/client")}`)
        return
      }
      router.push("/dashboard/client")
      return
    }

    if (!user && !loading) {
      router.push(`/sign-up?next=${encodeURIComponent(`/pricing?checkout=${checkoutKey}`)}`)
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
    if (checkoutMessage === "success" || checkoutSyncState === "active") {
      return {
        title: "Subscription active",
        text: "Your plan and credits are active on your workspace.",
        tone: "border-border bg-card/80",
      }
    }

    if (checkoutMessage === "cancelled" || checkoutSyncState === "cancelled") {
      return {
        title: "Checkout cancelled",
        text: "No charge was made. You can restart checkout whenever you are ready.",
        tone: "border-border bg-card/80",
      }
    }

    if (checkoutMessage === "failed" || checkoutSyncState === "failed") {
      return {
        title: "Billing needs attention",
        text: "The payment or subscription status was not confirmed. Open billing settings or contact support if this repeats.",
        tone: "border-destructive/30 bg-card/80",
      }
    }

    if (checkoutMessage === "pending" || checkoutSyncState === "pending") {
      return {
        title: "Confirming payment",
        text: "Lemon Squeezy accepted the checkout. AxLiner is waiting for the verified billing update before changing credits.",
        tone: "border-border bg-card/80",
      }
    }

    return null
  })()

  const isFreeAccount = Boolean(user && billingStatus?.plan === "free")
  const accountCredits = billingStatus?.credits?.available_credits ?? 0
  const freePlan = backendByKey.get("free")
  const freeCreditsLabel = freePlan?.included_volume || "30 free credits"
  const isSignedIn = Boolean(user && !loading)

  const comparisonPlans = visiblePlans
  const comparisonRows = [
    {
      label: "Included files",
      values: comparisonPlans.map((plan) => planPresentation(plan).included),
    },
    {
      label: "Files per run",
      values: comparisonPlans.map((plan) => `Up to ${plan.max_files_per_batch}`),
    },
    {
      label: "File size",
      values: comparisonPlans.map((plan) => `${plan.max_file_size_mb}MB`),
    },
    {
      label: "Output modes",
      values: comparisonPlans.map(() => "Table + text"),
    },
    {
      label: "Review workflow",
      values: comparisonPlans.map((plan) => (plan.checkout_key ? "Batch compare + edit" : "Basic review")),
    },
  ]

  const navLinkClass = cn(
    navigationMenuTriggerStyle(),
    "bg-transparent text-foreground transition-colors hover:bg-muted focus:bg-transparent active:bg-transparent"
  )

  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <nav className="fixed left-0 right-0 top-0 z-50 pt-3 backdrop-blur-2xl lg:pt-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between rounded-md border border-border bg-background/82 p-2 shadow-sm backdrop-blur-2xl lg:p-3">
            <Link href="/" aria-label="AxLiner home" className="flex-shrink-0">
              <AppLogo />
            </Link>

            <div className="hidden flex-1 items-center justify-center lg:flex">
              <NavigationMenu>
                <NavigationMenuList className="gap-1">
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent text-foreground transition-colors hover:bg-muted focus:bg-transparent active:bg-transparent">
                      Solutions
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <IndustrySolutionsMenuGrid />
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink href="/how-axliner-is-built" className={navLinkClass}>
                      How AxLiner's Built
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink href="/benchmarks" className={navLinkClass}>
                      Benchmarks
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink href="/pricing" className={navLinkClass}>
                      Pricing
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink href="/blogs" className={navLinkClass}>
                      Blogs
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              {isSignedIn ? (
                <>
                  <Button variant="outline" className="rounded-md" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button className="rounded-md" asChild>
                    <Link href="/dashboard/client">Convert Files</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" className="rounded-md" asChild>
                    <Link href="/sign-up?next=%2Fdashboard%2Fclient">Sign Up</Link>
                  </Button>
                  <Button variant="outline" className="rounded-md" asChild>
                    <Link href="/sign-in?next=%2Fdashboard%2Fclient">Sign in</Link>
                  </Button>
                </>
              )}
            </div>

            <MobileNav isAuthenticated={isSignedIn} user={user} />
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-[1480px] px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl font-semibold tracking-normal text-foreground sm:text-6xl">Pricing</h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground">
            Clear plans for handwritten images, PDFs, and batch conversion into review-ready Excel files.
          </p>

          <div className="mt-8 inline-flex rounded-full border border-border bg-card p-1 shadow-sm">
            {(["month", "year"] as BillingMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setBillingMode(mode)}
                className={cn(
                  "rounded-full px-6 py-2 text-sm font-semibold transition",
                  billingMode === mode
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {mode === "month" ? "Monthly" : "Annually"}
              </button>
            ))}
          </div>

          {!user && !loading && (
            <div className="mx-auto mt-6 flex w-fit flex-wrap items-center justify-center gap-3 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground shadow-sm">
              <span>
                Create a free account for <span className="font-semibold text-foreground">{freeCreditsLabel}</span>.
              </span>
              <Link href="/sign-up?next=%2Fdashboard%2Fclient" className="font-semibold text-foreground underline underline-offset-4">
                Start free
              </Link>
            </div>
          )}

          {isFreeAccount && (
            <div className="mx-auto mt-6 flex w-fit items-center gap-4 rounded-full border border-border bg-card px-5 py-3 shadow-sm">
              <CreditStack className="h-6 w-6 text-foreground" />
              <span className="text-sm font-semibold text-muted-foreground">
                <span className="text-foreground">{accountCredits.toLocaleString()}</span> credits left
              </span>
              <Button
                size="sm"
                className="rounded-full"
                onClick={() => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth", block: "start" })}
              >
                Upgrade
              </Button>
            </div>
          )}
        </div>

        {statusPanel && (
          <div className={cn("mx-auto mt-8 max-w-4xl rounded-md border p-5 text-center shadow-sm", statusPanel.tone)}>
            <p className="text-base font-semibold text-foreground">{statusPanel.title}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{statusPanel.text}</p>
          </div>
        )}

        <div id="plans" className="mx-auto mt-14 grid max-w-[1400px] auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-4">
          {billingLoading && plans.length === 0
            ? Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="h-[560px] rounded-2xl border-border bg-card shadow-sm">
                  <CardContent className="h-full animate-pulse p-7">
                    <div className="h-5 w-24 rounded-full bg-muted" />
                    <div className="mt-10 h-12 w-36 rounded-2xl bg-muted" />
                    <div className="mt-8 h-24 rounded-2xl bg-muted" />
                    <div className="mt-8 h-12 rounded-full bg-muted" />
                  </CardContent>
                </Card>
              ))
            : visiblePlans.length === 0
              ? (
                <Card className="rounded-2xl border-border bg-card shadow-sm md:col-span-2 xl:col-span-4">
                  <CardContent className="p-8 text-center">
                    <p className="text-xl font-semibold text-foreground">Pricing is temporarily unavailable</p>
                    <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                      Plan data comes from the billing backend. Refresh this page in a moment, or contact support if the plan catalog stays unavailable.
                    </p>
                    <Button
                      className="mt-6 rounded-full bg-foreground px-6 text-background hover:bg-foreground/90"
                      onClick={() => void refreshBilling({ includePlans: true, includeStatus: Boolean(user), includeLimits: false })}
                    >
                      Refresh pricing
                    </Button>
                  </CardContent>
                </Card>
              )
              : visiblePlans.map((plan) => {
                const presentation = planPresentation(plan)
                const isPaid = Boolean(plan.checkout_key)
                const isLoading = Boolean(plan.checkout_key && checkoutLoading === plan.checkout_key)
                const isPopular = plan.plan === "max"
                const intervalLabel = plan.interval === "year" ? "per year" : plan.interval === "month" ? "per month" : "forever"
                const featureRows = [
                  presentation.included,
                  `Up to ${plan.max_files_per_batch} files per run`,
                  `${plan.max_file_size_mb}MB max file size`,
                  "Table and text output",
                  isPaid ? "Batch review workspace" : "Saved workspace access",
                ]

                return (
                  <article
                    key={plan.plan}
                    className={cn(
                      "flex h-full min-h-[560px] flex-col rounded-2xl border bg-card p-6 shadow-sm transition",
                      isPopular ? "border-foreground shadow-md" : "border-border"
                    )}
                  >
                    <div className="flex min-h-[96px] items-start justify-between gap-4">
                      <div>
                        <p className="text-xl font-semibold text-foreground">{presentation.name}</p>
                        <p className="mt-2 max-w-[220px] text-sm leading-6 text-muted-foreground">{presentation.description}</p>
                      </div>
                      {isPopular && (
                        <span className="rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background">
                          Popular
                        </span>
                      )}
                    </div>

                    <div className="mt-8 min-h-[92px]">
                      <div className="text-5xl font-semibold tracking-normal text-foreground">
                        <AnimatedPrice formatted={presentation.priceFormatted} />
                      </div>
                      <p className="mt-2 text-sm font-medium text-muted-foreground">{intervalLabel}</p>
                    </div>

                    <div className="mt-6 rounded-2xl border border-border bg-muted/50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Included</p>
                      <p className="mt-2 text-lg font-semibold text-foreground">{presentation.included}</p>
                    </div>

                    <Button
                      className={cn(
                        "mt-6 h-11 w-full rounded-full text-sm font-semibold",
                        isPopular ? "bg-foreground text-background hover:bg-foreground/90" : ""
                      )}
                      variant={isPopular ? "default" : "outline"}
                      disabled={Boolean(isLoading || (isPaid && !plan.checkout_available))}
                      onClick={() => startCheckout(plan)}
                    >
                      {isLoading
                        ? "Opening checkout..."
                        : isPaid && !plan.checkout_available
                          ? "Checkout pending"
                          : isPaid
                            ? "Get started"
                            : "Start free"}
                    </Button>

                    <ul className="mt-7 flex-1 space-y-3 border-t border-border pt-6">
                      {featureRows.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                )
              })}
        </div>

        {comparisonPlans.length > 0 && (
          <section className="mx-auto mt-16 max-w-[1180px]">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-semibold tracking-normal text-foreground">Compare plans</h2>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="grid min-w-[760px] grid-cols-[1.15fr_repeat(4,1fr)] border-b border-border bg-muted/40">
                <div className="p-4 text-sm font-semibold text-muted-foreground">Feature</div>
                {comparisonPlans.map((plan) => (
                  <div key={plan.plan} className="p-4 text-sm font-semibold text-foreground">
                    {planPresentation(plan).name}
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                {comparisonRows.map((row) => (
                  <div key={row.label} className="grid min-w-[760px] grid-cols-[1.15fr_repeat(4,1fr)] border-b border-border last:border-b-0">
                    <div className="p-4 text-sm font-semibold text-foreground">{row.label}</div>
                    {row.values.map((value, index) => (
                      <div key={`${row.label}-${index}`} className="p-4 text-sm text-muted-foreground">
                        {value}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

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
                    className="h-[80px] w-[120px] flex-shrink-0 border border-border bg-white shadow-sm transition-all duration-300 hover:border-foreground/30 hover:shadow-md"
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
    </main>
  )
}
