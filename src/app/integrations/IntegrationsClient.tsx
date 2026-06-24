import Image from "next/image";
import Link from "next/link";

const integrationGroups = [
  {
    title: "QuickBooks + Xero",
    body: "Send reviewed draft bills to either ledger only after the batch is approved.",
    logos: [
      { src: "/integrations/quickbooks.png", alt: "QuickBooks Online", width: 64, height: 64 },
      { src: "/integrations/xero.png", alt: "Xero", width: 64, height: 64 },
    ],
  },
  {
    title: "Drive + Gmail",
    body: "Bring folders and attachments into one intake queue instead of chasing files across tabs.",
    logos: [
      { src: "/drive.png", alt: "Google Drive", width: 64, height: 64 },
      { src: "/integrations/gmail.webp", alt: "Gmail", width: 64, height: 64 },
    ],
  },
  {
    title: "Excel + CSV",
    body: "Download the corrected batch as a workbook or flat file, ready for the next system.",
    logos: [{ src: "/logos/excel.png", alt: "Microsoft Excel", width: 64, height: 64 }],
  },
] as const;

const steps = [
  ["01", "Collect the batch", "Upload a folder or route attachments into the same client queue."],
  ["02", "Review the exceptions", "Compare every source with editable fields and clear the flagged values."],
  ["03", "Publish the draft", "Send approved bills to QuickBooks or Xero, or export the reviewed batch."],
] as const;

export default function IntegrationsClient() {
  return (
    <>
      <section className="bg-[#FDFBF7] px-4 pb-20 pt-36 sm:px-6 lg:px-8 lg:pb-28 lg:pt-44">
        <div className="mx-auto max-w-[1120px]">
          <div className="max-w-[900px]">
            <h1 className="text-balance text-[clamp(2.5rem,4.5vw,4rem)] font-medium leading-[1.02] tracking-[-0.045em] text-black">
              Your stack, connected to the <span className="text-[var(--landing-blue)]">review board</span>.
            </h1>
            <p className="mt-7 max-w-[590px] text-[19px] font-medium leading-8 text-black">
              Collect the folder, correct the batch, then publish reviewed drafts to QuickBooks or Xero.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/sign-up?next=%2Fdashboard%2Fclient"
                className="inline-flex h-12 items-center rounded-full bg-[var(--brand-green)] px-7 text-[15px] font-bold text-[var(--brand-green-fg)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_0_0_1px_var(--brand-green-ring),0_1px_3px_0_rgba(0,0,0,0.12)]"
              >
                Start free
              </Link>
              <Link
                href="/dashboard/integrations"
                className="inline-flex h-12 items-center rounded-full border border-black bg-white px-7 text-[15px] font-bold text-black"
              >
                Open integrations
              </Link>
            </div>
          </div>

        </div>
      </section>

      <section className="bg-white px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-[1120px]">
          <h2 className="max-w-[760px] text-balance text-[clamp(2rem,4vw,3.25rem)] font-medium leading-[1.05] tracking-[-0.045em] text-black">
            One batch. Three clean handoffs.
          </h2>
          <div className="mt-14 grid gap-4 lg:grid-cols-3">
            {integrationGroups.map((group) => (
              <article key={group.title} className="flex min-h-[360px] flex-col rounded-2xl bg-[#efefef] p-8">
                <div className="flex min-h-20 items-center gap-4">
                  {group.logos.map((logo) => (
                    <div key={logo.alt} className="flex size-16 items-center justify-center rounded-2xl bg-white p-3 shadow-sm">
                      <Image {...logo} className="h-auto max-h-10 w-auto max-w-10 object-contain" />
                    </div>
                  ))}
                </div>
                <div className="mt-auto pt-10">
                  <h3 className="text-[27px] font-medium tracking-[-0.035em] text-black">{group.title}</h3>
                  <p className="mt-4 text-[16px] font-medium leading-7 text-black">{group.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#FDFBF7] px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto grid max-w-[1120px] gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-black/10 bg-white p-4 sm:p-6">
            <Image
              src="/photos/istockphoto-2273856415-612x612.jpg"
              alt="Person capturing a receipt with a mobile phone"
              width={612}
              height={612}
              sizes="(min-width: 1024px) 540px, 100vw"
              className="h-auto w-full rounded-xl object-contain"
            />
            <h2 className="px-2 pb-2 pt-7 text-[clamp(1.75rem,3vw,2.5rem)] font-medium tracking-[-0.04em] text-black">
              Capture the paperwork where it arrives.
            </h2>
          </article>
          <article className="rounded-2xl border border-black/10 bg-white p-4 sm:p-6">
            <Image
              src="/photos/istockphoto-2185212349-612x612.jpg"
              alt="Accountant reviewing extracted invoice data on screen"
              width={612}
              height={612}
              sizes="(min-width: 1024px) 540px, 100vw"
              className="h-auto w-full rounded-xl object-contain"
            />
            <h2 className="px-2 pb-2 pt-7 text-[clamp(1.75rem,3vw,2.5rem)] font-medium tracking-[-0.04em] text-black">
              Review every draft before it moves.
            </h2>
          </article>
        </div>
      </section>

      <section className="bg-[#FDFBF7] px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-[1120px]">
          <h2 className="max-w-[760px] text-balance text-[clamp(2rem,4vw,3.25rem)] font-medium leading-[1.05] tracking-[-0.045em] text-black">
            Intake to books, without the tab maze.
          </h2>
          <div className="mt-14 grid gap-4 lg:grid-cols-3">
            {steps.map(([number, title, body]) => (
              <article key={number} className="rounded-2xl border border-black/10 bg-white p-8">
                <p className="text-sm font-bold text-[var(--landing-blue)]">{number}</p>
                <h3 className="mt-16 text-[26px] font-medium tracking-[-0.035em] text-black">{title}</h3>
                <p className="mt-4 text-[16px] font-medium leading-7 text-black">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
