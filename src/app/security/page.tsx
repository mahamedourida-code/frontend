import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { EditorialPageShell } from "@/components/EditorialPageShell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "AxLiner Security | Document Processing Controls",
  description:
    "How AxLiner structures file ownership, job access, download controls, infrastructure boundaries, and security expectations for document conversion.",
  alternates: {
    canonical: "https://www.axliner.com/security",
  },
}

const securitySections = [
  { id: "document-path", title: "Document path" },
  { id: "ownership", title: "Ownership" },
  { id: "downloads", title: "Downloads" },
  { id: "operations", title: "Operations" },
  { id: "questions", title: "Questions" },
]

const controlRows = [
  ["Jobs", "Files stay tied to an authenticated user or an anonymous session owner."],
  ["Storage", "Durable metadata and storage paths are checked before result access."],
  ["Queue", "Workers process admitted jobs outside the web request path."],
  ["Review", "Downloads and corrected output follow the same result ownership model."],
]

export default function SecurityPage() {
  return (
    <EditorialPageShell
      eyebrow="Security"
      title="Security for document conversion starts with ownership, storage, and clear access paths."
      meta="Security overview for AxLiner document processing workflows."
      links={securitySections}
      hero={
        <div className="relative mt-9 aspect-[16/8.6] overflow-hidden rounded-md border border-border bg-card shadow-sm">
          <Image
            src="/secu.webp"
            alt="Secure document processing illustration"
            fill
            priority
            sizes="(min-width: 1024px) 820px, 100vw"
            className="object-cover object-center"
          />
        </div>
      }
      intro={
        <>
          <p>
            AxLiner works with paperwork that may be operationally sensitive. Security is therefore treated as a
            product flow: who owns the job, where files live, who may download them, and how the batch behaves after a
            page reload or worker retry.
          </p>
          <p>
            This page describes the controls users can understand from the service surface. The privacy policy covers
            the wider data-handling and processor explanation.
          </p>
        </>
      }
    >
      <section id="document-path" className="scroll-mt-32 border-t border-border pt-9">
        <h2 className="text-3xl font-semibold tracking-normal">Document path</h2>
        <div className="mt-5 space-y-5 text-[19px] leading-8">
          <p>
            The conversion path begins with upload, passes through a queued processing job, stores result metadata, and
            ends with review and download. Each stage should preserve the association between the source batch and the
            owner that initiated it.
          </p>
          <p>
            The practical reason is simple: a completed model response is not enough if another endpoint later checks a
            different session or file source. Security and reliability improve when status, downloads, sharing, and
            cancellation follow the same metadata model.
          </p>
        </div>
        <Card className="mt-7 border-border bg-card shadow-sm">
          <CardContent className="p-5">
            {controlRows.map(([label, copy]) => (
              <div key={label} className="grid gap-2 border-b border-border py-4 last:border-b-0 sm:grid-cols-[100px_1fr]">
                <p className="font-semibold">{label}</p>
                <p className="leading-7 text-muted-foreground">{copy}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section id="ownership" className="scroll-mt-32 border-t border-border pt-9">
        <h2 className="text-3xl font-semibold tracking-normal">Ownership</h2>
        <div className="mt-5 space-y-5 text-[19px] leading-8">
          <p>
            Signed-in jobs should be checked against the account that created them. Anonymous trial jobs need their
            original session context. That boundary matters for status polling, file preview, ZIP generation, share
            creation, and direct downloads.
          </p>
          <p>
            AxLiner is built to make the durable database and storage metadata the long-lived source of truth, while
            Redis remains fast queue and job state. Local disk is temporary scratch space, not the security record for a
            deployed SaaS.
          </p>
        </div>
      </section>

      <section id="downloads" className="scroll-mt-32 border-t border-border pt-9">
        <h2 className="text-3xl font-semibold tracking-normal">Downloads and sharing</h2>
        <div className="mt-5 space-y-5 text-[19px] leading-8">
          <p>
            Result access is most trustworthy when a frontend receives backend-generated download or share paths after
            the backend verifies file metadata. A file identifier alone should not be treated as permission to read
            another user's output.
          </p>
          <p>
            Shared access can stay convenient without making ownership vague. The owner authorizes the share session,
            the share session carries a controlled file snapshot or verified join, and public viewing follows that
            share boundary rather than bypassing it.
          </p>
        </div>
      </section>

      <section id="operations" className="scroll-mt-32 border-t border-border pt-9">
        <h2 className="text-3xl font-semibold tracking-normal">Operational controls</h2>
        <div className="mt-5 space-y-5 text-[19px] leading-8">
          <p>
            Queue admission, rate limits, OCR concurrency caps, durable job metadata, and retry-safe worker behavior are
            reliability controls with security value. They reduce runaway workloads and keep one user from exhausting
            capacity for everyone else.
          </p>
          <p>
            Compliance language should stay precise. AxLiner is designed around privacy expectations and secure
            infrastructure boundaries; formal certifications should only be claimed when they are actually completed
            and available to customers.
          </p>
        </div>
      </section>

      <section id="questions" className="scroll-mt-32 border-t border-border pt-9">
        <h2 className="text-3xl font-semibold tracking-normal">Questions</h2>
        <p className="mt-5 text-[19px] leading-8">
          For security or privacy questions, use the contact path and avoid emailing sensitive source documents unless
          support asks for a safe sample.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild className="rounded-md px-6">
            <Link href="/contact">Contact AxLiner</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-md px-6">
            <Link href="/privacy-policy">Privacy policy</Link>
          </Button>
        </div>
      </section>
    </EditorialPageShell>
  )
}
