"use client"

import { toast } from "sonner"

type ErrorActionContext = {
  isAuthenticated?: boolean
  onSignIn?: () => void
  onRetry?: () => void
  upgradeHref?: string
  billingHref?: string
  supportHref?: string
}

type ErrorAction = {
  label: string
  onClick: () => void
}

type ErrorUi = {
  title: string
  description: string
  action?: ErrorAction
}

function readValue(error: any, key: string): any {
  return error?.[key] ?? error?.detail?.[key] ?? error?.response?.data?.[key] ?? error?.response?.data?.detail?.[key]
}

function getStatus(error: any): number {
  return Number(error?.status_code ?? error?.status ?? error?.response?.status ?? 0)
}

function getCode(error: any): string {
  return String(readValue(error, "code") || "").toUpperCase()
}

function getMessage(error: any): string {
  const detail = error?.detail
  if (typeof detail === "string") return detail
  return String(error?.message || error?.response?.data?.message || "Something went wrong.")
}

function goTo(href: string) {
  if (typeof window !== "undefined") {
    window.location.href = href
  }
}

function formatRetry(error: any): string {
  const retryAfter = readValue(error, "retry_after") ?? readValue(error, "retry_after_seconds")
  const seconds = Number(retryAfter)
  if (!Number.isFinite(seconds) || seconds <= 0) return "Wait a moment, then retry the batch."
  if (seconds < 60) return `Try again in about ${Math.ceil(seconds)} seconds.`
  return `Try again in about ${Math.ceil(seconds / 60)} minutes.`
}

function formatMaxSize(error: any): string {
  const mb = readValue(error, "max_file_size_mb") ?? readValue(error, "max_size_mb")
  const bytes = readValue(error, "max_file_size_bytes") ?? readValue(error, "max_size_bytes")
  if (mb) return `Maximum file size is ${mb} MB.`
  if (bytes) return `Maximum file size is ${Math.round(Number(bytes) / 1024 / 1024)} MB.`
  return "Compress the image or upload a smaller file."
}

export function getApiErrorUi(error: any, context: ErrorActionContext = {}): ErrorUi {
  const status = getStatus(error)
  const code = getCode(error)
  const message = getMessage(error)
  const upgradeHref = context.upgradeHref || "/pricing?from=credits"
  const billingHref = context.billingHref || "/dashboard/settings?section=billing"
  const supportHref = context.supportHref || "mailto:support@axliner.com"

  if (
    status === 402 ||
    code === "INSUFFICIENT_CREDITS" ||
    code === "DAILY_IMAGE_LIMIT_EXCEEDED" ||
    code === "ANONYMOUS_FREE_TRIAL_LIMIT_REACHED"
  ) {
    if (!context.isAuthenticated) {
      return {
        title: "Free trial limit reached",
        description: "Create an account, then choose a Lemon Squeezy plan when you need more pages.",
        action: context.onSignIn
          ? { label: "Create account", onClick: context.onSignIn }
          : { label: "Create account", onClick: () => goTo(`/sign-up?next=${encodeURIComponent(upgradeHref)}`) },
      }
    }

    const billingIssue = code.includes("PAST_DUE") || code.includes("PAYMENT") || code.includes("SUBSCRIPTION")

    return {
      title: "Not enough credits",
      description: `${message} Upgrade for more pages, or manage billing if your subscription is already active.`,
      action: {
        label: billingIssue ? "Manage billing" : "Upgrade plan",
        onClick: () => goTo(billingIssue ? billingHref : upgradeHref),
      },
    }
  }

  if (status === 429 || code.includes("RATE_LIMIT") || code.includes("QUEUE")) {
    return {
      title: code.includes("QUEUE") ? "Queue is full" : "Too many requests",
      description: formatRetry(error),
      action: context.onRetry ? { label: "Retry", onClick: context.onRetry } : undefined,
    }
  }

  if (status === 413 || code.includes("FILE_TOO_LARGE") || code.includes("MAX_FILE_SIZE")) {
    return {
      title: "File is too large",
      description: formatMaxSize(error),
    }
  }

  if (status === 401) {
    return {
      title: "Sign in again",
      description: "Your session expired before the request could finish.",
      action: context.onSignIn
        ? { label: "Sign in", onClick: context.onSignIn }
        : { label: "Sign in", onClick: () => goTo(`/sign-in?next=${encodeURIComponent(window.location.pathname + window.location.search)}`) },
    }
  }

  if (status >= 500) {
    return {
      title: "Server is busy",
      description: "Your files are not charged as completed. Retry later, or contact support if this repeats.",
      action: context.onRetry
        ? { label: "Retry", onClick: context.onRetry }
        : { label: "Support", onClick: () => goTo(supportHref) },
    }
  }

  if (code === "PLAN_BATCH_LIMIT_EXCEEDED" || code === "ABSOLUTE_BATCH_LIMIT_EXCEEDED") {
    return {
      title: "Reduce batch size",
      description: message,
      action: { label: "See plans", onClick: () => goTo(upgradeHref) },
    }
  }

  return {
    title: "Upload failed",
    description: message,
    action: context.onRetry ? { label: "Retry", onClick: context.onRetry } : undefined,
  }
}

export function showApiErrorToast(error: any, context: ErrorActionContext = {}) {
  const ui = getApiErrorUi(error, context)
  toast.error(ui.title, {
    description: ui.description,
    action: ui.action,
  })
}

export function showBatchLimitToast(maxFiles: number, context: ErrorActionContext = {}) {
  const upgradeHref = context.upgradeHref || "/pricing?from=batch-limit"
  toast.error("Reduce batch size", {
    description: `Your current plan allows up to ${maxFiles} images per batch.`,
    action: {
      label: "See plans",
      onClick: () => goTo(upgradeHref),
    },
  })
}
