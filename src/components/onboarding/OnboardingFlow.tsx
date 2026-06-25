"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { AppLogo } from "@/components/AppIcon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"
import { createClient } from "@/utils/supabase/client"
import { cn } from "@/lib/utils"
import {
  DESTINATIONS,
  DOC_TYPES,
  EMPTY_ANSWERS,
  HEARD,
  ROLES,
  VOLUME,
  type Option,
  type OnboardingAnswers,
} from "./onboarding-options"

const STEP_COUNT = 6

function AuthLoader() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white">
      <Loader2 className="h-7 w-7 animate-spin text-[#021b16]" />
    </main>
  )
}

export function OnboardingFlow() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()
  const supabase = createClient()

  const nextPath = useMemo(() => {
    const next = searchParams.get("next")
    return next && next.startsWith("/") ? next : "/dashboard/client"
  }, [searchParams])

  const [answers, setAnswers] = useState<OnboardingAnswers>(EMPTY_ANSWERS)
  const [step, setStep] = useState(0) // 0..5 questions, 6 = finish screen
  const [tried, setTried] = useState(false)
  const [saving, setSaving] = useState(false)
  const [finished, setFinished] = useState(false)

  // Gate: must be signed in; bounce already-onboarded users straight through.
  useEffect(() => {
    if (loading || finished) return
    if (!user) {
      router.replace(`/sign-in?next=${encodeURIComponent("/onboarding")}`)
      return
    }
    if (user.user_metadata?.onboarded_at) {
      router.replace(nextPath)
    }
  }, [loading, user, finished, nextPath, router])

  const set = (patch: Partial<OnboardingAnswers>) => setAnswers((a) => ({ ...a, ...patch }))

  const toggle = (key: "docTypes" | "destinations", id: string) =>
    setAnswers((a) => {
      const has = a[key].includes(id)
      return { ...a, [key]: has ? a[key].filter((x) => x !== id) : [...a[key], id] }
    })

  // Which steps must be answered before Continue (red asterisk on 0, 1, 5).
  const stepValid = (s: number): boolean => {
    if (s === 0) return answers.firstName.trim().length > 0
    if (s === 1) return Boolean(answers.role)
    if (s === 5) return Boolean(answers.heard)
    return true
  }

  const goNext = () => {
    if (!stepValid(step)) {
      setTried(true)
      return
    }
    setTried(false)
    setStep((s) => s + 1)
  }

  const goBack = () => {
    setTried(false)
    setStep((s) => Math.max(0, s - 1))
  }

  const handleEnter = async () => {
    if (!user) return
    setSaving(true)
    const full_name = `${answers.firstName.trim()} ${answers.lastName.trim()}`.trim()
    const { error } = await supabase.auth.updateUser({
      data: {
        onboarded_at: new Date().toISOString(),
        first_name: answers.firstName.trim(),
        last_name: answers.lastName.trim(),
        full_name,
        org_name: answers.orgName.trim(),
        role: answers.role,
        doc_types: answers.docTypes,
        volume: answers.volume,
        destinations: answers.destinations,
        referral_source: answers.heard,
        referral_other: answers.heardOther.trim(),
      },
    })
    if (full_name) {
      void supabase.from("profiles").update({ full_name }).eq("id", user.id)
    }
    if (error) {
      setSaving(false)
      toast.error("Couldn't save", { description: error.message })
      return
    }
    setFinished(true)
    router.replace(nextPath)
  }

  if (loading || !user) return <AuthLoader />

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="grid min-h-screen lg:grid-cols-[minmax(420px,0.9fr)_minmax(520px,1.1fr)]">
        <Atmosphere step={step} firstName={answers.firstName} />

        <section className="flex min-h-screen flex-col px-6 py-8 sm:px-10 lg:px-14">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <AppLogo className="h-9 w-auto" />
          </div>

          {step < STEP_COUNT ? (
            <ProgressHeader step={step} />
          ) : null}

          <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col justify-center py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                {step === 0 && <WelcomeStep answers={answers} set={set} tried={tried} />}
                {step === 1 && (
                  <PickStep
                    title="What do you do?"
                    required
                    tried={tried && !answers.role}
                    options={ROLES}
                    selected={answers.role ? [answers.role] : []}
                    onSelect={(id) => set({ role: id })}
                    columns={2}
                  />
                )}
                {step === 2 && (
                  <PickStep
                    title="What will you process?"
                    subtitle="Pick any. You can change this anytime."
                    multi
                    options={DOC_TYPES}
                    selected={answers.docTypes}
                    onSelect={(id) => toggle("docTypes", id)}
                    columns={2}
                  />
                )}
                {step === 3 && (
                  <PickStep
                    title="How much comes in?"
                    options={VOLUME}
                    selected={answers.volume ? [answers.volume] : []}
                    onSelect={(id) => set({ volume: id })}
                    variant="row"
                  />
                )}
                {step === 4 && (
                  <PickStep
                    title="Where should it land?"
                    subtitle="Pick any. You can connect these later."
                    multi
                    options={DESTINATIONS}
                    selected={answers.destinations}
                    onSelect={(id) => toggle("destinations", id)}
                    columns={2}
                  />
                )}
                {step === 5 && (
                  <HeardStep answers={answers} set={set} tried={tried && !answers.heard} />
                )}
                {step === STEP_COUNT && (
                  <FinishStep firstName={answers.firstName} saving={saving} onEnter={handleEnter} />
                )}
              </motion.div>
            </AnimatePresence>

            {step < STEP_COUNT && (
              <div className="mt-10 flex items-center justify-between">
                {step > 0 ? (
                  <Button variant="ghost" className="rounded-full px-3" onClick={goBack}>
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                ) : (
                  <span />
                )}

                <Button variant="ink" className="rounded-full px-7" onClick={goNext}>
                  {step === 5 ? "Finish" : "Continue"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

/* ----------------------------- Left atmosphere ---------------------------- */

function Atmosphere({ step, firstName }: { step: number; firstName: string }) {
  const second = step >= 3
  return (
    <aside className="relative hidden overflow-hidden border-r border-black/10 bg-white lg:flex">
      {/* The two ink landscapes on white, crossfading by phase */}
      {["/onboarding/backdrop-1.png", "/onboarding/backdrop-2.png"].map((src, i) => (
        <motion.div
          key={src}
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: (i === 1) === second ? 1 : 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        >
          <Image
            src={src}
            alt=""
            fill
            priority={i === 0}
            sizes="(min-width: 1024px) 45vw, 0vw"
            className="object-contain object-top"
          />
        </motion.div>
      ))}
      {/* white fade only at the bottom so the birds read boldly up top but the headline stays legible */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to top, #ffffff 20%, rgba(255,255,255,0) 50%)" }}
      />

      <div className="relative z-10 flex w-full flex-col justify-between px-12 py-12">
        <div className="self-start">
          <AppLogo className="h-8 w-auto" />
        </div>

        <div>
          <h2 className="max-w-[360px] text-[34px] font-semibold leading-[1.12] tracking-tight text-black">
            {firstName ? `Welcome aboard, ${firstName}.` : "Throw us the whole folder."}
          </h2>
          <div className="mt-8 flex items-center gap-2">
            {Array.from({ length: STEP_COUNT }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i <= Math.min(step, STEP_COUNT - 1) ? "w-7 bg-black" : "w-3 bg-black/20",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}

/* ------------------------------ Step chrome ------------------------------- */

function ProgressHeader({ step }: { step: number }) {
  const pct = ((step + 1) / STEP_COUNT) * 100
  return (
    <div className="mx-auto w-full max-w-[480px]">
      <div className="flex items-center justify-between text-[13px] font-semibold">
        <span className="text-black">Step {step + 1} of {STEP_COUNT}</span>
      </div>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-black/10">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "#317cff" }}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}

function StepHead({
  title,
  subtitle,
  required,
}: {
  title: string
  subtitle?: string
  required?: boolean
}) {
  return (
    <div className="mb-7">
      <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-black">
        {title}
        {required && <span className="text-red-500"> *</span>}
      </h1>
      {subtitle && <p className="mt-2 text-[15px] font-medium text-black/55">{subtitle}</p>}
    </div>
  )
}

/* -------------------------------- Steps ----------------------------------- */

function WelcomeStep({
  answers,
  set,
  tried,
}: {
  answers: OnboardingAnswers
  set: (p: Partial<OnboardingAnswers>) => void
  tried: boolean
}) {
  const missing = tried && !answers.firstName.trim()
  return (
    <div>
      <StepHead title="Let's set up your space" subtitle="Just a few quick questions." />

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-semibold">
              First name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="firstName"
              value={answers.firstName}
              onChange={(e) => set({ firstName: e.target.value })}
              placeholder="Alex"
              autoComplete="given-name"
              aria-invalid={missing}
              className={cn("h-11 rounded-md bg-card text-sm", missing && "border-red-500")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-semibold">
              Last name
            </Label>
            <Input
              id="lastName"
              value={answers.lastName}
              onChange={(e) => set({ lastName: e.target.value })}
              placeholder="Rivera"
              autoComplete="family-name"
              className="h-11 rounded-md bg-card text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="orgName" className="text-sm font-semibold">
            Business or firm name
          </Label>
          <Input
            id="orgName"
            value={answers.orgName}
            onChange={(e) => set({ orgName: e.target.value })}
            placeholder="Rivera Bookkeeping"
            className="h-11 rounded-md bg-card text-sm"
          />
        </div>

        {missing && <p className="text-sm font-medium text-red-500">Add your first name to continue.</p>}
      </div>
    </div>
  )
}

function PickStep({
  title,
  subtitle,
  required,
  tried,
  options,
  selected,
  onSelect,
  columns = 2,
  multi,
  variant = "card",
}: {
  title: string
  subtitle?: string
  required?: boolean
  tried?: boolean
  options: Option[]
  selected: string[]
  onSelect: (id: string) => void
  columns?: 1 | 2
  multi?: boolean
  variant?: "card" | "row"
}) {
  return (
    <div>
      <StepHead title={title} subtitle={subtitle} required={required} />
      {variant === "row" ? (
        <div className="space-y-3">
          {options.map((o) => (
            <RowCard key={o.id} option={o} active={selected.includes(o.id)} onClick={() => onSelect(o.id)} />
          ))}
        </div>
      ) : (
        <div className={cn("grid gap-3", columns === 2 ? "grid-cols-2" : "grid-cols-1")}>
          {options.map((o) => (
            <IconCard key={o.id} option={o} active={selected.includes(o.id)} onClick={() => onSelect(o.id)} />
          ))}
        </div>
      )}
      {tried && <p className="mt-4 text-sm font-medium text-red-500">Pick one to continue.</p>}
    </div>
  )
}

function HeardStep({
  answers,
  set,
  tried,
}: {
  answers: OnboardingAnswers
  set: (p: Partial<OnboardingAnswers>) => void
  tried: boolean
}) {
  const isOther = answers.heard === "other"
  return (
    <div>
      <StepHead title="How did you hear about us?" required />
      <div className="grid grid-cols-2 gap-3">
        {HEARD.map((o) => (
          <IconCard key={o.id} option={o} active={answers.heard === o.id} onClick={() => set({ heard: o.id })} />
        ))}
        <button
          type="button"
          onClick={() => set({ heard: "other" })}
          className={cn(
            "col-span-2 flex h-[52px] items-center justify-center rounded-xl border px-4 text-[15px] font-semibold transition-colors",
            isOther ? "border-[#10b981] bg-[#d1fae5]/50 text-black" : "border-black/12 bg-white text-black hover:border-black/30",
          )}
        >
          Something else
        </button>
      </div>

      {isOther && (
        <Input
          value={answers.heardOther}
          onChange={(e) => set({ heardOther: e.target.value })}
          placeholder="Where did you find us?"
          className="mt-3 h-11 rounded-md bg-card text-sm"
          autoFocus
        />
      )}

      {tried && <p className="mt-4 text-sm font-medium text-red-500">Pick one to continue.</p>}
    </div>
  )
}

function FinishStep({
  firstName,
  saving,
  onEnter,
}: {
  firstName: string
  saving: boolean
  onEnter: () => void
}) {
  return (
    <div className="text-center">
      <Image
        src="/onboarding/finish.png"
        alt=""
        width={640}
        height={640}
        className="mx-auto h-80 w-auto"
        priority
      />
      <h1 className="mt-4 text-[28px] font-semibold leading-tight tracking-tight text-black">
        {firstName ? `You're all set, ${firstName}.` : "You're all set."}
      </h1>
      <p className="mx-auto mt-3 max-w-[340px] text-[15px] font-medium text-black/55">
        Your workspace is ready. Throw us the whole folder.
      </p>
      <Button
        variant="ink"
        className="mt-8 h-12 rounded-full px-8"
        onClick={onEnter}
        disabled={saving}
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Enter AxLiner
        {!saving && <ArrowRight className="h-4 w-4" />}
      </Button>
    </div>
  )
}

/* ------------------------------ Option cards ------------------------------ */

function IconCard({ option, active, onClick }: { option: Option; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "group relative flex h-[120px] flex-col items-center justify-center gap-2 rounded-xl border px-3 text-center transition-all",
        active
          ? "border-[#10b981] bg-[#d1fae5]/40 shadow-[0_1px_3px_rgba(2,17,17,0.08)]"
          : "border-black/12 bg-white hover:border-black/30",
      )}
    >
      {active && (
        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#10b981] text-white">
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
      )}
      {option.icon ? (
        <Image src={option.icon} alt="" width={72} height={72} className="h-16 w-16 object-contain" />
      ) : null}
      <span className="text-[14px] font-semibold leading-tight text-black">{option.label}</span>
    </button>
  )
}

function RowCard({ option, active, onClick }: { option: Option; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex w-full items-center justify-between rounded-xl border px-5 py-4 text-left transition-all",
        active ? "border-[#10b981] bg-[#d1fae5]/40" : "border-black/12 bg-white hover:border-black/30",
      )}
    >
      <span>
        <span className="block text-[15px] font-semibold text-black">{option.label}</span>
        {option.hint && <span className="block text-[13px] font-medium text-black/50">{option.hint}</span>}
      </span>
      <span
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
          active ? "border-[#10b981] bg-[#10b981] text-white" : "border-black/25",
        )}
      >
        {active && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
    </button>
  )
}
