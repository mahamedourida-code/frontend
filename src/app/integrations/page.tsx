import type { Metadata } from "next";
import NextLink from "next/link";
import { MarketingNavBar } from "@/components/MarketingNavBar";
import { AppLogo } from "@/components/AppIcon";
import IntegrationsClient from "./IntegrationsClient";

export const metadata: Metadata = {
  title: "Integrations — AxLiner",
  description:
    "Connect AxLiner to the accounting and cloud tools you already use. QuickBooks Online, Google Drive, Gmail, Xero (coming soon), and direct Excel/CSV export — all wired into one batch review workflow.",
};

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Convert files", href: "/dashboard/client" },
      { label: "Review board", href: "/dashboard/client" },
      { label: "AP queue", href: "/dashboard/accounts-payable" },
      { label: "Inbox", href: "/dashboard/inbox" },
      { label: "Integrations", href: "/integrations" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Accounting", href: "/solutions/accounting" },
      { label: "Banking", href: "/solutions/banking" },
      { label: "Healthcare", href: "/solutions/healthcare" },
      { label: "Construction", href: "/solutions/construction" },
      { label: "Real Estate", href: "/solutions/real-estate" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blogs" },
      { label: "Pricing", href: "/pricing" },
      { label: "Security", href: "/security" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Try AxLiner", href: "/dashboard/client" },
      { label: "Sign in", href: "/sign-in" },
      { label: "Sign up free", href: "/sign-up" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "EULA", href: "/end-user-license-agreement" },
    ],
  },
];

function FooterLinkedInIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.8 8.1H3.2V20h3.6V8.1Zm.2-3.7A2.1 2.1 0 1 1 2.8 4.4a2.1 2.1 0 0 1 4.2 0ZM20.8 13.2V20h-3.6v-6.3c0-1.6-.6-2.7-2-2.7-1.1 0-1.7.7-2 1.5-.1.3-.1.8-.1 1.2V20H9.5s.1-10.1 0-11.9h3.6v1.7c.5-.8 1.4-2 3.4-2 2.5 0 4.3 1.6 4.3 5.4Z" />
    </svg>
  );
}

function FooterYouTubeIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.4 7.1a2.8 2.8 0 0 0-2-2C17.7 4.6 12 4.6 12 4.6s-5.7 0-7.4.5a2.8 2.8 0 0 0-2 2A29.4 29.4 0 0 0 2.1 12c0 1.7.2 3.4.5 4.9a2.8 2.8 0 0 0 2 2c1.7.5 7.4.5 7.4.5s5.7 0 7.4-.5a2.8 2.8 0 0 0 2-2c.3-1.5.5-3.2.5-4.9 0-1.7-.2-3.4-.5-4.9Zm-11.6 8V8.9l5.5 3.1-5.5 3.1Z" />
    </svg>
  );
}

const footerSocialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com", Icon: FooterLinkedInIcon },
  { label: "YouTube", href: "https://www.youtube.com", Icon: FooterYouTubeIcon },
];

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNavBar />
      <IntegrationsClient />

      {/* ── Final CTA band ── */}
      <section className="relative z-10 w-full overflow-hidden bg-black px-5 py-16 text-white sm:px-10 sm:py-20 lg:px-16 lg:py-[104px]">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 text-center">
          <h2 className="ax-marketing-display text-[40px] font-bold leading-[1.08] tracking-tight text-white md:text-[48px] lg:text-[56px]">
            Connect your stack in minutes.
          </h2>
          <p className="max-w-[820px] text-[18px] font-medium leading-[1.45] text-white/85">
            Upload from anywhere, review every line, post directly to QuickBooks. No manual re-entry, no data leaving your control.
          </p>
          <div className="mt-4 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <NextLink
              href="/dashboard/client"
              className="inline-flex h-14 items-center rounded-full bg-[#d1fae5] px-10 text-base font-bold text-black shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_0_0_1px_var(--brand-green-ring),0_6px_22px_-8px_rgba(16,185,129,0.55)] transition-all hover:bg-[#a7f3d0]"
            >
              Start free →
            </NextLink>
            <NextLink
              href="/pricing"
              className="inline-flex h-14 items-center rounded-full border-2 border-white px-10 text-base font-bold text-white transition-colors hover:bg-white hover:text-black"
            >
              See pricing
            </NextLink>
          </div>
          <p className="mt-4 text-sm font-semibold text-white/65">
            No credit card · 50 free conversions · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 bg-black text-white">
        <div className="mx-auto max-w-[1200px] px-4 pt-16 pb-10 sm:px-6 lg:px-8 lg:pt-20">
          <div className="flex flex-col gap-6 border-b border-white/12 pb-10 sm:flex-row sm:items-center sm:justify-between">
            <NextLink href="/" aria-label="AxLiner home" className="inline-flex items-center">
              <AppLogo className="h-8 w-auto invert" />
            </NextLink>
            <div className="flex items-center gap-3">
              {footerSocialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:-translate-y-0.5 hover:bg-[#d1fae5] hover:text-black"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 py-12 sm:grid-cols-3 lg:grid-cols-5 lg:gap-8">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <p className="text-[15px] font-bold text-white">{column.title}</p>
                <ul className="mt-5 space-y-3.5">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.label}`}>
                      <NextLink
                        href={link.href}
                        className="text-[14px] font-medium text-white/70 transition-opacity hover:text-white hover:opacity-100"
                      >
                        {link.label}
                      </NextLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-6 border-t border-white/12 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] font-medium text-white/70">
              © 2026 AxLiner Inc. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <NextLink href="/contact" className="text-[13px] font-medium text-white/70 transition-colors hover:text-white">
                Contact Us
              </NextLink>
              <NextLink href="/privacy-policy" className="text-[13px] font-medium text-white/70 transition-colors hover:text-white">
                Privacy Policy
              </NextLink>
              <NextLink href="/end-user-license-agreement" className="text-[13px] font-medium text-white/70 transition-colors hover:text-white">
                Terms &amp; Conditions
              </NextLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
