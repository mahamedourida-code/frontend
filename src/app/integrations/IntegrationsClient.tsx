"use client";

import Image from "next/image";
import NextLink from "next/link";
import { motion, type Variants } from "framer-motion";

// ── Animation helpers ──────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// ── Integration card data ──────────────────────────────────────────────────
const integrations = [
  {
    name: "QuickBooks Online",
    logo: "/integrations/quickbooks.png",
    logoWidth: 52,
    logoHeight: 52,
    description: "Post reviewed draft bills directly to your QuickBooks AP queue — one click after review.",
    status: "available" as const,
  },
  {
    name: "Google Drive",
    logo: "/drive.png",
    logoWidth: 48,
    logoHeight: 48,
    description: "Connect a Drive folder and AxLiner auto-ingests every new file the moment it lands.",
    status: "available" as const,
  },
  {
    name: "Gmail",
    logo: "/integrations/gmail.webp",
    logoWidth: 48,
    logoHeight: 48,
    description: "Forward invoice emails to your AxLiner inbox — attachments queue automatically for extraction.",
    status: "available" as const,
  },
  {
    name: "Excel / CSV Export",
    logo: null,
    logoWidth: 48,
    logoHeight: 48,
    description: "Download any reviewed batch as a clean, multi-sheet Excel workbook or a flat CSV instantly.",
    status: "available" as const,
  },
  {
    name: "Xero",
    logo: "/integrations/xero.png",
    logoWidth: 52,
    logoHeight: 52,
    description: "Sync approved invoices and bills to Xero — structured and ready for reconciliation.",
    status: "roadmap" as const,
  },
];

// ── How it connects steps ──────────────────────────────────────────────────
const steps = [
  {
    number: "01",
    title: "Upload from anywhere",
    body: "Drag files into the dashboard, drop an entire Drive folder, or forward an email to your AxLiner inbox. Every intake path lands in the same batch queue.",
  },
  {
    number: "02",
    title: "Review every line before it moves",
    body: "AxLiner extracts structured data and surfaces it side-by-side with the source image. Correct outliers, confirm amounts, then approve the whole batch at once.",
  },
  {
    number: "03",
    title: "Post or export — your call",
    body: "Push approved bills straight to QuickBooks, download as Excel/CSV, or both. Nothing leaves the review board until you say so.",
  },
];

// ── Excel SVG icon (inline, no extra file needed) ──────────────────────────
function ExcelIcon() {
  return (
    <svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true">
      <rect width="48" height="48" rx="8" fill="#1D6F42" />
      <text x="7" y="34" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="22" fill="#fff">
        XLS
      </text>
    </svg>
  );
}

export default function IntegrationsClient() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white px-4 pb-20 pt-24 sm:px-6 sm:pb-28 sm:pt-32 lg:px-8">
        {/* soft mint glow behind hero text */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b from-[#d1fae5]/40 via-[#d1fae5]/10 to-transparent"
        />
        <div className="relative mx-auto max-w-[1280px]">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-center gap-6 text-center"
          >
            <motion.span
              variants={fadeIn}
              className="inline-flex items-center rounded-full bg-[#d1fae5] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#064e3b]"
            >
              Integrations
            </motion.span>

            <motion.h1
              variants={fadeUp}
              className="ax-marketing-display mx-auto max-w-[860px] text-[42px] font-bold leading-[1.06] tracking-tight text-neutral-950 md:text-[56px] lg:text-[68px]"
            >
              Seamless integrations with the{" "}
              <span className="text-[#059669]">accounting tools</span> you already use
            </motion.h1>

            <motion.p
              variants={fadeIn}
              className="ax-marketing-body mx-auto max-w-[640px] text-[18px] font-medium leading-relaxed text-neutral-600"
            >
              AxLiner plugs into your existing stack. Capture documents from Drive, Gmail, or your desktop, review every extracted line, then publish reviewed drafts directly to QuickBooks.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col items-center gap-3 sm:flex-row">
              <NextLink
                href="/dashboard/client"
                className="inline-flex h-12 items-center rounded-full bg-[#d1fae5] px-8 text-sm font-bold text-[#064e3b] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_0_0_1px_var(--brand-green-ring),0_6px_22px_-8px_rgba(16,185,129,0.55)] transition-all hover:bg-[#a7f3d0]"
              >
                Get started free →
              </NextLink>
              <NextLink
                href="/pricing"
                className="inline-flex h-12 items-center rounded-full border-2 border-neutral-900 px-8 text-sm font-bold text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white"
              >
                See pricing
              </NextLink>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Integration cards grid ───────────────────────────────────────── */}
      <section className="bg-white px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {integrations.map((integration) => (
              <motion.div
                key={integration.name}
                variants={fadeIn}
                className="group relative flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-7 shadow-sm transition-all duration-200 hover:border-emerald-300 hover:shadow-[0_4px_24px_-6px_rgba(16,185,129,0.18)]"
              >
                {/* roadmap badge */}
                {integration.status === "roadmap" && (
                  <span className="absolute right-4 top-4 rounded-full bg-neutral-100 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    Coming soon
                  </span>
                )}

                {/* logo */}
                <div className="flex h-14 w-14 items-center justify-center">
                  {integration.logo ? (
                    <Image
                      src={integration.logo}
                      alt={`${integration.name} logo`}
                      width={integration.logoWidth}
                      height={integration.logoHeight}
                      className="h-12 w-12 object-contain"
                    />
                  ) : (
                    <ExcelIcon />
                  )}
                </div>

                <div>
                  <h3 className="text-[17px] font-bold text-neutral-950">{integration.name}</h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-neutral-500">
                    {integration.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How it connects — 3 steps ────────────────────────────────────── */}
      <section className="bg-[#d1fae5] px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="flex flex-col items-center gap-4 text-center"
          >
            <motion.span
              variants={fadeIn}
              className="inline-flex items-center rounded-full bg-[#064e3b]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#064e3b]"
            >
              How it connects
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="ax-marketing-section-title mx-auto max-w-[640px] text-[34px] font-bold leading-tight tracking-tight text-neutral-950 md:text-[44px]"
            >
              Three steps from intake to accounting
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
            className="mt-16 grid gap-8 sm:grid-cols-3"
          >
            {steps.map((step) => (
              <motion.div
                key={step.number}
                variants={fadeIn}
                className="flex flex-col gap-4 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-emerald-300/40"
              >
                <span className="text-[13px] font-black tracking-[0.15em] text-[#059669]">
                  {step.number}
                </span>
                <h3 className="text-[19px] font-bold text-neutral-950">{step.title}</h3>
                <p className="text-[14px] leading-relaxed text-neutral-600">{step.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Supporting photo section ─────────────────────────────────────── */}
      <section className="bg-white px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
            className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20"
          >
            {/* left: text */}
            <motion.div variants={fadeUp} className="flex flex-col gap-5">
              <span className="inline-flex w-fit items-center rounded-full bg-[#d1fae5] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#064e3b]">
                Real-world capture
              </span>
              <h2 className="ax-marketing-section-title text-[34px] font-bold leading-tight tracking-tight text-neutral-950 md:text-[42px]">
                Messy documents. WhatsApp photos. Crumpled receipts.
              </h2>
              <p className="ax-marketing-body text-[16px] leading-relaxed text-neutral-600">
                Snap a photo with your phone, forward the email, or drop the scan. AxLiner extracts structured data from all of it — and surfaces per-field confidence flags so you know exactly which cells to double-check.
              </p>
              <NextLink
                href="/dashboard/client"
                className="inline-flex w-fit h-11 items-center rounded-full border-2 border-neutral-900 px-8 text-sm font-bold text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white"
              >
                Try a messy document →
              </NextLink>
            </motion.div>

            {/* right: photo */}
            <motion.div
              variants={fadeIn}
              className="overflow-hidden rounded-2xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.18)]"
            >
              <Image
                src="/photos/istockphoto-2273856415-612x612.jpg"
                alt="Person capturing a receipt with a mobile phone"
                width={612}
                height={612}
                className="h-auto w-full object-cover"
                priority={false}
              />
            </motion.div>
          </motion.div>

          {/* second row — reversed */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
            className="mt-16 grid items-center gap-12 lg:grid-cols-2 lg:gap-20"
          >
            {/* left: photo */}
            <motion.div
              variants={fadeIn}
              className="overflow-hidden rounded-2xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.18)] lg:order-first"
            >
              <Image
                src="/photos/istockphoto-2185212349-612x612.jpg"
                alt="Accountant reviewing extracted invoice data on screen"
                width={612}
                height={612}
                className="h-auto w-full object-cover"
                priority={false}
              />
            </motion.div>

            {/* right: text */}
            <motion.div variants={fadeUp} className="flex flex-col gap-5 lg:order-last">
              <span className="inline-flex w-fit items-center rounded-full bg-[#d1fae5] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#064e3b]">
                Review board
              </span>
              <h2 className="ax-marketing-section-title text-[34px] font-bold leading-tight tracking-tight text-neutral-950 md:text-[42px]">
                See everything before it touches QuickBooks.
              </h2>
              <p className="ax-marketing-body text-[16px] leading-relaxed text-neutral-600">
                Every extracted document lands on the review board before export. Source image on the left, editable cells on the right. Correct, tab, approve — then post the whole reviewed batch to QuickBooks in one click.
              </p>
              <NextLink
                href="/dashboard/client"
                className="inline-flex w-fit h-11 items-center rounded-full border-2 border-neutral-900 px-8 text-sm font-bold text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white"
              >
                Explore the review board →
              </NextLink>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
