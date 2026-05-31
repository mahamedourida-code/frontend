"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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

function PrimaryAudienceLink({ solution }: { solution: AudienceSolution }) {
  const Icon = solution.icon;

  return (
    <NavigationMenuLink asChild>
      <Link
        href={audienceSolutionHref(solution.slug)}
        className="group flex flex-row items-center gap-3 rounded-[15px] border border-black/8 bg-[#f7f3e9] px-3 py-3 text-black outline-none transition-[border-color,background-color] hover:border-black/18 hover:bg-[#f3eddf] focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-white text-black">
          <Icon className="size-4" />
        </span>
        <span className="text-[13px] font-semibold leading-4">{solution.menuLabel}</span>
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
        className="group flex flex-row items-center gap-2 rounded-[10px] px-2 py-1.5 text-[12px] font-semibold leading-4 text-black outline-none transition-colors hover:bg-[#d1fae5] focus-visible:ring-2 focus-visible:ring-emerald-500"
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
          <p className="px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-black/50">
            For your practice
          </p>
          <div className="mt-3 space-y-2">
            {primaryAudienceSolutions.map((solution) => (
              <PrimaryAudienceLink key={solution.slug} solution={solution} />
            ))}
          </div>
        </section>

        <section className="p-5">
          <p className="px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-black/50">
            Accounting workflow
          </p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {audienceSolutionGroups.map((group) => {
              const Icon = group.icon;

              return (
                <div
                  key={group.label}
                  className="rounded-[15px] border border-black/8 bg-white p-3"
                >
                  <div className="flex items-center gap-2 border-b border-black/8 pb-2.5">
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

      <div className="grid grid-cols-2 gap-3 border-t border-black/10 bg-[#fcfbf8] p-4">
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
    "rounded-none bg-transparent px-3.5 text-[16px] font-semibold text-foreground",
    "transition-colors hover:bg-transparent hover:text-emerald-700",
    "focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent",
  );

  const audienceTrigger = cn(
    "relative h-9 rounded-none bg-transparent px-3.5 text-[16px] font-semibold",
    "text-foreground transition-colors hover:bg-transparent hover:text-emerald-700",
    "focus:bg-transparent focus:ring-0 focus-visible:ring-2 focus-visible:ring-emerald-500",
    "data-[state=open]:bg-transparent data-[state=open]:text-emerald-700 data-[state=open]:hover:bg-transparent",
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
      <div className="mx-auto flex h-full max-w-[1500px] items-center justify-between px-4 sm:px-5 lg:px-9">
        <Link href="/" aria-label="AxLiner home" className="flex-shrink-0">
          <AppLogo className="h-7 w-auto" />
        </Link>

        <div className="hidden flex-1 items-center justify-center lg:flex">
          <NavigationMenu viewport={false}>
            <NavigationMenuList className="gap-0">
              <NavigationMenuItem>
                <NavigationMenuTrigger className={audienceTrigger}>
                  For Accountants &amp; Bookkeepers
                </NavigationMenuTrigger>
                <NavigationMenuContent className="-left-[240px] xl:-left-[180px] 2xl:-left-[120px]">
                  <AudienceMegaMenu />
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/pricing" className={flatLink}>
                    Pricing
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/blogs" className={flatLink}>
                    Blog
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
                className="h-10 px-4 text-sm font-semibold text-foreground hover:text-emerald-700"
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
