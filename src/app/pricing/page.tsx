"use client"

import { Fragment, Suspense, type ComponentType, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowRight,
  BookCheck,
  Check,
  CircleDollarSign,
  FileSpreadsheet,
  FolderOpen,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { CreditStack } from "@/components/BillingGlyphs"
import { MarketingNavBar } from "@/components/MarketingNavBar"
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
type PricingIcon = ComponentType<{ className?: string }>
type ComparisonGroup = {
  title: string
  rows: Array<{
    label: string
    values: ComparisonCell[]
    emphasis?: boolean
  }>
}

const paidPlanKeys: BillingPlanKey[] = ["pro_monthly", "pro_yearly", "max_monthly", "max_yearly", "mega_monthly", "mega_yearly"]

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
  eyebrow: string
  description: string
  bestFor: string
  features: string[]
}> = {
  free: {
    name: "Free",
    eyebrow: "Try the workflow",
    description: "For a small test batch before moving client work into AxLiner.",
    bestFor: "A first folder, a sample client, or light cleanup.",
    features: ["30 starter credits", "5 files per run", "Saved batches after sign-up", "Review and export outputs"],
  },
  pro: {
    name: "Standard",
    eyebrow: "Regular client folders",
    description: "For solo bookkeepers processing recurring invoice and receipt batches.",
    bestFor: "Weekly client paperwork and month-end catch-up.",
    features: ["1,000 credits each month", "30 files per run", "Mixed document auto-detect", "Review board and clean exports"],
  },
  max: {
    name: "Pro",
    eyebrow: "Most practices",
    description: "For accounting teams that need bigger batches and a smoother review flow.",
    bestFor: "Multiple clients, supplier invoices, statements, and AP handoff.",
    features: ["2,500 credits each month", "50 files per run", "Vendor memory and exception review", "Draft publishing handoff"],
  },
  mega: {
    name: "Max",
    eyebrow: "Higher volume",
    description: "For practices clearing larger backlogs and high-volume client folders.",
    bestFor: "Bulk cleanup, monthly close pressure, and dense client folders.",
    features: ["7,000 credits each month", "100 files per run", "Lowest unit cost", "High-volume review workflow"],
  },
}

const workflowCards = [
  {
    icon: FolderOpen,
    title: "One folder, mixed documents",
    text: "Invoices, receipts, statements, notes, scans, photos, and PDFs can start in the same batch.",
  },
  {
    icon: BookCheck,
    title: "Review exceptions first",
    text: "AxLiner flags uncertain fields and keeps the source beside the extracted row before export.",
  },
  {
    icon: FileSpreadsheet,
    title: "Clean handoff",
    text: "Export corrected Excel or CSV files, or publish reviewed entries to your accounting software.",
  },
]

const includedAll = [
  "Auto-detect for mixed client folders",
  "Invoice, receipt, bank statement, table, and notes modes",
  "Batch Review Board with editable fields",
  "Excel, CSV, and text exports",
  "Accounting software handoff for approved entries",
]

const creditGuideCards: Array<{ icon: PricingIcon; label: string; value: string; text: string }> = [
  { icon: ReceiptText, label: "Standard", value: "1,000", text: "steady receipt and invoice cleanup" },
  { icon: ShieldCheck, label: "Pro", value: "2,500", text: "larger client batches and AP review" },
  { icon: CreditStack, label: "Max", value: "7,000", text: "high-volume folders and backlog work" },
]

function formatCents(cents: number) {
  const amount = (cents || 0) / 100
  return amount % 1 === 0 ? `$${amount.toLocaleString()}` : `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function creditsLabel(plan: BillingPlan) {
  if (!plan.checkout_key) return plan.included_volume || `${plan.credits.toLocaleString()} credits`
  return plan.interval === "year"
    ? `${plan.credits.toLocaleString()} credits/year`
    : `${plan.credits.toLocaleString()} credits/month`
}

function priceSubtext(plan: BillingPlan) {
  if (plan.interval === "forever") return "No card required"
  if (plan.interval === "year") {
    const monthlyEquivalent = Math.round((plan.price_cents || 0) / 12 / 100)
    return `${formatCents(monthlyEquivalent * 100)}/mo, billed yearly`
  }
  return "per month"
}

function creditUnitPrice(plan: BillingPlan) {
  if (!plan.checkout_key || !plan.credits) return "Starter credits included"
  const cents = plan.price_cents / plan.credits
  return `${cents.toFixed(cents >= 1 ? 1 : 2)} cents per credit`
}

function planRunPolicy(plan: BillingPlan) {
  if (plan.daily_run_limit) return `${plan.daily_run_limit} runs/day`
  return "No daily run cap"
}

function CompareTick() {
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand-green)] text-[var(--brand-green-fg)] shadow-[0_0_0_1px_var(--brand-green-ring)]">
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

  const visiblePlans = useMemo(() => {
    const free = backendByKey.get("free")
    const standard = catalogPlans.find((plan) => plan.plan === "pro" && plan.interval === billingMode)
    const pro = catalogPlans.find((plan) => plan.plan === "max" && plan.interval === billingMode)
    const max = catalogPlans.find((plan) => plan.plan === "mega" && plan.interval === billingMode)
    return [free, standard, pro, max].filter(Boolean) as BillingPlan[]
  }, [backendByKey, billingMode, catalogPlans])

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
      toast.error("Polar checkout is not configured yet.")
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

  const isFreeAccount = Boolean(user && billingStatus?.plan === "free")
  const accountCredits = billingStatus?.credits?.available_credits ?? 0
  const freePlan = backendByKey.get("free")
  const freeCreditsLabel = freePlan?.included_volume || "30 free credits"
  const comparisonPlans = visiblePlans
  const providerLabel = planCatalog?.provider === "polar" || !planCatalog ? "Polar" : "billing"

  const comparisonGroups: ComparisonGroup[] = [
    {
      title: "Volume and limits",
      rows: [
        {
          label: "Included credits",
          values: comparisonPlans.map((plan) => creditsLabel(plan)),
          emphasis: true,
        },
        {
          label: "Files per run",
          values: comparisonPlans.map((plan) => `Up to ${plan.max_files_per_batch}`),
          emphasis: true,
        },
        {
          label: "Run policy",
          values: comparisonPlans.map((plan) => planRunPolicy(plan)),
        },
        {
          label: "Max file size",
          values: comparisonPlans.map((plan) => `${plan.max_file_size_mb}MB`),
        },
      ],
    },
    {
      title: "Document coverage",
      rows: [
        {
          label: "Mixed-folder auto-detect",
          values: comparisonPlans.map(() => true),
        },
        {
          label: "Invoices and receipts",
          values: comparisonPlans.map(() => true),
        },
        {
          label: "Bank statements",
          values: comparisonPlans.map(() => true),
        },
        {
          label: "Tables and handwritten notes",
          values: comparisonPlans.map(() => true),
        },
      ],
    },
    {
      title: "Review workflow",
      rows: [
        {
          label: "Batch Review Board",
          values: comparisonPlans.map((plan) => plan.checkout_key ? true : "Limited"),
        },
        {
          label: "Field and row exception flags",
          values: comparisonPlans.map(() => true),
        },
        {
          label: "Editable extracted rows",
          values: comparisonPlans.map(() => true),
        },
        {
          label: "Vendor memory",
          values: comparisonPlans.map((plan) => plan.checkout_key ? true : "Account only"),
        },
      ],
    },
    {
      title: "Output and accounting",
      rows: [
        {
          label: "Excel and CSV export",
          values: comparisonPlans.map(() => true),
        },
        {
          label: "Corrected batch download",
          values: comparisonPlans.map((plan) => plan.checkout_key ? true : "Limited"),
        },
        {
          label: "AP queue for reviewed bills",
          values: comparisonPlans.map((plan) => plan.checkout_key ? true : "Limited"),
        },
        {
          label: "Publish approved entries",
          values: comparisonPlans.map((plan) => plan.checkout_key ? true : "Limited"),
        },
      ],
    },
  ]

  return (
    <main className="ax-marketing-page min-h-screen bg-white text-black">
      <MarketingNavBar />

      <section className="ax-marketing-container max-w-[1500px] pb-16 pt-32 lg:pt-36">
        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">Pricing</p>
            <h1 className="ax-marketing-section-title mt-4 max-w-[980px] text-black">
              Simple pricing for messy accounting work.
            </h1>
            <p className="ax-marketing-lead mt-6 max-w-[820px] text-black">
              Pay for processing volume, not client seats. Upload full folders, review exceptions, export clean files, or publish approved entries to your accounting software.
            </p>
          </div>

          <div className="rounded-[8px] border border-neutral-900/12 bg-[#f7fff9] p-5 shadow-[0_18px_44px_-34px_rgba(0,0,0,0.45)]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand-green)] text-[var(--brand-green-fg)] shadow-[0_0_0_1px_var(--brand-green-ring)]">
                <CircleDollarSign aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-bold text-neutral-950">Credits stay simple.</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-neutral-800">
                  One processed page or image uses one credit. You can upload mixed batches; AxLiner handles the sorting and review flow.
                </p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm font-semibold text-neutral-950">
              <div className="rounded-[8px] border border-neutral-900/10 bg-white p-3">No client minimums</div>
              <div className="rounded-[8px] border border-neutral-900/10 bg-white p-3">Secure checkout by {providerLabel}</div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex w-fit rounded-full border border-neutral-900/15 bg-white p-1 shadow-sm">
            {(["month", "year"] as BillingMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setBillingMode(mode)}
                className={cn(
                  "rounded-full px-5 py-2 text-sm font-bold transition",
                  billingMode === mode
                    ? "bg-neutral-950 text-white shadow-sm"
                    : "text-neutral-800 hover:bg-[var(--brand-green)]"
                )}
              >
                {mode === "month" ? "Monthly" : "Annual"}
              </button>
            ))}
          </div>

          <p className="max-w-xl text-sm font-semibold leading-6 text-neutral-700">
            Annual plans include 12 months of credits and come in below paying month to month.
          </p>
        </div>

        {!user && !loading && (
          <div className="mt-7 flex w-fit flex-wrap items-center gap-3 rounded-full border border-neutral-900/10 bg-[var(--brand-green)] px-4 py-2 text-sm font-semibold text-neutral-950 shadow-sm">
            <span>
              Create a free account for <span className="font-bold text-[var(--brand-green-fg)]">{freeCreditsLabel}</span>.
            </span>
            <Link href="/sign-up?next=%2Fdashboard%2Fclient" className="font-bold underline underline-offset-4">
              Start free
            </Link>
          </div>
        )}

        {isFreeAccount && (
          <div className="mt-7 flex w-fit items-center gap-4 rounded-full border border-neutral-900/15 bg-white px-5 py-3 shadow-sm">
            <CreditStack className="h-6 w-6 text-neutral-950" />
            <span className="text-sm font-bold text-neutral-950">
              <span className="text-emerald-700">{accountCredits.toLocaleString()}</span> credits left
            </span>
            <Button
              size="sm"
              variant="glossy"
              onClick={() => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            >
              Upgrade
            </Button>
          </div>
        )}

        {statusPanel && (
          <div className={cn("mt-8 max-w-4xl rounded-[8px] border p-5 shadow-sm", statusPanel.tone)}>
            <p className="text-base font-bold text-neutral-950">{statusPanel.title}</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-neutral-800">{statusPanel.text}</p>
          </div>
        )}

        <div id="plans" className="mt-12 grid max-w-[1500px] auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-4">
          {billingLoading && plans.length === 0
            ? fallbackPlans.slice(0, 4).map((plan) => (
                <article key={plan.key} className="min-h-[560px] rounded-[8px] border border-neutral-900/10 bg-white p-6 shadow-sm">
                  <div className="h-full animate-pulse">
                    <div className="h-4 w-28 rounded-full bg-neutral-200" />
                    <div className="mt-8 h-12 w-36 rounded-[8px] bg-neutral-200" />
                    <div className="mt-8 h-24 rounded-[8px] bg-neutral-200" />
                    <div className="mt-8 h-12 rounded-full bg-neutral-200" />
                  </div>
                </article>
              ))
            : visiblePlans.map((plan) => {
                const copy = planCopyByPlan[plan.plan] || planCopyByPlan.free
                const isPaid = Boolean(plan.checkout_key)
                const isLoading = Boolean(plan.checkout_key && checkoutLoading === plan.checkout_key)
                const isPopular = plan.plan === "max"
                const actionLabel = isLoading ? "Opening checkout..." : isPaid ? `Choose ${copy.name}` : "Start free"

                return (
                  <article
                    key={`${plan.plan}-${plan.interval}`}
                    className={cn(
                      "relative flex min-h-[570px] flex-col rounded-[8px] border bg-white p-6 shadow-[0_18px_55px_-42px_rgba(0,0,0,0.5)]",
                      isPopular ? "border-emerald-500 ring-1 ring-emerald-500/40" : "border-neutral-900/12"
                    )}
                  >
                    {isPopular && (
                      <span className="absolute right-5 top-5 rounded-full bg-[var(--brand-green)] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--brand-green-fg)] shadow-[0_0_0_1px_var(--brand-green-ring)]">
                        Best fit
                      </span>
                    )}

                    <div className="pr-20">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">{copy.eyebrow}</p>
                      <h2 className="mt-3 text-2xl font-bold text-neutral-950">{copy.name}</h2>
                      <p className="mt-3 min-h-[72px] text-[15px] font-semibold leading-6 text-neutral-800">{copy.description}</p>
                    </div>

                    <div className="mt-8">
                      <div className="flex items-end gap-2 text-neutral-950">
                        <span className="text-5xl font-bold tracking-normal">{formatCents(plan.price_cents)}</span>
                      </div>
                      <p className="mt-2 text-sm font-bold uppercase tracking-[0.14em] text-emerald-700">{priceSubtext(plan)}</p>
                    </div>

                    <div className="mt-6 rounded-[8px] border border-neutral-900/10 bg-[#f7fff9] p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Included volume</p>
                      <p className="mt-2 text-lg font-bold text-neutral-950">{creditsLabel(plan)}</p>
                      <p className="mt-1 text-sm font-semibold text-neutral-700">{creditUnitPrice(plan)}</p>
                    </div>

                    <Button
                      className="mt-6 h-11 w-full"
                      variant={isPopular ? "glossy" : isPaid ? "ink" : "surface"}
                      disabled={isLoading}
                      onClick={() => startCheckout(plan)}
                    >
                      {actionLabel}
                      {!isLoading && <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />}
                    </Button>

                    <div className="mt-6 border-t border-neutral-900/10 pt-5">
                      <p className="text-sm font-bold text-neutral-950">Best for</p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-neutral-800">{copy.bestFor}</p>
                    </div>

                    <ul className="mt-5 flex-1 space-y-3">
                      {copy.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm font-semibold leading-6 text-neutral-900">
                          <Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                )
              })}
        </div>

        <section className="mt-16 grid gap-4 lg:grid-cols-3">
          {workflowCards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.title} className="rounded-[8px] border border-neutral-900/10 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-950 text-white">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-xl font-bold text-neutral-950">{card.title}</h2>
                <p className="mt-3 text-[15px] font-semibold leading-6 text-neutral-800">{card.text}</p>
              </div>
            )
          })}
        </section>

        <section className="mt-16 rounded-[8px] border border-neutral-900/10 bg-neutral-950 p-6 text-white shadow-[0_24px_80px_-56px_rgba(0,0,0,0.65)] lg:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-green)]">Every paid plan</p>
              <h2 className="mt-4 text-3xl font-bold tracking-normal sm:text-4xl">The same workflow, more capacity as you grow.</h2>
              <p className="mt-4 text-base font-semibold leading-7 text-white/78">
                We keep pricing easy to understand: the plan changes your monthly credits and batch size. The review workflow stays familiar.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {includedAll.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[8px] border border-white/12 bg-white/6 p-4">
                  <Sparkles aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-green)]" />
                  <span className="text-sm font-semibold leading-6 text-white">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {comparisonPlans.length > 0 && (
          <section className="mt-20 max-w-[1500px]">
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">Side by side</p>
                <h2 className="ax-marketing-section-title mt-3 text-black">Compare plans</h2>
              </div>
              <p className="max-w-xl text-sm font-semibold leading-6 text-neutral-700">
                Prices stay visible while you scroll the table, so it is easy to compare capacity against workflow features.
              </p>
            </div>

            <div className="sticky top-[72px] z-30 hidden grid-cols-[24%_repeat(4,minmax(0,1fr))] overflow-hidden rounded-t-[8px] border border-neutral-900/10 bg-white/95 shadow-[0_1px_0_rgba(0,0,0,0.12),0_18px_45px_-38px_rgba(0,0,0,0.55)] backdrop-blur lg:grid">
              <div className="flex items-end border-r border-neutral-900/10 px-6 pb-5 pt-4 text-xs font-bold uppercase tracking-[0.16em] text-neutral-900">
                Feature
              </div>
              {comparisonPlans.map((plan) => {
                const copy = planCopyByPlan[plan.plan] || planCopyByPlan.free
                const isLoading = Boolean(plan.checkout_key && checkoutLoading === plan.checkout_key)
                return (
                  <div key={`sticky-${plan.plan}-${plan.interval}`} className="flex min-h-[168px] flex-col border-r border-neutral-900/10 px-5 pb-5 pt-4 last:border-r-0">
                    <p className="text-lg font-bold text-neutral-950">{copy.name}</p>
                    <p className="mt-2 text-sm font-semibold leading-5 text-neutral-700">{creditsLabel(plan)}</p>
                    <p className="mt-4 text-3xl font-bold tracking-normal text-neutral-950">{formatCents(plan.price_cents)}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">{priceSubtext(plan)}</p>
                    <Button
                      className="mt-auto h-10 w-full"
                      variant={plan.plan === "max" ? "glossy" : plan.checkout_key ? "ink" : "surface"}
                      disabled={isLoading}
                      onClick={() => startCheckout(plan)}
                    >
                      {isLoading ? "Opening..." : plan.checkout_key ? "Choose plan" : "Start free"}
                    </Button>
                  </div>
                )
              })}
            </div>

            <Table
              className="min-w-[1040px] border-separate border-spacing-0"
              containerClassName="rounded-[8px] border border-neutral-900/10 bg-white shadow-sm lg:overflow-visible"
            >
              <TableHeader className="bg-white/95 shadow-[0_1px_0_rgba(0,0,0,0.12)] lg:hidden">
                <TableRow className="border-neutral-900/10 hover:bg-transparent">
                  <TableHead className="sticky left-0 z-40 w-[24%] border-b border-neutral-900/10 bg-white/95 px-4 pb-5 pt-4 text-xs font-bold uppercase tracking-[0.16em] text-neutral-900 lg:px-6">
                    Feature
                  </TableHead>
                  {comparisonPlans.map((plan) => {
                    const copy = planCopyByPlan[plan.plan] || planCopyByPlan.free
                    const isLoading = Boolean(plan.checkout_key && checkoutLoading === plan.checkout_key)
                    return (
                      <TableHead
                        key={`${plan.plan}-${plan.interval}`}
                        className="min-w-[190px] border-b border-neutral-900/10 px-4 pb-5 pt-4 align-top lg:px-5"
                      >
                        <div className="flex min-h-[168px] flex-col items-start whitespace-normal">
                          <p className="text-lg font-bold text-neutral-950">{copy.name}</p>
                          <p className="mt-2 text-sm font-semibold leading-5 text-neutral-700">{creditsLabel(plan)}</p>
                          <p className="mt-4 text-3xl font-bold tracking-normal text-neutral-950">{formatCents(plan.price_cents)}</p>
                          <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">{priceSubtext(plan)}</p>
                          <Button
                            className="mt-auto h-10 w-full"
                            variant={plan.plan === "max" ? "glossy" : plan.checkout_key ? "ink" : "surface"}
                            disabled={isLoading}
                            onClick={() => startCheckout(plan)}
                          >
                            {isLoading ? "Opening..." : plan.checkout_key ? "Choose plan" : "Start free"}
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
                    <TableRow className="border-neutral-900/10 bg-[#f7fff9] hover:bg-[#f7fff9]">
                      <TableCell
                        colSpan={comparisonPlans.length + 1}
                        className="border-b border-neutral-900/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-800 lg:px-6"
                      >
                        {group.title}
                      </TableCell>
                    </TableRow>
                    {group.rows.map((row) => (
                      <TableRow key={row.label} className="border-neutral-900/10 hover:bg-[var(--brand-green)]/35">
                        <TableCell
                          className={cn(
                            "sticky left-0 z-10 border-b border-neutral-900/10 bg-white px-4 py-5 text-sm font-bold whitespace-normal text-neutral-950 lg:px-6",
                            row.emphasis && "text-base"
                          )}
                        >
                          {row.label}
                        </TableCell>
                        {row.values.map((value, index) => (
                          <TableCell
                            key={`${row.label}-${index}`}
                            className={cn(
                              "border-b border-neutral-900/10 px-4 py-5 text-sm font-semibold whitespace-normal text-neutral-900 lg:px-5",
                              row.emphasis && "text-base"
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

        <section className="mt-16 grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="rounded-[8px] border border-neutral-900/10 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--brand-green)] text-[var(--brand-green-fg)] shadow-[0_0_0_1px_var(--brand-green-ring)]">
              <UploadCloud aria-hidden="true" className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-neutral-950">Not sure how many credits you need?</h2>
            <p className="mt-3 text-[15px] font-semibold leading-6 text-neutral-800">
              Start with the plan that matches your usual monthly folder volume. If the close gets heavier, upgrade before the next batch.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {creditGuideCards.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="rounded-[8px] border border-neutral-900/10 bg-white p-5 shadow-sm">
                  <Icon className="h-6 w-6 text-neutral-950" />
                  <p className="mt-5 text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">{item.label}</p>
                  <p className="mt-2 text-3xl font-bold text-neutral-950">{item.value}</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-neutral-800">{item.text}</p>
                </div>
              )
            })}
          </div>
        </section>
      </section>
    </main>
  )
}
