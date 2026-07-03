"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import type { ComponentType } from "react"
import {
  ArrowRight,
  BookCheck,
  Building2,
  CircleDollarSign,
  Clock3,
  FileStack,
  Landmark,
  PlugZap,
  ReceiptText,
  ShieldCheck,
  Upload,
} from "lucide-react"

import type { CompanySummary } from "@/components/dashboard/companies/company-types"
import { StatusBadge, type StatusTone } from "@/components/dashboard/StatusBadge"
import { Button } from "@/components/ui/button"
import { useMotionTokens } from "@/lib/motion"
import { cn } from "@/lib/utils"

type MetricCard = {
  key: string
  label: string
  value: number
  icon: ComponentType<{ className?: string }>
  tone: "blue" | "amber" | "emerald" | "violet" | "ink"
  href?: string
}

type FlowStep = {
  key: string
  label: string
  value: number
  icon: ComponentType<{ className?: string }>
  tone: string
}

const moneyFormatter = new Intl.NumberFormat(undefined, {
  notation: "compact",
  maximumFractionDigits: 1,
})

function formatCount(value: number) {
  return moneyFormatter.format(value)
}

function recentDate(value: string | null) {
  if (!value) return "No upload"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "No upload"
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date)
}

function totalDocuments(company: CompanySummary) {
  return company.purchases + company.receipts + company.bankStatements + company.other
}

function freshnessScore(value: string | null) {
  if (!value) return 0
  const time = new Date(value).getTime()
  if (Number.isNaN(time)) return 0
  return time
}

function statusFor(company: CompanySummary): { label: string; tone: StatusTone } {
  if (company.needsReview > 0) return { label: "Review", tone: "warning" }
  if (company.bills > 0) return { label: "Bills", tone: "success" }
  if (totalDocuments(company) > 0) return { label: "Clear", tone: "neutral" }
  return { label: "Empty", tone: "neutral" }
}

function toneClass(tone: MetricCard["tone"]) {
  if (tone === "amber") return "bg-[color-mix(in_srgb,var(--workspace-warning)_10%,white)] text-[var(--workspace-warning)]"
  if (tone === "emerald") return "bg-[color-mix(in_srgb,var(--text-success)_10%,white)] text-[var(--text-success)]"
  if (tone === "violet") return "bg-[color-mix(in_srgb,var(--text-review)_10%,white)] text-[var(--text-review)]"
  if (tone === "ink") return "bg-[#111827] text-white"
  return "bg-[var(--workspace-blue-soft)] text-[var(--workspace-primary)]"
}

function MetricCardView({ metric }: { metric: MetricCard }) {
  const Icon = metric.icon
  const body = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className={cn("flex size-9 items-center justify-center rounded-lg", toneClass(metric.tone))}>
          <Icon className="size-4" />
        </span>
        <ArrowRight className={cn("size-4 text-[var(--workspace-muted)]", !metric.href && "hidden")} />
      </div>
      <div className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--workspace-muted)]">{metric.label}</p>
        <p className="mt-1 text-3xl font-semibold leading-none tabular-nums text-[var(--workspace-ink)]">{formatCount(metric.value)}</p>
      </div>
    </>
  )

  const className = "ax-interactive block rounded-xl border border-[var(--workspace-border)] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_-20px_rgba(16,24,40,0.35)] hover:-translate-y-0.5 hover:shadow-[0_2px_5px_rgba(16,24,40,0.08),0_18px_34px_-22px_rgba(16,24,40,0.42)]"

  if (metric.href) {
    return (
      <Link href={metric.href} className={className}>
        {body}
      </Link>
    )
  }

  return <div className={className}>{body}</div>
}

function FlowStepView({ step, total }: { step: FlowStep; total: number }) {
  const Icon = step.icon
  const width = total > 0 ? Math.max(8, Math.round((step.value / total) * 100)) : 8

  return (
    <div className="min-w-0 rounded-lg border border-[var(--workspace-border)] bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-[12px] font-semibold text-[var(--workspace-ink)]">
          <span className={cn("flex size-7 items-center justify-center rounded-md", step.tone)}>
            <Icon className="size-3.5" />
          </span>
          {step.label}
        </span>
        <span className="font-mono text-[12px] font-semibold tabular-nums text-[var(--workspace-muted)]">{formatCount(step.value)}</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--workspace-soft)]">
        <div className="h-full rounded-full bg-[var(--workspace-primary)]" style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}

function ClientRow({ company }: { company: CompanySummary }) {
  const status = statusFor(company)
  const docs = totalDocuments(company)
  const reviewWeight = docs > 0 ? Math.round((company.needsReview / docs) * 100) : 0

  return (
    <Link
      href={`/dashboard/companies/${encodeURIComponent(company.id)}`}
      className="ax-interactive group grid gap-3 rounded-lg border border-transparent px-2 py-2.5 hover:border-[var(--workspace-border)] hover:bg-[var(--workspace-row-hover)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[var(--workspace-border)] bg-[var(--workspace-soft)] text-[var(--workspace-ink)]">
          <Building2 className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-[var(--workspace-ink)]">{company.name}</span>
          <span className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-[var(--workspace-muted)]">
            <span>{formatCount(docs)} docs</span>
            <span className="h-1 w-1 rounded-full bg-[var(--workspace-border)]" />
            <span>{recentDate(company.lastUploadAt)}</span>
            {company.accountingConnected ? (
              <>
                <span className="h-1 w-1 rounded-full bg-[var(--workspace-border)]" />
                <span>{company.accountingProvider === "xero" ? "Xero" : "QuickBooks"}</span>
              </>
            ) : null}
          </span>
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-[var(--workspace-soft)] sm:block">
          <div
            className={cn(
              "h-full rounded-full",
              company.needsReview > 0 ? "bg-[var(--workspace-warning)]" : "bg-[var(--workspace-success)]",
            )}
            style={{ width: `${company.needsReview > 0 ? Math.max(12, reviewWeight) : docs > 0 ? 100 : 8}%` }}
          />
        </div>
        <StatusBadge tone={status.tone} size="sm">{status.label}</StatusBadge>
      </div>
    </Link>
  )
}

export function WorkspaceCommandCenter({ companies }: { companies: CompanySummary[] }) {
  const m = useMotionTokens()

  if (!companies.length) return null

  const needsReview = companies.reduce((sum, company) => sum + company.needsReview, 0)
  const draftBills = companies.reduce((sum, company) => sum + company.bills, 0)
  const documents = companies.reduce((sum, company) => sum + totalDocuments(company), 0)
  const connected = companies.filter((company) => company.accountingConnected).length
  const connectedReady = connected > 0 && connected === companies.length
  const activeClients = companies.filter((company) => totalDocuments(company) > 0 || company.needsReview > 0 || company.bills > 0).length

  const priorityClients = [...companies]
    .sort((left, right) => (
      right.needsReview - left.needsReview ||
      right.bills - left.bills ||
      totalDocuments(right) - totalDocuments(left) ||
      freshnessScore(right.lastUploadAt) - freshnessScore(left.lastUploadAt)
    ))
    .slice(0, 4)

  const metrics: MetricCard[] = [
    { key: "review", label: "Review", value: needsReview, icon: BookCheck, tone: needsReview > 0 ? "amber" : "emerald", href: "#clients" },
    { key: "bills", label: "Bills", value: draftBills, icon: CircleDollarSign, tone: draftBills > 0 ? "emerald" : "blue", href: "/dashboard/accounts-payable" },
    { key: "connected", label: "Connected", value: connected, icon: PlugZap, tone: connectedReady ? "emerald" : "violet", href: "/dashboard/integrations" },
    { key: "docs", label: "Docs", value: documents, icon: FileStack, tone: "ink" },
  ]

  const flow: FlowStep[] = [
    { key: "intake", label: "Intake", value: documents, icon: Upload, tone: "bg-[var(--workspace-blue-soft)] text-[var(--workspace-primary)]" },
    { key: "check", label: "Check", value: needsReview, icon: BookCheck, tone: "bg-[color-mix(in_srgb,var(--workspace-warning)_10%,white)] text-[var(--workspace-warning)]" },
    { key: "draft", label: "Draft", value: draftBills, icon: ReceiptText, tone: "bg-[color-mix(in_srgb,var(--text-success)_10%,white)] text-[var(--text-success)]" },
    { key: "publish", label: "Publish", value: connected, icon: Landmark, tone: "bg-[color-mix(in_srgb,var(--text-review)_10%,white)] text-[var(--text-review)]" },
  ]

  return (
    <motion.section
      variants={m.staggerParent(0.035)}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      <motion.div variants={m.panel} className="overflow-hidden rounded-2xl border border-[var(--workspace-border)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_22px_60px_-38px_rgba(15,23,42,0.45)]">
        <div className="grid gap-px bg-[var(--workspace-border)] lg:grid-cols-[1.08fr_0.92fr]">
          <div className="relative overflow-hidden bg-[#111827] p-5 text-white sm:p-6">
            <div className="absolute right-0 top-0 h-40 w-40 translate-x-12 -translate-y-16 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex min-h-[230px] flex-col justify-between gap-8">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[12px] font-semibold text-white/82">
                  <ShieldCheck className="size-3.5" />
                  Command
                </span>
                <StatusBadge tone={needsReview > 0 ? "warning" : "success"} size="sm" className="border-white/14 bg-white/10 text-white">
                  {needsReview > 0 ? "Review" : "Clear"}
                </StatusBadge>
              </div>
              <div>
                <div className="flex items-end gap-3">
                  <span className="text-6xl font-semibold leading-none tracking-normal tabular-nums sm:text-7xl">
                    {formatCount(needsReview || draftBills || activeClients)}
                  </span>
                  <span className="pb-2 text-sm font-semibold text-white/64">
                    {needsReview ? "to check" : draftBills ? "draft bills" : "active clients"}
                  </span>
                </div>
                <p className="mt-4 max-w-md text-sm font-medium leading-6 text-white/72">
                  {needsReview
                    ? "Fix exceptions first."
                    : draftBills
                      ? "Drafts are ready."
                      : "Workspace is clean."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button asChild variant="glossy" size="sm" className="h-9 px-4">
                  <Link href="/dashboard/client#upload-files">
                    <Upload className="size-4" />
                    Upload
                  </Link>
                </Button>
                <Link
                  href="#clients"
                  className="ax-interactive inline-flex h-9 items-center gap-2 rounded-full border border-white/18 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/14"
                >
                  <BookCheck className="size-4" />
                  Review
                </Link>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--workspace-ink)]">Priority</p>
                <p className="mt-0.5 text-xs font-medium text-[var(--workspace-muted)]">Next clients</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--workspace-border)] bg-[var(--workspace-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--workspace-muted)]">
                <Clock3 className="size-3" />
                Today
              </span>
            </div>
            <div className="space-y-1">
              {priorityClients.map((company) => (
                <ClientRow key={company.id} company={company} />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={m.staggerParent(0.03)} className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {metrics.map((metric) => (
          <motion.div key={metric.key} variants={m.listItem}>
            <MetricCardView metric={metric} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={m.fadeUp} className="rounded-xl border border-[var(--workspace-border)] bg-[var(--workspace-soft)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
        <div className="grid gap-2 md:grid-cols-4">
          {flow.map((step) => (
            <FlowStepView key={step.key} step={step} total={Math.max(documents, companies.length, 1)} />
          ))}
        </div>
      </motion.div>
    </motion.section>
  )
}
