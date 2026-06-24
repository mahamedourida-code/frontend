import type { Metadata } from "next"
import { Check } from "lucide-react"

import { MarketingFooter } from "@/components/MarketingFooter"
import { MarketingNavBar } from "@/components/MarketingNavBar"
import { ContactForm } from "./ContactForm"

export const metadata: Metadata = {
  title: "Contact AxLiner",
  description: "Talk to the AxLiner team about product, billing, privacy, or account questions.",
  alternates: {
    canonical: "https://www.axliner.com/contact",
  },
}

const REASSURANCE = [
  "Real human replies, usually the same business day",
  "Tell us the document type and what you expected",
  "Privacy and deletion requests are handled right here",
]

export default function ContactPage() {
  return (
    <div className="ax-marketing-page min-h-screen bg-[#FDFBF7] text-[#191919]">
      <MarketingNavBar />

      <main className="mx-auto max-w-[1500px] px-4 pb-28 pt-32 sm:px-5 lg:px-9 lg:pt-40">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(440px,0.75fr)] lg:gap-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--landing-blue)]">Contact</p>
            <h1 className="mt-5 max-w-[850px] text-[clamp(3.5rem,7vw,7.5rem)] font-medium leading-[0.9] tracking-[-0.065em] text-[#191919]">
              Bring us the messy batch.
            </h1>
            <p className="mt-7 max-w-[620px] text-lg font-medium leading-8 text-[#444] sm:text-xl">
              Product, billing, privacy, or a batch that did not come out right — send it over and the team will take a look.
            </p>

            <ul className="mt-10 grid max-w-[760px] gap-3 sm:grid-cols-3">
              {REASSURANCE.map((item) => (
                <li key={item} className="rounded-[24px] border border-black/10 bg-white p-5 shadow-[0_16px_40px_rgba(25,25,25,0.05)]">
                  <span aria-hidden className="flex size-8 items-center justify-center rounded-full bg-[var(--brand-green)]">
                    <Check className="size-3.5 text-black" strokeWidth={3} />
                  </span>
                  <span className="mt-5 block text-[15px] font-semibold leading-6 text-[#191919]">{item}</span>
                </li>
              ))}
            </ul>

            <p className="mt-9 text-[15px] font-medium text-[#444]">
              Prefer email?{" "}
              <a href="mailto:contact@axliner.com" className="font-semibold text-[var(--landing-blue)] hover:underline">
                contact@axliner.com
              </a>
            </p>
          </div>

          <ContactForm />
        </div>
      </main>

      <MarketingFooter />
    </div>
  )
}
