"use client";

import Image from "next/image";

const firstRowTestimonials = [
  {
    name: "Sarah Mitchell",
    handle: "@sarahmitchell",
    avatar: "/testimonials/avi_schiffmann.jpg",
    text: "Our invoice batches move faster now. We review the extracted rows, fix the few edge cases, and get the Excel handoff out sooner.",
  },
  {
    name: "David Chen",
    handle: "@davidchen",
    avatar: "/testimonials/alex_finn.jpg",
    text: "Handwritten table batches finally feel manageable. The review set is much easier than retyping rows from scans.",
  },
  {
    name: "Emily Rodriguez",
    handle: "@emilyrodriguez",
    avatar: "/testimonials/alvaro_cintas.jpg",
    text: "Game changer for our data entry team.",
  },
  {
    name: "Michael Thompson",
    handle: "@mikethompson",
    avatar: "/testimonials/tom_blomfield.jpg",
    text: "AxLiner keeps the table structure clear enough for review. That saves our team from rebuilding every spreadsheet by hand.",
  },
  {
    name: "Jessica Park",
    handle: "@jessicapark",
    avatar: "/testimonials/catalin.jpg",
    text: "AxLiner has become an essential tool in our workflow. The accuracy on complex forms is outstanding.",
  },
];

const secondRowTestimonials = [
  {
    name: "Robert Williams",
    handle: "@robertwilliams",
    avatar: "/testimonials/bodega_man.jpg",
    text: "We upload handwritten paperwork in a batch, inspect the result cards, and spend time on exceptions instead of typing every line again.",
  },
  {
    name: "Amanda Foster",
    handle: "@amandafoster",
    avatar: "/testimonials/luca.jpg",
    text: "AxLiner makes document digitization insanely fast and accurate. Our team productivity has doubled.",
  },
  {
    name: "Chris Anderson",
    handle: "@chrisanderson",
    avatar: "/testimonials/jon_myers.jpg",
    text: "The workflow is direct: add files, review the spreadsheet outputs, download the corrected batch.",
  },
  {
    name: "Rachel Martinez",
    handle: "@rachelmartinez",
    avatar: "/testimonials/tom_dorr.jpg",
    text: "I've been using AxLiner exclusively for the past month. The results speak for themselves. Outstanding tool that delivers on its promises every single time.",
  },
  {
    name: "James Wilson",
    handle: "@jameswilson",
    avatar: "/testimonials/alexander_wilczek.jpg",
    text: "It saves the slow part of data entry without hiding the review step.",
  },
];

function TestimonialCard({ testimonial, index }: { testimonial: typeof firstRowTestimonials[number]; index: string }) {
  return (
    <div
      key={index}
      className="flex w-[420px] flex-shrink-0 flex-col rounded-2xl bg-white p-7 ring-1 ring-black/10 transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
    >
      <p className="ax-body flex-1 text-[17px] font-semibold leading-7 text-neutral-900">
        {testimonial.text}
      </p>

      <div className="mt-6 flex items-center gap-3 border-t border-black/10 pt-5">
        <Image
          src={testimonial.avatar}
          alt={testimonial.name}
          width={44}
          height={44}
          className="h-11 w-11 rounded-full object-cover ring-1 ring-black/10"
        />
        <div className="flex-1">
          <p className="text-[15px] font-bold text-neutral-950">{testimonial.name}</p>
          <p className="text-[13px] font-semibold text-[var(--brand-brown)]">{testimonial.handle}</p>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsMarquee() {
  return (
    <section className="relative z-10 overflow-hidden bg-white pb-16 pt-20 lg:pb-20 lg:pt-28">
      <div className="mx-auto mb-12 max-w-[928px] px-4 text-center sm:px-6 lg:mb-14 lg:px-8">
        <p className="ax-eyebrow text-[var(--brand-brown)]">Testimonials</p>
        <h2 className="ax-h2 ax-marketing-section-title mt-3 font-bold text-neutral-950">
          The people who reconcile the books.
        </h2>
      </div>
      <div className="relative w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-24 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-24 bg-gradient-to-l from-white to-transparent" />
        <div className="relative mb-6 overflow-hidden">
          <div
            className="flex items-start gap-6"
            style={{ animation: "scroll-left 90s linear infinite", width: "max-content", willChange: "transform" }}
            onMouseEnter={(event) => { event.currentTarget.style.animationPlayState = "paused"; }}
            onMouseLeave={(event) => { event.currentTarget.style.animationPlayState = "running"; }}
          >
            {Array.from({ length: 3 }, (_, setIndex) =>
              firstRowTestimonials.map((testimonial, index) => (
                <TestimonialCard key={`${setIndex}-${index}`} testimonial={testimonial} index={`${setIndex}-${index}`} />
              ))
            )}
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div
            className="flex items-start gap-6"
            style={{ animation: "scroll-right 90s linear infinite", width: "max-content", willChange: "transform" }}
            onMouseEnter={(event) => { event.currentTarget.style.animationPlayState = "paused"; }}
            onMouseLeave={(event) => { event.currentTarget.style.animationPlayState = "running"; }}
          >
            {Array.from({ length: 3 }, (_, setIndex) =>
              secondRowTestimonials.map((testimonial, index) => (
                <TestimonialCard key={`${setIndex}-${index}`} testimonial={testimonial} index={`${setIndex}-${index}`} />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
