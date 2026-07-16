"use client"

import { Keyboard } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

// A single keystroke chip. `combo` is rendered as a group (e.g. ⌘ ↵); a row can
// list several combos as accepted alternatives (e.g. A or ⌘ ↵).
type Shortcut = {
  label: string
  combos: string[][]
}

type Section = {
  title: string
  shortcuts: Shortcut[]
}

// Mirrors the real handlers — Review board keys live in ConversionWorkspace's C5
// triage effect; ⌘K + ? live in DashboardShell. Keep this in sync with those.
const SECTIONS: Section[] = [
  {
    title: "Review board",
    shortcuts: [
      { label: "Next document", combos: [["J"]] },
      { label: "Previous document", combos: [["K"]] },
      { label: "Mark this document ready", combos: [["A"], ["⌘", "↵"]] },
      { label: "Jump to the first field that needs you", combos: [["E"]] },
      { label: "Publish receipt to QuickBooks or Xero", combos: [["P"]] },
    ],
  },
  {
    title: "Find & navigate",
    shortcuts: [
      { label: "Search clients, documents, and pages", combos: [["⌘", "K"]] },
    ],
  },
  {
    title: "General",
    shortcuts: [
      { label: "Show this shortcut guide", combos: [["?"]] },
      { label: "Close this guide or any dialog", combos: [["Esc"]] },
    ],
  },
]

function Key({ children }: { children: string }) {
  return (
    <kbd className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-md border border-[var(--workspace-border)] bg-[var(--workspace-soft)] px-1.5 font-sans text-[12px] font-semibold text-foreground">
      {children}
    </kbd>
  )
}

interface ShortcutCheatsheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShortcutCheatsheet({ open, onOpenChange }: ShortcutCheatsheetProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <span className="flex size-8 items-center justify-center rounded-md border border-[var(--workspace-border)] bg-[var(--workspace-soft)] text-foreground">
              <Keyboard className="size-4" />
            </span>
            Keyboard shortcuts
          </DialogTitle>
          <DialogDescription className="sr-only">
            Keyboard shortcuts for the review board and workspace navigation.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          className="-mt-1 space-y-5"
          initial={prefersReducedMotion ? false : "hidden"}
          animate={prefersReducedMotion ? undefined : "show"}
          variants={
            prefersReducedMotion
              ? undefined
              : { show: { transition: { staggerChildren: 0.03 } } }
          }
        >
          {SECTIONS.map((section) => (
            <motion.div
              key={section.title}
              variants={
                prefersReducedMotion
                  ? undefined
                  : {
                      hidden: { opacity: 0, y: 6 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.16, ease: [0.16, 1, 0.3, 1] } },
                    }
              }
            >
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-normal text-foreground">
                {section.title}
              </p>
              <ul className="overflow-hidden rounded-lg border border-[var(--workspace-border)] bg-white">
                {section.shortcuts.map((shortcut, index) => (
                  <li
                    key={shortcut.label}
                    className={cn(
                      "flex items-center justify-between gap-4 px-3 py-2.5",
                      index > 0 && "border-t border-[var(--workspace-border)]"
                    )}
                  >
                    <span className="text-[13px] font-medium text-foreground">
                      {shortcut.label}
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      {shortcut.combos.map((combo, comboIndex) => (
                        <span key={comboIndex} className="flex items-center gap-1.5">
                          {comboIndex > 0 && (
                            <span className="text-[11px] font-semibold text-foreground">or</span>
                          )}
                          <span className="flex items-center gap-1">
                            {combo.map((key, keyIndex) => (
                              <Key key={keyIndex}>{key}</Key>
                            ))}
                          </span>
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
