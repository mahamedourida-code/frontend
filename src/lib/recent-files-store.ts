// Durable record of history items the user deleted, so every list rendering the
// same data (Activity, the dashboard "Recent files" panel) hides them instantly
// — and KEEPS hiding them across a full page reload, not just within the current
// session. Persisted to localStorage and reconciled against what the server
// actually returns so the set self-heals (a confirmed-gone id is dropped; an id
// the server still returns stays hidden until the backend catches up).

const STORAGE_KEY = "axliner:deleted-history-ids"

function loadInitial(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
      ? new Set(parsed.filter((value): value is string => typeof value === "string"))
      : new Set()
  } catch {
    return new Set()
  }
}

const deletedIds = loadInitial()
const listeners = new Set<() => void>()

function persist() {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...deletedIds]))
  } catch {
    // localStorage can be unavailable (private mode, quota) — hiding still works
    // in-memory for the current session, so this is non-fatal.
  }
}

function notify() {
  listeners.forEach((listener) => listener())
}

export function markHistoryItemsDeleted(ids: Array<string | undefined | null>) {
  let changed = false
  for (const id of ids) {
    if (id && !deletedIds.has(id)) {
      deletedIds.add(id)
      changed = true
    }
  }
  if (changed) {
    persist()
    notify()
  }
}

export function unmarkHistoryItemsDeleted(ids: Array<string | undefined | null>) {
  let changed = false
  for (const id of ids) {
    if (id && deletedIds.delete(id)) changed = true
  }
  if (changed) {
    persist()
    notify()
  }
}

export function isHistoryItemDeleted(id: string) {
  return deletedIds.has(id)
}

/** True when ANY of the row's id variants has been optimistically deleted. */
export function isAnyHistoryItemDeleted(ids: Array<string | undefined | null>) {
  return ids.some((id) => Boolean(id) && deletedIds.has(id as string))
}

/**
 * Reconcile the local deleted set against the ids the server just returned.
 * Any locally-deleted id the server NO LONGER returns is confirmed gone, so we
 * drop it (keeps the set from growing without bound). Ids the server still
 * returns are kept hidden — the delete hasn't taken effect yet. Call this after
 * every history fetch with the full set of id variants from the response.
 */
export function reconcileHistoryDeletions(presentIds: Iterable<string | undefined | null>) {
  if (deletedIds.size === 0) return
  const present = new Set<string>()
  for (const id of presentIds) if (id) present.add(id)
  let changed = false
  for (const id of [...deletedIds]) {
    if (!present.has(id)) {
      deletedIds.delete(id)
      changed = true
    }
  }
  if (changed) {
    persist()
    notify()
  }
}

export function subscribeHistoryDeletions(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
