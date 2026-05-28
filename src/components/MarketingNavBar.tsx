"use client";

import { useEffect } from "react";
import { useState } from "react";
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
  ListTodo,
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

type AudienceLink = {
  label: string;
  description: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const bookkeeperLinks: AudienceLink[] = [
  { label: "Document extraction", description: "Invoices, receipts, bank statements, handwritten notes", href: "/dashboard/client", Icon: ScanLine },
  { label: "Review board", description: "Source image + editable cells, side by side", href: "/dashboard/client", Icon: Eye },
  { label: "Mixed batch auto-detect", description: "Drop a whole folder — AxLiner classifies each file", href: "/dashboard/auto-detect", Icon: Layers },
  { label: "Export to Excel / CSV", description: "One file or the full batch, clean and ready", href: "/dashboard/client", Icon: Download },
  { label: "QuickBooks publishing", description: "Draft Bill posted with original doc attached", href: "/dashboard/integrations", Icon: ArrowUpRight },
  { label: "Client upload links", description: "Clients submit without an account", href: "/dashboard/inbox", Icon: Link2 },
];

const practiceLinks: AudienceLink[] = [
  { label: "Batch processing", description: "Up to 50 files, mixed types, one job", href: "/dashboard/client", Icon: FolderOpen },
  { label: "Team reviewer access", description: "Invite colleagues — they review, you publish", href: "/dashboard/settings", Icon: Users },
  { label: "AP queue + QuickBooks", description: "Code, approve, and bulk-publish bills in one screen", href: "/dashboard/accounts-payable", Icon: ReceiptText },
  { label: "Vendor memory rules", description: "Auto-fill coding for recurring suppliers", href: "/dashboard/settings", Icon: BookOpen },
  { label: "Inbox & client intake", description: "Watch folder, email forwarding, intake links", href: "/dashboard/inbox", Icon: Inbox },
  { label: "Workflows", description: "Routing rules for multi-step review", href: "/dashboard/workflows", Icon: Workflow },
];

type PanelProps = {
  links: AudienceLink[];
  headline: string;
  body: string;
};

function AudiencePanel({ links, headline, body }: PanelProps) {
  return (
    <div className="grid w-[660px] grid-cols-[1fr_0.96fr] overflow-hidden">
      {/* Left — feature links */}
      <div className="space-y-0.5 p-4">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="group flex items-start gap-3 rounded-lg px-3 py-2.5 ax-interactive hover:bg-accent"
          >
            <link.Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
            <div className="min-w-0">
              <p className="text-sm font-medium leading-none text-foreground">{link.label}</p>
              <p className="mt-1 text-xs leading-snug text-muted-foreground">{link.description}</p>
            </div>
          </Link>
        ))}
        <div className="pt-2 pl-3">
          <Link
            href="/pricing"
            className="text-xs font-semibold text-primary ax-interactive hover:opacity-80"
          >
            See pricing →
          </Link>
        </div>
      </div>

      {/* Right — positioning panel */}
      <div className="flex flex-col justify-between border-l border-border bg-muted/40 p-5">
        <div>
          <p className="text-[15px] font-bold leading-snug text-foreground">
            {headline}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {body}
          </p>
        </div>
        <Button
          variant="glossy"
          asChild
          className="mt-6 h-9 w-full text-sm font-semibold"
        >
          <Link href="/sign-up?next=%2Fdashboard%2Fclient">Start free →</Link>
        </Button>
      </div>
    </div>
  );
}

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

  const flatLinkClass = cn(
    navigationMenuTriggerStyle(),
    "rounded-none bg-transparent px-3 text-[15px] font-medium text-foreground transition-colors hover:bg-transparent hover:text-foreground/64 focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent"
  );

  const triggerClass =
    "rounded-none bg-transparent px-3 text-[15px] font-medium text-foreground transition-colors hover:bg-transparent hover:text-foreground/64 focus:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-primary";

  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-[72px] border-b transition-[background-color,border-color] duration-200",
        scrolled
          ? "border-border bg-background/96 backdrop-blur-xl"
          : "border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-full max-w-[1480px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="AxLiner home" className="flex-shrink-0">
          <AppLogo />
        </Link>

        {/* Desktop nav */}
        <div className="hidden flex-1 items-center justify-center lg:flex">
          <NavigationMenu>
            <NavigationMenuList className="gap-0">
              {/* Audience track 1 */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className={triggerClass}>
                  For Bookkeepers
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <AudiencePanel
                    links={bookkeeperLinks}
                    headline='"Built for the bookkeeper Dext priced out."'
                    body="Process every invoice, receipt, and bank statement a client sends — reviewed by you, posted correctly. No per-client minimums. No surprise price increases."
                  />
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Audience track 2 */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className={triggerClass}>
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

              {/* Shared flat links */}
              <NavigationMenuItem>
                <NavigationMenuLink href="/pricing" className={flatLinkClass}>
                  Pricing
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink href="/blogs" className={flatLinkClass}>
                  Blog
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right actions */}
        <div className="hidden items-center gap-3 lg:flex">
          {loading ? (
            <div className="h-11 w-[184px]" aria-hidden="true" />
          ) : isAuthenticated ? (
            <Button variant="ink" asChild className="h-11 rounded-xl px-7 text-base font-semibold">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="h-11 rounded-xl px-5 text-base font-medium">
                <Link href="/sign-in?next=%2Fdashboard%2Fclient">Log in</Link>
              </Button>
              <Button variant="ink" asChild className="h-11 rounded-xl px-7 text-base font-semibold">
                <Link href="/sign-up?next=%2Fdashboard%2Fclient">Sign up free</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile */}
        {loading ? (
          <div className="h-10 w-10 lg:hidden" aria-hidden="true" />
        ) : (
          <MobileNav isAuthenticated={isAuthenticated} user={user} onSectionClick={onSectionClick} />
        )}
      </div>
    </nav>
  );
}
