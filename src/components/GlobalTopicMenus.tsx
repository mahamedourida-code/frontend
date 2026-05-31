"use client"

import Link from "next/link"
import {
  ArrowRight,
  BookCheck,
  CalendarRange,
  Cloud,
  LineChart,
  Link2,
  Mail,
  Sparkles,
  Store,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

/**
 * B2 — Global topic mega-menus for the dashboard top bar.
 *
 * Three compact, grouped dropdowns for cross-cutting topics that don't belong
 * in the workspace sidebar. Each panel is a shortcut/overview into EXISTING
 * routes — never a new feature. Targets that aren't shipped yet render as a
 * disabled "Coming soon" affordance instead of a broken link.
 *
 * Mirrors the marketing nav's grouped-panel look, retuned to dashboard tokens
 * (mint #d1fae5 accents, rounded-full CTA pill, framer-motion-free / Radix
 * animation only). 3 primary triggers · 4–5 links + one CTA per panel.
 */

type TopicLink = {
  label: string
  description: string
  icon: LucideIcon
  href?: string
  soon?: boolean
}

type Topic = {
  key: string
  trigger: string
  triggerIcon: LucideIcon
  eyebrow: string
  links: TopicLink[]
  cta: { label: string; href: string }
}

const TOPICS: Topic[] = [
  {
    key: "automations",
    trigger: "Automations",
    triggerIcon: Sparkles,
    eyebrow: "Set it once, AxLiner pre-fills",
    links: [
      {
        label: "Vendor rules",
        description: "Remembered category, tax & terms per supplier.",
        icon: Store,
        href: "/dashboard/settings?section=vendors",
      },
      {
        label: "Auto-publish rules",
        description: "Decide what's ready to draft into QuickBooks.",
        icon: BookCheck,
        soon: true,
      },
      {
        label: "Workflows",
        description: "Chain intake, review and handoff steps.",
        icon: Workflow,
        soon: true,
      },
    ],
    cta: { label: "Manage vendor memory", href: "/dashboard/settings?section=vendors" },
  },
  {
    key: "insights",
    trigger: "Insights",
    triggerIcon: LineChart,
    eyebrow: "What this month earned you",
    links: [
      {
        label: "Clients",
        description: "Per-client activity and review load.",
        icon: Users,
        soon: true,
      },
      {
        label: "Monthly recap",
        description: "Reviewed, pre-coded, duplicates caught, hours saved.",
        icon: CalendarRange,
        href: "/dashboard",
      },
      {
        label: "Reports",
        description: "Overview metrics across your workspace.",
        icon: LineChart,
        href: "/dashboard",
      },
    ],
    cta: { label: "Open this month's recap", href: "/dashboard" },
  },
  {
    key: "connections",
    trigger: "Connections",
    triggerIcon: Link2,
    eyebrow: "Where documents come from & go",
    links: [
      {
        label: "QuickBooks",
        description: "Publish reviewed drafts to QuickBooks Online.",
        icon: BookCheck,
        href: "/dashboard/integrations",
      },
      {
        label: "Xero",
        description: "Accounting sync — on the roadmap.",
        icon: Link2,
        soon: true,
      },
      {
        label: "Drive & Dropbox",
        description: "Pull folders straight into intake.",
        icon: Cloud,
        href: "/dashboard/integrations",
      },
      {
        label: "Email intake",
        description: "Forward invoices to your AxLiner inbox.",
        icon: Mail,
        href: "/dashboard/inbox",
      },
    ],
    cta: { label: "Manage connections", href: "/dashboard/integrations" },
  },
]

const triggerClass = cn(
  "relative h-9 rounded-full bg-transparent px-3 text-[13px] font-semibold",
  "text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground",
  "focus:bg-transparent focus:ring-0 focus-visible:ring-2 focus-visible:ring-emerald-500",
  "data-[state=open]:bg-muted/70 data-[state=open]:text-foreground",
)

function TopicPanel({ topic }: { topic: Topic }) {
  const Eyebrow = topic.triggerIcon

  return (
    <div className="w-[320px] overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-[0_24px_60px_-30px_rgba(15,23,42,0.45)]">
      <div className="flex items-center gap-2 border-b border-border/70 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
        <Eyebrow className="size-3.5" />
        {topic.eyebrow}
      </div>

      <div className="p-2">
        {topic.links.map((link) => {
          const Icon = link.icon

          if (link.soon || !link.href) {
            return (
              <div
                key={link.label}
                aria-disabled="true"
                className="flex cursor-default items-start gap-3 rounded-xl px-2.5 py-2.5 opacity-60"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5">
                    <span className="text-[13px] font-semibold text-foreground">{link.label}</span>
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                      Coming soon
                    </span>
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-4 text-muted-foreground">
                    {link.description}
                  </span>
                </span>
              </div>
            )
          }

          return (
            <NavigationMenuLink asChild key={link.label}>
              <Link
                href={link.href}
                className="group flex items-start gap-3 rounded-xl px-2.5 py-2.5 outline-none transition-colors hover:bg-[#d1fae5]/55 focus-visible:bg-[#d1fae5]/55 dark:hover:bg-emerald-500/10 dark:focus-visible:bg-emerald-500/10"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#d1fae5] text-[#064e3b] transition-transform group-hover:-translate-y-0.5 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <Icon className="size-4 text-current" />
                </span>
                <span className="min-w-0">
                  <span className="text-[13px] font-semibold text-foreground">{link.label}</span>
                  <span className="mt-0.5 block text-[11px] leading-4 text-muted-foreground">
                    {link.description}
                  </span>
                </span>
              </Link>
            </NavigationMenuLink>
          )
        })}
      </div>

      <div className="border-t border-border/70 bg-[#d1fae5] px-3 py-2.5 dark:bg-emerald-500/10">
        <NavigationMenuLink asChild>
          <Link
            href={topic.cta.href}
            className="group inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[12px] font-bold text-[#064e3b] outline-none transition-colors hover:text-emerald-900 focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-emerald-300"
          >
            {topic.cta.label}
            <ArrowRight className="size-3.5 text-current transition-transform group-hover:translate-x-0.5" />
          </Link>
        </NavigationMenuLink>
      </div>
    </div>
  )
}

export function GlobalTopicMenus({ className }: { className?: string }) {
  return (
    <NavigationMenu viewport={false} className={cn("max-w-none", className)} aria-label="Global topics">
      <NavigationMenuList className="gap-0.5">
        {TOPICS.map((topic) => (
          <NavigationMenuItem key={topic.key}>
            <NavigationMenuTrigger className={triggerClass}>
              {topic.trigger}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <TopicPanel topic={topic} />
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
