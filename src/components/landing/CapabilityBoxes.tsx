"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { GrowthChart } from "@/components/landing/GrowthChart";

/* Use-cases bento, modelled on Devin AI's "Use cases" section: #efefef cards,
   16px radius, minimal 2–5 word titles, one blue accent link per relevant card.
   Two outer tall cards each carry a single visual docked to the TOP-LEFT corner
   (only that corner inherits the card radius — Devin's framing), flanking two
   stacked text cards. Static (no scroll animation). Bullets stay solid black
   (AxLiner: no grey text); accents use --brand-link. */

interface TextCard {
  title: string;
  bullets: string[];
  cta?: { label: string; href: string };
  className: string;
}

const reviewCard = {
  title: "The review board",
  bullets: [
    "Flagged exceptions surface first, not buried",
    "Field- and row-level confidence on every value",
    "Source on the left, editable fields on the right",
  ],
  cta: { label: "Open the review board", href: "/dashboard/client" },
};

const growthCard = {
  title: "Take on more clients",
  bullets: [
    "Hours of manual data entry, gone",
    "Close the month days sooner",
    "Grow the book of business, not the headcount",
  ],
  cta: { label: "See plans", href: "/pricing" },
};

const textCards: TextCard[] = [
  {
    title: "Read the whole folder",
    bullets: [
      "Invoices, receipts, bank statements, handwritten tables",
      "Photos, PDFs, scans, HEIC — all in one stack",
      "Batch the entire client folder at once",
    ],
    className: "lg:col-start-2 lg:row-start-1",
  },
  {
    title: "Publish to your books",
    bullets: [
      "Reviewed draft bills to QuickBooks or Xero",
      "Source attached to every posted entry",
      "Never pays, approves, or reconciles for you",
    ],
    cta: { label: "See QuickBooks & Xero", href: "/integrations" },
    className: "lg:col-start-2 lg:row-start-2",
  },
];

function CardBody({
  title,
  bullets,
  cta,
}: {
  title: string;
  bullets: string[];
  cta?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-1 flex-col px-8 pb-8 pt-7 lg:px-9">
      <h3
        className="font-medium tracking-[-0.04em] text-[#191919]"
        style={{ fontSize: "23px", lineHeight: "1.18" }}
      >
        {title}
      </h3>
      <ul className="mt-5 space-y-2.5">
        {bullets.map((bullet) => (
          <li
            key={bullet}
            className="flex gap-2 text-[15px] font-normal leading-snug text-[#191919]"
          >
            <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#191919]" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
      {cta && (
        <Link
          href={cta.href}
          className="mt-7 inline-flex w-fit items-center gap-1 text-[15px] font-medium text-[var(--brand-link)] hover:underline"
        >
          {cta.label}
          <ChevronRight className="size-4" />
        </Link>
      )}
    </div>
  );
}

export function CapabilityBoxes() {
  return (
    <section className="bg-[#FDFBF7] py-24 lg:py-32">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8">
        {/* Minimal heading, one blue accent word */}
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

        {/* Bento — two tall visual cards flanking two stacked text cards */}
        <div className="mt-14 grid grid-cols-1 gap-4 lg:mt-16 lg:grid-cols-3 lg:grid-rows-[repeat(2,300px)]">
          {/* Review board — visual docked top-left, colourful rows showing */}
          <article className="flex min-h-[460px] flex-col overflow-hidden rounded-2xl bg-[#efefef] lg:col-start-1 lg:row-start-1 lg:row-span-2">
            <div className="aspect-[945/608] w-[88%] shrink-0 overflow-hidden rounded-tl-2xl">
              <img
                src="/review-board-crop.png"
                alt="The AxLiner batch review board: document type, status, and vendor for each row"
                loading="lazy"
                draggable={false}
                className="h-full w-full object-cover object-top"
              />
            </div>
            <CardBody {...reviewCard} />
          </article>

          {/* Stacked text cards */}
          {textCards.map((card) => (
            <article
              key={card.title}
              className={`flex min-h-[260px] flex-col rounded-2xl bg-[#efefef] ${card.className}`}
            >
              <CardBody title={card.title} bullets={card.bullets} cta={card.cta} />
            </article>
          ))}

          {/* Growth chart — recreated, docked top-left */}
          <article className="flex min-h-[460px] flex-col overflow-hidden rounded-2xl bg-[#efefef] lg:col-start-3 lg:row-start-1 lg:row-span-2">
            <div className="aspect-[945/608] w-[88%] shrink-0 overflow-hidden rounded-tl-2xl">
              <GrowthChart />
            </div>
            <CardBody {...growthCard} />
          </article>
        </div>
      </div>
    </section>
  );
}
