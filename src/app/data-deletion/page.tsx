import Link from "next/link"

import { MarketingNavBar } from "@/components/MarketingNavBar"
import { Button } from "@/components/ui/button"

const deletedData = [
  "Account information such as email, name, provider identity, and profile data.",
  "Processing history, job records, generated output files, and file metadata linked to the account.",
  "Stored upload and output files that remain inside the AxLiner retention window.",
  "Usage information tied to credits, conversion runs, and account activity where deletion is legally possible.",
  "Authentication state and provider login sessions controlled by AxLiner.",
]

export default function DataDeletionPage() {
  return (
    <main className="ax-marketing-page min-h-screen bg-white text-black">
      <MarketingNavBar />

      <article className="ax-marketing-container-reading max-w-[760px] pb-24 pt-32 lg:pt-36">
        <header>
          <p className="ax-marketing-eyebrow text-emerald-700">Data deletion</p>
          <h1 className="ax-marketing-section-title mt-5 text-black">
            Delete AxLiner account data with a clear request.
          </h1>
          <p className="ax-marketing-lead mt-5 text-black">
            AxLiner processes documents for conversion and keeps the account, job, file, and billing metadata needed
            to deliver the service. This page explains how to request deletion and what happens after the request is
            confirmed.
          </p>
          <p className="mt-4 text-sm font-semibold text-foreground">Last updated: May 22, 2026</p>
        </header>

        <section className="mt-10 border-t border-border pt-9">
          <h2 className="ax-marketing-subtitle">What can be deleted</h2>
          <p className="ax-marketing-prose mt-5">
            A deletion request is meant to remove the account data AxLiner no longer needs to operate for you. That
            normally includes the following information.
          </p>
          <ul className="mt-5 space-y-3">
            {deletedData.map((item) => (
              <li key={item} className="ax-marketing-prose flex gap-3">
                <span className="mt-[14px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 border-t border-border pt-9">
          <h2 className="ax-marketing-subtitle">Delete from account settings</h2>
          <div className="ax-marketing-prose mt-5 space-y-5">
            <p>
              If you can access the account, start from{" "}
              <Link href="/dashboard/settings" className="font-semibold text-primary underline underline-offset-4">
                account settings
              </Link>
              . Confirm the deletion action from the account area before you leave the workspace. Account deletion is
              permanent, so download any result files you still need first.
            </p>
            <p>
              Once the account deletion flow is confirmed, the current AxLiner session should stop being a path back
              into that workspace. New use of the product requires a new account or a new anonymous trial session.
            </p>
          </div>
        </section>

        <section className="mt-10 border-t border-border pt-9">
          <h2 className="ax-marketing-subtitle">Request deletion by email</h2>
          <div className="ax-marketing-prose mt-5 space-y-5">
            <p>
              If you cannot reach settings, email{" "}
              <a className="font-semibold text-primary underline underline-offset-4" href="mailto:contact@axliner.com">
                contact@axliner.com
              </a>{" "}
              with the subject line <span className="font-semibold">Data Deletion Request</span>. Send the request from
              the account email when possible and say whether you want account deletion, file deletion, or help
              identifying the right account.
            </p>
            <p>
              Do not email sensitive source documents unless support asks for a safe sample. The account email and a
              clear description of the requested action are usually the right starting point.
            </p>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild variant="glossy" className="px-6">
              <a href="mailto:contact@axliner.com?subject=Data%20Deletion%20Request">Email deletion request</a>
            </Button>
            <Button asChild variant="outline" className="px-6">
              <Link href="/contact">Contact page</Link>
            </Button>
          </div>
        </section>

        <section className="mt-10 border-t border-border pt-9">
          <h2 className="ax-marketing-subtitle">After deletion</h2>
          <div className="ax-marketing-prose mt-5 space-y-5">
            <p>
              Generated files, file metadata, job history, profile information, and active access paths are removed
              according to the confirmed deletion action and the service retention process. Shared download access
              tied to removed files should no longer be usable after the underlying output is deleted.
            </p>
            <p>
              Some limited records may remain when AxLiner must keep them for billing, fraud prevention, security,
              tax, dispute handling, or legal compliance. Those records should be limited to the purpose that requires
              retention and are not a way to restore deleted working files.
            </p>
          </div>
        </section>

        <section className="mt-10 border-t border-border pt-9">
          <h2 className="ax-marketing-subtitle">Related pages</h2>
          <p className="ax-marketing-prose mt-5">
            Read the <Link href="/privacy-policy" className="font-semibold text-primary underline underline-offset-4">privacy policy</Link>{" "}
            for the wider data handling explanation or use the{" "}
            <Link href="/contact" className="font-semibold text-primary underline underline-offset-4">contact page</Link>{" "}
            if you need help before making a deletion request.
          </p>
        </section>
      </article>
    </main>
  )
}
