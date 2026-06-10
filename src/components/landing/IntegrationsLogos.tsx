"use client"

import { motion, useReducedMotion } from "framer-motion"

// Black logos (transparent PNGs) seated in soft-grey cards — three per row.
const LOGOS = [
  { src: "/logos/quickbooks.png", alt: "QuickBooks" },
  { src: "/logos/xero.png", alt: "Xero" },
  { src: "/logos/excel.png", alt: "Microsoft Excel" },
  { src: "/logos/google-sheets.png", alt: "Google Sheets" },
  { src: "/logos/gmail.png", alt: "Gmail" },
  { src: "/logos/google-drive.png", alt: "Google Drive" },
  { src: "/logos/dropbox.png", alt: "Dropbox" },
  { src: "/logos/onedrive.png", alt: "OneDrive" },
  { src: "/logos/outlook.png", alt: "Outlook" },
]

export function IntegrationsLogos() {
  const reduce = useReducedMotion()

  return (
    <section className="relative z-10 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8">
        <p className="text-center text-[15px] font-semibold tracking-tight text-black">
          Works with the tools you already use
        </p>

        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } }}
          className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
        >
          {LOGOS.map((logo) => (
            <motion.li
              key={logo.alt}
              variants={{
                hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 14 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
              }}
              className="flex h-28 items-center justify-center rounded-2xl bg-[#f1f1f1] sm:h-32"
            >
              <img
                src={logo.src}
                alt={logo.alt}
                loading="lazy"
                className="h-full w-full object-contain p-7 sm:p-8"
              />
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
