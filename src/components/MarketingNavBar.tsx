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

/* ── Link row used inside both halves of the merged panel ── */
function FeatureLinkRow({ link, index }: { link: AudienceLink; index: number }) {
  return (
    <Link
      href={link.href}
      style={{ animationDelay: `${index * 28}ms` }}
      className={cn(
        "group flex items-start gap-3 rounded-lg px-3 py-2.5",
        "ax-interactive ax-fade-in hover:bg-accent",
      )}
    >
      <span className="mt-[1px] flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background shadow-xs transition-[border-color,background] duration-[180ms] group-hover:border-primary/30 group-hover:bg-primary/5">
        <link.Icon className="size-[15px] text-muted-foreground transition-[color,transform] duration-[180ms] group-hover:translate-x-px group-hover:text-primary" />
      </span>
      <div className="min-w-0">
        <p className="text-[13.5px] font-semibold leading-none text-foreground">{link.label}</p>
        <p className="mt-[5px] text-[12px] leading-snug text-muted-foreground">{link.description}</p>
      </div>
    </Link>
  );
}

/* ── Merged audience mega-panel ── */
function MergedAudiencePanel() {
  return (
    <div className="w-[820px] overflow-hidden rounded-xl">

      {/* Top: two columns of feature links */}
      <div className="grid grid-cols-2 divide-x divide-border">
        {/* Left column — solo bookkeepers */}
        <div className="space-y-px p-4">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
            Solo Bookkeepers
          </p>
          {bookkeeperLinks.map((link, i) => (
            <FeatureLinkRow key={link.label} link={link} index={i} />
          ))}
        </div>

        {/* Right column — accounting practices */}
        <div className="space-y-px p-4">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
            Accounting Practices
          </p>
          {practiceLinks.map((link, i) => (
            <FeatureLinkRow key={link.label} link={link} index={i + 6} />
          ))}
        </div>
      </div>

      {/* Bottom: horizontal CTA strip */}
      <div className="flex items-center justify-between gap-6 border-t border-border bg-muted/40 px-5 py-4">
        <p
          className="text-[13.5px] font-bold leading-snug tracking-[-0.005em] text-foreground"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          &ldquo;Built for solo bookkeepers and firms alike — without per-client minimums.&rdquo;
        </p>
        <Button variant="glossy" asChild className="h-9 shrink-0 px-5 text-[13px] font-bold">
          <Link href="/sign-up?next=%2Fdashboard%2Fclient">Start free →</Link>
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

  /* shared flat-link style — bigger, bolder for visual consistency with body copy */
  const flatLink = cn(
    navigationMenuTriggerStyle(),
    "rounded-none bg-transparent px-3.5 text-[15.5px] font-bold text-foreground",
    "transition-colors hover:bg-transparent hover:text-emerald-700",
    "focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent",
  );

  /* audience trigger style — adds sliding underline on open */
  const audienceTrigger = cn(
    "relative h-9 rounded-none bg-transparent px-3.5 text-[15.5px] font-bold",
    "text-foreground transition-colors hover:bg-transparent hover:text-emerald-700",
    "focus:bg-transparent focus:ring-0",
    "data-[state=open]:bg-transparent data-[state=open]:text-emerald-700",
    /* underline: a pseudo-element via after: Tailwind arbitrary */
    "after:absolute after:inset-x-3.5 after:bottom-0 after:h-[2px] after:origin-left",
    "after:scale-x-0 after:rounded-full after:bg-emerald-700 after:transition-transform after:duration-[140ms] after:ease-out",
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
          <AppLogo className="h-7 w-auto" />
        </Link>

        {/* Desktop nav ─────────────────── */}
        <div className="hidden flex-1 items-center justify-center lg:flex">
          <NavigationMenu>
            <NavigationMenuList className="gap-0">

              {/* Audience — merged into one consistent dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className={audienceTrigger}>
                  For Accountants &amp; Bookkeepers
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <MergedAudiencePanel />
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
            <div className="h-9 w-[170px]" aria-hidden="true" />
          ) : isAuthenticated ? (
            <Button variant="ink" asChild className="h-9 rounded-lg px-4 text-[13.5px] font-bold">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className="h-9 rounded-lg px-3.5 text-[13.5px] font-semibold text-foreground hover:text-emerald-700"
              >
                <Link href="/sign-in?next=%2Fdashboard%2Fclient">Log in</Link>
              </Button>
              <Button
                variant="ink"
                asChild
                className="h-9 rounded-lg px-4 text-[13.5px] font-bold"
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
