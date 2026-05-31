"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useProcessingState } from "@/contexts/ProcessingStateContext"

/**
 * Client-side notifications store for the B3 notifications bell.
 *
 * There is no backend notifications endpoint / table (and the task explicitly
 * says not to add one). Instead we derive notifications from the same
 * client-side signals the app already raises:
 *   - ProcessingStateContext → "job finished" / "results ready"
 *   - a lightweight `axliner:notify` window event → any other producer
 *     (duplicate detected, QuickBooks token expiring, client uploaded) can
 *     surface a notification by dispatching the event alongside its toast,
 *     without coupling to this module.
 *
 * Everything lives in memory + localStorage (read state survives reloads).
 * Degrades gracefully to an empty "You're all caught up" state.
 */

export type NotificationGroup =
  | "job_finished"
  | "duplicate_detected"
  | "quickbooks_token"
  | "client_uploaded"

export type AppNotification = {
  id: string
  group: NotificationGroup
  title: string
  preview: string
  href: string
  /** epoch ms */
  createdAt: number
  read: boolean
}

export type NotifyPayload = {
  group: NotificationGroup
  title: string
  preview: string
  href?: string
  /** stable key — repeat dispatches with the same dedupeKey are ignored */
  dedupeKey?: string
}

const READ_STORAGE_KEY = "axliner_notifications_read_v1"
const NOTIFY_EVENT = "axliner:notify"
const MAX_ITEMS = 40

const DEFAULT_HREF: Record<NotificationGroup, string> = {
  job_finished: "/dashboard/client",
  duplicate_detected: "/dashboard/client",
  quickbooks_token: "/dashboard/integrations",
  client_uploaded: "/dashboard/inbox",
}

/**
 * Fire a notification from anywhere in the app (alongside an existing toast):
 *   notify({ group: "duplicate_detected", title: "Possible duplicate", preview: "Acme #1042 matches May 3", href: "/dashboard/client" })
 */
export function notify(payload: NotifyPayload) {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent<NotifyPayload>(NOTIFY_EVENT, { detail: payload }))
}

function loadReadSet(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    return new Set(Array.isArray(parsed) ? parsed : [])
  } catch {
    return new Set()
  }
}

function persistReadSet(ids: Set<string>) {
  if (typeof window === "undefined") return
  try {
    // keep the read-set bounded so it can't grow forever
    const trimmed = Array.from(ids).slice(-200)
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(trimmed))
  } catch {
    /* storage full / unavailable — read state is best-effort */
  }
}

export function useNotifications() {
  const { state: processingState } = useProcessingState()
  const [items, setItems] = useState<AppNotification[]>([])
  const readRef = useRef<Set<string>>(new Set())
  const seenKeysRef = useRef<Set<string>>(new Set())

  // hydrate the read-set once
  useEffect(() => {
    readRef.current = loadReadSet()
  }, [])

  const addItem = useCallback((next: Omit<AppNotification, "read">) => {
    const isRead = readRef.current.has(next.id)
    setItems((prev) => {
      if (prev.some((n) => n.id === next.id)) return prev
      const merged = [{ ...next, read: isRead }, ...prev]
      return merged.slice(0, MAX_ITEMS)
    })
  }, [])

  // ── Source 1: processing lifecycle ────────────────────────────────
  useEffect(() => {
    if (
      processingState.processingComplete &&
      processingState.processedFiles.length > 0 &&
      processingState.jobId
    ) {
      const count = processingState.processedFiles.length
      addItem({
        id: `job-${processingState.jobId}`,
        group: "job_finished",
        title: "Batch finished",
        preview: `${count} document${count === 1 ? "" : "s"} ready for review`,
        href: "/dashboard/client",
        createdAt: processingState.lastUpdated || Date.now(),
      })
    }
  }, [
    processingState.processingComplete,
    processingState.processedFiles.length,
    processingState.jobId,
    processingState.lastUpdated,
    addItem,
  ])

  // ── Source 2: `axliner:notify` window events ──────────────────────
  useEffect(() => {
    const onNotify = (event: Event) => {
      const detail = (event as CustomEvent<NotifyPayload>).detail
      if (!detail?.group || !detail?.title) return
      const key = detail.dedupeKey || `${detail.group}:${detail.title}:${detail.preview}`
      if (seenKeysRef.current.has(key)) return
      seenKeysRef.current.add(key)
      addItem({
        id: `evt-${key}`,
        group: detail.group,
        title: detail.title,
        preview: detail.preview,
        href: detail.href || DEFAULT_HREF[detail.group],
        createdAt: Date.now(),
      })
    }
    window.addEventListener(NOTIFY_EVENT, onNotify)
    return () => window.removeEventListener(NOTIFY_EVENT, onNotify)
  }, [addItem])

  const markAllRead = useCallback(() => {
    setItems((prev) => {
      prev.forEach((n) => readRef.current.add(n.id))
      persistReadSet(readRef.current)
      return prev.map((n) => (n.read ? n : { ...n, read: true }))
    })
  }, [])

  const markRead = useCallback((id: string) => {
    setItems((prev) => {
      if (!prev.some((n) => n.id === id && !n.read)) return prev
      readRef.current.add(id)
      persistReadSet(readRef.current)
      return prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    })
  }, [])

  const sorted = useMemo(
    () => [...items].sort((a, b) => b.createdAt - a.createdAt),
    [items]
  )
  const unread = useMemo(() => sorted.filter((n) => !n.read), [sorted])

  return {
    items: sorted,
    unread,
    unreadCount: unread.length,
    markAllRead,
    markRead,
  }
}
