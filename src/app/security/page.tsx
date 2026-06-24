import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { BrandVisualFrame } from "@/components/BrandVisual"
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
      title="Your documents stay inside a controlled path."
      meta="Security overview for AxLiner document processing workflows."
      links={securitySections}
      hero={
        <BrandVisualFrame treatment="photo" className="mt-9 min-h-[420px] bg-white">
          <Image
            src="/secu.webp"
            alt="Secure document processing illustration"
            fill
            priority
            sizes="(min-width: 1024px) 820px, 100vw"
            className="object-contain"
          />
        </BrandVisualFrame>
      }
      intro={
        <p>
          Security follows the document path: who owns a job, where files live, who may download them, and how the batch
          behaves after a reload or worker retry. The privacy policy covers wider data handling and processors.
        </p>
      }
    >
      <section id="document-path" className="scroll-mt-32">
        <h2 className="text-3xl font-medium tracking-[-0.03em]">Document path</h2>
        <div className="mt-5 space-y-4">
          <p>
            Upload, queued processing, result metadata, review, and download preserve the association between a source
            batch and its owner. Status, sharing, cancellation, and downloads follow the same metadata model.
          </p>
        </div>
        <Card className="mt-7 rounded-3xl border-black/10 bg-[#FDFBF7] shadow-none">
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

      <section id="ownership" className="scroll-mt-32">
        <h2 className="text-3xl font-medium tracking-[-0.03em]">Ownership</h2>
        <div className="mt-5 space-y-4">
          <p>
            Signed-in jobs should be checked against the account that created them. Anonymous trial jobs need their
            original session context. That boundary matters for status polling, file preview, ZIP generation, share
            creation, and direct downloads. Durable database and storage metadata are the long-lived source of truth;
            local disk remains temporary scratch space.
          </p>
        </div>
      </section>

      <section id="downloads" className="scroll-mt-32">
        <h2 className="text-3xl font-medium tracking-[-0.03em]">Downloads and sharing</h2>
        <div className="mt-5 space-y-4">
          <p>
            The backend verifies file metadata before returning download or share paths. A file identifier alone is not
            permission to read output; shared viewing follows the boundary authorized by the owner.
          </p>
        </div>
      </section>

      <section id="operations" className="scroll-mt-32">
        <h2 className="text-3xl font-medium tracking-[-0.03em]">Operational controls</h2>
        <div className="mt-5 space-y-4">
          <p>
            Queue admission, rate limits, OCR concurrency caps, durable job metadata, and retry-safe worker behavior are
            reliability controls with security value. Formal certifications are claimed only when completed and available
            to customers.
          </p>
        </div>

        {/* Secure bookkeeping accent photo */}
        <BrandVisualFrame treatment="photo" className="mt-8 min-h-[340px] bg-[#FDFBF7]">
          <Image
            src="/photos/The-Real-Cost-of-DIY-Bookkeeping-scaled.jpg"
            alt="Organized bookkeeping records representing secure document handling"
            fill
            sizes="(min-width: 1024px) 820px, 100vw"
            className="object-contain"
          />
        </BrandVisualFrame>
      </section>

      <section id="questions" className="scroll-mt-32">
        <h2 className="text-3xl font-medium tracking-[-0.03em]">Questions</h2>
        <p className="mt-5">
          For security or privacy questions, use the contact path and avoid emailing sensitive source documents unless
          support asks for a safe sample.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild variant="glossy" className="px-6">
            <Link href="/contact">Contact AxLiner</Link>
          </Button>
          <Button asChild variant="outline" className="px-6">
            <Link href="/privacy-policy">Privacy policy</Link>
          </Button>
        </div>
      </section>
    </EditorialPageShell>
  )
}
