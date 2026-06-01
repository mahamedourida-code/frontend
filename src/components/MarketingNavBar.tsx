"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Inbox,
  ListChecks,
  Columns2,
  Brain,
  ShieldAlert,
  GitBranch,
  RefreshCcw,
  ScanLine,
  FileText,
  GraduationCap,
  ScrollText,
  Wrench,
  Gift,
  LifeBuoy,
  UserRound,
  Building2,
  type LucideIcon,
} from "lucide-react";

import { AppLogo } from "@/components/AppIcon";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useAuth } from "@/hooks/useAuth";
import {
  AudienceSolution,
  audienceSolutionGroups,
  audienceSolutionHref,
  getAudienceSolutionBySlug,
  primaryAudienceSlugs,
} from "@/lib/audience-solutions";
import { cn } from "@/lib/utils";

const primaryAudienceSolutions = primaryAudienceSlugs.map(getAudienceSolutionBySlug);

/* ── shared menu primitives ─────────────────────────────────────────────── */

type IconRow = {
  icon: LucideIcon;
  label: string;
  copy: string;
  href: string;
};

function MenuEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-black/55">
      {children}
    </p>
  );
}

function IconRowLink({ row }: { row: IconRow }) {
  const Icon = row.icon;
  return (
    <NavigationMenuLink asChild>
      <Link
        href={row.href}
        className="group grid grid-cols-[36px_1fr] gap-3 rounded-[14px] p-2.5 text-black outline-none transition-colors hover:bg-black/[0.04] focus-visible:ring-2 focus-visible:ring-black/15"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-[11px] bg-[#d1fae5] text-black">
          <Icon className="size-[18px]" strokeWidth={2} />
        </span>
        <span className="min-w-0">
          <span className="block text-[13.5px] font-bold leading-4 text-black">{row.label}</span>
          <span className="mt-1 block text-[12px] font-medium leading-[1.4] text-black/65">{row.copy}</span>
        </span>
      </Link>
    </NavigationMenuLink>
  );
}

function TextSubLink({ icon: Icon, label, href }: { icon: LucideIcon; label: string; href: string }) {
  return (
    <NavigationMenuLink asChild>
      <Link
        href={href}
        className="group flex items-center gap-2.5 rounded-[10px] px-2 py-2 text-[13px] font-semibold leading-4 text-black outline-none transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-black/15"
      >
        <Icon className="size-4 shrink-0 text-black" strokeWidth={2} />
        {label}
        <ArrowRight className="ml-auto size-3.5 shrink-0 text-black/40 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </NavigationMenuLink>
  );
}

/* ── Features mega-menu ─────────────────────────────────────────────────── */

const featureRows: IconRow[] = [
  {
    icon: Inbox,
    label: "Inbox",
    copy: "Invoices arrive by email, upload, or photo and start processing instantly.",
    href: "/dashboard/inbox",
  },
  {
    icon: ListChecks,
    label: "Processing Queue",
    copy: "A live workspace that groups documents by what needs attention.",
    href: "/dashboard/client",
  },
  {
    icon: Columns2,
    label: "Review Board",
    copy: "Source document beside editable fields with per-field confidence flags.",
    href: "/dashboard/client",
  },
  {
    icon: Brain,
    label: "Vendor Memory",
    copy: "AxLiner learns each supplier and pre-fills what you correct over time.",
    href: "/for-accountants-and-bookkeepers/batch-review-board",
  },
  {
    icon: ShieldAlert,
    label: "Duplicate & Anomaly Detection",
    copy: "Catches duplicates, odd amounts, and missing VAT before anything posts.",
    href: "/dashboard/client",
  },
  {
    icon: GitBranch,
    label: "Approval Workflows",
    copy: "Route invoices by amount, supplier, or category for clean sign-off.",
    href: "/for-accountants-and-bookkeepers/team-review",
  },
];

function FeaturesMegaMenu() {
  return (
    <div className="w-[820px] overflow-hidden rounded-[22px] border border-black/10 bg-white text-black shadow-[0_24px_60px_-28px_rgba(0,0,0,0.3)]">
      <div className="grid grid-cols-[1fr_300px]">
        <section className="p-5">
          <MenuEyebrow>The workflow</MenuEyebrow>
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            {featureRows.map((row) => (
              <IconRowLink key={row.label} row={row} />
            ))}
          </div>
        </section>

        <section className="bg-[#f7f3e9] p-5">
          <MenuEyebrow>Why AxLiner</MenuEyebrow>
          <div className="mt-3 space-y-3">
            <Link
              href="/for-accountants-and-bookkeepers/batch-review-board"
              className="group block rounded-[15px] border border-black/10 bg-white p-3.5 text-black transition-colors hover:border-black/25"
            >
              <span className="flex size-9 items-center justify-center rounded-[11px] bg-[#d1fae5] text-black">
                <Columns2 className="size-[18px]" strokeWidth={2} />
              </span>
              <span className="mt-3 block text-[13.5px] font-bold leading-4">The Batch Review Board</span>
              <span className="mt-1.5 block text-[12px] font-medium leading-[1.45] text-black/65">
                Correct every exception before export or publish. Our whole differentiator.
              </span>
            </Link>
            <Link
              href="/handwritten-to-excel"
              className="group block rounded-[15px] border border-black/10 bg-white p-3.5 text-black transition-colors hover:border-black/25"
            >
              <span className="flex size-9 items-center justify-center rounded-[11px] bg-[#d1fae5] text-black">
                <ScanLine className="size-[18px]" strokeWidth={2} />
              </span>
              <span className="mt-3 block text-[13.5px] font-bold leading-4">Reads the messy stuff</span>
              <span className="mt-1.5 block text-[12px] font-medium leading-[1.45] text-black/65">
                Handwriting, phone photos, wrinkled receipts — built for real finance ops.
              </span>
            </Link>
          </div>
        </section>
      </div>

      <div className="flex items-center gap-3 border-t border-black/10 bg-white px-5 py-3.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-[#f7f3e9]">
          <Image src="/integrations/quickbooks.png" alt="QuickBooks" width={28} height={28} className="size-7 object-contain" />
        </span>
        <span className="min-w-0">
          <span className="block text-[13px] font-bold leading-4 text-black">Accounting Sync</span>
          <span className="mt-0.5 block text-[12px] font-medium leading-4 text-black/65">
            Publish reviewed entries to QuickBooks Online in one action.
          </span>
        </span>
        <Link
          href="/dashboard/integrations"
          className="ml-auto inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-[#d1fae5] px-4 text-[13px] font-bold text-black shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_0_0_1px_var(--brand-green-ring),0_1px_3px_0_rgba(0,0,0,0.12)] transition-colors hover:bg-[#a7f3d0]"
        >
          Connect <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}

/* ── For Accountants & Bookkeepers mega-menu ────────────────────────────── */

const primaryAudienceIcons: Record<string, LucideIcon> = {
  "solo-bookkeepers": UserRound,
  "accounting-practices": Building2,
};

function PrimaryAudienceLink({ solution }: { solution: AudienceSolution }) {
  const Icon = primaryAudienceIcons[solution.slug] ?? UserRound;

  return (
    <NavigationMenuLink asChild>
      <Link
        href={audienceSolutionHref(solution.slug)}
        className="group flex flex-row items-center gap-3 rounded-[15px] border border-black/10 bg-[#f7f3e9] px-3 py-3 text-black outline-none transition-colors hover:border-black/25 focus-visible:ring-2 focus-visible:ring-black/15"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-white text-black">
          <Icon className="size-4" />
        </span>
        <span className="text-[13px] font-bold leading-4">{solution.menuLabel}</span>
        <ArrowRight className="ml-auto size-3.5 shrink-0 text-black/45 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </NavigationMenuLink>
  );
}

function SecondaryAudienceLink({ solution }: { solution: AudienceSolution }) {
  return (
    <NavigationMenuLink asChild>
      <Link
        href={audienceSolutionHref(solution.slug)}
        className="group flex flex-row items-center gap-2 rounded-[10px] px-2 py-1.5 text-[12px] font-semibold leading-4 text-black outline-none transition-colors hover:bg-[#d1fae5] focus-visible:ring-2 focus-visible:ring-black/15"
      >
        {solution.menuLabel}
        <ArrowRight className="ml-auto size-3 shrink-0 opacity-35 transition-[opacity,transform] group-hover:translate-x-0.5 group-hover:opacity-100" />
      </Link>
    </NavigationMenuLink>
  );
}

type IntegrationCardProps = {
  asset: string;
  assetAlt: string;
  label: string;
  copy: string;
  className: string;
};

function IntegrationCard({ asset, assetAlt, label, copy, className }: IntegrationCardProps) {
  return (
    <div
      className={cn("flex min-h-[92px] items-center gap-4 rounded-[16px] px-4 py-3.5 text-black", className)}
    >
      <span className="flex size-14 shrink-0 items-center justify-center rounded-[12px] bg-white shadow-[0_1px_0_rgba(0,0,0,0.08)]">
        <Image src={asset} alt={assetAlt} width={36} height={36} className="size-9 object-contain" />
      </span>
      <span>
        <span className="block text-[13px] font-bold leading-4">{label}</span>
        <span className="mt-1 block text-[12px] font-medium leading-[1.45] text-black/70">{copy}</span>
      </span>
    </div>
  );
}

function AudienceMegaMenu() {
  return (
    <div className="w-[940px] overflow-hidden rounded-[22px] border border-black/10 bg-white text-black shadow-[0_24px_60px_-28px_rgba(0,0,0,0.3)]">
      <div className="grid grid-cols-[236px_1fr]">
        <section className="border-r border-black/10 p-5">
          <MenuEyebrow>For your practice</MenuEyebrow>
          <div className="mt-3 space-y-2">
            {primaryAudienceSolutions.map((solution) => (
              <PrimaryAudienceLink key={solution.slug} solution={solution} />
            ))}
          </div>
        </section>

        <section className="p-5">
          <MenuEyebrow>Accounting workflow</MenuEyebrow>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {audienceSolutionGroups.map((group) => {
              const Icon = group.icon;

              return (
                <div
                  key={group.label}
                  className="rounded-[15px] border border-black/10 bg-white p-3"
                >
                  <div className="flex items-center gap-2 border-b border-black/10 pb-2.5">
                    <span className="flex size-7 items-center justify-center rounded-[9px] bg-[#d1fae5] text-black">
                      <Icon className="size-3.5" />
                    </span>
                    <p className="text-[13px] font-bold leading-4 text-black">{group.label}</p>
                  </div>
                  <div className="mt-2 space-y-0.5">
                    {group.slugs.map((slug) => (
                      <SecondaryAudienceLink key={slug} solution={getAudienceSolutionBySlug(slug)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-black/10 bg-white p-4">
        <IntegrationCard
          asset="/integrations/quickbooks.png"
          assetAlt="QuickBooks"
          label="QuickBooks"
          copy="Publish reviewed bills to QuickBooks Online."
          className="bg-[#d1fae5]"
        />
        <IntegrationCard
          asset="/integrations/xero.png"
          assetAlt="Xero"
          label="Xero export"
          copy="Export-ready handoff for Xero workflows."
          className="bg-[#f7f3e9]"
        />
      </div>
    </div>
  );
}

/* ── Resources dropdown ─────────────────────────────────────────────────── */

const resourcePrimary: IconRow[] = [
  {
    icon: FileText,
    label: "Blog",
    copy: "Playbooks on batch review, messy-document OCR, and clean books.",
    href: "/blogs",
  },
  {
    icon: GraduationCap,
    label: "Learn AxLiner",
    copy: "Guides and walkthroughs for the review board and QuickBooks sync.",
    href: "/blogs",
  },
];

const resourceAdditional: { icon: LucideIcon; label: string; href: string }[] = [
  { icon: ScrollText, label: "Changelog", href: "#" },
  { icon: Wrench, label: "Tools", href: "#" },
  { icon: Gift, label: "Affiliate program", href: "#" },
  { icon: LifeBuoy, label: "Help and support", href: "/contact" },
];

function ResourcesMenu() {
  return (
    <div className="w-[620px] overflow-hidden rounded-[22px] border border-black/10 bg-white text-black shadow-[0_24px_60px_-28px_rgba(0,0,0,0.3)]">
      <div className="grid grid-cols-[1fr_240px]">
        <section className="p-5">
          <MenuEyebrow>Learn</MenuEyebrow>
          <div className="mt-3 space-y-1.5">
            {resourcePrimary.map((row) => (
              <IconRowLink key={row.label} row={row} />
            ))}
          </div>
        </section>

        <section className="bg-[#f7f3e9] p-5">
          <MenuEyebrow>Additional resources</MenuEyebrow>
          <div className="mt-3 space-y-0.5">
            {resourceAdditional.map((item) => (
              <TextSubLink key={item.label} icon={item.icon} label={item.label} href={item.href} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ── Nav bar ────────────────────────────────────────────────────────────── */

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

  const flatLink = cn(
    navigationMenuTriggerStyle(),
    "rounded-[8px] bg-transparent px-3 text-[15px] font-semibold text-black",
    "transition-colors hover:bg-black/[0.05] hover:text-black",
    "focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent",
  );

  const dropdownTrigger = cn(
    "h-9 rounded-[8px] bg-transparent px-3 text-[15px] font-semibold",
    "text-black transition-colors hover:bg-black/[0.05] hover:text-black",
    "focus:bg-transparent focus:ring-0 focus-visible:ring-2 focus-visible:ring-black/15",
    "data-[state=open]:bg-black/[0.05] data-[state=open]:text-black data-[state=open]:hover:bg-black/[0.05]",
    "[&_svg]:text-black",
  );

  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-[68px] border-b",
        "transition-[background-color,border-color,box-shadow] duration-200",
        scrolled
          ? "border-black/10 bg-white/95 shadow-[0_1px_0_0_rgba(0,0,0,0.06)] backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-full max-w-[1500px] items-center justify-between px-4 sm:px-5 lg:px-9">
        <Link href="/" aria-label="AxLiner home" className="flex-shrink-0">
          <AppLogo className="h-7 w-auto" />
        </Link>

        <div className="hidden flex-1 items-center justify-center lg:flex">
          <NavigationMenu viewport={false}>
            <NavigationMenuList className="gap-0">
              <NavigationMenuItem>
                <NavigationMenuTrigger className={dropdownTrigger}>
                  Features
                </NavigationMenuTrigger>
                <NavigationMenuContent className="left-0 xl:left-0">
                  <FeaturesMegaMenu />
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className={dropdownTrigger}>
                  For Accountants &amp; Bookkeepers
                </NavigationMenuTrigger>
                <NavigationMenuContent className="-left-[240px] xl:-left-[180px] 2xl:-left-[120px]">
                  <AudienceMegaMenu />
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className={dropdownTrigger}>
                  Resources
                </NavigationMenuTrigger>
                <NavigationMenuContent className="-left-[300px] xl:-left-[260px]">
                  <ResourcesMenu />
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/pricing" className={flatLink}>
                    Pricing
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {loading ? (
            <div className="h-9 w-[170px]" aria-hidden="true" />
          ) : isAuthenticated ? (
            <Button variant="ink" asChild className="h-10 px-5 text-sm font-bold">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className="h-10 px-4 text-sm font-semibold text-black hover:bg-black/[0.05] hover:text-black"
              >
                <Link href="/sign-in?next=%2Fdashboard%2Fclient">Log in</Link>
              </Button>
              <Button variant="ink" asChild className="h-10 px-5 text-sm font-bold">
                <Link href="/sign-up?next=%2Fdashboard%2Fclient">Sign up</Link>
              </Button>
            </>
          )}
        </div>

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
