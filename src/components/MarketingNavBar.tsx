"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Columns2,
  ShieldAlert,
  RefreshCcw,
  ScanLine,
  FileText,
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
  audienceSolutionGroups,
  audienceSolutionHref,
  getAudienceSolutionBySlug,
  primaryAudienceSlugs,
} from "@/lib/audience-solutions";
import { cn } from "@/lib/utils";

const primaryAudienceSolutions = primaryAudienceSlugs.map(getAudienceSolutionBySlug);

/* ── shared card-grid mega-menu primitives ──────────────────────────────── */

type Accent = "lavender" | "mint" | "periwinkle" | "teal" | "cream";

const accentFill: Record<Accent, string> = {
  lavender: "hover:!bg-[#e9d5ff] focus-visible:!bg-[#e9d5ff] data-[active]:!bg-[#e9d5ff]",
  mint: "hover:!bg-[#58f29b] focus-visible:!bg-[#58f29b] data-[active]:!bg-[#58f29b]",
  periwinkle: "hover:!bg-[#91a6ff] focus-visible:!bg-[#91a6ff] data-[active]:!bg-[#91a6ff]",
  teal: "hover:!bg-[#2fc9c1] focus-visible:!bg-[#2fc9c1] data-[active]:!bg-[#2fc9c1]",
  cream: "hover:!bg-[#f2dfbf] focus-visible:!bg-[#f2dfbf] data-[active]:!bg-[#f2dfbf]",
};

const cardBase =
  "ax-interactive group relative isolate flex flex-col overflow-hidden !rounded-[12px] !bg-[#f1f1f1] text-neutral-950 outline-none transition-[background-color,color,transform] duration-150 focus-visible:ring-2 focus-visible:ring-black/15";

const menuIconClass =
  "relative z-10 text-neutral-950 transition-colors duration-150";
const menuTitleClass =
  "relative z-10 block text-[15px] font-bold leading-5 text-neutral-950 transition-colors duration-150";
const featuredTitleClass =
  "relative z-10 block text-[20px] font-bold leading-6 text-neutral-950 transition-colors duration-150";
const menuDescriptionClass =
  "relative z-10 mt-1 block text-[13px] font-semibold leading-snug text-neutral-600 transition-colors duration-150 group-hover:text-neutral-950 group-focus-visible:text-neutral-950 group-data-[active]:text-neutral-950";
const featuredDescriptionClass =
  "relative z-10 mt-1.5 block text-[13px] font-semibold leading-snug text-neutral-600 transition-colors duration-150 group-hover:text-neutral-950 group-focus-visible:text-neutral-950 group-data-[active]:text-neutral-950";

type FeaturedCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  accent: Accent;
};

/* Wide left card (~1.6x a normal card): raw icon top-left, then title +
   one-line description anchored near the bottom. */
function FeaturedCard({ icon: Icon, title, description, href, accent }: FeaturedCardProps) {
  return (
    <NavigationMenuLink asChild>
      <Link href={href} className={cn(cardBase, "h-full basis-0 grow-[1.6] justify-between p-6", accentFill[accent])}>
        <Icon className={cn("size-7", menuIconClass)} strokeWidth={2} />
        <span className="mt-12 block">
          <span className={featuredTitleClass}>{title}</span>
          <span className={featuredDescriptionClass}>{description}</span>
        </span>
      </Link>
    </NavigationMenuLink>
  );
}

type StandaloneCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  accent: Accent;
};

/* Equal-width standalone card: raw icon top-left, title + one-line description. */
function StandaloneCard({ icon: Icon, title, description, href, accent }: StandaloneCardProps) {
  return (
    <NavigationMenuLink asChild>
      <Link href={href} className={cn(cardBase, "h-full basis-0 grow justify-between p-5", accentFill[accent])}>
        <Icon className={cn("size-[22px]", menuIconClass)} strokeWidth={2} />
        <span className="mt-8 block">
          <span className={menuTitleClass}>{title}</span>
          <span className={menuDescriptionClass}>{description}</span>
        </span>
      </Link>
    </NavigationMenuLink>
  );
}

type CompactCardProps = {
  title: string;
  description: string;
  href: string;
  accent: Accent;
};

/* Small card used inside the stacked column: bold title + one-line
   description, no big icon. */
function CompactCard({ title, description, href, accent }: CompactCardProps) {
  return (
    <NavigationMenuLink asChild>
      <Link href={href} className={cn(cardBase, "h-full justify-center p-5", accentFill[accent])}>
        <span className={menuTitleClass}>{title}</span>
        <span className={menuDescriptionClass}>{description}</span>
      </Link>
    </NavigationMenuLink>
  );
}

type SubItem = { title: string; description: string; href: string; accent: Accent };

/* Stacked column of 2–3 compact sub-items, equal-height with the cards beside it. */
function StackedColumn({ items }: { items: SubItem[] }) {
  return (
    <div className="flex h-full basis-0 grow-[1.1] flex-col gap-3">
      {items.map((item) => (
        <div key={item.title} className="flex grow flex-col">
          <CompactCard title={item.title} description={item.description} href={item.href} accent={item.accent} />
        </div>
      ))}
    </div>
  );
}

/* Shared panel shell: centered, generous width, one horizontal row of cards. */
function MenuPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-[1140px] overflow-hidden rounded-[16px] border border-neutral-200 bg-white p-3 text-neutral-950 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.32)]">
      <div className="flex items-stretch gap-[10px]">{children}</div>
    </div>
  );
}

/* ── Features mega-menu ─────────────────────────────────────────────────── */

function FeaturesMegaMenu() {
  return (
    <MenuPanel>
      <FeaturedCard
        icon={Columns2}
        title="Batch review board"
        description="Fix every exception before export."
        href="/for-accountants-and-bookkeepers/batch-review-board"
        accent="lavender"
      />
      <StackedColumn
        items={[
          { title: "Inbox", description: "Email, upload, or photo intake.", href: "/dashboard/inbox", accent: "lavender" },
          { title: "Processing queue", description: "Every batch grouped by status.", href: "/dashboard/client", accent: "cream" },
          {
            title: "Vendor memory",
            description: "Learns each supplier as you go.",
            href: "/for-accountants-and-bookkeepers/batch-review-board",
            accent: "lavender",
          },
        ]}
      />
      <StandaloneCard
        icon={ShieldAlert}
        title="Duplicate detection"
        description="Catches repeats and anomalies."
        href="/dashboard/client"
        accent="mint"
      />
      <StandaloneCard
        icon={RefreshCcw}
        title="Publish to QuickBooks & Xero"
        description="Reviewed drafts, one click out."
        href="/dashboard/integrations"
        accent="periwinkle"
      />
      <StandaloneCard
        icon={ScanLine}
        title="OCR engine"
        description="Reads handwriting and photos."
        href="/ocr"
        accent="teal"
      />
    </MenuPanel>
  );
}

/* ── For Accountants & Bookkeepers mega-menu ────────────────────────────── */

const primaryAudienceIcons: Record<string, LucideIcon> = {
  "solo-bookkeepers": UserRound,
  "accounting-practices": Building2,
};

function AudienceMegaMenu() {
  const featured = primaryAudienceSolutions[0];
  const FeaturedIcon = primaryAudienceIcons[featured.slug] ?? UserRound;
  const second = primaryAudienceSolutions[1];

  // Re-render the existing audience data as the same card-grid + hover-fill.
  const prepare = audienceSolutionGroups[0];
  const review = audienceSolutionGroups[1];
  const finish = audienceSolutionGroups[2];

  const stackedSlugs: SubItem[] = [...prepare.slugs, ...review.slugs.slice(0, 1)].map((slug, i): SubItem => {
    const s = getAudienceSolutionBySlug(slug);
    return {
      title: s.menuLabel,
      description: s.eyebrow,
      href: audienceSolutionHref(slug),
      accent: i === 1 ? "cream" : "lavender",
    };
  });

  const finishCards = finish.slugs.map((slug) => getAudienceSolutionBySlug(slug));

  return (
    <MenuPanel>
      <FeaturedCard
        icon={FeaturedIcon}
        title={featured.menuLabel}
        description="A calm path from folder to reviewed books."
        href={audienceSolutionHref(featured.slug)}
        accent="lavender"
      />
      <StackedColumn items={stackedSlugs} />
      <StandaloneCard
        icon={primaryAudienceIcons[second.slug] ?? Building2}
        title={second.menuLabel}
        description="Intake to reviewer sign-off, visible."
        href={audienceSolutionHref(second.slug)}
        accent="mint"
      />
      {finishCards.map((s, i) => (
        <StandaloneCard
          key={s.slug}
          icon={finish.icon}
          title={s.menuLabel}
          description={s.eyebrow}
          href={audienceSolutionHref(s.slug)}
          accent={i === 0 ? "periwinkle" : "teal"}
        />
      ))}
    </MenuPanel>
  );
}

/* ── Resources dropdown ─────────────────────────────────────────────────── */

function ResourcesMenu() {
  return (
    <MenuPanel>
      <FeaturedCard
        icon={FileText}
        title="Blog"
        description="Playbooks and guides for the close."
        href="/blogs"
        accent="lavender"
      />
      <StackedColumn
        items={[
          { title: "Learn AxLiner", description: "Short product walkthroughs.", href: "/blogs", accent: "lavender" },
          { title: "Changelog", description: "What shipped, recently.", href: "#", accent: "cream" },
          { title: "Tools", description: "Free utilities for bookkeepers.", href: "#", accent: "lavender" },
        ]}
      />
      <StandaloneCard
        icon={Gift}
        title="Affiliate program"
        description="Earn by referring practices."
        href="#"
        accent="mint"
      />
      <StandaloneCard
        icon={LifeBuoy}
        title="Help and support"
        description="Reach the team directly."
        href="/contact"
        accent="periwinkle"
      />
    </MenuPanel>
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
          ? "border-black/10 bg-white shadow-[0_1px_0_0_rgba(0,0,0,0.06)]"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-full max-w-[1500px] items-center justify-between px-5 sm:px-7 lg:px-12">
        <Link href="/" aria-label="AxLiner home" className="flex-shrink-0">
          <AppLogo className="h-12 w-auto" />
        </Link>

        <div className="hidden flex-1 items-center justify-center lg:flex">
          <NavigationMenu viewport={false} delayDuration={0} skipDelayDuration={0}>
            <NavigationMenuList className="gap-0">
              <NavigationMenuItem>
                <NavigationMenuTrigger className={dropdownTrigger}>
                  Features
                </NavigationMenuTrigger>
                <NavigationMenuContent className="-left-[40px] xl:-left-[80px]">
                  <FeaturesMegaMenu />
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className={dropdownTrigger}>
                  For Accountants &amp; Bookkeepers
                </NavigationMenuTrigger>
                <NavigationMenuContent className="-left-[300px] xl:-left-[320px]">
                  <AudienceMegaMenu />
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className={dropdownTrigger}>
                  Resources
                </NavigationMenuTrigger>
                <NavigationMenuContent className="-left-[560px] xl:-left-[560px]">
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
              <Button variant="glossy" asChild className="h-11 rounded-lg px-5 text-[15px] font-bold">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="surface" asChild className="h-11 rounded-lg px-5 text-[15px] font-semibold">
                <Link href="?demo=1" scroll={false}>Request a demo</Link>
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
              <Button variant="glossy" asChild className="h-11 rounded-lg px-5 text-[15px] font-bold">
                <Link href="/sign-up?next=%2Fdashboard%2Fclient">Sign up</Link>
              </Button>
              <Button variant="surface" asChild className="h-11 rounded-lg px-5 text-[15px] font-semibold">
                <Link href="?demo=1" scroll={false}>Request a demo</Link>
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
