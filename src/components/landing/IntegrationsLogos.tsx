"use client"

import { motion, useReducedMotion } from "framer-motion"

// Near-black "logo tint" — the crisp monochrome logo-wall look.
const TINT = "#171717"
const H = 50 // uniform logo height in px
const MAX_W = 184

// Aspect ratios read from each SVG's viewBox. Logos are masked, so the source
// colors don't matter — every mark renders in the one soft brown.
const LOGOS = [
  { src: "/logos/quickbooks.svg", alt: "QuickBooks", aspect: 3.908 },
  { src: "/logos/zoho-books.svg", alt: "Zoho Books", aspect: 2.905 },
  { src: "/logos/excel.svg", alt: "Microsoft Excel", aspect: 1.059 },
  { src: "/logos/gmail.svg", alt: "Gmail", aspect: 1.257 },
  { src: "/logos/google-drive.svg", alt: "Google Drive", aspect: 1.15 },
  { src: "/logos/dropbox.svg", alt: "Dropbox", aspect: 5.079 },
]

export function IntegrationsLogos() {
  const reduce = useReducedMotion()

  return (
    <section className="relative z-10 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <p className="text-center text-[15px] font-semibold tracking-tight text-black">
          Works with the tools you already use
        </p>

        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } }}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-9 sm:mt-12 sm:gap-x-16 lg:gap-x-20"
        >
          {LOGOS.map((logo) => {
            const width = Math.round(Math.min(logo.aspect * H, MAX_W))
            return (
              <motion.li
                key={logo.alt}
                variants={{
                  hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 14 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
                }}
              >
                <span
                  role="img"
                  aria-label={logo.alt}
                  className="block shrink-0"
                  style={{
                    height: H,
                    width,
                    backgroundColor: TINT,
                    WebkitMaskImage: `url(${logo.src})`,
                    maskImage: `url(${logo.src})`,
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    maskPosition: "center",
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                  }}
                />
              </motion.li>
            )
          })}
        </motion.ul>
      </div>
    </section>
  )
}
