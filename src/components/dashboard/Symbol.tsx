"use client"

import {
  Archive,
  BadgeCheck,
  Banknote,
  BookCheck,
  Bot,
  Building2,
  Calculator,
  Calendar,
  ChartLine,
  CircleDollarSign,
  ClipboardCheck,
  Clock,
  CopyCheck,
  FileSpreadsheet,
  FileText,
  Files,
  FolderOpen,
  FolderTree,
  GitCompareArrows,
  Inbox,
  Landmark,
  Layers,
  ListChecks,
  Mail,
  Map,
  Percent,
  PlugZap,
  ReceiptText,
  Scale,
  ScanLine,
  Send,
  ShieldCheck,
  Sparkles,
  SquareCheckBig,
  Table2,
  Tag,
  TrendingUp,
  Upload,
  Wand2,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

const SIZE = {
  inline: "h-12 w-12 sm:h-14 sm:w-14",
  badge: "h-16 w-16 sm:h-20 sm:w-20",
  medium: "h-28 w-28 sm:h-32 sm:w-32",
  hero: "h-56 w-56 sm:h-72 sm:w-72",
} as const

type SymbolTone =
  | "emerald"
  | "sky"
  | "violet"
  | "amber"
  | "rose"
  | "cyan"
  | "indigo"
  | "teal"
  | "slate"

const PRIMARY_TONE =
  "border-[color-mix(in_srgb,var(--workspace-primary)_24%,transparent)] bg-[color-mix(in_srgb,var(--workspace-primary)_7%,white)] text-[var(--workspace-icon-action)]"

const toneClasses: Record<SymbolTone, string> = {
  emerald: PRIMARY_TONE,
  sky: PRIMARY_TONE,
  violet: PRIMARY_TONE,
  amber:
    "border-[color-mix(in_srgb,var(--workspace-warning)_30%,transparent)] bg-[color-mix(in_srgb,var(--workspace-warning)_8%,white)] text-[var(--workspace-warning-hover)]",
  rose:
    "border-[color-mix(in_srgb,var(--workspace-danger)_28%,transparent)] bg-[color-mix(in_srgb,var(--workspace-danger)_7%,white)] text-[var(--workspace-danger)]",
  cyan: PRIMARY_TONE,
  indigo: PRIMARY_TONE,
  teal: PRIMARY_TONE,
  slate:
    "border-[var(--workspace-border)] bg-[var(--workspace-soft)] text-[var(--workspace-icon)]",
}

type SymbolMeta = {
  Icon: LucideIcon
  tone: SymbolTone
}

const symbolMeta: Record<string, SymbolMeta> = {
  "ai-mascot": { Icon: Bot, tone: "violet" },
  "ai-robot": { Icon: Bot, tone: "violet" },
  "approved-stamp": { Icon: BadgeCheck, tone: "emerald" },
  "balance-scale": { Icon: Scale, tone: "indigo" },
  "bank-statement": { Icon: Landmark, tone: "indigo" },
  banknote: { Icon: Banknote, tone: "emerald" },
  "before-after": { Icon: GitCompareArrows, tone: "cyan" },
  calculator: { Icon: Calculator, tone: "slate" },
  coins: { Icon: CircleDollarSign, tone: "emerald" },
  "crumpled-receipt": { Icon: ReceiptText, tone: "amber" },
  duplicate: { Icon: CopyCheck, tone: "rose" },
  "email-drop": { Icon: Mail, tone: "sky" },
  "export-excel": { Icon: FileSpreadsheet, tone: "emerald" },
  "filing-cabinet": { Icon: Archive, tone: "slate" },
  "folder-drop": { Icon: FolderOpen, tone: "sky" },
  "handwritten-note": { Icon: FileText, tone: "violet" },
  invoice: { Icon: ReceiptText, tone: "emerald" },
  ledger: { Icon: BookCheck, tone: "indigo" },
  "paper-pile": { Icon: Files, tone: "slate" },
  "paper-plane": { Icon: Send, tone: "sky" },
  "percent-tag": { Icon: Percent, tone: "amber" },
  "phone-capture": { Icon: ScanLine, tone: "cyan" },
  "processing-gears": { Icon: Wand2, tone: "violet" },
  "ready-check": { Icon: SquareCheckBig, tone: "emerald" },
  receipt: { Icon: ReceiptText, tone: "amber" },
  "review-board": { Icon: ListChecks, tone: "violet" },
  "review-magnify": { Icon: ScanLine, tone: "violet" },
  scanner: { Icon: ScanLine, tone: "cyan" },
  shoebox: { Icon: Archive, tone: "slate" },
  spreadsheet: { Icon: Table2, tone: "teal" },
  "sync-publish": { Icon: Send, tone: "sky" },
  "upload-tray": { Icon: Upload, tone: "sky" },
  "vat-box": { Icon: Percent, tone: "amber" },
  "warning-flag": { Icon: ShieldCheck, tone: "rose" },

  "code-4000-chip": { Icon: Tag, tone: "indigo" },
  "code-account-badge": { Icon: BadgeCheck, tone: "indigo" },
  "code-account-sparkline": { Icon: ChartLine, tone: "sky" },
  "code-account-tag": { Icon: Tag, tone: "indigo" },
  "code-aging-timeline": { Icon: Clock, tone: "amber" },
  "code-balanced-equals": { Icon: Scale, tone: "emerald" },
  "code-batch-counter": { Icon: Layers, tone: "slate" },
  "code-budget-gauge": { Icon: Calculator, tone: "teal" },
  "code-cashflow-line": { Icon: ChartLine, tone: "emerald" },
  "code-category-chip": { Icon: Tag, tone: "cyan" },
  "code-clearing": { Icon: ClipboardCheck, tone: "teal" },
  "code-coa-tree": { Icon: FolderTree, tone: "sky" },
  "code-confidence-tick": { Icon: BadgeCheck, tone: "emerald" },
  "code-cost-centre": { Icon: Building2, tone: "indigo" },
  "code-department": { Icon: Building2, tone: "violet" },
  "code-double-entry": { Icon: GitCompareArrows, tone: "indigo" },
  "code-exempt": { Icon: ShieldCheck, tone: "slate" },
  "code-extract-field": { Icon: FileText, tone: "cyan" },
  "code-journal-entry": { Icon: BookCheck, tone: "indigo" },
  "code-ledger-line": { Icon: BookCheck, tone: "indigo" },
  "code-map-to-account": { Icon: Map, tone: "sky" },
  "code-matched-unmatched": { Icon: GitCompareArrows, tone: "amber" },
  "code-mom-trend": { Icon: TrendingUp, tone: "emerald" },
  "code-period-close": { Icon: Calendar, tone: "violet" },
  "code-post-entry": { Icon: Send, tone: "sky" },
  "code-rate-20-tile": { Icon: Percent, tone: "amber" },
  "code-recon-match": { Icon: Scale, tone: "emerald" },
  "code-reverse-charge": { Icon: Percent, tone: "rose" },
  "code-spend-bars": { Icon: ChartLine, tone: "teal" },
  "code-t-account": { Icon: BookCheck, tone: "indigo" },
  "code-trial-balance": { Icon: Scale, tone: "violet" },
  "code-variance": { Icon: TrendingUp, tone: "rose" },
  "code-vat-chip": { Icon: Percent, tone: "amber" },
  "code-zero-rated": { Icon: Percent, tone: "slate" },

  "firstsight-draft-bills-empty": { Icon: ReceiptText, tone: "amber" },
  "firstsight-inbox-empty": { Icon: Inbox, tone: "sky" },
  "firstsight-review-empty": { Icon: ListChecks, tone: "violet" },
  "firstsight-sources-empty": { Icon: PlugZap, tone: "cyan" },
  "firstsight-tables-empty": { Icon: Table2, tone: "teal" },
  "firstsight-vendors-empty": { Icon: Building2, tone: "indigo" },
  "firstsight-workspace-launcher": { Icon: Upload, tone: "sky" },

  "nav-node-bank-statements": { Icon: Landmark, tone: "indigo" },
  "nav-node-draft-bills": { Icon: ReceiptText, tone: "amber" },
  "nav-node-inbox": { Icon: Inbox, tone: "sky" },
  "nav-node-integrations": { Icon: PlugZap, tone: "cyan" },
  "nav-node-invoices": { Icon: ReceiptText, tone: "emerald" },
  "nav-node-notes": { Icon: FileText, tone: "violet" },
  "nav-node-receipts": { Icon: ReceiptText, tone: "amber" },
  "nav-node-tables": { Icon: Table2, tone: "teal" },
  "nav-step-1-upload": { Icon: Upload, tone: "sky" },
  "nav-step-2-review": { Icon: ListChecks, tone: "violet" },
  "nav-step-3-publish": { Icon: Send, tone: "emerald" },
  "nav-workspace-node": { Icon: Layers, tone: "emerald" },

  "success-approved": { Icon: BadgeCheck, tone: "emerald" },
  "success-bill-ready": { Icon: ReceiptText, tone: "emerald" },
  "success-duplicate-resolved": { Icon: CopyCheck, tone: "emerald" },
  "success-exported-excel": { Icon: FileSpreadsheet, tone: "emerald" },
  "success-fields-verified": { Icon: BadgeCheck, tone: "emerald" },
  "success-inbox-zero": { Icon: Inbox, tone: "emerald" },
  "success-period-closed": { Icon: Calendar, tone: "emerald" },
  "success-published": { Icon: Send, tone: "emerald" },
  "success-recon-balanced": { Icon: Scale, tone: "emerald" },
  "success-vendor-remembered": { Icon: Building2, tone: "emerald" },
}

interface SymbolProps {
  name: string
  size?: keyof typeof SIZE
  className?: string
  /** Accessible label; empty string keeps it decorative (aria-hidden). */
  alt?: string
}

function resolveSymbol(name: string): SymbolMeta {
  if (symbolMeta[name]) return symbolMeta[name]
  if (name.startsWith("success-")) return { Icon: BadgeCheck, tone: "emerald" }
  if (name.startsWith("code-")) return { Icon: Tag, tone: "indigo" }
  if (name.startsWith("nav-")) return { Icon: Layers, tone: "sky" }
  return { Icon: Sparkles, tone: "slate" }
}

export function Symbol({ name, size = "medium", className, alt = "" }: SymbolProps) {
  const { Icon, tone } = resolveSymbol(name)

  return (
    <span
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-2xl border shadow-none",
        SIZE[size],
        toneClasses[tone],
        className,
      )}
    >
      <Icon className="size-[56%]" strokeWidth={2.1} aria-hidden="true" />
    </span>
  )
}
