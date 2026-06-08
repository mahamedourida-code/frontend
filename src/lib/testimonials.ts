export type Testimonial = {
  quote: string
  name: string
  title: string
  avatar: string
}

// Shared customer testimonials — used on the auth (sign-in / sign-up) screen
// and the Request-a-demo panel so the social proof stays in one place.
export const testimonialSet: Testimonial[] = [
  {
    quote:
      "AxLiner gives our bookkeeping team clean Excel files from handwritten expense sheets before month-end review starts.",
    name: "Mara Ellis",
    title: "Senior Bookkeeper, Ledger North",
    avatar: "/testimonial/aa.jpg",
  },
  {
    quote:
      "We upload paper invoices and field notes in one batch, then review the spreadsheet instead of rebuilding every row.",
    name: "Daniel Rowe",
    title: "Accounting Operations Lead",
    avatar: "/testimonial/zz.jpg",
  },
  {
    quote:
      "For bank statement photos and handwritten logs, the team starts from structured rows instead of a blank workbook.",
    name: "Nadia Clarke",
    title: "Payroll & Reconciliation Manager",
    avatar: "/testimonial/ee.jpg",
  },
]
