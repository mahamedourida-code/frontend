/**
 * Pure helpers for bank-statement reconciliation. Designed to run on the
 * client over the extracted structured data — no network calls, no I/O.
 *
 * Positioning: at the price point AxLiner targets, no other tool runs a
 * balance check on *extracted* statement data (Xero/JAX only reconcile
 * imported live feeds). This is the verification step that converts a
 * spreadsheet of rows into a trust signal.
 */

export type ReconciliationStatus = "balanced" | "off" | "insufficient_data"

export type ReconciliationResult = {
  status: ReconciliationStatus
  openingBalance: number | null
  reportedClosing: number | null
  totalDebits: number
  totalCredits: number
  calculatedClosing: number | null
  difference: number | null
  rowCount: number
  /** Rough heuristic: difference divided by the median transaction amount. */
  estimatedMissingRows: number | null
  currency: string | null
}

type BankRow = Record<string, unknown> | null | undefined

type StatementData = {
  opening_balance?: unknown
  closing_balance?: unknown
  currency?: unknown
  transactions?: unknown
} | null | undefined

/** Tolerance used for "balanced" comparison — 1 cent. */
const BALANCE_TOLERANCE = 0.01

/**
 * Parse a numeric amount written in a wide range of human/locale formats.
 *
 * Handles:
 *   - currency symbols ($, €, £, ¥, etc.) and arbitrary letters
 *   - thousands separators (comma or dot or apostrophe)
 *   - European decimal commas ("1.234,56" → 1234.56)
 *   - accounting parentheses ("(1,234.56)" → -1234.56)
 *   - trailing minus ("1234.56-" → -1234.56)
 *   - explicit DR/CR suffixes ("1234.56 DR" → -1234.56)
 */
export function parseAmount(input: unknown): number | null {
  if (input === null || input === undefined) return null
  if (typeof input === "number") {
    return Number.isFinite(input) ? input : null
  }
  let raw = String(input).trim()
  if (!raw) return null

  let negative = false

  // Accounting parentheses
  if (raw.startsWith("(") && raw.endsWith(")")) {
    negative = true
    raw = raw.slice(1, -1)
  }

  // Trailing minus
  if (raw.endsWith("-")) {
    negative = true
    raw = raw.slice(0, -1)
  }

  // DR / CR suffixes (case-insensitive)
  const upper = raw.toUpperCase()
  if (upper.endsWith("DR") || upper.endsWith("DB")) {
    negative = true
    raw = raw.slice(0, -2)
  } else if (upper.endsWith("CR")) {
    raw = raw.slice(0, -2)
  }

  // Strip everything except digits, separators, and the sign
  let cleaned = raw.replace(/[^\d.,\-]/g, "").trim()
  if (!cleaned) return null

  // Resolve leading minus
  if (cleaned.startsWith("-")) {
    negative = !negative
    cleaned = cleaned.slice(1)
  }

  // Detect European vs US decimal: if both "." and "," appear, the rightmost
  // separator is the decimal point. If only one appears and it groups 3-digit
  // chunks repeatedly, treat it as a thousands separator.
  const lastDot = cleaned.lastIndexOf(".")
  const lastComma = cleaned.lastIndexOf(",")

  if (lastDot >= 0 && lastComma >= 0) {
    if (lastComma > lastDot) {
      // European: 1.234,56
      cleaned = cleaned.replace(/\./g, "").replace(",", ".")
    } else {
      // US: 1,234.56
      cleaned = cleaned.replace(/,/g, "")
    }
  } else if (lastComma >= 0) {
    // Only comma — could be decimal or thousands.
    const afterComma = cleaned.length - lastComma - 1
    if (afterComma === 3 && /,\d{3}$/.test(cleaned)) {
      // Looks like thousands grouping ("1,234")
      cleaned = cleaned.replace(/,/g, "")
    } else {
      cleaned = cleaned.replace(",", ".")
    }
  } else {
    // Only dot — could be decimal or thousands.
    const afterDot = cleaned.length - lastDot - 1
    if (lastDot >= 0 && afterDot === 3 && /\.\d{3}$/.test(cleaned) && cleaned.split(".").length > 2) {
      cleaned = cleaned.replace(/\./g, "")
    }
  }

  const value = Number(cleaned)
  if (!Number.isFinite(value)) return null
  return negative ? -value : value
}

function median(values: number[]): number | null {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

/**
 * Run the reconciliation pass over a bank statement structured payload.
 *
 * Convention: a transaction row's `debit` reduces the balance; `credit`
 * increases it. So:
 *   calculatedClosing = openingBalance + totalCredits - totalDebits
 *   difference        = reportedClosing - calculatedClosing
 */
export function reconcileBankStatement(data: StatementData): ReconciliationResult {
  const openingBalance = parseAmount(data?.opening_balance)
  const reportedClosing = parseAmount(data?.closing_balance)
  const transactions = Array.isArray(data?.transactions)
    ? (data!.transactions as BankRow[])
    : []

  const currency = typeof data?.currency === "string" ? data.currency : null

  let totalDebits = 0
  let totalCredits = 0
  const magnitudes: number[] = []

  for (const row of transactions) {
    if (!row || typeof row !== "object") continue
    const debit = parseAmount((row as Record<string, unknown>).debit)
    const credit = parseAmount((row as Record<string, unknown>).credit)
    if (debit !== null && Math.abs(debit) > 0) {
      const value = Math.abs(debit)
      totalDebits += value
      magnitudes.push(value)
    }
    if (credit !== null && Math.abs(credit) > 0) {
      const value = Math.abs(credit)
      totalCredits += value
      magnitudes.push(value)
    }
  }

  const rowCount = transactions.length

  if (openingBalance === null || reportedClosing === null || rowCount === 0) {
    return {
      status: "insufficient_data",
      openingBalance,
      reportedClosing,
      totalDebits,
      totalCredits,
      calculatedClosing: openingBalance !== null ? openingBalance + totalCredits - totalDebits : null,
      difference: null,
      rowCount,
      estimatedMissingRows: null,
      currency,
    }
  }

  const calculatedClosing = openingBalance + totalCredits - totalDebits
  const difference = reportedClosing - calculatedClosing

  const balanced = Math.abs(difference) <= BALANCE_TOLERANCE

  let estimatedMissingRows: number | null = null
  if (!balanced) {
    const med = median(magnitudes)
    if (med && med > 0) {
      const est = Math.round(Math.abs(difference) / med)
      estimatedMissingRows = Math.max(1, est)
    }
  }

  return {
    status: balanced ? "balanced" : "off",
    openingBalance,
    reportedClosing,
    totalDebits,
    totalCredits,
    calculatedClosing,
    difference,
    rowCount,
    estimatedMissingRows,
    currency,
  }
}

/** Format a number for the panel, respecting the statement's currency. */
export function formatAmount(value: number | null, currency: string | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—"
  const abs = Math.abs(value)
  const formatted = abs.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const signed = value < 0 ? `-${formatted}` : formatted
  if (!currency) return signed
  // Place currency code as a trailing symbol when it's a 3-letter ISO code,
  // otherwise lead with it.
  const trimmed = currency.trim()
  if (/^[A-Za-z]{3}$/.test(trimmed)) {
    return `${signed} ${trimmed.toUpperCase()}`
  }
  return `${trimmed}${signed}`
}
