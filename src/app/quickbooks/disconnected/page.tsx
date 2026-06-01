import type { Metadata } from "next"
import Link from "next/link"

import { MarketingNavBar } from "@/components/MarketingNavBar"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "QuickBooks Disconnected | AxLiner",
  description: "Your QuickBooks Online company is no longer connected to AxLiner.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function QuickBooksDisconnectedPage() {
  return (
    <main className="ax-marketing-page min-h-screen bg-white text-black">
      <MarketingNavBar />

      <section className="ax-marketing-container-reading flex min-h-screen max-w-[720px] items-center py-28">
        <div className="w-full border-t border-border pt-10">
          <p className="ax-marketing-eyebrow text-emerald-700">QuickBooks Online</p>
          <h1 className="ax-marketing-section-title mt-5 text-black">Your company is disconnected.</h1>
          <p className="ax-marketing-body mt-5 max-w-[620px] text-black">
            AxLiner can no longer read QuickBooks vendor, account, or tax reference lists for this workspace. You can
            reconnect from Integrations whenever you need that workflow again.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="glossy" className="px-6">
              <Link href="/dashboard/integrations">Open integrations</Link>
            </Button>
            <Button asChild variant="outline" className="px-6">
              <Link href="/">Return home</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
