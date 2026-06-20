"use client";

import Image from "next/image";
import NextLink from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MarketingNavBar } from "@/components/MarketingNavBar";
import { AppLogo } from "@/components/AppIcon";

/* ── Animation helpers ──────────────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const, delay },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" as const, delay },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const childFadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/* ── Data ───────────────────────────────────────────────────────────────── */

const messyInputs = [
  {
    icon: "✍️",
    label: "Handwritten notes & receipts",
    copy: "Scrawled expense notes, handwritten invoices, field logs — if a human can read it, AxLiner can extract it.",
  },
  {
    icon: "📱",
    label: "WhatsApp & phone photos",
    copy: "The classic: a client photographs a crumpled receipt at 11 pm and sends it over WhatsApp. AxLiner handles the glare, blur, and crop.",
  },
  {
    icon: "🧾",
    label: "Faded thermal receipts",
    copy: "Thermal paper fades fast. AxLiner's extraction layer is trained on low-contrast printed text, not just pristine PDFs.",
  },
  {
    icon: "📄",
    label: "Scanned documents",
    copy: "Flatbed scans, multi-page PDFs, skewed pages — they all land in the same batch and get classified automatically.",
  },
  {
    icon: "📦",
    label: "Mixed batches",
    copy: "Drop a folder with invoices, bank statements, and handwritten notes all together. AxLiner sorts and extracts on the right schema for each type.",
  },
  {
    icon: "📊",
    label: "Tables & statements",
    copy: "Bank statements, expense reports, and tabular data map cleanly into row-level spreadsheet output ready for review.",
  },
];

const extractionSteps = [
  {
    number: "01",
    title: "Capture",
    description:
      "Upload a file, forward an email, or photograph with your phone. AxLiner accepts PDFs, JPEGs, PNGs, and HEIC images — any resolution, any orientation.",
    image: "/photos/istockphoto-2273856415-612x612.jpg",
    imageAlt: "Accountant photographing an invoice with his phone, laptop open beside him",
  },
  {
    number: "02",
    title: "Classify",
    description:
      "Each document in the batch is classified automatically: invoice, receipt, bank statement, table, or handwritten note. No manual sorting required.",
    image: "/photos/istockphoto-2227797727-612x612.jpg",
    imageAlt: "Multiple floating document types being classified with checkmarks",
  },
  {
    number: "03",
    title: "Extract on the right schema",
    description:
      "An invoice gets vendor, date, amount, line items, and tax. A receipt gets merchant and total. A bank statement gets transactions. Each document type has its own extraction schema.",
    image: "/photos/istockphoto-2254128413-612x612.jpg",
    imageAlt: "Glowing INVOICE document with extraction icons and green verification check",
  },
  {
    number: "04",
    title: "Confidence-flagged review",
    description:
      "Every extracted field carries a per-field confidence signal. Low-confidence cells are surfaced first in the review board so you correct exceptions — not everything.",
    image: "/photos/kelly-sikkema-M98NRBuzbpc-unsplash.jpg",
    imageAlt: "Financial documents spread on a desk with a phone and coffee",
  },
];

const documentTypes = [
  { label: "Invoices", icon: "🧾" },
  { label: "Receipts", icon: "🗒️" },
  { label: "Bank statements", icon: "🏦" },
  { label: "Expense reports", icon: "📋" },
  { label: "Handwritten notes", icon: "✍️" },
  { label: "Purchase orders", icon: "📦" },
  { label: "Credit notes", icon: "💳" },
  { label: "Delivery notes", icon: "🚚" },
  { label: "Remittance advice", icon: "📨" },
  { label: "Tables & data sheets", icon: "📊" },
];

/* ── Footer helpers (mirrors page.tsx) ──────────────────────────────────── */

type FooterIconProps = { className?: string };

function FooterLinkedInIcon({ className }: FooterIconProps) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.8 8.1H3.2V20h3.6V8.1Zm.2-3.7A2.1 2.1 0 1 1 2.8 4.4a2.1 2.1 0 0 1 4.2 0ZM20.8 13.2V20h-3.6v-6.3c0-1.6-.6-2.7-2-2.7-1.1 0-1.7.7-2 1.5-.1.3-.1.8-.1 1.2V20H9.5s.1-10.1 0-11.9h3.6v1.7c.5-.8 1.4-2 3.4-2 2.5 0 4.3 1.6 4.3 5.4Z" />
    </svg>
  );
}

function FooterYouTubeIcon({ className }: FooterIconProps) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.4 7.1a2.8 2.8 0 0 0-2-2C17.7 4.6 12 4.6 12 4.6s-5.7 0-7.4.5a2.8 2.8 0 0 0-2 2A29.4 29.4 0 0 0 2.1 12c0 1.7.2 3.4.5 4.9a2.8 2.8 0 0 0 2 2c1.7.5 7.4.5 7.4.5s5.7 0 7.4-.5a2.8 2.8 0 0 0 2-2c.3-1.5.5-3.2.5-4.9 0-1.7-.2-3.4-.5-4.9Zm-11.6 8V8.9l5.5 3.1-5.5 3.1Z" />
    </svg>
  );
}

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Convert files", href: "/dashboard/client" },
      { label: "Review board", href: "/dashboard/client" },
      { label: "AP queue", href: "/dashboard/accounts-payable" },
      { label: "Inbox", href: "/dashboard/inbox" },
      { label: "Integrations", href: "/dashboard/integrations" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Accounting", href: "/solutions/accounting" },
      { label: "Banking", href: "/solutions/banking" },
      { label: "Healthcare", href: "/solutions/healthcare" },
      { label: "Construction", href: "/solutions/construction" },
      { label: "Real Estate", href: "/solutions/real-estate" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blogs" },
      { label: "Pricing", href: "/pricing" },
      { label: "Security", href: "/security" },
      { label: "Handwritten to Excel", href: "/handwritten-to-excel" },
      { label: "Image to Excel", href: "/image-to-excel" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Try AxLiner", href: "/dashboard/client" },
      { label: "Sign in", href: "/sign-in" },
      { label: "Sign up free", href: "/sign-up" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "EULA", href: "/end-user-license-agreement" },
      { label: "Data Deletion", href: "/data-deletion" },
    ],
  },
];

const footerSocialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com", Icon: FooterLinkedInIcon },
  { label: "YouTube", href: "https://www.youtube.com", Icon: FooterYouTubeIcon },
];

/* ── Page ───────────────────────────────────────────────────────────────── */

export default function OCRPage() {
  return (
    <div className="ax-marketing-page relative min-h-screen bg-white text-neutral-950">
      <MarketingNavBar />

      <main>
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-white pt-24 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-28">
          {/* Subtle mint radial tint */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(209,250,229,0.35) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10 mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)] lg:gap-16">

              {/* Left — copy */}
              <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
                <motion.p
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={0}
                  className="ax-eyebrow text-emerald-700"
                >
                  The OCR engine
                </motion.p>

                <motion.h1
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={0.08}
                  className="ax-h1 ax-marketing-display mt-4 font-bold text-black"
                >
                  How AxLiner reads your documents
                </motion.h1>

                <motion.p
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={0.18}
                  className="ax-body ax-marketing-body mt-6 font-semibold text-neutral-700"
                >
                  Other tools work on clean PDFs. AxLiner was built for the real pile — handwriting, phone photos in bad light, faded thermal paper. Every field it extracts carries a per-field confidence signal so you know exactly what to review.
                </motion.p>

                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={0.28}
                  className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:items-start"
                >
                  <Button
                    variant="glossy"
                    asChild
                    className="h-[52px] rounded-full px-10 text-base font-bold"
                  >
                    <NextLink href="/dashboard/client">Start free</NextLink>
                  </Button>
                  <Button
                    variant="surface"
                    asChild
                    className="h-[52px] rounded-full px-10 text-base font-semibold"
                  >
                    <NextLink href="#how-it-works">See how it works ↓</NextLink>
                  </Button>
                </motion.div>

                <motion.p
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                  custom={0.4}
                  className="mt-5 text-sm font-semibold text-neutral-500"
                >
                  No credit card · 50 free conversions · Cancel anytime
                </motion.p>
              </div>

              {/* Right — hero photo */}
              <motion.div
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                custom={0.15}
                className="relative mx-auto w-full max-w-[520px] lg:max-w-none"
              >
                <div className="relative overflow-hidden rounded-2xl shadow-[0_24px_60px_-16px_rgba(0,0,0,0.2)] ring-1 ring-black/8">
                  <Image
                    src="/photos/istockphoto-2273856415-612x612.jpg"
                    alt="Accountant photographing an invoice with a phone, laptop open beside them"
                    width={612}
                    height={612}
                    className="h-auto w-full object-cover"
                    priority
                  />
                  {/* Confidence badge overlay */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2.5 rounded-full bg-white/95 px-4 py-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.15)] backdrop-blur-sm">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--brand-green)]">
                      <svg
                        className="h-4 w-4 text-emerald-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-[13px] font-bold text-neutral-900">
                      Per-field confidence flags
                    </span>
                  </div>
                </div>

                {/* Decorative glow behind photo */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl"
                  style={{
                    background:
                      "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(209,250,229,0.5) 0%, transparent 70%)",
                  }}
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Messy inputs band ─────────────────────────────────────────── */}
        <section className="bg-[#f5f5f5] py-20 lg:py-28">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="mx-auto max-w-2xl text-center"
            >
              <p className="ax-eyebrow text-neutral-600">Real-world inputs</p>
              <h2 className="ax-h2 ax-marketing-section-title mt-4 font-bold text-neutral-950">
                The messy inputs we handle
              </h2>
              <p className="ax-body ax-marketing-body mt-5 font-semibold text-neutral-700">
                Built for the documents your clients actually send — not the perfect exports accounting software expects.
              </p>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {messyInputs.map((item) => (
                <motion.div
                  key={item.label}
                  variants={childFadeUp}
                  className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
                >
                  <span className="text-3xl" role="img" aria-hidden="true">
                    {item.icon}
                  </span>
                  <h3 className="mt-4 text-[17px] font-bold leading-snug text-neutral-950">
                    {item.label}
                  </h3>
                  <p className="mt-2 text-[15px] font-medium leading-relaxed text-neutral-600">
                    {item.copy}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── How extraction works ─────────────────────────────────────── */}
        <section id="how-it-works" className="bg-white py-20 lg:py-28">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="mx-auto max-w-2xl text-center"
            >
              <p className="ax-eyebrow text-neutral-600">Under the hood</p>
              <h2 className="ax-h2 ax-marketing-section-title mt-4 font-bold text-neutral-950">
                How extraction works
              </h2>
              <p className="ax-body ax-marketing-body mt-5 font-semibold text-neutral-700">
                A four-step pipeline from raw photo to a reviewable, confidence-flagged spreadsheet.
              </p>
            </motion.div>

            <div className="mt-16">
              {extractionSteps.map((step, index) => {
                const isEven = index % 2 === 0;
                return (
                  <motion.div
                    key={step.number}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.25 }}
                    custom={0}
                    className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-20 ${
                      index > 0 ? "mt-20 border-t border-neutral-100 pt-20" : ""
                    }`}
                  >
                    {/* Text side */}
                    <div className={isEven ? "lg:order-1" : "lg:order-2"}>
                      <div className="inline-flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-green)] text-sm font-bold text-emerald-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_0_0_1px_#10b981,0_1px_3px_0_rgba(0,0,0,0.12)]">
                          {step.number}
                        </span>
                        <span className="text-sm font-bold uppercase tracking-widest text-neutral-400">
                          Step {index + 1}
                        </span>
                      </div>
                      <h3 className="ax-h3 mt-5 font-bold text-neutral-950">{step.title}</h3>
                      <p className="ax-body ax-marketing-body mt-4 font-semibold text-neutral-700">
                        {step.description}
                      </p>
                    </div>

                    {/* Image side */}
                    <div className={isEven ? "lg:order-2" : "lg:order-1"}>
                      <div className="overflow-hidden rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/6">
                        <Image
                          src={step.image}
                          alt={step.imageAlt}
                          width={612}
                          height={612}
                          className="h-[300px] w-full object-cover sm:h-[360px]"
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Confidence flags + Review Board ──────────────────────────── */}
        <section className="bg-[var(--brand-green)] py-20 lg:py-28">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

              {/* Left copy */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                <p className="ax-eyebrow text-emerald-800">Review board</p>
                <h2 className="ax-h2 ax-marketing-section-title mt-4 font-bold text-neutral-950">
                  You see every field before it posts
                </h2>
                <p className="ax-body ax-marketing-body mt-5 font-semibold text-neutral-800">
                  Every extracted document lands in the review board. Per-field confidence flags highlight the cells most likely to need a correction — not a sea of green checkmarks hiding problems.
                </p>
                <p className="ax-body ax-marketing-body mt-4 font-bold text-neutral-950">
                  AxLiner prepares it. You approve it.
                </p>

                {/* Confidence flag legend */}
                <div className="mt-8 space-y-3">
                  {[
                    {
                      color: "bg-emerald-100 text-emerald-800 border-emerald-200",
                      dot: "bg-emerald-500",
                      label: "High confidence",
                      copy: "Field extracted cleanly — no action needed.",
                    },
                    {
                      color: "bg-amber-50 text-amber-800 border-amber-200",
                      dot: "bg-amber-400",
                      label: "Review suggested",
                      copy: "Readable but check the value — may need a correction.",
                    },
                    {
                      color: "bg-red-50 text-red-800 border-red-200",
                      dot: "bg-red-400",
                      label: "Needs attention",
                      copy: "Low confidence — verify against the source document.",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${item.color}`}
                    >
                      <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.dot}`} />
                      <div>
                        <p className="text-[14px] font-bold leading-none">{item.label}</p>
                        <p className="mt-1 text-[13px] font-medium leading-snug opacity-80">
                          {item.copy}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-9">
                  <Button
                    variant="ink"
                    asChild
                    className="h-12 px-8 text-[15px] font-bold"
                  >
                    <NextLink href="/dashboard/client">Open the review board →</NextLink>
                  </Button>
                </div>
              </motion.div>

              {/* Right photo */}
              <motion.div
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                custom={0.1}
                className="relative"
              >
                <div className="overflow-hidden rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.15)] ring-1 ring-black/8">
                  <Image
                    src="/photos/kelly-sikkema-SiOW0btU0zk-unsplash.jpg"
                    alt="Tax documents laid out on a desk for review"
                    width={895}
                    height={1119}
                    className="h-[440px] w-full object-cover object-center sm:h-[500px]"
                  />
                </div>

                {/* Floating confidence card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                  className="absolute -bottom-4 -left-4 rounded-2xl bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.14)] ring-1 ring-black/6 sm:-bottom-6 sm:-left-6"
                >
                  <p className="text-[12px] font-bold uppercase tracking-wider text-neutral-500">
                    Per-field signal
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {[
                      { field: "Vendor", status: "High", color: "text-emerald-600" },
                      { field: "Amount", status: "High", color: "text-emerald-600" },
                      { field: "Date", status: "Review", color: "text-amber-600" },
                      { field: "Tax code", status: "Needs attention", color: "text-red-500" },
                    ].map((row) => (
                      <div key={row.field} className="flex items-center gap-3 text-[13px]">
                        <span className="w-20 font-semibold text-neutral-700">{row.field}</span>
                        <span className={`font-bold ${row.color}`}>{row.status}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Supported document types ─────────────────────────────────── */}
        <section className="bg-white py-20 lg:py-28">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="mx-auto max-w-2xl text-center"
            >
              <p className="ax-eyebrow text-neutral-600">Document types</p>
              <h2 className="ax-h2 ax-marketing-section-title mt-4 font-bold text-neutral-950">
                What AxLiner extracts
              </h2>
              <p className="ax-body ax-marketing-body mt-5 font-semibold text-neutral-700">
                Each document type gets its own extraction schema. No generic table dump — the right fields, in the right columns, every time.
              </p>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="mt-12 flex flex-wrap justify-center gap-3"
            >
              {documentTypes.map((type) => (
                <motion.div
                  key={type.label}
                  variants={childFadeUp}
                  className="flex items-center gap-2.5 rounded-full border border-neutral-200 bg-neutral-50 px-5 py-3 text-[15px] font-semibold text-neutral-800 transition-colors hover:border-emerald-300 hover:bg-[var(--brand-green)] hover:text-emerald-900"
                >
                  <span className="text-lg" role="img" aria-hidden="true">
                    {type.icon}
                  </span>
                  {type.label}
                </motion.div>
              ))}
            </motion.div>

            {/* Supporting visual */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              custom={0.1}
              className="mx-auto mt-16 max-w-3xl overflow-hidden rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] ring-1 ring-black/6"
            >
              <Image
                src="/photos/istockphoto-2254128413-612x612.jpg"
                alt="Invoice document with digital extraction icons and green verification"
                width={612}
                height={612}
                className="h-auto w-full object-cover"
              />
            </motion.div>
          </div>
        </section>

        {/* ── Final CTA band ────────────────────────────────────────────── */}
        <section className="relative z-10 w-full overflow-hidden bg-black px-5 py-16 text-white sm:px-10 sm:py-20 lg:px-16 lg:py-[104px]">
          <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 text-center">
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              className="ax-h2 font-bold leading-[1.08] text-white"
            >
              Give it a messy document.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              custom={0.1}
              className="max-w-[680px] text-[18px] font-medium leading-[1.45] text-white/85"
            >
              Upload a handwritten receipt, a phone photo, or a scanned statement. See every field extracted and confidence-flagged — ready for your review in seconds.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              custom={0.2}
              className="mt-4 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <NextLink
                href="/dashboard/client"
                className="inline-flex h-14 items-center rounded-full bg-[var(--brand-green)] px-10 text-base font-bold text-black shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_0_0_1px_var(--brand-green-ring),0_6px_22px_-8px_rgba(16,185,129,0.55)] transition-all hover:bg-[var(--brand-green-hover)]"
              >
                Start free →
              </NextLink>
              <NextLink
                href="/pricing"
                className="inline-flex h-14 items-center rounded-full border-2 border-white px-10 text-base font-bold text-white transition-colors hover:bg-white hover:text-black"
              >
                See pricing
              </NextLink>
            </motion.div>

            <motion.p
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              custom={0.3}
              className="mt-4 text-sm font-semibold text-white/65"
            >
              No credit card · 50 free conversions · Cancel anytime
            </motion.p>
          </div>
        </section>
      </main>

      {/* ── Footer (mirrors page.tsx) ─────────────────────────────────────── */}
      <footer className="relative z-10 bg-black text-white">
        <div className="mx-auto max-w-[1200px] px-4 pt-16 pb-10 sm:px-6 lg:px-8 lg:pt-20">
          {/* Logo + social row */}
          <div className="flex flex-col gap-6 border-b border-white/12 pb-10 sm:flex-row sm:items-center sm:justify-between">
            <NextLink href="/" aria-label="AxLiner home" className="inline-flex items-center">
              <AppLogo className="h-11 w-auto invert" />
            </NextLink>
            <div className="flex items-center gap-3">
              {footerSocialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-green)] hover:text-black"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-10 py-12 sm:grid-cols-3 lg:grid-cols-5 lg:gap-8">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <p className="text-[15px] font-bold text-white">{column.title}</p>
                <ul className="mt-5 space-y-3.5">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.label}`}>
                      <NextLink
                        href={link.href}
                        className="text-[14px] font-medium text-white/70 transition-opacity hover:text-white hover:opacity-100"
                      >
                        {link.label}
                      </NextLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom legal row */}
          <div className="flex flex-col gap-6 border-t border-white/12 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] font-medium text-white/70">
              © 2026 AxLiner Inc. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <NextLink
                href="/contact"
                className="text-[13px] font-medium text-white/70 transition-colors hover:text-white"
              >
                Contact Us
              </NextLink>
              <NextLink
                href="/privacy-policy"
                className="text-[13px] font-medium text-white/70 transition-colors hover:text-white"
              >
                Privacy Policy
              </NextLink>
              <NextLink
                href="/end-user-license-agreement"
                className="text-[13px] font-medium text-white/70 transition-colors hover:text-white"
              >
                Terms &amp; Conditions
              </NextLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
