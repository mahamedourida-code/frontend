"use client"

import { motion, useReducedMotion } from "framer-motion"

// Black logos (trimmed transparent PNGs) seated in soft-grey cards — three per row.
const LOGOS = [
  { src: "/logos/quickbooks.png", alt: "QuickBooks", name: "QuickBooks" },
  { src: "/logos/xero.png", alt: "Xero", name: "Xero" },
  { src: "/logos/excel.png", alt: "Microsoft Excel", name: "Excel" },
  { src: "/logos/google-sheets.png", alt: "Google Sheets", name: "Google Sheets" },
  { src: "/logos/gmail.png", alt: "Gmail", name: "Gmail" },
  { src: "/logos/google-drive.png", alt: "Google Drive", name: "Google Drive" },
  { src: "/logos/dropbox.png", alt: "Dropbox", name: "Dropbox" },
  { src: "/logos/onedrive.png", alt: "OneDrive", name: "OneDrive" },
  { src: "/logos/outlook.png", alt: "Outlook", name: "Outlook" },
]

export function IntegrationsLogos({ showNames = true }: { showNames?: boolean }) {
  const reduce = useReducedMotion()

  return (
    <section className="relative z-10 bg-[#F6F1EA] py-16 sm:py-20">
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-xl font-bold tracking-tight text-black text-balance sm:text-2xl">
          Works with the tools you already use
        </h2>

        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } }}
          className="mt-10 grid grid-cols-1 gap-x-4 gap-y-6 sm:mt-14 sm:grid-cols-2 sm:gap-x-5 lg:grid-cols-3"
        >
          {LOGOS.map((logo) => (
            <motion.li
              key={logo.alt}
              variants={{
                hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 14 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
              }}
              className="flex flex-col"
            >
              <div className="flex h-24 items-center justify-center rounded-2xl bg-white px-8 py-5 ring-1 ring-black/5 sm:h-28">
                <img
                  src={logo.src}
                  alt={logo.alt}
                  loading="lazy"
                  className="max-h-10 w-auto max-w-full object-contain sm:max-h-12"
                />
              </div>
              {showNames ? (
                <span className="mt-3 text-center text-sm font-semibold text-black">{logo.name}</span>
              ) : null}
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
