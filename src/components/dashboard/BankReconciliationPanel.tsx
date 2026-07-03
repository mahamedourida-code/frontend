"use client"

import * as React from "react"
import { AlertTriangle, CheckCircle2, Info } from "lucide-react"

import { cn } from "@/lib/utils"
import { AnomalyChip } from "@/components/dashboard/AnomalyChip"
import { reconciliationCopy } from "@/lib/anomaly-reasons"
import {
  formatAmount,
  reconcileBankStatement,
  type ReconciliationResult,
} from "@/lib/reconciliation"

type BankReconciliationPanelProps = {
  data: unknown
  className?: string
}

type SummaryCell = {
  label: string
  value: string
  tone?: "default" | "positive" | "negative"
  emphasis?: boolean
}

function deriveCells(result: ReconciliationResult): SummaryCell[] {
  const currency = result.currency

  return [
    {
      label: "Opening balance",
      value: formatAmount(result.openingBalance, currency),
    },
    {
      label: "Total debits",
      value: formatAmount(result.totalDebits ? -result.totalDebits : 0, currency),
      tone: "negative",
    },
    {
      label: "Total credits",
      value: formatAmount(result.totalCredits, currency),
      tone: "positive",
    },
    {
      label: "Calculated closing",
      value: formatAmount(result.calculatedClosing, currency),
      emphasis: true,
    },
    {
      label: "Reported closing",
      value: formatAmount(result.reportedClosing, currency),
      emphasis: true,
    },
    {
      label: "Difference",
      value:
        result.difference === null
          ? "—"
          : formatAmount(result.difference, currency),
      tone:
        result.difference === null
          ? "default"
          : Math.abs(result.difference) <= 0.01
            ? "positive"
            : "negative",
      emphasis: true,
    },
  ]
}

export function BankReconciliationPanel({ data, className }: BankReconciliationPanelProps) {
  const result = React.useMemo(() => reconcileBankStatement(data as any), [data])

  const cells = deriveCells(result)

  const headerCopy = (() => {
    if (result.status === "balanced") {
      return {
        icon: <CheckCircle2 className="size-4" />,
        label: "Balanced",
        tone: "balanced" as const,
      }
    }
    if (result.status === "off") {
      return {
        icon: <AlertTriangle className="size-4" />,
        label: `${formatAmount(result.difference, result.currency)} off`,
        tone: "off" as const,
      }
    }
    return {
      icon: <Info className="size-4" />,
      label: "Reconciliation pending",
      tone: "info" as const,
    }
  })()

  const headerTone = {
    balanced:
      "border-emerald-200 bg-emerald-50 text-emerald-900",
    off: "border-amber-200 bg-amber-50 text-amber-900",
    info: "border-border bg-muted/40 text-foreground",
  }[headerCopy.tone]

  return (
    <section
      aria-label="Balance reconciliation"
      className={cn(
        "border-t border-border bg-white",
        className,
      )}
    >
      <header
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 border-b px-4 py-2.5",
          headerTone,
        )}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-full",
              headerCopy.tone === "balanced" && "bg-emerald-500 text-white",
              headerCopy.tone === "off" && "bg-amber-500 text-white",
              headerCopy.tone === "info" && "bg-muted text-muted-foreground",
            )}
          >
            {headerCopy.icon}
          </span>
          <div className="leading-tight">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em]">
              Balance check
            </p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">{headerCopy.label}</p>
              {(() => {
                const copy = reconciliationCopy(headerCopy.tone, {
                  difference:
                    result.difference === null
                      ? null
                      : formatAmount(Math.abs(result.difference), result.currency),
                  missingRows: result.estimatedMissingRows ?? null,
                })
                return (
                  <AnomalyChip
                    tone={copy.tone}
                    title={copy.title}
                    reason={copy.reason}
                    label="Why"
                    className="h-5 bg-white/70"
                  />
                )
              })()}
            </div>
          </div>
        </div>
      </header>

      <dl className="grid grid-cols-2 divide-x divide-border border-b border-border sm:grid-cols-3 lg:grid-cols-6">
        {cells.map((cell, index) => (
          <div
            key={cell.label}
            className={cn(
              "min-w-0 px-3 py-2.5",
              index >= 3 && index < 6 ? "border-t border-border sm:border-t-0" : "",
            )}
          >
            <dt className="truncate text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              {cell.label}
            </dt>
            <dd
              className={cn(
                "mt-1 truncate font-mono text-sm tabular-nums",
                cell.emphasis ? "font-bold" : "font-semibold",
                cell.tone === "positive" && "text-emerald-700",
                cell.tone === "negative" && "text-amber-700",
                (cell.tone === "default" || !cell.tone) && "text-gray-900",
              )}
              title={cell.value}
            >
              {cell.value}
            </dd>
          </div>
        ))}
      </dl>

    </section>
  )
}
