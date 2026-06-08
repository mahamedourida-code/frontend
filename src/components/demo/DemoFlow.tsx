"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Check, Loader2 } from "lucide-react"

import { AppLogo } from "@/components/AppIcon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { demoApi } from "@/lib/api-client"
import { testimonialSet } from "@/lib/testimonials"

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL
const EASE = [0.22, 1, 0.36, 1] as const

type Step = "form" | "schedule" | "done"
type Fields = { name: string; email: string; company: string; goal: string }
type FieldErrors = Partial<Record<"name" | "email" | "company", string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* ── Left panel: rotating customer testimonials on a deep-brown field ── */
function TestimonialPanel() {
  const reduce = useReducedMotion()
  const [i, setI] = useState(() => Math.floor(Math.random() * testimonialSet.length))

  useEffect(() => {
    if (reduce) return
    const id = setInterval(() => setI((n) => (n + 1) % testimonialSet.length), 6500)
    return () => clearInterval(id)
  }, [reduce])

  const t = testimonialSet[i]

  return (
    <div className="relative flex flex-col justify-between gap-12 bg-[var(--brand-brown-dark)] p-10 text-white lg:p-12">
      <AppLogo className="h-9 w-auto invert" />

      <div className="flex-1">
        <h2 className="text-[26px] font-bold leading-tight tracking-tight text-balance sm:text-[30px]">
          What our customers say about AxLiner
        </h2>

        <div className="relative mt-8 min-h-[210px]">
          <span aria-hidden className="block text-6xl font-black leading-none text-white/25">&ldquo;</span>
          <AnimatePresence mode="wait">
            <motion.figure
              key={t.name}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="-mt-3"
            >
              <blockquote className="max-w-[420px] text-lg font-semibold leading-snug text-white">
                {t.quote}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <Image
                  src={t.avatar}
                  alt={t.name}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full border border-white/35 object-cover"
                />
                <span className="flex flex-col">
                  <span className="text-sm font-semibold text-white">{t.name}</span>
                  <span className="mt-0.5 text-xs font-medium text-white/75">{t.title}</span>
                </span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        <div className="mt-7 flex gap-2">
          {testimonialSet.map((item, idx) => (
            <button
              key={item.name}
              type="button"
              aria-label={`Show testimonial ${idx + 1}`}
              onClick={() => setI(idx)}
              className="ax-interactive h-1.5 rounded-full transition-all"
              style={{
                width: idx === i ? 26 : 10,
                backgroundColor: idx === i ? "#ffffff" : "rgba(255,255,255,0.4)",
              }}
            />
          ))}
        </div>
      </div>

      <p className="text-sm font-medium leading-6 text-white/80">
        Trusted by bookkeepers, accounting firms, and finance teams who review before anything posts.
      </p>
    </div>
  )
}

/* ── Right panel: lead form → Calendly → confirmation ── */
export function DemoFlow() {
  const reduce = useReducedMotion()
  const [step, setStep] = useState<Step>("form")
  const [fields, setFields] = useState<Fields>({ name: "", email: "", company: "", goal: "" })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [booked, setBooked] = useState(false)

  const firstName = useMemo(() => fields.name.trim().split(/\s+/)[0] || "there", [fields.name])

  const set = (key: keyof Fields) => (e: { target: { value: string } }) =>
    setFields((f) => ({ ...f, [key]: e.target.value }))

  function validate(): boolean {
    const next: FieldErrors = {}
    if (!fields.name.trim()) next.name = "Tell us your name."
    if (!fields.email.trim()) next.email = "We need an email to send the invite."
    else if (!EMAIL_RE.test(fields.email.trim())) next.email = "That email doesn't look right."
    if (!fields.company.trim()) next.company = "Which company is this for?"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await demoApi.submitLead({
        name: fields.name.trim(),
        work_email: fields.email.trim(),
        company: fields.company.trim(),
        automation_goal: fields.goal.trim() || undefined,
      })
    } catch {
      // Non-blocking: never trap the prospect if storage hiccups — let them book.
    } finally {
      setSubmitting(false)
      setStep(CALENDLY_URL ? "schedule" : "done")
    }
  }

  // Load Calendly + listen for a completed booking only while scheduling.
  useEffect(() => {
    if (step !== "schedule" || !CALENDLY_URL) return
    const script = document.createElement("script")
    script.src = "https://assets.calendly.com/assets/external/widget.js"
    script.async = true
    document.body.appendChild(script)
    const onMessage = (e: MessageEvent) => {
      if (e.data?.event === "calendly.event_scheduled") {
        setBooked(true)
        setStep("done")
      }
    }
    window.addEventListener("message", onMessage)
    return () => {
      window.removeEventListener("message", onMessage)
      script.remove()
    }
  }, [step])

  const calendlySrc = useMemo(() => {
    if (!CALENDLY_URL) return ""
    const u = new URL(CALENDLY_URL)
    u.searchParams.set("hide_gdpr_banner", "1")
    u.searchParams.set("primary_color", "6b4f2e")
    if (fields.name.trim()) u.searchParams.set("name", fields.name.trim())
    if (fields.email.trim()) u.searchParams.set("email", fields.email.trim())
    if (fields.company.trim()) u.searchParams.set("a1", fields.company.trim())
    return u.toString()
  }, [fields])

  return (
    <div className="grid w-full overflow-hidden rounded-2xl bg-white shadow-[0_24px_70px_-30px_rgba(0,0,0,0.45)] ring-1 ring-black/10 lg:grid-cols-[0.9fr_1.1fr]">
      <TestimonialPanel />

      <div className="p-7 sm:p-10 lg:p-12">
        <AnimatePresence mode="wait">
          {step === "form" ? (
            <motion.div
              key="form"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <h1 className="text-3xl font-bold tracking-tight text-black">Request a demo</h1>
              <p className="mt-2 text-[15px] leading-7 text-black">
                See AxLiner run on your own documents. Share a few details and pick a time that works.
              </p>

              <form className="mt-8 space-y-5" onSubmit={onSubmit} noValidate>
                <Field id="name" label="Name" error={errors.name}>
                  <Input id="name" value={fields.name} onChange={set("name")} placeholder="Jane Cooper" autoComplete="name" />
                </Field>
                <Field id="email" label="Work email" error={errors.email}>
                  <Input id="email" type="email" value={fields.email} onChange={set("email")} placeholder="jane@firm.com" autoComplete="email" />
                </Field>
                <Field id="company" label="Company" error={errors.company}>
                  <Input id="company" value={fields.company} onChange={set("company")} placeholder="Ledger North" autoComplete="organization" />
                </Field>
                <Field id="goal" label="What are you looking to automate?" optional>
                  <Textarea
                    id="goal"
                    value={fields.goal}
                    onChange={set("goal")}
                    rows={3}
                    placeholder="Invoices, receipts, bank statements, handwritten sheets…"
                  />
                </Field>

                <p className="text-[13px] leading-6 text-black">
                  By requesting a demo you agree to our{" "}
                  <Link href="/privacy-policy" className="font-semibold text-[var(--brand-link)] underline-offset-4 hover:text-[var(--brand-link-hover)] hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>

                <Button type="submit" variant="glossy" disabled={submitting} className="h-12 w-full text-[15px]">
                  {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
                  {submitting ? "Sending…" : "Request my demo"}
                </Button>
              </form>
            </motion.div>
          ) : step === "schedule" ? (
            <motion.div
              key="schedule"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <h1 className="text-3xl font-bold tracking-tight text-black">Pick a time, {firstName}</h1>
              <p className="mt-2 text-[15px] leading-7 text-black">
                Choose a slot below. You&rsquo;ll get a calendar invite at {fields.email.trim()}.
              </p>
              <div className="mt-6 overflow-hidden rounded-xl ring-1 ring-black/10">
                <div className="calendly-inline-widget" data-url={calendlySrc} style={{ minWidth: 320, height: 660 }} />
              </div>
              <button
                type="button"
                onClick={() => setStep("form")}
                className="ax-interactive mt-5 text-sm font-semibold text-[var(--brand-link)] underline-offset-4 hover:text-[var(--brand-link-hover)] hover:underline"
              >
                ← Back to details
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="flex min-h-[420px] flex-col items-center justify-center text-center"
            >
              <span className="flex size-14 items-center justify-center rounded-full bg-[var(--brand-brown-dark)] text-white">
                <Check className="size-7" />
              </span>
              <h1 className="mt-6 text-3xl font-bold tracking-tight text-black">
                {booked ? "You’re booked" : "Request received"}
              </h1>
              <p className="mt-3 max-w-sm text-[15px] leading-7 text-black">
                {booked
                  ? `Thanks, ${firstName}. A calendar invite is on its way to ${fields.email.trim()}. We’ll bring AxLiner running on documents like yours.`
                  : `Thanks, ${firstName}. We’ve got your request and will email ${fields.email.trim()} to set up a time.`}
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Button asChild variant="surface" className="px-6">
                  <Link href="/">Back to home</Link>
                </Button>
                <Link
                  href="/dashboard/client"
                  className="ax-interactive text-sm font-semibold text-[var(--brand-link)] underline-offset-4 hover:text-[var(--brand-link-hover)] hover:underline"
                >
                  Or try it yourself now
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* Labeled field with optional inline error. */
function Field({
  id,
  label,
  optional,
  error,
  children,
}: {
  id: string
  label: string
  optional?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-semibold text-black">
        {label}
        {optional ? <span className="ml-1.5 text-xs font-medium text-black/55">(optional)</span> : null}
      </Label>
      {children}
      {error ? <p className="text-[13px] font-medium text-red-600">{error}</p> : null}
    </div>
  )
}
