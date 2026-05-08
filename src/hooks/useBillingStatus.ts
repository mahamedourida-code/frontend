"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  billingApi,
  ocrApi,
  type AppLimits,
  type BillingPlansResponse,
  type BillingStatusResponse,
} from "@/lib/api-client"

type CheckoutSyncState = "idle" | "active" | "pending" | "cancelled" | "failed"

type UseBillingStatusOptions = {
  enabled?: boolean
  loadStatus?: boolean
  loadPlans?: boolean
  loadLimits?: boolean
}

type RefreshOptions = {
  includeStatus?: boolean
  includePlans?: boolean
  includeLimits?: boolean
}

type BillingSnapshot = {
  status: BillingStatusResponse | null
  planCatalog: BillingPlansResponse | null
  limits: AppLimits | null
}

const paidPlans = new Set(["pro", "max", "mega", "business", "enterprise"])
const failedSubscriptionStates = new Set(["cancelled", "expired", "past_due", "unpaid"])

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function isPaidActive(status: BillingStatusResponse | null) {
  if (!status || !paidPlans.has(status.plan)) return false
  const subscriptionStatus = status.subscription?.status?.toLowerCase()
  return !subscriptionStatus || subscriptionStatus === "active" || subscriptionStatus === "on_trial"
}

function isFailedOrCancelled(status: BillingStatusResponse | null) {
  const subscriptionStatus = status?.subscription?.status?.toLowerCase()
  return Boolean(subscriptionStatus && failedSubscriptionStates.has(subscriptionStatus))
}

export function useBillingStatus({
  enabled = true,
  loadStatus = true,
  loadPlans = false,
  loadLimits = false,
}: UseBillingStatusOptions = {}) {
  const [billingStatus, setBillingStatus] = useState<BillingStatusResponse | null>(null)
  const [planCatalog, setPlanCatalog] = useState<BillingPlansResponse | null>(null)
  const [limits, setLimits] = useState<AppLimits | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(enabled && (loadStatus || loadPlans || loadLimits)))
  const [error, setError] = useState<string | null>(null)
  const [checkoutSyncState, setCheckoutSyncState] = useState<CheckoutSyncState>("idle")
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null)

  const refresh = useCallback(async (options: RefreshOptions = {}): Promise<BillingSnapshot | null> => {
    const shouldLoadStatus = options.includeStatus ?? loadStatus
    const shouldLoadPlans = options.includePlans ?? loadPlans
    const shouldLoadLimits = options.includeLimits ?? loadLimits

    if (!enabled || (!shouldLoadStatus && !shouldLoadPlans && !shouldLoadLimits)) {
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const statusPromise: Promise<BillingStatusResponse | null> = shouldLoadStatus
        ? billingApi.getStatus().catch(() => null)
        : Promise.resolve(null)
      const plansPromise: Promise<BillingPlansResponse | null> = shouldLoadPlans
        ? billingApi.getPlans().catch(() => null)
        : Promise.resolve(null)
      const limitsPromise: Promise<AppLimits | null> = shouldLoadLimits
        ? ocrApi.getLimits().catch(() => null)
        : Promise.resolve(null)
      const [status, plans, liveLimits] = await Promise.all([statusPromise, plansPromise, limitsPromise])

      if (status) setBillingStatus(status)
      if (plans) setPlanCatalog(plans)
      if (liveLimits) setLimits(liveLimits)
      setLastUpdatedAt(Date.now())

      return {
        status,
        planCatalog: plans,
        limits: liveLimits,
      }
    } catch (err: any) {
      setError(err?.detail || err?.message || "Billing is not available right now.")
      return null
    } finally {
      setIsLoading(false)
    }
  }, [enabled, loadLimits, loadPlans, loadStatus])

  const pollBillingStatus = useCallback(async ({
    timeoutMs = 30000,
    intervalMs = 2500,
  }: {
    timeoutMs?: number
    intervalMs?: number
  } = {}) => {
    if (!enabled) return { state: "pending" as CheckoutSyncState, status: billingStatus }

    setCheckoutSyncState("pending")
    const startedAt = Date.now()
    let latestStatus: BillingStatusResponse | null = null

    while (Date.now() - startedAt < timeoutMs) {
      const snapshot = await refresh({
        includeStatus: true,
        includePlans: false,
        includeLimits: true,
      })
      latestStatus = snapshot?.status || latestStatus

      if (isPaidActive(latestStatus)) {
        setCheckoutSyncState("active")
        return { state: "active" as CheckoutSyncState, status: latestStatus }
      }

      if (isFailedOrCancelled(latestStatus)) {
        setCheckoutSyncState("failed")
        return { state: "failed" as CheckoutSyncState, status: latestStatus }
      }

      await wait(intervalMs)
    }

    setCheckoutSyncState("pending")
    return { state: "pending" as CheckoutSyncState, status: latestStatus }
  }, [billingStatus, enabled, refresh])

  useEffect(() => {
    if (!enabled) return
    void refresh()
  }, [enabled, refresh])

  const credits = billingStatus?.credits || limits?.credits || null
  const plans = useMemo(() => planCatalog?.plans || [], [planCatalog])

  return {
    billingStatus,
    planCatalog,
    plans,
    limits,
    credits,
    isLoading,
    error,
    checkoutSyncState,
    setCheckoutSyncState,
    lastUpdatedAt,
    refresh,
    pollBillingStatus,
  }
}
