"use client"

import { Fragment, Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, Check, X } from "lucide-react"
import { toast } from "sonner"

import { CreditStack } from "@/components/BillingGlyphs"
import { MarketingNavBar } from "@/components/MarketingNavBar"
import { IntegrationsLogos } from "@/components/landing/IntegrationsLogos"
import { Button } from "@/components/ui/button"
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

const paidPlanKeys: BillingPlanKey[] = ["pro_monthly", "pro_yearly", "max_monthly", "max_yearly", "mega_monthly", "mega_yearly"]

const displayPriceCentsByKey: Record<BillingPlanKey, number> = {
  pro_monthly: 1900,
  pro_yearly: 19000,
  max_monthly: 3900,
  max_yearly: 39000,
  mega_monthly: 7900,
  mega_yearly: 79000,
}

const fallbackPlans: BillingPlan[] = [
  {
    key: "free",
    checkout_key: null,
    name: "Free",
    plan: "free",
    interval: "forever",
    price_cents: 0,
    price_formatted: "$0",
    currency: "USD",
    credits: 30,
    included_volume: "30 credits after account creation",
    max_files_per_batch: 5,
    daily_image_limit: 30,
    daily_run_limit: 3,
    max_file_size_mb: 10,
    annual_discount_percent: 0,
    checkout_available: false,
  },
  {
    key: "pro_monthly",
    checkout_key: "pro_monthly",
    name: "Standard Plan",
    plan: "pro",
    interval: "month",
    price_cents: 1900,
    price_formatted: "$19",
    currency: "USD",
    credits: 1000,
    included_volume: "1,000 credits/month",
    max_files_per_batch: 30,
    daily_image_limit: 1000,
    daily_run_limit: 0,
    max_file_size_mb: 10,
    annual_discount_percent: 0,
    checkout_available: false,
  },
  {
    key: "pro_yearly",
    checkout_key: "pro_yearly",
    name: "Standard Plan",
    plan: "pro",
    interval: "year",
    price_cents: 19000,
    price_formatted: "$190",
    currency: "USD",
    credits: 12000,
    included_volume: "12,000 credits/year",
    max_files_per_batch: 30,
    daily_image_limit: 1000,
    daily_run_limit: 0,
    max_file_size_mb: 10,
    annual_discount_percent: 17,
    checkout_available: false,
  },
  {
    key: "max_monthly",
    checkout_key: "max_monthly",
    name: "Pro Plan",
    plan: "max",
    interval: "month",
    price_cents: 3900,
    price_formatted: "$39",
    currency: "USD",
    credits: 2500,
    included_volume: "2,500 credits/month",
    max_files_per_batch: 50,
    daily_image_limit: 2500,
    daily_run_limit: 0,
    max_file_size_mb: 10,
    annual_discount_percent: 0,
    checkout_available: false,
  },
  {
    key: "max_yearly",
    checkout_key: "max_yearly",
    name: "Pro Plan",
    plan: "max",
    interval: "year",
    price_cents: 39000,
    price_formatted: "$390",
    currency: "USD",
    credits: 30000,
    included_volume: "30,000 credits/year",
    max_files_per_batch: 50,
    daily_image_limit: 2500,
    daily_run_limit: 0,
    max_file_size_mb: 10,
    annual_discount_percent: 17,
    checkout_available: false,
  },
  {
    key: "mega_monthly",
    checkout_key: "mega_monthly",
    name: "Max Plan",
    plan: "mega",
    interval: "month",
    price_cents: 7900,
    price_formatted: "$79",
    currency: "USD",
    credits: 7000,
    included_volume: "7,000 credits/month",
    max_files_per_batch: 100,
    daily_image_limit: 7000,
    daily_run_limit: 0,
    max_file_size_mb: 10,
    annual_discount_percent: 0,
    checkout_available: false,
  },
  {
    key: "mega_yearly",
    checkout_key: "mega_yearly",
    name: "Max Plan",
    plan: "mega",
    interval: "year",
    price_cents: 79000,
    price_formatted: "$790",
    currency: "USD",
    credits: 84000,
    included_volume: "84,000 credits/year",
    max_files_per_batch: 100,
    daily_image_limit: 7000,
    daily_run_limit: 0,
    max_file_size_mb: 10,
    annual_discount_percent: 17,
    checkout_available: false,
  },
]

const planCopyByPlan: Record<string, {
  name: string
  description: string
  included: string[]
}> = {
  pro: {
    name: "Standard",
    description: "Everything a solo bookkeeper needs to turn regular client paperwork into clean exports.",
    included: ["Mixed document batches", "Batch Review Board", "Excel and CSV exports"],
  },
  max: {
    name: "Pro",
    description: "More room for practices processing supplier invoices, receipts, and statements every week.",
    included: ["Everything in Standard", "Vendor memory", "AP draft handoff"],
  },
  mega: {
    name: "Max",
    description: "Higher-volume capacity for cleanup projects, monthly close pressure, and dense client folders.",
    included: ["Everything in Pro", "High-volume batches", "Lowest unit cost"],
  },
}

const faqs = [
  {
    question: "What counts as a credit?",
    answer: "One processed page or image uses one credit. A batch can contain mixed files; AxLiner classifies them before review.",
  },
  {
    question: "Can I review before exporting?",
    answer: "Yes. Every batch lands in the Batch Review Board so uncertain fields can be corrected before export or publish.",
  },
  {
    question: "Do plans limit teammates?",
    answer: "Pricing is centered on processing volume and batch size. Team access can grow with the workspace workflow.",
  },
  {
    question: "Can AxLiner publish directly to accounting software?",
    answer: "Reviewed entries can be handed off to supported accounting flows. AxLiner never pays, reconciles, or auto-approves bills.",
  },
  {
    question: "Can I start without paying?",
    answer: "Yes. Create a free account to test a small batch before moving recurring client work into a paid plan.",
  },
]

function formatCents(cents: number) {
  const amount = (cents || 0) / 100
  return amount % 1 === 0
    ? `$${amount.toLocaleString()}`
    : `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function creditsLabel(plan: BillingPlan) {
  if (!plan.checkout_key) return plan.included_volume || `${plan.credits.toLocaleString()} credits`
  return plan.interval === "year"
    ? `${plan.credits.toLocaleString()} credits/year`
    : `${plan.credits.toLocaleString()} credits/month`
}

function priceSubtext(plan: BillingPlan) {
  if (plan.interval === "forever") return "No card required"
  if (plan.interval === "year") return "per month, billed annually"
  return "per month"
}

function planRunPolicy(plan: BillingPlan) {
  if (plan.daily_run_limit) return `${plan.daily_run_limit} runs/day`
  return "No daily run cap"
}

function displayPlanPriceCents(plan: BillingPlan) {
  if (plan.key === "free") return plan.price_cents || 0
  return displayPriceCentsByKey[plan.key] ?? plan.price_cents ?? 0
}

function displayMonthlyCents(plan: BillingPlan) {
  const displayCents = displayPlanPriceCents(plan)
  if (plan.interval === "year") return Math.floor(displayCents / 12)
  return displayCents
}

function priceNumber(plan: BillingPlan) {
  return Math.floor(displayMonthlyCents(plan) / 100).toLocaleString()
}

function comparePriceLabel(plan: BillingPlan) {
  return `$${priceNumber(plan)}/mo`
}

function compareBillingLabel(plan: BillingPlan) {
  return plan.interval === "year"
    ? `${formatCents(displayPlanPriceCents(plan))} billed annually`
    : "Billed monthly"
}

// Black circle with white check — no color accent
function CompareTick() {
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-950 text-white">
      <Check aria-hidden="true" className="h-3.5 w-3.5 stroke-[3]" />
    </span>
  )
}

function CompareCellValue({ value }: { value: ComparisonCell }) {
  if (value === true) return <CompareTick />
  if (value === false) return <X aria-hidden="true" className="h-5 w-5 text-neutral-300" />
  return <span className="font-semibold text-neutral-950">{value}</span>
}

function PricingFallback() {
  return (
    <main className="ax-marketing-page min-h-screen bg-white text-black">
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
    planCatalog,
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
  const catalogPlans = plans.length > 0 ? plans : fallbackPlans
  const backendByKey = useMemo(() => new Map(catalogPlans.map((plan) => [plan.key, plan])), [catalogPlans])

  const paidPlans = useMemo(() => {
    const standard = catalogPlans.find((plan) => plan.plan === "pro" && plan.interval === billingMode)
    const pro = catalogPlans.find((plan) => plan.plan === "max" && plan.interval === billingMode)
    const max = catalogPlans.find((plan) => plan.plan === "mega" && plan.interval === billingMode)
    return [standard, pro, max].filter(Boolean) as BillingPlan[]
  }, [billingMode, catalogPlans])

  const yearlyDiscountPercent = useMemo(() => {
    const discounts = catalogPlans
      .filter((plan) => plan.interval === "year")
      .map((plan) => plan.annual_discount_percent || 0)
      .filter((discount) => discount > 0)

    return discounts.length > 0 ? Math.max(...discounts) : 0
  }, [catalogPlans])

  const findCheckoutPlan = (planKey: BillingPlanKey) => {
    return catalogPlans.find((plan) => plan.checkout_key === planKey)
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
  }, [catalogPlans, searchParams, user?.id, loading, autoCheckoutStarted])

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

  const statusPanel = (() => {
    if (checkoutMessage === "success" || checkoutSyncState === "active") {
      return {
        title: "Subscription active",
        text: "Your plan and credits are active on your workspace.",
        tone: "border-neutral-900/10 bg-white",
      }
    }

    if (checkoutMessage === "cancelled" || checkoutSyncState === "cancelled") {
      return {
        title: "Checkout cancelled",
        text: "No charge was made. You can restart checkout whenever you are ready.",
        tone: "border-neutral-900/10 bg-white",
      }
    }

    if (checkoutMessage === "failed" || checkoutSyncState === "failed") {
      return {
        title: "Billing needs attention",
        text: "The payment or subscription status was not confirmed. Open billing settings or contact support if this repeats.",
        tone: "border-destructive/30 bg-white",
      }
    }

    if (checkoutMessage === "pending" || checkoutSyncState === "pending") {
      return {
        title: "Confirming payment",
        text: "Checkout is complete. AxLiner is waiting for the verified billing update before changing credits.",
        tone: "border-neutral-900/10 bg-white",
      }
    }

    return null
  })()

  const freePlan = backendByKey.get("free") || fallbackPlans[0]
  const isFreeAccount = Boolean(user && billingStatus?.plan === "free")
  const accountCredits = billingStatus?.credits?.available_credits ?? 0
  const providerLabel = planCatalog?.provider === "polar" ? "Polar" : "secure checkout"

  const comparisonGroups: ComparisonGroup[] = [
    {
      title: "Volume and limits",
      rows: [
        {
          label: "Included credits",
          values: paidPlans.map((plan) => creditsLabel(plan)),
          emphasis: true,
        },
        {
          label: "Files per run",
          values: paidPlans.map((plan) => `Up to ${plan.max_files_per_batch}`),
          emphasis: true,
        },
        {
          label: "Run policy",
          values: paidPlans.map((plan) => planRunPolicy(plan)),
        },
        {
          label: "Max file size",
          values: paidPlans.map((plan) => `${plan.max_file_size_mb}MB`),
        },
      ],
    },
    {
      title: "Document coverage",
      rows: [
        {
          label: "Mixed-folder auto-detect",
          values: paidPlans.map(() => true),
        },
        {
          label: "Invoices and receipts",
          values: paidPlans.map(() => true),
        },
        {
          label: "Bank statements",
          values: paidPlans.map(() => true),
        },
        {
          label: "Tables and handwritten notes",
          values: paidPlans.map(() => true),
        },
      ],
    },
    {
      title: "Review workflow",
      rows: [
        {
          label: "Batch Review Board",
          values: paidPlans.map(() => true),
        },
        {
          label: "Field and row exception flags",
          values: paidPlans.map(() => true),
        },
        {
          label: "Editable extracted rows",
          values: paidPlans.map(() => true),
        },
        {
          label: "Vendor memory",
          values: paidPlans.map((plan) => plan.plan === "pro" ? "Included" : true),
        },
      ],
    },
    {
      title: "Output and accounting",
      rows: [
        {
          label: "Excel and CSV export",
          values: paidPlans.map(() => true),
        },
        {
          label: "Corrected batch download",
          values: paidPlans.map(() => true),
        },
        {
          label: "AP queue for reviewed bills",
          values: paidPlans.map((plan) => plan.plan === "pro" ? "Limited" : true),
        },
        {
          label: "Publish approved entries",
          values: paidPlans.map((plan) => plan.plan === "pro" ? "Limited" : true),
        },
      ],
    },
  ]

  return (
    <main className="ax-marketing-page min-h-screen bg-white text-black">
      <MarketingNavBar />

      {/* Hero */}
      <section className="pt-[152px]">
        <div className="mx-auto max-w-[1296px] px-4 sm:px-6 lg:px-0">
          <div className="text-center">
            <h1 className="ax-h1 font-bold leading-[1.05] tracking-tight text-neutral-950">
              Simple, honest pricing.
            </h1>
            <p className="mx-auto mt-5 max-w-[720px] text-[18px] font-semibold leading-7 text-neutral-700">
              Processing capacity for full client folders, reviewed exports, and approved accounting handoff. Start free with {freePlan.credits.toLocaleString()} credits.
            </p>
          </div>

          {/* Billing toggle */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <span className={cn("text-sm font-bold", billingMode === "month" ? "text-neutral-950" : "text-neutral-400")}>
              Monthly
            </span>
            <button
              type="button"
              aria-label="Toggle annual billing"
              onClick={() => setBillingMode((mode) => mode === "month" ? "year" : "month")}
              className="relative inline-flex h-7 w-12 shrink-0 rounded-full bg-neutral-950 p-1 transition-colors"
            >
              <span
                className={cn(
                  "h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
                  billingMode === "year" && "translate-x-5"
                )}
              />
            </button>
            <span className={cn("relative text-sm font-semibold transition-colors", billingMode === "year" ? "text-neutral-950" : "text-neutral-400")}>
              Annual
              {/* GREEN annual-discount badge — intentionally kept green */}
              {yearlyDiscountPercent > 0 && (
                <span className="ml-3 rounded-full border border-[#b6fcdf] bg-[#e9fef6] px-3.5 py-1.5 text-[15px] font-bold leading-none text-[#28b57b]">
                  {yearlyDiscountPercent}% off
                </span>
              )}
            </span>
          </div>

          {isFreeAccount && (
            <div className="mx-auto mt-6 flex w-fit items-center gap-4 rounded-full border border-neutral-900/15 bg-white px-5 py-3 shadow-sm">
              <CreditStack className="h-6 w-6 text-neutral-950" />
              <span className="text-sm font-bold text-neutral-950">
                <span className="text-neutral-950">{accountCredits.toLocaleString()}</span> credits left
              </span>
            </div>
          )}

          {statusPanel && (
            <div className={cn("mx-auto mt-8 max-w-3xl rounded-[24px] border p-5 text-left shadow-sm", statusPanel.tone)}>
              <p className="text-base font-bold text-neutral-950">{statusPanel.title}</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-neutral-800">{statusPanel.text}</p>
            </div>
          )}

          {/* Plan cards */}
          <div id="plans" className="mt-10 grid gap-6 lg:grid-cols-3">
            {billingLoading && plans.length === 0 ? (
              fallbackPlans.slice(1, 4).map((plan) => (
                <article key={plan.key} className="min-h-[600px] rounded-[42px] border border-neutral-200 bg-gradient-to-b from-white to-neutral-50 p-10">
                  <div className="h-full animate-pulse">
                    <div className="h-8 w-28 rounded-full bg-neutral-200" />
                    <div className="mt-10 h-20 w-40 rounded-[16px] bg-neutral-200" />
                    <div className="mt-8 h-24 rounded-[20px] bg-neutral-200" />
                    <div className="mt-auto h-12 rounded-full bg-neutral-200" />
                  </div>
                </article>
              ))
            ) : (
              paidPlans.map((plan) => {
                const copy = planCopyByPlan[plan.plan] || planCopyByPlan.pro
                const isPopular = plan.plan === "max"
                const isLoading = Boolean(plan.checkout_key && checkoutLoading === plan.checkout_key)

                return (
                  <article
                    key={`${plan.plan}-${plan.interval}`}
                    className={cn(
                      "flex min-h-[600px] flex-col gap-8 rounded-[42px] border p-10",
                      isPopular
                        ? "border-neutral-950 bg-white"
                        : "border-neutral-200 bg-white"
                    )}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <h2 className={cn(
                          "ax-h3 font-bold leading-tight tracking-tight",
                          "text-neutral-950"
                        )}>
                          {copy.name}
                        </h2>
                        {isPopular && (
                          <span className="rounded-full bg-neutral-950 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-white">
                            Popular
                          </span>
                        )}
                      </div>
                      <div className={cn("mt-8 flex items-end gap-2", "text-neutral-950")}>
                        <span className="pb-3 text-3xl font-semibold">$</span>
                        <span className="text-[88px] font-bold leading-none tracking-tight">{priceNumber(plan)}</span>
                      </div>
                      <p className={cn("mt-2 text-base font-semibold", "text-neutral-500")}>
                        {priceSubtext(plan)}
                      </p>
                      <p className={cn("mt-5 text-lg font-bold", "text-neutral-950")}>
                        {creditsLabel(plan)}
                      </p>
                    </div>

                    <p className={cn("text-[17px] font-semibold leading-7", "text-neutral-700")}>
                      {copy.description}
                    </p>

                    <ul className="flex-1 space-y-3">
                      {copy.included.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-base font-semibold leading-7">
                          <Check aria-hidden="true" className={cn("mt-1 h-4 w-4 shrink-0", "text-neutral-950")} />
                          <span className="text-neutral-900">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant="glossy"
                      className="h-12 w-full rounded-lg text-base font-bold"
                      disabled={isLoading}
                      onClick={() => startCheckout(plan)}
                    >
                      {isLoading ? "Opening checkout..." : "Buy now"}
                      {!isLoading && <ArrowRight aria-hidden="true" className="h-4 w-4" />}
                    </Button>
                  </article>
                )
              })
            )}
          </div>
        </div>
      </section>

      <IntegrationsLogos />

      {paidPlans.length > 0 && (
        <section className="mx-auto mt-32 max-w-[1248px] px-4 sm:px-6 lg:px-0">
          <h2 className="ax-h2 text-center font-bold leading-tight tracking-tight text-neutral-950">
            Compare plans
          </h2>

          <div className="sticky top-[84px] z-40 mt-14 hidden grid-cols-[30%_repeat(3,minmax(0,1fr))] overflow-hidden rounded-t-[32px] border border-neutral-200 bg-white shadow-[0_14px_36px_-30px_rgba(0,0,0,0.55)] lg:grid">
            <div className="bg-neutral-50 px-6 py-7 text-base font-bold uppercase tracking-[0.16em] text-neutral-500">
              Feature
            </div>
            {paidPlans.map((plan) => {
              const copy = planCopyByPlan[plan.plan] || planCopyByPlan.pro
              return (
                <div key={`sticky-${plan.plan}-${plan.interval}`} className="border-l border-neutral-200 bg-white px-6 py-7">
                  <p className="text-[26px] font-bold leading-tight text-neutral-950">{copy.name}</p>
                  <p className="mt-4 text-[34px] font-bold leading-none text-neutral-950">{comparePriceLabel(plan)}</p>
                  <p className="mt-2 text-base font-semibold text-neutral-700">{compareBillingLabel(plan)}</p>
                </div>
              )
            })}
          </div>

          <div className="rounded-[32px] border border-neutral-200 bg-white lg:rounded-t-none lg:border-t-0">
            <Table className="min-w-[980px] border-separate border-spacing-0 text-base" containerClassName="overflow-x-auto rounded-[32px] lg:rounded-t-none">
              <TableHeader className="lg:hidden">
                <TableRow className="border-neutral-200 hover:bg-transparent">
                  <TableHead className="w-[30%] border-b border-neutral-200 bg-neutral-50 px-6 py-7 text-base font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Feature
                  </TableHead>
                  {paidPlans.map((plan) => {
                    const copy = planCopyByPlan[plan.plan] || planCopyByPlan.pro
                    return (
                      <TableHead key={`${plan.plan}-${plan.interval}`} className="border-b border-l border-neutral-200 bg-white px-6 py-7 align-top">
                        <p className="text-[26px] font-bold leading-tight text-neutral-950">{copy.name}</p>
                        <p className="mt-4 text-[34px] font-bold leading-none text-neutral-950">{comparePriceLabel(plan)}</p>
                        <p className="mt-2 text-base font-semibold text-neutral-700">{compareBillingLabel(plan)}</p>
                      </TableHead>
                    )
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonGroups.map((group) => (
                  <Fragment key={group.title}>
                    <TableRow className="border-neutral-200 bg-neutral-50 hover:bg-neutral-50">
                      <TableCell
                        colSpan={paidPlans.length + 1}
                        className="border-b border-neutral-200 px-6 py-4 text-sm font-bold uppercase tracking-[0.2em] text-neutral-500"
                      >
                        {group.title}
                      </TableCell>
                    </TableRow>
                    {group.rows.map((row) => (
                      <TableRow key={row.label} className="border-neutral-200 hover:bg-neutral-50">
                        <TableCell className={cn("border-b border-neutral-200 px-6 py-6 text-base font-semibold text-neutral-950", row.emphasis && "text-lg")}>
                          {row.label}
                        </TableCell>
                        {row.values.map((value, index) => (
                          <TableCell key={`${row.label}-${index}`} className="border-b border-l border-neutral-200 px-6 py-6 text-base font-semibold text-neutral-900">
                            <CompareCellValue value={value} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      )}

      <section className="mx-auto mt-36 grid max-w-[1248px] gap-12 px-4 pb-28 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-0">
        <h2 className="ax-h2 font-bold leading-none tracking-tight text-neutral-950">FAQ</h2>
        <div className="divide-y divide-neutral-200 border-y border-neutral-200">
          {faqs.map((item) => (
            <details key={item.question} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-bold text-neutral-950">
                {item.question}
                <span className="text-2xl font-semibold text-neutral-400 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="max-w-3xl pb-2 pt-4 text-base font-semibold leading-7 text-neutral-700">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="pb-28 text-center">
        <h2 className="ax-h2 font-bold leading-tight tracking-tight text-neutral-950">
          Clear the next client folder faster.
        </h2>
        <Button
          asChild
          variant="glossy"
          className="mt-10 h-12 min-w-[300px] rounded-lg text-base font-bold"
        >
          <Link href="/dashboard/client">Start now</Link>
        </Button>
        <p className="mt-4 text-sm font-semibold text-neutral-900">Checkout handled by {providerLabel}.</p>
      </section>
    </main>
  )
}
