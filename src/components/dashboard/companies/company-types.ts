export type CompanySummary = {
  id: string
  name: string
  quickbooksConnected: boolean
  quickbooksCompanyName: string | null
  accountingProvider: "quickbooks" | "xero"
  accountingConnected: boolean
  accountingCompanyName: string | null
  purchases: number
  receipts: number
  bankStatements: number
  other: number
  needsReview: number
  bills: number
  lastUploadAt: string | null
}

type UnknownRecord = Record<string, unknown>

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? value as UnknownRecord : {}
}

function firstNumber(...values: unknown[]): number {
  const match = values.find((value) => typeof value === "number" && Number.isFinite(value))
  return typeof match === "number" ? match : 0
}

function firstString(...values: unknown[]): string | null {
  const match = values.find((value) => typeof value === "string" && value.trim())
  return typeof match === "string" ? match : null
}

export function normalizeCompany(value: unknown): CompanySummary {
  const company = record(value)
  const counts = record(company.document_counts || company.counts)
  const quickbooks = record(company.quickbooks)

  return {
    id: String(company.id || company.company_id || ""),
    name: firstString(company.name, company.company_name) || "Untitled client",
    quickbooksConnected: Boolean(company.quickbooks_connected ?? quickbooks.connected),
    quickbooksCompanyName: firstString(company.quickbooks_company_name, quickbooks.company_name),
    accountingProvider: company.accounting_destination === "xero" ? "xero" : "quickbooks",
    accountingConnected: Boolean(company.accounting_connected ?? company.quickbooks_connected ?? quickbooks.connected),
    accountingCompanyName: firstString(company.accounting_company_name, company.quickbooks_company_name, quickbooks.company_name),
    purchases: firstNumber(company.purchases, company.purchase_count, counts.purchases),
    receipts: firstNumber(company.receipts, company.receipt_count, counts.receipts),
    bankStatements: firstNumber(company.bank_statements, company.bank_statement_count, counts.bank_statements),
    other: firstNumber(company.other, company.other_count, counts.other),
    needsReview: firstNumber(company.needs_review, company.needs_review_count, counts.needs_review),
    bills: firstNumber(company.bills, company.bill_count, counts.bills),
    lastUploadAt: firstString(company.last_upload_at, company.last_submission_at),
  }
}

export function companiesFromResponse(response: unknown): CompanySummary[] {
  const payload = record(response)
  const companies = Array.isArray(response)
    ? response
    : Array.isArray(payload.companies)
      ? payload.companies
      : Array.isArray(payload.items)
        ? payload.items
        : []

  return companies.map(normalizeCompany).filter((company) => company.id)
}

export function companyFromResponse(response: unknown): CompanySummary {
  const payload = record(response)
  return normalizeCompany(payload.company || response)
}
