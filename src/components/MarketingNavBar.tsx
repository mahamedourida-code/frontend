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
  tag?: string;
  href: string;
};

function MenuEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-1 text-[12px] font-bold uppercase tracking-[0.18em] text-black/55">
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
        className="group grid grid-cols-[48px_1fr] items-center gap-4 rounded-[16px] p-3.5 text-black outline-none transition-colors hover:bg-black/[0.04] focus-visible:ring-2 focus-visible:ring-black/15"
      >
        <span className="flex size-12 shrink-0 items-center justify-center text-black">
          <Icon className="size-[22px]" strokeWidth={2} />
        </span>
        <span className="min-w-0">
          <span className="block text-[17px] font-bold leading-5 text-black">{row.label}</span>
          {row.tag ? (
            <span className="mt-0.5 block text-[13px] font-medium leading-tight text-black/55">{row.tag}</span>
          ) : null}
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
        className="group flex items-center gap-3 rounded-[12px] px-3 py-3 text-[16px] font-semibold leading-5 text-black outline-none transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-black/15"
      >
        <Icon className="size-[18px] shrink-0 text-black" strokeWidth={2} />
        {label}
        <ArrowRight className="ml-auto size-4 shrink-0 text-black/40 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </NavigationMenuLink>
  );
}

/* ── Features mega-menu ─────────────────────────────────────────────────── */

const featureRows: IconRow[] = [
  {
    icon: Inbox,
    label: "Inbox",
    tag: "Email, upload, photo",
    href: "/dashboard/inbox",
  },
  {
    icon: ListChecks,
    label: "Processing Queue",
    tag: "Grouped by status",
    href: "/dashboard/client",
  },
  {
    icon: Columns2,
    label: "Review Board",
    tag: "Side-by-side check",
    href: "/dashboard/client",
  },
  {
    icon: Brain,
    label: "Vendor Memory",
    tag: "Learns each supplier",
    href: "/for-accountants-and-bookkeepers/batch-review-board",
  },
  {
    icon: ShieldAlert,
    label: "Duplicate Detection",
    tag: "Catches anomalies",
    href: "/dashboard/client",
  },
  {
    icon: GitBranch,
    label: "Approval Workflows",
    tag: "Clean sign-off",
    href: "/for-accountants-and-bookkeepers/team-review",
  },
];

function FeaturesMegaMenu() {
  return (
    <div className="w-[900px] overflow-hidden rounded-[24px] border border-black/10 bg-white text-black shadow-[0_24px_60px_-28px_rgba(0,0,0,0.3)]">
      <div className="grid grid-cols-[1fr_320px]">
        <section className="p-6">
          <MenuEyebrow>The workflow</MenuEyebrow>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {featureRows.map((row) => (
              <IconRowLink key={row.label} row={row} />
            ))}
          </div>
        </section>

        <section className="bg-[#f7f3e9] p-6">
          <MenuEyebrow>Why AxLiner</MenuEyebrow>
          <div className="mt-4 space-y-3.5">
            <Link
              href="/for-accountants-and-bookkeepers/batch-review-board"
              className="group block rounded-[16px] border border-black/10 bg-white p-4 text-black transition-colors hover:border-black/25"
            >
              <span className="flex size-11 items-center justify-center text-black">
                <Columns2 className="size-[22px]" strokeWidth={2} />
              </span>
              <span className="mt-3.5 block text-[17px] font-bold leading-5">Batch Review Board</span>
              <span className="mt-1 block text-[13px] font-medium leading-tight text-black/55">
                Fix exceptions before export
              </span>
            </Link>
            <Link
              href="/ocr"
              className="group block rounded-[16px] border border-black/10 bg-white p-4 text-black transition-colors hover:border-black/25"
            >
              <span className="flex size-11 items-center justify-center text-black">
                <ScanLine className="size-[22px]" strokeWidth={2} />
              </span>
              <span className="mt-3.5 block text-[17px] font-bold leading-5">OCR engine</span>
              <span className="mt-1 block text-[13px] font-medium leading-tight text-black/55">
                Reads handwriting, photos, receipts
              </span>
            </Link>
          </div>
        </section>
      </div>

      <div className="flex items-center gap-4 border-t border-black/10 bg-white px-6 py-4">
        <RefreshCcw className="size-7 shrink-0 text-black" strokeWidth={2} />
        <span className="min-w-0">
          <span className="block text-[16px] font-bold leading-5 text-black">Accounting Sync</span>
          <span className="mt-0.5 block text-[13px] font-medium leading-tight text-black/55">
            One-click to QuickBooks Online
          </span>
        </span>
        <Link
          href="/dashboard/integrations"
          className="ml-auto inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-[var(--brand-green)] px-5 text-[15px] font-bold text-black shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_0_0_1px_var(--brand-green-ring),0_1px_3px_0_rgba(0,0,0,0.12)] transition-colors hover:bg-[var(--brand-green-hover)]"
        >
          Connect <ArrowRight className="size-4" />
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
        className="group flex flex-row items-center gap-3.5 rounded-[16px] border border-black/10 bg-[#f7f3e9] px-4 py-3.5 text-black outline-none transition-colors hover:border-black/25 focus-visible:ring-2 focus-visible:ring-black/15"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-white text-black">
          <Icon className="size-5" />
        </span>
        <span className="text-[16px] font-bold leading-5">{solution.menuLabel}</span>
        <ArrowRight className="ml-auto size-4 shrink-0 text-black/45 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </NavigationMenuLink>
  );
}

function SecondaryAudienceLink({ solution }: { solution: AudienceSolution }) {
  return (
    <NavigationMenuLink asChild>
      <Link
        href={audienceSolutionHref(solution.slug)}
        className="group flex flex-row items-center gap-2 rounded-[11px] px-2.5 py-2 text-[15px] font-semibold leading-5 text-black outline-none transition-colors hover:bg-black/[0.05] focus-visible:ring-2 focus-visible:ring-black/15"
      >
        {solution.menuLabel}
        <ArrowRight className="ml-auto size-3.5 shrink-0 opacity-35 transition-[opacity,transform] group-hover:translate-x-0.5 group-hover:opacity-100" />
      </Link>
    </NavigationMenuLink>
  );
}

type IntegrationCardProps = {
  asset: string;
  assetAlt: string;
  label: string;
  href: string;
  className: string;
};

function IntegrationCard({ asset, assetAlt, label, href, className }: IntegrationCardProps) {
  return (
    <NavigationMenuLink asChild>
      <Link
        href={href}
        className={cn(
          "group flex items-center gap-4 rounded-[16px] px-5 py-4 text-black outline-none transition-colors focus-visible:ring-2 focus-visible:ring-black/15",
          className,
        )}
      >
        <Image src={asset} alt={assetAlt} width={120} height={44} className="h-10 w-auto object-contain" />
        <span className="text-[17px] font-bold leading-5">{label}</span>
        <ArrowRight className="ml-auto size-4 shrink-0 text-black/40 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </NavigationMenuLink>
  );
}

function AudienceMegaMenu() {
  return (
    <div className="w-[940px] overflow-hidden rounded-[24px] border border-black/10 bg-white text-black shadow-[0_24px_60px_-28px_rgba(0,0,0,0.3)]">
      <div className="grid grid-cols-[260px_1fr]">
        <section className="border-r border-black/10 p-6">
          <MenuEyebrow>For your practice</MenuEyebrow>
          <div className="mt-4 space-y-2.5">
            {primaryAudienceSolutions.map((solution) => (
              <PrimaryAudienceLink key={solution.slug} solution={solution} />
            ))}
          </div>
        </section>

        <section className="p-6">
          <MenuEyebrow>Accounting workflow</MenuEyebrow>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {audienceSolutionGroups.map((group) => {
              const Icon = group.icon;

              return (
                <div
                  key={group.label}
                  className="rounded-[16px] border border-black/10 bg-white p-3.5"
                >
                  <div className="flex items-center gap-2.5 border-b border-black/10 pb-3">
                    <span className="flex size-8 items-center justify-center text-black">
                      <Icon className="size-4" />
                    </span>
                    <p className="text-[15px] font-bold leading-5 text-black">{group.label}</p>
                  </div>
                  <div className="mt-2.5 space-y-0.5">
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

      <div className="grid grid-cols-2 gap-4 border-t border-black/10 bg-white p-5">
        <IntegrationCard
          asset="/integrations/quickbooks.png"
          assetAlt="QuickBooks"
          label="QuickBooks"
          href="/dashboard/integrations"
          className="bg-[var(--brand-green)] hover:bg-[var(--brand-green-hover)]"
        />
        <IntegrationCard
          asset="/integrations/xero.png"
          assetAlt="Xero"
          label="Xero export"
          href="/dashboard/integrations"
          className="bg-[#f7f3e9] hover:bg-[#efe7d4]"
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
    tag: "Playbooks & guides",
    href: "/blogs",
  },
  {
    icon: GraduationCap,
    label: "Learn AxLiner",
    tag: "Walkthroughs",
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
    <div className="w-[680px] overflow-hidden rounded-[24px] border border-black/10 bg-white text-black shadow-[0_24px_60px_-28px_rgba(0,0,0,0.3)]">
      <div className="grid grid-cols-[1fr_270px]">
        <section className="p-6">
          <MenuEyebrow>Learn</MenuEyebrow>
          <div className="mt-4 space-y-2">
            {resourcePrimary.map((row) => (
              <IconRowLink key={row.label} row={row} />
            ))}
          </div>
        </section>

        <section className="bg-[#f7f3e9] p-6">
          <MenuEyebrow>Additional resources</MenuEyebrow>
          <div className="mt-4 space-y-1">
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
    "h-10 rounded-[8px] bg-transparent px-3.5 text-[15px] font-semibold text-black",
    "transition-colors hover:bg-black/[0.05] hover:text-black",
    "focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent",
  );

  const dropdownTrigger = cn(
    "h-10 rounded-[8px] bg-transparent px-3.5 text-[15px] font-semibold",
    "text-black transition-colors hover:bg-black/[0.05] hover:text-black",
    "focus:bg-transparent focus:ring-0 focus-visible:ring-2 focus-visible:ring-black/15",
    "data-[state=open]:bg-black/[0.05] data-[state=open]:text-black data-[state=open]:hover:bg-black/[0.05]",
    "[&_svg]:text-black",
  );

  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-[var(--axn-bar,0px)] z-50 h-[84px] border-b",
        "transition-[background-color,border-color,box-shadow] duration-200",
        scrolled
          ? "border-black/10 bg-white/95 shadow-[0_1px_0_0_rgba(0,0,0,0.06)] backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-full max-w-[1500px] items-center justify-between px-5 sm:px-7 lg:px-12">
        <Link href="/" aria-label="AxLiner home" className="flex-shrink-0">
          <AppLogo className="h-9 w-auto" />
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
                  <Link href="/integrations" className={flatLink}>
                    Integrations
                  </Link>
                </NavigationMenuLink>
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

        <div className="hidden items-center gap-2.5 lg:flex">
          {loading ? (
            <div className="h-11 w-[280px]" aria-hidden="true" />
          ) : isAuthenticated ? (
            <>
              <Button variant="glossy" asChild className="h-11 px-5 text-[15px] font-bold bg-[var(--brand-brown)] border-[var(--brand-brown)] hover:border-black">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="ghost" asChild className="h-11 px-5 text-[15px] font-semibold bg-white text-black shadow-none border-2 border-black hover:bg-black hover:text-white">
                <Link href="/contact">Talk to us</Link>
              </Button>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className="h-11 px-4 text-[15px] font-semibold text-black hover:bg-transparent hover:text-[var(--brand-green)]"
              >
                <Link href="/sign-in?next=%2Fdashboard%2Fclient">Log in</Link>
              </Button>
              <Button variant="glossy" asChild className="h-11 px-5 text-[15px] font-bold bg-[var(--brand-brown)] border-[var(--brand-brown)] hover:border-black">
                <Link href="/sign-up?next=%2Fdashboard%2Fclient">Sign up</Link>
              </Button>
              <Button variant="ghost" asChild className="h-11 px-5 text-[15px] font-semibold bg-white text-black shadow-none border-2 border-black hover:bg-black hover:text-white">
                <Link href="/contact">Talk to us</Link>
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
