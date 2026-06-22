"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

/* Use-cases bento — rebuilt to match Devin AI's "Use cases" section:
   a 3×3 staircase grid where three tall cards carry a real product
   screenshot anchored to the bottom-right (top-cropped), and three short
   cards are text-only. Minimal 2–5 word titles, one blue accent CTA per
   relevant card. Static — no scroll animation. Bullets stay solid black
   (AxLiner brand rule: no grey text), blue accents use --brand-link. */

interface Card {
  layout: "tall" | "short";
  title: string;
  bullets: string[];
  image?: { src: string; alt: string };
  cta?: { label: string; href: string };
}

const cards: Card[] = [
  {
    layout: "tall",
    title: "The review board",
    bullets: [
      "Flagged exceptions surface first, not buried",
      "Field- and row-level confidence on every value",
      "Source on the left, editable fields on the right",
    ],
    image: { src: "/product-board.png", alt: "The AxLiner batch review board with statuses, confidence flags, and one-click publish" },
    cta: { label: "Open the review board", href: "/dashboard/client" },
  },
  {
    layout: "short",
    title: "Read the whole folder",
    bullets: [
      "Invoices, receipts, bank statements, handwritten tables",
      "Photos, PDFs, scans, HEIC — all in one stack",
      "Batch the entire client folder at once",
    ],
  },
  {
    layout: "short",
    title: "Publish to your books",
    bullets: [
      "Reviewed draft bills to QuickBooks or Xero",
      "Source attached to every posted entry",
      "Never pays, approves, or reconciles for you",
    ],
    cta: { label: "See QuickBooks & Xero", href: "/integrations" },
  },
  {
    layout: "tall",
    title: "Clean spreadsheets out",
    bullets: [
      "Export reviewed Excel or CSV anytime",
      "Columns mapped to the right schema",
      "Numbers, dates, and totals already parsed",
    ],
    image: { src: "/after.png", alt: "Reviewed data exported to a clean Excel spreadsheet" },
    cta: { label: "See export formats", href: "/products" },
  },
  {
    layout: "tall",
    title: "Any table, handled",
    bullets: [
      "Wide, dense tables read column by column",
      "Handwritten ledgers and printed grids alike",
      "Every cell placed where it belongs",
    ],
    image: { src: "/ee.png", alt: "A dense multi-column table extracted into a structured spreadsheet" },
  },
  {
    layout: "short",
    title: "Built for many clients",
    bullets: [
      "A workspace per firm, a client per company",
      "Per-client coding and accounting connections",
      "Made for bookkeepers running many books",
    ],
  },
];

// Devin's staircase: col1 = tall→short, col2 = short→tall, col3 = tall→short.
const placement = [
  "lg:col-start-1 lg:row-start-1 lg:row-span-2",
  "lg:col-start-1 lg:row-start-3",
  "lg:col-start-2 lg:row-start-1",
  "lg:col-start-2 lg:row-start-2 lg:row-span-2",
  "lg:col-start-3 lg:row-start-1 lg:row-span-2",
  "lg:col-start-3 lg:row-start-3",
];

export function CapabilityBoxes() {
  return (
    <section className="bg-[#FDFBF7] py-24 lg:py-32">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8">
        {/* Section header — minimal, left-aligned, one blue accent word */}
        <h2
          className="font-medium tracking-[-0.04em] text-[#191919]"
          style={{ fontSize: "clamp(40px, 5vw, 60px)", lineHeight: "1.06" }}
        >
          From folder to <span className="text-[var(--brand-link)]">books</span>.
        </h2>
        <p className="mt-5 max-w-[480px] text-[17px] font-normal leading-7 text-[#191919]">
          Drop the whole folder. AxLiner reads every document, flags what&apos;s
          unsure, and hands back reviewed entries — ready to publish.
        </p>

        {/* Staircase bento */}
        <div className="mt-14 grid grid-cols-1 gap-4 lg:mt-16 lg:grid-cols-3 lg:grid-rows-[repeat(3,300px)]">
          {cards.map((card, index) => {
            const isTall = card.layout === "tall";
            return (
              <article
                key={card.title}
                className={`flex flex-col overflow-hidden rounded-2xl bg-[#efefef] ${
                  isTall ? "min-h-[440px]" : "min-h-[260px]"
                } ${placement[index]}`}
              >
                <div className="flex flex-col px-8 pb-6 pt-12 lg:px-9 lg:pt-14">
                  <h3
                    className="font-medium tracking-[-0.04em] text-[#191919]"
                    style={{ fontSize: "23px", lineHeight: "1.18" }}
                  >
                    {card.title}
                  </h3>

                  <ul className="mt-5 space-y-2.5">
                    {card.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex gap-2 text-[15px] font-normal leading-snug text-[#191919]"
                      >
                        <span aria-hidden className="shrink-0">—</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  {card.cta && (
                    <Link
                      href={card.cta.href}
                      className="mt-7 inline-flex w-fit items-center gap-1 text-[15px] font-medium text-[var(--brand-link)] hover:underline"
                    >
                      {card.cta.label}
                      <ChevronRight className="size-4" />
                    </Link>
                  )}
                </div>

                {isTall && card.image && (
                  <div className="mt-3 flex-1 w-[90%] self-end overflow-hidden">
                    <img
                      src={card.image.src}
                      alt={card.image.alt}
                      loading="lazy"
                      draggable={false}
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
