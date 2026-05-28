"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Download,
  Eye,
  FolderOpen,
  Inbox,
  Layers,
  Link2,
  ReceiptText,
  ScanLine,
  Users,
  Workflow,
} from "lucide-react";

import { AppLogo } from "@/components/AppIcon";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

/* ── Data ────────────────────────────────────────────────────── */

type AudienceLink = {
  label: string;
  description: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const bookkeeperLinks: AudienceLink[] = [
  { label: "Document extraction",       description: "Invoices, receipts, bank statements, handwritten notes", href: "/dashboard/client",       Icon: ScanLine    },
  { label: "Review board",              description: "Source image + editable cells, side by side",            href: "/dashboard/client",       Icon: Eye         },
  { label: "Mixed batch auto-detect",   description: "Drop a whole folder — AxLiner classifies each file",    href: "/dashboard/auto-detect",  Icon: Layers      },
  { label: "Export to Excel / CSV",     description: "One file or the full batch, clean and ready",           href: "/dashboard/client",       Icon: Download    },
  { label: "QuickBooks publishing",     description: "Draft Bill posted with original document attached",     href: "/dashboard/integrations", Icon: ArrowUpRight },
  { label: "Client upload links",       description: "Clients submit directly — no account needed",           href: "/dashboard/inbox",        Icon: Link2       },
];

const practiceLinks: AudienceLink[] = [
  { label: "Batch processing",          description: "Up to 50 files, mixed types, one job",                 href: "/dashboard/client",           Icon: FolderOpen  },
  { label: "Team reviewer access",      description: "Invite colleagues — they review, you publish",         href: "/dashboard/settings",         Icon: Users       },
  { label: "AP queue + QuickBooks",     description: "Code, approve, and bulk-publish bills in one screen",  href: "/dashboard/accounts-payable", Icon: ReceiptText },
  { label: "Vendor memory rules",       description: "Auto-fill coding for recurring suppliers",             href: "/dashboard/settings",         Icon: BookOpen    },
  { label: "Inbox & client intake",     description: "Watch folder, email forwarding, intake links",         href: "/dashboard/inbox",            Icon: Inbox       },
  { label: "Workflows",                 description: "Routing rules for multi-step document review",         href: "/dashboard/workflows",        Icon: Workflow    },
];

/* ── Mega-dropdown panel ─────────────────────────────────────── */

type PanelProps = {
  links: AudienceLink[];
  headline: string;
  body: string;
  signupHref?: string;
};

function AudiencePanel({ links, headline, body, signupHref = "/sign-up?next=%2Fdashboard%2Fclient" }: PanelProps) {
  return (
    <div className="grid w-[680px] grid-cols-[1.08fr_0.92fr] overflow-hidden rounded-xl">

      {/* ── Left: feature links ── */}
      <div className="space-y-px p-3">
        {links.map((link, i) => (
          <Link
            key={link.label}
            href={link.href}
            style={{ animationDelay: `${i * 32}ms` }}
            className={cn(
              "group flex items-start gap-3 rounded-lg px-3 py-2.5",
              "ax-interactive ax-fade-in hover:bg-accent",
            )}
          >
            {/* icon */}
            <span className="mt-[1px] flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background shadow-xs transition-[border-color,background] duration-[180ms] group-hover:border-primary/30 group-hover:bg-primary/5">
              <link.Icon className="size-[15px] text-muted-foreground transition-[color,transform] duration-[180ms] group-hover:translate-x-px group-hover:text-primary" />
            </span>

            {/* copy */}
            <div className="min-w-0">
              <p className="text-[13.5px] font-semibold leading-none text-foreground">
                {link.label}
              </p>
              <p className="mt-[5px] text-[12px] leading-snug text-muted-foreground">
                {link.description}
              </p>
            </div>
          </Link>
        ))}

        {/* footer link */}
        <div className="px-3 pt-3">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary ax-interactive hover:opacity-75"
          >
            View pricing
            <ArrowUpRight className="size-3" />
          </Link>
        </div>
      </div>

      {/* ── Right: positioning panel ── */}
      <div className="flex flex-col justify-between border-l border-border bg-muted/35 px-5 py-5">
        <div>
          {/* editorial quote headline */}
          <p
            className="text-[15px] font-bold leading-[1.35] tracking-[-0.01em] text-foreground"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {headline}
          </p>

          {/* divider */}
          <div className="my-4 h-px w-8 bg-primary/40 rounded-full" />

          {/* body */}
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            {body}
          </p>
        </div>

        {/* CTA */}
        <Button
          variant="glossy"
          asChild
          className="mt-6 h-9 w-full text-[13px] font-bold"
        >
          <Link href={signupHref}>
            Start free →
          </Link>
        </Button>
      </div>
    </div>
  );
}

/* ── Nav bar ─────────────────────────────────────────────────── */

type MarketingNavBarProps = {
  onSectionClick?: (sectionId: string) => void;
};

export function MarketingNavBar({ onSectionClick }: MarketingNavBarProps) {
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const isAuthenticated = Boolean(user && !loading);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 12);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  /* shared flat-link style */
  const flatLink = cn(
    navigationMenuTriggerStyle(),
    "rounded-none bg-transparent px-3.5 text-[14.5px] font-medium text-foreground/80",
    "transition-colors hover:bg-transparent hover:text-foreground",
    "focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent",
  );

  /* audience trigger style — adds sliding underline on open */
  const audienceTrigger = cn(
    "relative h-9 rounded-none bg-transparent px-3.5 text-[14.5px] font-medium",
    "text-foreground/80 transition-colors hover:bg-transparent hover:text-foreground",
    "focus:bg-transparent focus:ring-0",
    "data-[state=open]:bg-transparent data-[state=open]:text-foreground",
    /* underline: a pseudo-element via after: Tailwind arbitrary */
    "after:absolute after:inset-x-3.5 after:bottom-0 after:h-[1.5px] after:origin-left",
    "after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform after:duration-[140ms] after:ease-out",
    "data-[state=open]:after:scale-x-100",
  );

  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-[68px] border-b",
        "transition-[background-color,border-color,box-shadow] duration-200",
        scrolled
          ? "border-border bg-background/95 shadow-[0_1px_0_0_hsl(var(--border))] backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-full max-w-[1480px] items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" aria-label="AxLiner home" className="flex-shrink-0">
          <AppLogo />
        </Link>

        {/* Desktop nav ─────────────────── */}
        <div className="hidden flex-1 items-center justify-center lg:flex">
          <NavigationMenu>
            <NavigationMenuList className="gap-0">

              {/* Audience 1 */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className={audienceTrigger}>
                  For Bookkeepers
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <AudiencePanel
                    links={bookkeeperLinks}
                    headline='"Built for the bookkeeper Dext priced out."'
                    body="Process every invoice, receipt, and bank statement a client sends — reviewed by you, posted correctly. No per-client minimums. No surprise renewals."
                  />
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Audience 2 */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className={audienceTrigger}>
                  For Accounting Practices
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <AudiencePanel
                    links={practiceLinks}
                    headline='"One review board for your whole practice."'
                    body="Invite reviewers, assign documents, and publish bills to QuickBooks — without anyone touching the books until you say so."
                  />
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Flat links */}
              <NavigationMenuItem>
                <NavigationMenuLink href="/pricing" className={flatLink}>
                  Pricing
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink href="/blogs" className={flatLink}>
                  Blog
                </NavigationMenuLink>
              </NavigationMenuItem>

            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right actions ───────────────── */}
        <div className="hidden items-center gap-2 lg:flex">
          {loading ? (
            <div className="h-11 w-[192px]" aria-hidden="true" />
          ) : isAuthenticated ? (
            <Button variant="ink" asChild className="h-10 rounded-xl px-6 text-[14px] font-semibold">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className="h-10 rounded-xl px-5 text-[14px] font-medium text-foreground/80 hover:text-foreground"
              >
                <Link href="/sign-in?next=%2Fdashboard%2Fclient">Log in</Link>
              </Button>
              <Button
                variant="ink"
                asChild
                className="h-10 rounded-xl px-6 text-[14px] font-semibold"
              >
                <Link href="/sign-up?next=%2Fdashboard%2Fclient">Sign up free</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile ─────────────────────── */}
        {loading ? (
          <div className="h-10 w-10 lg:hidden" aria-hidden="true" />
        ) : (
          <MobileNav
            isAuthenticated={isAuthenticated}
            user={user}
            onSectionClick={onSectionClick}
          />
        )}
      </div>
    </nav>
  );
}
