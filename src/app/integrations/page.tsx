import type { Metadata } from "next";
import Link from "next/link";

import { MarketingFooter } from "@/components/MarketingFooter";
import { MarketingNavBar } from "@/components/MarketingNavBar";
import IntegrationsClient from "./IntegrationsClient";

export const metadata: Metadata = {
  title: "Integrations — AxLiner",
  description:
    "Collect documents, review every exception, and publish reviewed drafts to QuickBooks Online or Xero from one batch workflow.",
};

export default function IntegrationsPage() {
  return (
    <main className="ax-marketing-page min-h-screen bg-white text-black">
      <MarketingNavBar />
      <IntegrationsClient />

      <section className="bg-[var(--brand-green)] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-black">Ready for the next batch?</p>
            <h2 className="mt-4 max-w-[760px] text-balance text-[clamp(2.5rem,5vw,5rem)] font-medium leading-[1] tracking-[-0.05em] text-black">
              Put the folder through one reviewable workflow.
            </h2>
          </div>
          <Link
            href="/sign-up?next=%2Fdashboard%2Fclient"
            className="inline-flex h-12 shrink-0 items-center rounded-full bg-black px-7 text-[15px] font-bold text-white"
          >
            Start free
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
