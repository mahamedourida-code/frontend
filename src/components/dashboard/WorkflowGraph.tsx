"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Symbol } from "@/components/dashboard/Symbol"

type GraphNode = {
  label: string
  href: string
  symbol?: string
  hint?: string
}

// Tier 2 — the primary destinations.
const PRIMARY: GraphNode[] = [
  { label: "Upload & review", href: "/dashboard/client#upload-files", symbol: "upload-tray", hint: "Drop a batch" },
  { label: "Draft bills", href: "/dashboard/accounts-payable", symbol: "code-map-to-account", hint: "Code & publish" },
  { label: "Inbox", href: "/dashboard/inbox", symbol: "folder-drop", hint: "Incoming docs" },
]

// Tier 3 — quick mode launchers (the page reads ?mode=…).
const MODES: GraphNode[] = [
  { label: "Invoices", href: "/dashboard/client?mode=invoice", symbol: "invoice" },
  { label: "Receipts", href: "/dashboard/client?mode=receipt", symbol: "receipt" },
  { label: "Bank statements", href: "/dashboard/client?mode=bank_statement", symbol: "bank-statement" },
  { label: "Tables", href: "/dashboard/client?mode=table", symbol: "spreadsheet" },
  { label: "Notes", href: "/dashboard/client?mode=notes", symbol: "handwritten-note" },
]

const RAIL = "var(--brand-green-ring)"

function NodeBox({
  node,
  tone,
  className,
}: {
  node: GraphNode
  tone: "top" | "primary" | "leaf"
  className?: string
}) {
  return (
    <Link
      href={node.href}
      className={cn(
        "ax-interactive group relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_1px_3px_0_rgba(0,0,0,0.12)] outline-none transition-all hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[var(--brand-green-ring)]",
        tone === "top" &&
          "border border-[var(--brand-green-ring)] bg-[var(--brand-green)] text-[var(--brand-green-fg)]",
        tone !== "top" &&
          "border border-[color:#b49168] bg-[var(--brand-clay)] text-[#2f2418] hover:bg-[var(--brand-clay-hover)]",
        className,
      )}
    >
      {node.symbol ? <Symbol name={node.symbol} size="inline" className="h-9 w-9 shrink-0" alt="" /> : null}
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold leading-tight">{node.label}</span>
        {node.hint ? <span className="block truncate text-[11px] font-medium opacity-70">{node.hint}</span> : null}
      </span>
    </Link>
  )
}

/** Vertical connector stub. */
function Stub({ className }: { className?: string }) {
  return <span aria-hidden className={cn("w-px shrink-0", className)} style={{ background: RAIL }} />
}

/**
 * The "button-graph" — a clickable org-chart launcher styled like the reference:
 * an emerald top node over clay/brown destination nodes joined by emerald
 * connectors. On ≥sm it renders as a tree; on mobile it collapses to clean
 * grouped link rows. Real <Link>s, keyboard-accessible.
 */
export function WorkflowGraph({ className }: { className?: string }) {
  return (
    <nav aria-label="Workspace launcher" className={cn("w-full", className)}>
      {/* Tree (sm and up) */}
      <div className="hidden flex-col items-center sm:flex">
        <NodeBox node={{ label: "Your workspace", href: "/dashboard/client#upload-files", symbol: "review-magnify" }} tone="top" />
        <Stub className="h-5" />

        {/* Tier 2 rail + nodes */}
        <div className="relative w-full max-w-3xl">
          <span aria-hidden className="absolute left-[16.66%] right-[16.66%] top-0 h-px" style={{ background: RAIL }} />
          <div className="grid grid-cols-3 gap-3">
            {PRIMARY.map((node) => (
              <div key={node.href} className="flex flex-col items-center">
                <Stub className="h-5" />
                <NodeBox node={node} tone="primary" className="w-full" />
              </div>
            ))}
          </div>
        </div>

        <Stub className="h-5" />

        {/* Tier 3 rail + mode leaves */}
        <div className="relative w-full max-w-4xl">
          <span aria-hidden className="absolute left-[10%] right-[10%] top-0 h-px" style={{ background: RAIL }} />
          <div className="grid grid-cols-5 gap-2.5">
            {MODES.map((node) => (
              <div key={node.href} className="flex flex-col items-center">
                <Stub className="h-5" />
                <NodeBox node={node} tone="leaf" className="w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stacked (mobile) */}
      <div className="space-y-3 sm:hidden">
        <NodeBox node={{ label: "Your workspace", href: "/dashboard/client#upload-files", symbol: "review-magnify" }} tone="top" />
        <div className="space-y-2">
          {PRIMARY.map((node) => (
            <NodeBox key={node.href} node={node} tone="primary" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {MODES.map((node) => (
            <NodeBox key={node.href} node={node} tone="leaf" />
          ))}
        </div>
      </div>
    </nav>
  )
}
