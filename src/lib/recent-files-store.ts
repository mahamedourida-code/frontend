// Session-scoped record of history items the user deleted in Activity, so any
// other list rendering the same data (e.g. the dashboard "Recent files" panel)
// can hide them immediately — even when its own copy is still served from the
// Next.js router cache after navigating back, before it refetches.

const deletedIds = new Set<string>()
const listeners = new Set<() => void>()

export function markHistoryItemsDeleted(ids: Array<string | undefined | null>) {
  let changed = false
  for (const id of ids) {
    if (id && !deletedIds.has(id)) {
      deletedIds.add(id)
      changed = true
    }
  }
  if (changed) listeners.forEach((listener) => listener())
}

export function unmarkHistoryItemsDeleted(ids: Array<string | undefined | null>) {
  let changed = false
  for (const id of ids) {
    if (id && deletedIds.delete(id)) changed = true
  }
  if (changed) listeners.forEach((listener) => listener())
}

export function isHistoryItemDeleted(id: string) {
  return deletedIds.has(id)
}

/** True when ANY of the row's id variants has been optimistically deleted. */
export function isAnyHistoryItemDeleted(ids: Array<string | undefined | null>) {
  return ids.some((id) => Boolean(id) && deletedIds.has(id as string))
}

export function subscribeHistoryDeletions(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
