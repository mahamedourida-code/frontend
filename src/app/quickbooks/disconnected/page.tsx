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
    <main className="min-h-screen bg-background text-foreground">
      <MarketingNavBar />

      <section className="mx-auto flex min-h-screen max-w-[720px] items-center px-4 py-28 sm:px-6">
        <div className="w-full border-t border-border pt-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">QuickBooks Online</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-normal sm:text-5xl">Your company is disconnected.</h1>
          <p className="mt-5 max-w-[620px] text-lg leading-8 text-foreground/76">
            AxLiner can no longer read QuickBooks vendor, account, or tax reference lists for this workspace. You can
            reconnect from Integrations whenever you need that workflow again.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="rounded-md px-6">
              <Link href="/dashboard/integrations">Open integrations</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-md px-6">
              <Link href="/">Return home</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
