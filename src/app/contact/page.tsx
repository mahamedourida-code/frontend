import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { BrandVisualFrame } from "@/components/BrandVisual"
import { MarketingNavBar } from "@/components/MarketingNavBar"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Contact AxLiner",
  description: "Contact AxLiner for product, billing, privacy, or account questions.",
  alternates: {
    canonical: "https://www.axliner.com/contact",
  },
}

export default function ContactPage() {
  return (
    <main className="ax-marketing-page min-h-screen bg-white text-black">
      <MarketingNavBar />

      <article className="ax-marketing-container-reading pb-24 pt-32 lg:pt-36">
        <header>
          <p className="ax-marketing-eyebrow text-emerald-700">Contact</p>
          <h1 className="ax-marketing-section-title mt-5 text-black">
            Reach the AxLiner team with the document problem in front of you.
          </h1>
          <p className="ax-marketing-lead mt-5 text-black">
            Write to us for product questions, billing questions, privacy requests, or help with a conversion batch.
            A useful message explains what you uploaded, what output you expected, and whether the issue happened in
            Table mode or Bank statement mode.
          </p>

          <BrandVisualFrame treatment="photo" className="mt-9 aspect-[16/8]">
            <Image
              src="/forest.png"
              alt="Green forest light"
              fill
              priority
              sizes="(min-width: 1024px) 860px, 100vw"
              className="rounded-md object-cover object-center"
            />
            <div className="absolute inset-0 rounded-md bg-[linear-gradient(90deg,rgba(2,18,14,0.62),rgba(2,18,14,0.14))]" />
            <div className="absolute inset-x-0 bottom-0 z-10 p-6 text-white sm:p-8">
              <p className="max-w-xl text-lg font-semibold leading-7">
                Start with the source document type, expected spreadsheet result, and any job or file name you can
                share safely.
              </p>
            </div>
          </BrandVisualFrame>
        </header>

        <section className="mt-10 border-t border-border pt-9">
          <h2 className="ax-marketing-subtitle">The fastest contact path</h2>
          <div className="ax-marketing-prose mt-5 space-y-5">
            <p>
              For normal support, email{" "}
              <a className="font-semibold text-primary underline underline-offset-4" href="mailto:contact@axliner.com">
                contact@axliner.com
              </a>
              . If the question is about a failed batch, mention the approximate time of the run, the file type, the
              number of files or PDF pages, and the output mode you selected.
            </p>
            <p>
              If the question is about a paid plan, include the account email used in AxLiner and describe whether the
              problem happened during checkout, plan activation, credit balance, or billing portal access. Do not send
              passwords, access tokens, or sensitive document contents by email.
            </p>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild variant="glossy" className="px-6">
              <a href="mailto:contact@axliner.com?subject=AxLiner%20support%20request">Send email</a>
            </Button>
            <Button asChild variant="outline" className="px-6">
              <Link href="/data-deletion">Data deletion</Link>
            </Button>
          </div>
        </section>

        <section className="mt-10 border-t border-border pt-9">
          <h2 className="ax-marketing-subtitle">Privacy and account requests</h2>
          <div className="ax-marketing-prose mt-5 space-y-5">
            <p>
              Privacy questions and deletion requests should be clear enough to verify the account and the action being
              requested. Use the account email, say whether you want generated files deleted or the account removed,
              and avoid attaching documents unless support asks for a safe sample.
            </p>
            <p>
              The <Link href="/privacy-policy" className="font-semibold text-primary underline underline-offset-4">privacy policy</Link>{" "}
              explains how document files, job metadata, billing status, and service providers are handled. The{" "}
              <Link href="/data-deletion" className="font-semibold text-primary underline underline-offset-4">data deletion page</Link>{" "}
              explains the deletion path and retention exceptions.
            </p>
          </div>

          {/* Friendly office accent — small business owners */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="relative overflow-hidden rounded-2xl ring-1 ring-emerald-200 shadow-sm" style={{ aspectRatio: "4/3" }}>
              <Image
                src="/photos/istockphoto-1339827194-612x612.jpg"
                alt="Small business owners discussing a question with their accountant"
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover object-center"
              />
            </div>
            <div className="relative overflow-hidden rounded-2xl ring-1 ring-emerald-200 shadow-sm" style={{ aspectRatio: "4/3" }}>
              <Image
                src="/photos/smiling-young-woman-sitting-on-chair-holding-mobil-2023-11-27-04-52-35-utc.webp"
                alt="Team member ready to help with your AxLiner question"
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover object-center"
              />
            </div>
          </div>
        </section>
      </article>
    </main>
  )
}
