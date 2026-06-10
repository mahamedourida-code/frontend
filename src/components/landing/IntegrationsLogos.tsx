"use client"

import { motion, useReducedMotion } from "framer-motion"

// Black logos (trimmed transparent PNGs) seated in soft-grey cards — three per row.
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
        <h2 className="text-center text-2xl font-bold tracking-tight text-black text-balance sm:text-3xl">
          Works with the tools you already use
        </h2>

        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } }}
          className="mt-10 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
        >
          {LOGOS.map((logo) => (
            <motion.li
              key={logo.alt}
              variants={{
                hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 14 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
              }}
              className="flex h-32 items-center justify-center rounded-2xl bg-[#f1f1f1] px-8 py-5 sm:h-36"
            >
              <img
                src={logo.src}
                alt={logo.alt}
                loading="lazy"
                className="max-h-16 w-auto max-w-full object-contain sm:max-h-20"
              />
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
