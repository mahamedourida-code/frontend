"use client"

import { useState } from "react"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"

/* The "Talk to us" form card — Linear/Stripe-style. No backend contact endpoint
   exists, so submit composes a prefilled mailto: to contact@axliner.com and then
   shows an inline success state. Cream page, black text (NO grey), blue focus
   ring, mint glossy submit pill — all from existing tokens. */

type Topic = "product" | "billing" | "privacy" | "other"

const TOPICS: { value: Topic; label: string; subject: string }[] = [
  { value: "product", label: "Product question", subject: "Product question" },
  { value: "billing", label: "Billing", subject: "Billing question" },
  { value: "privacy", label: "Privacy or data deletion", subject: "Privacy / data deletion request" },
  { value: "other", label: "Something else", subject: "AxLiner support request" },
]

const fieldClass =
  "h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-[15px] font-medium text-black placeholder:text-black/40 outline-none transition-shadow focus-visible:border-[var(--landing-blue)] focus-visible:ring-2 focus-visible:ring-[var(--landing-blue)]/35"

const labelClass = "block text-[14px] font-semibold text-black"

export function ContactForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [topic, setTopic] = useState<Topic>("product")
  const [message, setMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Add your name, work email, and a short message so we can reply.")
      return
    }
    setError(null)

    const picked = TOPICS.find((t) => t.value === topic) ?? TOPICS[3]
    const body = [
      `Name: ${name.trim()}`,
      `Email: ${email.trim()}`,
      company.trim() ? `Company: ${company.trim()}` : null,
      `Topic: ${picked.label}`,
      "",
      message.trim(),
    ]
      .filter(Boolean)
      .join("\n")

    const href = `mailto:contact@axliner.com?subject=${encodeURIComponent(
      picked.subject,
    )}&body=${encodeURIComponent(body)}`

    window.location.href = href
    setSent(true)
  }

  if (sent) {
    return (
      <div className="rounded-2xl bg-white p-8 ring-1 ring-black/[0.06] sm:p-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-green)]">
          <Check className="size-6 text-black" strokeWidth={2.5} />
        </div>
        <h2 className="mt-6 text-[24px] font-semibold tracking-[-0.03em] text-black">
          Thanks — we&apos;ll be in touch.
        </h2>
        <p className="mt-3 text-[16px] font-medium leading-7 text-black">
          Your email app should have opened with the message ready to send. A real human
          replies, usually the same business day.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-7 inline-flex items-center gap-1 text-[15px] font-semibold text-[var(--landing-blue)] hover:underline"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl bg-white p-6 ring-1 ring-black/[0.06] sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="cf-name" className={labelClass}>
            Full name
          </label>
          <input
            id="cf-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Cooper"
            autoComplete="name"
            className={fieldClass}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="cf-email" className={labelClass}>
            Work email
          </label>
          <input
            id="cf-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@firm.com"
            autoComplete="email"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <label htmlFor="cf-company" className={labelClass}>
          Company <span className="font-normal text-black">(optional)</span>
        </label>
        <input
          id="cf-company"
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Cooper & Co. Bookkeeping"
          autoComplete="organization"
          className={fieldClass}
        />
      </div>

      <div className="mt-5 space-y-2">
        <span className={labelClass}>What&apos;s this about?</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TOPICS.map((t) => {
            const active = topic === t.value
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setTopic(t.value)}
                aria-pressed={active}
                className={
                  "rounded-full border px-3 py-2.5 text-[13.5px] font-semibold leading-tight transition-colors " +
                  (active
                    ? "border-[var(--landing-blue)] bg-[var(--landing-blue)]/10 text-black"
                    : "border-black/10 bg-white text-black hover:border-black/25")
                }
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <label htmlFor="cf-message" className={labelClass}>
          Message
        </label>
        <textarea
          id="cf-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us the document type, what you expected, and which mode you used."
          rows={5}
          className="w-full resize-y rounded-xl border border-black/10 bg-white px-4 py-3 text-[15px] font-medium leading-7 text-black placeholder:text-black/40 outline-none transition-shadow focus-visible:border-[var(--landing-blue)] focus-visible:ring-2 focus-visible:ring-[var(--landing-blue)]/35"
        />
      </div>

      {error && (
        <p className="mt-4 text-[14px] font-semibold text-red-600">{error}</p>
      )}

      <Button type="submit" variant="glossy" className="mt-6 h-12 w-full text-[15px] font-semibold sm:w-auto sm:px-8">
        Send message
      </Button>

      <p className="mt-4 text-[13.5px] font-medium text-black">
        We never ask for passwords or document contents here. Prefer email?{" "}
        <a
          href="mailto:contact@axliner.com"
          className="font-semibold text-[var(--landing-blue)] hover:underline"
        >
          contact@axliner.com
        </a>
      </p>
    </form>
  )
}
