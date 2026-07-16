"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Building2,
  FileOutput,
  FileText,
  Gift,
  Inbox,
  Layers,
  LifeBuoy,
  ScanLine,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import { AppLogo } from "@/components/AppIcon";
import { MobileNav } from "@/components/MobileNav";
import { VisualMenuImage, type NavVisualKey } from "@/components/nav/visual-menu-assets";
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

type VisualMenuCardProps = {
  title: string;
  detail?: string;
  href: string;
  visual: NavVisualKey;
  label: string;
  className?: string;
  imageClassName?: string;
};

type TextMenuItem = {
  title: string;
  detail?: string;
  href: string;
  icon?: LucideIcon;
};

function MenuPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "w-[960px] overflow-hidden rounded-[24px] border border-black/[0.07] bg-white/95 p-2.5 text-neutral-950",
        "shadow-[0_30px_90px_-58px_rgba(15,23,42,0.5),0_10px_28px_-24px_rgba(15,23,42,0.28)] backdrop-blur-xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

function VisualMenuCard({
  title,
  detail,
  href,
  visual,
  label,
  className,
  imageClassName,
}: VisualMenuCardProps) {
  return (
    <NavigationMenuLink asChild>
      <Link
        href={href}
        className={cn(
          "ax-interactive group flex min-h-[154px] flex-col justify-between overflow-hidden rounded-[18px] bg-[#fbfaf7] p-1",
          "shadow-[0_1px_2px_rgba(15,23,42,0.06)] outline-none",
          "transition-[border-color,box-shadow,transform] duration-200 ease-[var(--ax-motion-ease)]",
          "hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-28px_rgba(15,23,42,0.52)]",
          "focus-visible:ring-2 focus-visible:ring-black/15",
          className,
        )}
      >
        <VisualMenuImage visual={visual} label={label} className={cn("h-[88px] rounded-[15px]", imageClassName)} />
        <span className="flex min-h-[54px] flex-col justify-center px-2.5 pb-1 pt-2">
          <span className="text-[14px] font-bold leading-5 text-neutral-950">{title}</span>
          {detail ? (
            <span className="mt-0.5 text-[12px] font-semibold leading-4 text-neutral-500">{detail}</span>
          ) : null}
        </span>
      </Link>
    </NavigationMenuLink>
  );
}

function TextMenuLink({ title, detail, href, icon: Icon }: TextMenuItem) {
  return (
    <NavigationMenuLink asChild>
      <Link
        href={href}
        className={cn(
          "ax-interactive group flex min-h-[70px] items-center gap-3 rounded-[17px] border border-black/[0.05] bg-[#f7f4ee] px-3.5 py-3 text-neutral-950 outline-none",
          "transition-[background-color,border-color,transform] duration-150 ease-[var(--ax-motion-ease)] hover:-translate-y-px hover:border-black/[0.12] hover:bg-[#f1ede4]",
          "focus-visible:ring-2 focus-visible:ring-black/15",
        )}
      >
        {Icon ? (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-black shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
            <Icon className="size-4 text-black" strokeWidth={2} aria-hidden="true" />
          </span>
        ) : null}
        <span className="min-w-0">
          <span className="block truncate text-[14px] font-bold leading-5">{title}</span>
          {detail ? (
            <span className="mt-0.5 block truncate text-[12.5px] font-semibold leading-4 text-neutral-500">
              {detail}
            </span>
          ) : null}
        </span>
      </Link>
    </NavigationMenuLink>
  );
}

function TextMenuStack({ items, className }: { items: TextMenuItem[]; className?: string }) {
  return (
    <div className={cn("flex h-full flex-col gap-2.5", className)}>
      {items.map((item) => (
        <TextMenuLink key={`${item.title}-${item.href}`} {...item} />
      ))}
    </div>
  );
}

function FeaturesMegaMenu() {
  return (
    <MenuPanel>
      <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-2.5">
        <VisualMenuCard
          title="Review board"
          detail="Fix exceptions"
          href="/for-accountants-and-bookkeepers/batch-review-board"
          visual="batch"
          label="Review"
        />
        <VisualMenuCard
          title="Publish"
          detail="QBO + Xero"
          href="/dashboard/integrations"
          visual="export"
          label="Books"
        />
        <div className="col-span-2 grid grid-cols-2 gap-2.5">
          {[
            { title: "Inbox", detail: "Email + upload", href: "/dashboard/inbox", icon: Inbox },
            { title: "Processing queue", detail: "Stack status", href: "/dashboard/client", icon: Layers },
            {
              title: "Vendor memory",
              detail: "Supplier rules",
              href: "/for-accountants-and-bookkeepers/batch-review-board",
              icon: ShieldCheck,
            },
            { title: "Free OCR", detail: "Try a file", href: "/ocr", icon: ScanLine },
          ].map((item) => (
            <TextMenuLink key={`${item.title}-${item.href}`} {...item} />
          ))}
        </div>
      </div>
    </MenuPanel>
  );
}

function AudienceMegaMenu() {
  const featured = primaryAudienceSolutions[0];
  const second = primaryAudienceSolutions[1];
  const prepare = audienceSolutionGroups[0];
  const review = audienceSolutionGroups[1];
  const finish = audienceSolutionGroups[2];

  const workflowItems: TextMenuItem[] = [prepare, review, finish].flatMap((group) =>
    group.slugs.slice(0, 2).map((slug) => {
      const solution = getAudienceSolutionBySlug(slug);
      return {
        title: solution.menuLabel,
        detail: group.label,
        href: audienceSolutionHref(slug),
        icon: group.icon,
      };
    }),
  );

  return (
    <MenuPanel>
      <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-2.5">
        <VisualMenuCard
          title={featured.menuLabel}
          detail="Client folders"
          href={audienceSolutionHref(featured.slug)}
          visual="tray"
          label="Solo"
        />
        <TextMenuLink
          title={second.menuLabel}
          detail="Shared review"
          href={audienceSolutionHref(second.slug)}
          icon={Building2}
        />
        <TextMenuStack items={workflowItems.slice(0, 3)} />
        <TextMenuStack items={workflowItems.slice(3, 6)} />
      </div>
    </MenuPanel>
  );
}

function ResourcesMenu() {
  return (
    <MenuPanel className="w-[820px]">
      <div className="grid grid-cols-[1fr_1fr_1fr] gap-2.5">
        <VisualMenuCard
          title="Guides"
          detail="Playbooks"
          href="/blogs"
          visual="magnifier"
          label="Read"
        />
        <TextMenuStack
          items={[
            { title: "Learn AxLiner", detail: "Walkthroughs", href: "/blogs", icon: FileText },
            { title: "Changelog", detail: "Recent ships", href: "#", icon: FileOutput },
          ]}
        />
        <TextMenuStack
          items={[
            { title: "Tools", detail: "Utilities", href: "#" },
            { title: "Affiliate program", detail: "Partner path", href: "#", icon: Gift },
            { title: "Help and support", detail: "Contact", href: "/contact", icon: LifeBuoy },
          ]}
        />
      </div>
    </MenuPanel>
  );
}

type MarketingNavBarProps = {
  onSectionClick?: (sectionId: string) => void;
};

export function MarketingNavBar({ onSectionClick }: MarketingNavBarProps) {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const isAuthenticated = Boolean(user);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 12);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const flatLink = cn(
    navigationMenuTriggerStyle(),
    "h-10 rounded-full bg-transparent px-3.5 text-[15px] font-semibold text-black",
    "transition-colors hover:bg-black/[0.05] hover:text-black",
    "focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent",
  );

  const dropdownTrigger = cn(
    "h-10 rounded-full bg-transparent px-3.5 text-[15px] font-semibold",
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
      <div className="mx-auto flex h-full max-w-[1500px] items-center justify-between px-4 sm:px-5 lg:px-9">
        <Link href="/" aria-label="AxLiner home" className="flex-shrink-0">
          <AppLogo className="h-12 w-auto" />
        </Link>

        <div className="hidden flex-1 items-center justify-center lg:flex">
          <NavigationMenu viewport={false} delayDuration={0} skipDelayDuration={0}>
            <NavigationMenuList className="gap-0">
              <NavigationMenuItem>
                <NavigationMenuTrigger className={dropdownTrigger}>Features</NavigationMenuTrigger>
                <NavigationMenuContent className="-left-[60px] xl:-left-[110px]">
                  <FeaturesMegaMenu />
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className={dropdownTrigger}>
                  For Accountants &amp; Bookkeepers
                </NavigationMenuTrigger>
                <NavigationMenuContent className="-left-[300px] xl:-left-[340px]">
                  <AudienceMegaMenu />
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className={dropdownTrigger}>Resources</NavigationMenuTrigger>
                <NavigationMenuContent className="-left-[540px] xl:-left-[560px]">
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
          {isAuthenticated ? (
            <>
              <Button variant="ink" asChild className="h-10 px-5 text-[15px] font-semibold">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="surface" asChild className="h-10 px-5 text-[15px] font-semibold">
                <Link href="?demo=1" scroll={false}>
                  Request a demo
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className="h-10 px-4 text-[15px] font-semibold text-black hover:bg-transparent hover:text-black"
              >
                <Link href="/sign-in?next=%2Fdashboard%2Fclient">Log in</Link>
              </Button>
              <Button variant="ink" asChild className="h-10 px-5 text-[15px] font-semibold">
                <Link href="/sign-up?next=%2Fdashboard%2Fclient">Sign up</Link>
              </Button>
              <Button variant="surface" asChild className="h-10 px-5 text-[15px] font-semibold">
                <Link href="?demo=1" scroll={false}>
                  Request a demo
                </Link>
              </Button>
            </>
          )}
        </div>

        <MobileNav isAuthenticated={isAuthenticated} user={user} onSectionClick={onSectionClick} />
      </div>
    </nav>
  );
}
