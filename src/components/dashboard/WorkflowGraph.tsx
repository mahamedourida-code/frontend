"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Symbol } from "@/components/dashboard/Symbol"

type GraphNode = {
  label: string
  href: string
  symbol: string
  hint?: string
}

// The root node — the workspace itself.
const ROOT: GraphNode = {
  label: "Your workspace",
  href: "/dashboard/client#upload-files",
  symbol: "nav-workspace-node",
  hint: "Everything starts here",
}

// Tier 2 — the primary destinations.
const PRIMARY: GraphNode[] = [
  { label: "Upload & review", href: "/dashboard/client#upload-files", symbol: "nav-step-1-upload", hint: "Drop a batch" },
  { label: "Draft bills", href: "/dashboard/accounts-payable", symbol: "nav-node-draft-bills", hint: "Code & publish" },
  { label: "Inbox", href: "/dashboard/inbox", symbol: "nav-node-inbox", hint: "Incoming docs" },
]

// Tier 3 - quick auto-detect launcher.
const MODES: GraphNode[] = [
  { label: "Auto-detect documents", href: "/dashboard/client#upload-files", symbol: "nav-node-invoices" },
]

// How a batch travels — a light 1·2·3 strip above the tree.
const STEPS = [
  { symbol: "nav-step-1-upload", label: "Upload", hint: "Throw us the whole folder" },
  { symbol: "nav-step-2-review", label: "Review", hint: "Fix exceptions on the board" },
  { symbol: "nav-step-3-publish", label: "Publish", hint: "Export or send to QuickBooks or Xero" },
]

const RAIL = "#10b981" // emerald-500 connectors

/** Vertical connector stub. */
function Stub({ className }: { className?: string }) {
  return <span aria-hidden className={cn("w-px shrink-0", className)} style={{ background: RAIL }} />
}

/**
 * A node = a big, RAW emblem (free-standing art, no dark tile / ring / chip)
 * over a legible label. The whole thing is one clickable target with a soft
 * hover lift; the emblem itself never sits in a box.
 */
function Node({
  node,
  size,
  className,
}: {
  node: GraphNode
  size: "root" | "primary" | "leaf"
  className?: string
}) {
  const emblem =
    size === "root"
      ? "h-36 w-36 sm:h-48 sm:w-48"
      : size === "primary"
        ? "h-28 w-28 sm:h-36 sm:w-36"
        : "h-24 w-24 sm:h-28 sm:w-28"

  return (
    <Link
      href={node.href}
      className={cn(
        "ax-interactive group flex flex-col items-center gap-2 rounded-2xl px-3 py-2 text-center outline-none transition-transform duration-200 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-emerald-400/60",
        className,
      )}
    >
      <Symbol
        name={node.symbol}
        size="medium"
        className={cn(emblem, "transition-transform duration-200 group-hover:scale-105")}
        alt=""
      />
      <span className="flex flex-col">
        <span
          className={cn(
            "font-semibold leading-tight text-white",
            size === "leaf" ? "text-sm" : "text-base",
          )}
        >
          {node.label}
        </span>
        {node.hint ? (
          <span className="text-xs font-medium leading-tight text-white/80">{node.hint}</span>
        ) : null}
      </span>
    </Link>
  )
}

/**
 * The workspace launcher — a raw, emblem-first org-chart. An emerald workspace
 * node sits at the top, branching down to the primary destinations and the
 * five document-mode leaves, all joined by thin emerald connectors. Every
 * symbol reads as free-standing art on the page background. On mobile it
 * collapses to clean grouped rows.
 */
export function WorkflowGraph({ className }: { className?: string }) {
  return (
    <nav aria-label="Workspace launcher" className={cn("w-full", className)}>
      {/* How it flows — light step strip */}
      <ol className="mx-auto mb-10 flex max-w-3xl flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-start sm:gap-2">
        {STEPS.map((step, i) => (
          <li
            key={step.label}
            className="flex flex-1 items-center gap-3 sm:flex-col sm:items-center sm:gap-2 sm:text-center"
          >
            <Symbol name={step.symbol} size="medium" className="h-24 w-24 sm:h-28 sm:w-28" alt="" />
            <span className="flex flex-col sm:items-center">
              <span className="text-sm font-semibold leading-tight text-white">
                {i + 1}. {step.label}
              </span>
              <span className="text-xs font-medium leading-tight text-white/80">{step.hint}</span>
            </span>
          </li>
        ))}
      </ol>

      {/* Tree (sm and up) */}
      <div className="hidden flex-col items-center sm:flex">
        <Node node={ROOT} size="root" />
        <Stub className="h-6" />

        {/* Tier 2 rail + nodes */}
        <div className="relative w-full max-w-3xl">
          <span aria-hidden className="absolute left-[16.66%] right-[16.66%] top-0 h-px" style={{ background: RAIL }} />
          <div className="grid grid-cols-3 gap-4">
            {PRIMARY.map((node) => (
              <div key={node.href} className="flex flex-col items-center">
                <Stub className="h-6" />
                <Node node={node} size="primary" className="w-full" />
              </div>
            ))}
          </div>
        </div>

        <Stub className="h-6" />

        {/* Tier 3 rail + mode leaves */}
        <div className="relative w-full max-w-xs">
          <span aria-hidden className="absolute left-[50%] right-[50%] top-0 h-px" style={{ background: RAIL }} />
          <div className="grid grid-cols-1 gap-3">
            {MODES.map((node) => (
              <div key={node.href} className="flex flex-col items-center">
                <Stub className="h-6" />
                <Node node={node} size="leaf" className="w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stacked (mobile) */}
      <div className="space-y-6 sm:hidden">
        <Node node={ROOT} size="root" className="mx-auto" />
        <div className="grid grid-cols-1 gap-3">
          {PRIMARY.map((node) => (
            <Node key={node.href} node={node} size="primary" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {MODES.map((node) => (
            <Node key={node.href} node={node} size="leaf" />
          ))}
        </div>
      </div>
    </nav>
  )
}
