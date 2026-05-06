"use client";

import Image from "next/image";

const firstRowTestimonials = [
  {
    name: "Sarah Mitchell",
    handle: "@sarahmitchell",
    avatar: "/testimonials/avi_schiffmann.jpg",
    text: "AxLiner has completely transformed how we process invoices. What used to take hours now takes minutes. The accuracy is incredible!",
  },
  {
    name: "David Chen",
    handle: "@davidchen",
    avatar: "/testimonials/alex_finn.jpg",
    text: "Best OCR tool I've ever used. The handwritten table recognition is mind-blowing. We've processed thousands of documents with near-perfect accuracy.",
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
    text: "I was skeptical at first, but AxLiner exceeded all expectations. The table structure preservation is phenomenal. We've saved thousands of hours in manual data entry.",
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
    text: "The reason I chose AxLiner is the consistent accuracy and speed. Processing handwritten documents has never been easier. This tool has revolutionized our data extraction workflow and saved us countless hours of manual work.",
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
    text: "The UX is incredibly intuitive. Just upload your images and get perfect Excel files in seconds.",
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
    text: "AxLiner's OCR accuracy beats everything else I've tried.",
  },
];

function TestimonialCard({ testimonial, index }: { testimonial: typeof firstRowTestimonials[number]; index: string }) {
  return (
    <div
      key={index}
      className="w-[450px] flex-shrink-0 rounded-lg border border-border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:bg-card"
    >
      <div className="mb-4 flex items-center gap-3">
        <Image
          src={testimonial.avatar}
          alt={testimonial.name}
          width={48}
          height={48}
          className="h-12 w-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="text-base font-semibold text-foreground">{testimonial.name}</p>
          <p className="text-sm text-muted-foreground">{testimonial.handle}</p>
        </div>
        <svg className="h-5 w-5 text-foreground opacity-60" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </div>

      <div className="mb-4 border-t border-dashed border-border" />
      <p className="text-base leading-relaxed text-black dark:text-foreground">{testimonial.text}</p>
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
