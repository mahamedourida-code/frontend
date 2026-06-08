import type { Metadata } from "next"

import { MarketingNavBar } from "@/components/MarketingNavBar"
import { DemoFlow } from "@/components/demo/DemoFlow"

export const metadata: Metadata = {
  title: "Request a demo — AxLiner",
  description:
    "See AxLiner turn your invoices, receipts, bank statements, and handwritten sheets into reviewed spreadsheets and draft bills. Book a walkthrough.",
  alternates: { canonical: "https://www.axliner.com/demo" },
}

export default function DemoPage() {
  return (
    <main className="ax-marketing-page min-h-screen bg-white text-black">
      <MarketingNavBar />
      <section className="mx-auto w-full max-w-6xl px-4 pb-24 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <DemoFlow />
      </section>
    </main>
  )
}
