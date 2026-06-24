import Link from "next/link";

import { AppLogo } from "@/components/AppIcon";

const columns = [
  {
    title: "Product",
    links: [
      ["Convert files", "/dashboard/client"],
      ["Review board", "/dashboard/client"],
      ["AP queue", "/dashboard/accounts-payable"],
      ["Inbox", "/dashboard/inbox"],
      ["Integrations", "/integrations"],
    ],
  },
  {
    title: "Solutions",
    links: [
      ["Accounting", "/solutions/accounting"],
      ["Banking", "/solutions/banking"],
      ["Healthcare", "/solutions/healthcare"],
      ["Construction", "/solutions/construction"],
      ["Real Estate", "/solutions/real-estate"],
    ],
  },
  {
    title: "Resources",
    links: [
      ["Blog", "/blogs"],
      ["Pricing", "/pricing"],
      ["Security", "/security"],
      ["Handwritten to Excel", "/handwritten-to-excel"],
      ["Image to Excel", "/image-to-excel"],
    ],
  },
  {
    title: "Company",
    links: [
      ["Contact", "/contact"],
      ["Try AxLiner", "/dashboard/client"],
      ["Sign in", "/sign-in"],
      ["Sign up", "/sign-up"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy Policy", "/privacy-policy"],
      ["Terms of Service", "/terms-of-service"],
      ["EULA", "/end-user-license-agreement"],
      ["Data Deletion", "/data-deletion"],
    ],
  },
] as const;

function LinkedInIcon() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.8 8.1H3.2V20h3.6V8.1Zm.2-3.7A2.1 2.1 0 1 1 2.8 4.4a2.1 2.1 0 0 1 4.2 0ZM20.8 13.2V20h-3.6v-6.3c0-1.6-.6-2.7-2-2.7-1.1 0-1.7.7-2 1.5-.1.3-.1.8-.1 1.2V20H9.5s.1-10.1 0-11.9h3.6v1.7c.5-.8 1.4-2 3.4-2 2.5 0 4.3 1.6 4.3 5.4Z" />
    </svg>
  );
}

export function MarketingFooter() {
  return (
    <footer className="bg-[#23384a] text-white">
      <div className="mx-auto max-w-[1200px] px-4 pb-10 pt-16 sm:px-6 lg:px-8 lg:pt-20">
        <div className="flex flex-col gap-8 pb-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-5">
            <Link href="/" aria-label="AxLiner home" className="inline-flex items-center">
              <AppLogo className="h-11 w-auto invert" />
            </Link>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--landing-blue)]">Email</p>
              <a
                href="mailto:contact@axliner.com"
                className="mt-2 inline-block text-[15px] font-semibold text-white transition-opacity hover:opacity-70"
              >
                contact@axliner.com
              </a>
            </div>
          </div>

          <a
            href="https://www.linkedin.com/company/axliner/?viewAsMember=true"
            aria-label="LinkedIn"
            target="_blank"
            rel="noreferrer"
            className="inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-[transform,background-color,color] hover:-translate-y-0.5 hover:bg-[var(--brand-green)] hover:text-black"
          >
            <LinkedInIcon />
          </a>
        </div>

        <div className="grid grid-cols-2 gap-12 py-12 sm:grid-cols-3 lg:grid-cols-5 lg:gap-8">
          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-lg font-bold text-[var(--landing-blue)]">{column.title}</p>
              <ul className="mt-6 space-y-4">
                {column.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-[17px] font-semibold text-white transition-opacity hover:opacity-70">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-6 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[15px] font-semibold text-white">© 2026 AxLiner Inc. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/contact" className="text-[15px] font-semibold text-white transition-opacity hover:opacity-70">
              Contact Us
            </Link>
            <Link href="/privacy-policy" className="text-[15px] font-semibold text-white transition-opacity hover:opacity-70">
              Privacy Policy
            </Link>
            <Link href="/end-user-license-agreement" className="text-[15px] font-semibold text-white transition-opacity hover:opacity-70">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
