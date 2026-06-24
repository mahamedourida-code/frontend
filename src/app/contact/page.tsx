import type { Metadata } from "next"
import { Check } from "lucide-react"

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
    <main className="ax-marketing-page min-h-screen bg-[#FDFBF7] text-[#191919]">
      <MarketingNavBar />

      <section className="mx-auto max-w-[1120px] px-4 pb-28 pt-32 sm:px-6 lg:px-8 lg:pt-40">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
          {/* LEFT — headline, sub-line, reassurance bullets */}
          <div className="lg:pt-2">
            <p className="ax-marketing-eyebrow text-[var(--landing-blue)]">Contact</p>
            <h1 className="ax-marketing-section-title mt-5 text-[#191919]">
              Talk to a{" "}
              <span className="text-[var(--landing-blue)]">human</span> about
              your documents.
            </h1>
            <p className="mt-5 max-w-[440px] text-[17px] font-medium leading-7 text-[#191919]">
              Product, billing, privacy, or a batch that didn&apos;t come out right —
              send it over and the team will take a look.
            </p>

            <ul className="mt-9 space-y-4">
              {REASSURANCE.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="mt-0.5 flex size-[22px] shrink-0 items-center justify-center rounded-full bg-[var(--brand-green)]"
                  >
                    <Check className="size-3.5 text-black" strokeWidth={3} />
                  </span>
                  <span className="text-[16px] font-medium leading-6 text-[#191919]">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-9 text-[15px] font-medium text-[#191919]">
              Prefer email?{" "}
              <a
                href="mailto:contact@axliner.com"
                className="font-semibold text-[var(--landing-blue)] hover:underline"
              >
                contact@axliner.com
              </a>
            </p>
          </div>

          {/* RIGHT — the form card */}
          <ContactForm />
        </div>
      </section>
    </main>
  )
}
