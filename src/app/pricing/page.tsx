"use client"

import { Fragment, Suspense, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { CreditStack } from "@/components/BillingGlyphs"
import { MarketingNavBar } from "@/components/MarketingNavBar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/hooks/useAuth"
import { useBillingStatus } from "@/hooks/useBillingStatus"
import { billingApi, type BillingPlan, type BillingPlanKey } from "@/lib/api-client"
import { cn } from "@/lib/utils"

type BillingMode = "month" | "year"
type ComparisonCell = string | boolean
type ComparisonGroup = {
  title: string
  rows: Array<{
    label: string
    values: ComparisonCell[]
    emphasis?: boolean
  }>
}

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
  anonymous: "Try a small handwritten batch before creating a workspace.",
  free: "For light handwritten runs with saved review history.",
  pro: "For recurring invoice, statement, and table batches.",
  max: "For teams reviewing larger paperwork runs each month.",
  mega: "For high-volume document batches and spreadsheet handoff.",
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
    description: descriptionByPlan[plan.plan] || "Turn handwritten file batches into reviewable spreadsheet outputs.",
    included,
    credits,
    monthlyAllowance,
    priceFormatted: override?.priceFormatted || plan.price_formatted,
  }
}

function planRunPolicy(plan: BillingPlan) {
  if (plan.daily_run_limit) return `${plan.daily_run_limit} runs/day`
  return "No daily run cap"
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

function CompareTick() {
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-foreground/10 bg-foreground text-background">
      <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-none stroke-current stroke-[2.4]">
        <path d="M3.2 8.4 6.4 11.5 12.9 4.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

function CompareCellValue({ value }: { value: ComparisonCell }) {
  if (value === true) return <CompareTick />
  if (value === false) return <span className="text-base text-muted-foreground/60">-</span>
  return <span>{value}</span>
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

  const comparisonPlans = visiblePlans
  const comparisonGroups: ComparisonGroup[] = [
    {
      title: "Plan restrictions",
      rows: [
        {
          label: "Included files",
          values: comparisonPlans.map((plan) => planPresentation(plan).included),
          emphasis: true,
        },
        {
          label: "Run policy",
          values: comparisonPlans.map((plan) => planRunPolicy(plan)),
          emphasis: true,
        },
        {
          label: "Files per run",
          values: comparisonPlans.map((plan) => `Up to ${plan.max_files_per_batch}`),
          emphasis: true,
        },
        {
          label: "Max file size",
          values: comparisonPlans.map((plan) => `${plan.max_file_size_mb}MB`),
          emphasis: true,
        },
      ],
    },
    {
      title: "Document modes",
      rows: [
        {
          label: "Handwritten table mode",
          values: comparisonPlans.map(() => true),
        },
        {
          label: "Bank statement mode",
          values: comparisonPlans.map(() => true),
        },
        {
          label: "Invoice and receipt extraction",
          values: comparisonPlans.map(() => true),
        },
        {
          label: "Text extraction mode",
          values: comparisonPlans.map(() => true),
        },
      ],
    },
    {
      title: "Outputs",
      rows: [
        {
          label: "Excel table output",
          values: comparisonPlans.map(() => true),
        },
        {
          label: "PDF and image batches",
          values: comparisonPlans.map(() => true),
        },
      ],
    },
    {
      title: "Review",
      rows: [
        {
          label: "Result comparison",
          values: comparisonPlans.map(() => true),
        },
        {
          label: "Batch review workspace",
          values: comparisonPlans.map((plan) => Boolean(plan.checkout_key)),
        },
        {
          label: "Corrected batch download",
          values: comparisonPlans.map((plan) => Boolean(plan.checkout_key)),
        },
      ],
    },
  ]

  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <MarketingNavBar />

      <section className="mx-auto max-w-[1480px] px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl font-semibold tracking-normal text-foreground sm:text-6xl">Pricing</h1>

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
                variant="lime"
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

        {comparisonPlans.length > 0 && (
          <section className="mx-auto mt-20 max-w-[1260px]">
            <div className="mb-10 text-center">
              <h2 className="text-4xl font-semibold tracking-normal text-foreground">Compare plans</h2>
            </div>

            <Table className="min-w-[940px] border-separate border-spacing-0" containerClassName="lg:overflow-visible">
              <TableHeader className="sticky top-[72px] z-20 bg-background shadow-[0_1px_0_var(--border)]">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-[26%] border-b border-border px-4 pb-6 pt-3 text-sm font-semibold text-muted-foreground lg:px-6">
                    Features
                  </TableHead>
                  {comparisonPlans.map((plan) => {
                    const presentation = planPresentation(plan)

                    return (
                      <TableHead
                        key={`${plan.plan}-${plan.interval}`}
                        className="min-w-[170px] border-b border-border px-4 pb-6 pt-3 align-top lg:px-5"
                      >
                        <div className="flex min-h-[192px] flex-col items-start whitespace-normal">
                          <p className="text-lg font-semibold text-foreground">{presentation.name}</p>
                          <p className="mt-3 text-sm font-medium text-muted-foreground">{presentation.included}</p>
                          <div className="mt-5 text-3xl font-semibold tracking-normal text-foreground">
                            <AnimatedPrice formatted={presentation.priceFormatted} />
                          </div>
                          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            {plan.interval === "year" ? "per year" : plan.interval === "month" ? "per month" : "free"}
                          </p>
                          <Button
                            className="mt-auto h-10 w-full rounded-full text-sm font-semibold"
                            variant={plan.plan === "max" ? "default" : "outline"}
                            disabled={Boolean(plan.checkout_key && (!plan.checkout_available || checkoutLoading === plan.checkout_key))}
                            onClick={() => startCheckout(plan)}
                          >
                            {plan.checkout_key && checkoutLoading === plan.checkout_key
                              ? "Opening checkout..."
                              : plan.checkout_key && !plan.checkout_available
                                ? "Checkout pending"
                                : plan.checkout_key
                                  ? "Choose plan"
                                  : "Start free"}
                          </Button>
                        </div>
                      </TableHead>
                    )
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonGroups.map((group) => (
                  <Fragment key={group.title}>
                    <TableRow className="border-border bg-muted/35 hover:bg-muted/35">
                      <TableCell
                        colSpan={comparisonPlans.length + 1}
                        className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-foreground lg:px-6"
                      >
                        {group.title}
                      </TableCell>
                    </TableRow>
                    {group.rows.map((row) => (
                      <TableRow key={row.label} className="border-border hover:bg-muted/20">
                        <TableCell className="border-b border-border px-4 py-5 text-sm font-semibold text-foreground lg:px-6">
                          {row.label}
                        </TableCell>
                        {row.values.map((value, index) => (
                          <TableCell
                            key={`${row.label}-${index}`}
                            className={cn(
                              "border-b border-border px-4 py-5 text-sm font-medium lg:px-5",
                              row.emphasis ? "text-foreground" : "text-muted-foreground"
                            )}
                          >
                            <CompareCellValue value={value} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </section>
        )}
      </section>
    </main>
  )
}
