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
      className="w-[460px] flex-shrink-0 rounded-xl border border-gray-200 bg-white p-6 text-gray-950 shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-200 dark:bg-white dark:text-gray-950"
    >
      <div className="mb-5 flex items-center gap-3">
        <Image
          src={testimonial.avatar}
          alt={testimonial.name}
          width={52}
          height={52}
          className="h-13 w-13 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="text-lg font-bold text-gray-950">{testimonial.name}</p>
          <p className="text-sm font-medium text-gray-500">{testimonial.handle}</p>
        </div>
        <svg className="h-5 w-5 text-gray-950 opacity-60" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </div>

      <div className="mb-5 border-t border-dashed border-gray-200" />
      <p className="text-[17px] font-semibold leading-7 text-gray-900">{testimonial.text}</p>
    </div>
  );
}

export default function TestimonialsMarquee() {
  return (
    <section className="relative z-10 -mt-6 overflow-hidden pb-10 pt-0 sm:-mt-8 lg:-mt-10">
      <div className="w-full">
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
