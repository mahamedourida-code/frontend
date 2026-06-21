"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ScrollRevealText } from "@/components/landing/ScrollRevealText";

interface Card {
  heading: string;
  bullets: string[];
  link?: { label: string; href: string };
}

const cards: Card[] = [
  {
    heading: "Read the whole folder",
    bullets: [
      "— Invoices, receipts, bank statements, handwritten tables",
      "— Batch-upload the entire client folder at once",
      "— Photos, PDFs, scans, HEIC — all in one stack",
    ],
    link: { label: "See document types", href: "/products" },
  },
  {
    heading: "Review, don't retype",
    bullets: [
      "— Flagged exceptions surface first, not buried",
      "— Field- and row-level confidence on every value",
      "— Vendor memory pre-codes repeat suppliers",
    ],
    link: { label: "Open the review board", href: "/dashboard/client" },
  },
  {
    heading: "Publish to your books",
    bullets: [
      "— Reviewed draft bills to QuickBooks or Xero",
      "— Export clean Excel or CSV anytime",
      "— AxLiner never pays, approves, or reconciles",
    ],
    link: { label: "See integrations", href: "/integrations" },
  },
  {
    heading: "Built for many clients",
    bullets: [
      "— A workspace per firm, a client per company",
      "— Per-client coding and accounting connections",
      "— Made for bookkeepers running many books",
    ],
  },
];

export function CapabilityBoxes() {
  return (
    <section className="bg-[#FDFBF7] py-24 lg:py-32">
      <div className="mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8">
        {/* Section header — left-aligned */}
        <h2
          className="font-medium tracking-tight text-[#191919]"
          style={{ fontSize: "clamp(40px, 5vw, 54px)", lineHeight: "1.05" }}
        >
          Turn the whole folder into reviewed books
        </h2>
        <p className="mt-4 max-w-[520px] text-[18px] font-normal leading-7 text-[#191919]">
          Batch in any mix of documents. AxLiner reads them, flags what&apos;s
          unsure, and hands back reviewed entries — ready to publish.
        </p>

        {/* Card grid */}
        <div className="mt-12 grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.heading}
              className="flex flex-col rounded-2xl bg-[#efefef] p-8"
            >
              <h3
                className="mb-5 font-medium text-[#191919]"
                style={{ fontSize: "22px", lineHeight: "28px" }}
              >
                {card.heading}
              </h3>

              <div className="space-y-3">
                {card.bullets.map((bullet) => (
                  <ScrollRevealText
                    key={bullet}
                    className="text-[17px] font-normal leading-[25px]"
                  >
                    {bullet}
                  </ScrollRevealText>
                ))}
              </div>

              {card.link && (
                <Link
                  href={card.link.href}
                  className="mt-6 inline-flex items-center gap-1 text-[17px] font-medium text-[var(--brand-link)] hover:underline"
                >
                  {card.link.label}
                  <ChevronRight className="size-4" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
