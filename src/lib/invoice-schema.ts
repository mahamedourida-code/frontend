/**
 * P10 — Multi-language invoice schema (the field-mapping layer).
 *
 * OCR already handles character recognition (layer 1). This module is layer 2:
 * mapping the extracted fields to the right localized labels so a French or
 * German invoice reads naturally in the review board ("TVA" not "VAT",
 * "Montant HT"/"Montant TTC" not "Net"/"Total"). No backend change — the
 * extracted data keys are unchanged; only the display labels adapt.
 */

export type InvoiceLanguage = "en" | "fr" | "de" | "es" | "it"

export const INVOICE_LANGUAGES: Array<{ value: InvoiceLanguage; label: string; flag: string }> = [
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "de", label: "Deutsch", flag: "🇩🇪" },
  { value: "es", label: "Español", flag: "🇪🇸" },
  { value: "it", label: "Italiano", flag: "🇮🇹" },
]

const LANGUAGE_NAME: Record<InvoiceLanguage, string> = {
  en: "English",
  fr: "French",
  de: "German",
  es: "Spanish",
  it: "Italian",
}

export function invoiceLanguageName(language: InvoiceLanguage): string {
  return LANGUAGE_NAME[language] || "English"
}

/**
 * Field label translations keyed by the extracted-data path. Falls back to the
 * English label when a translation is missing so nothing renders blank.
 */
const FIELD_LABELS: Record<string, Record<InvoiceLanguage, string>> = {
  // Invoice + receipt header fields
  vendor_name: { en: "Vendor", fr: "Fournisseur", de: "Lieferant", es: "Proveedor", it: "Fornitore" },
  invoice_number: { en: "Invoice no.", fr: "N° de facture", de: "Rechnungsnr.", es: "N.º de factura", it: "N. fattura" },
  invoice_date: { en: "Invoice date", fr: "Date de facture", de: "Rechnungsdatum", es: "Fecha de factura", it: "Data fattura" },
  due_date: { en: "Due date", fr: "Échéance", de: "Fälligkeitsdatum", es: "Vencimiento", it: "Scadenza" },
  subtotal: { en: "Subtotal", fr: "Montant HT", de: "Nettobetrag", es: "Base imponible", it: "Imponibile" },
  tax_vat_amount: { en: "Tax / VAT", fr: "TVA", de: "MwSt.", es: "IVA", it: "IVA" },
  total: { en: "Total", fr: "Montant TTC", de: "Gesamtbetrag", es: "Total", it: "Totale" },
  currency: { en: "Currency", fr: "Devise", de: "Währung", es: "Moneda", it: "Valuta" },
  merchant: { en: "Merchant", fr: "Commerçant", de: "Händler", es: "Comercio", it: "Esercente" },
  date: { en: "Date", fr: "Date", de: "Datum", es: "Fecha", it: "Data" },
  payment_method: { en: "Payment method", fr: "Mode de paiement", de: "Zahlungsart", es: "Método de pago", it: "Metodo di pagamento" },
  // Bank statement header fields
  account_holder: { en: "Account holder", fr: "Titulaire du compte", de: "Kontoinhaber", es: "Titular", it: "Intestatario" },
  bank_name: { en: "Bank", fr: "Banque", de: "Bank", es: "Banco", it: "Banca" },
  period: { en: "Period", fr: "Période", de: "Zeitraum", es: "Período", it: "Periodo" },
  opening_balance: { en: "Opening balance", fr: "Solde initial", de: "Anfangssaldo", es: "Saldo inicial", it: "Saldo iniziale" },
  closing_balance: { en: "Closing balance", fr: "Solde final", de: "Schlusssaldo", es: "Saldo final", it: "Saldo finale" },
}

/** Line-item / transaction column translations keyed by column path. */
const COLUMN_LABELS: Record<string, Record<InvoiceLanguage, string>> = {
  date: { en: "Date", fr: "Date", de: "Datum", es: "Fecha", it: "Data" },
  description: { en: "Description", fr: "Description", de: "Beschreibung", es: "Descripción", it: "Descrizione" },
  quantity: { en: "Quantity", fr: "Quantité", de: "Menge", es: "Cantidad", it: "Quantità" },
  unit_price: { en: "Unit price", fr: "Prix unitaire", de: "Einzelpreis", es: "Precio unit.", it: "Prezzo unit." },
  tax_rate: { en: "Tax rate", fr: "Taux TVA", de: "Steuersatz", es: "Tipo IVA", it: "Aliquota IVA" },
  line_total: { en: "Line total", fr: "Total ligne", de: "Zeilensumme", es: "Total línea", it: "Totale riga" },
  reference: { en: "Reference", fr: "Référence", de: "Referenz", es: "Referencia", it: "Riferimento" },
  debit: { en: "Debit", fr: "Débit", de: "Soll", es: "Débito", it: "Dare" },
  credit: { en: "Credit", fr: "Crédit", de: "Haben", es: "Crédito", it: "Avere" },
  balance: { en: "Balance", fr: "Solde", de: "Saldo", es: "Saldo", it: "Saldo" },
}

export function fieldLabel(path: string, language: InvoiceLanguage, fallback: string): string {
  return FIELD_LABELS[path]?.[language] || fallback
}

export function columnLabel(path: string, language: InvoiceLanguage, fallback: string): string {
  return COLUMN_LABELS[path]?.[language] || fallback
}

/**
 * Heuristic language detection over the extracted data. Returns a suggested
 * non-English language when distinctive tax/field tokens are present, or null.
 */
const DETECTION_TOKENS: Record<Exclude<InvoiceLanguage, "en">, string[]> = {
  fr: ["tva", "fournisseur", "montant ht", "montant ttc", " ht ", " ttc", "facture", "échéance", "devise"],
  de: ["mwst", "rechnung", "lieferant", "gesamtbetrag", "nettobetrag", "fälligkeit", "umsatzsteuer", "ust"],
  es: ["factura", "proveedor", "base imponible", "importe", "vencimiento", "i.v.a"],
  it: ["fattura", "fornitore", "imponibile", "aliquota", "scadenza", "totale fattura"],
}

export function detectInvoiceLanguage(data: unknown): InvoiceLanguage | null {
  let haystack = ""
  try {
    haystack = JSON.stringify(data || {}).toLowerCase()
  } catch {
    return null
  }
  if (!haystack) return null
  const scores: Record<string, number> = {}
  for (const [lang, tokens] of Object.entries(DETECTION_TOKENS)) {
    scores[lang] = tokens.reduce((count, token) => (haystack.includes(token) ? count + 1 : count), 0)
  }
  let best: InvoiceLanguage | null = null
  let bestScore = 0
  for (const [lang, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score
      best = lang as InvoiceLanguage
    }
  }
  // Require at least two distinctive hits to avoid false positives (e.g. "iva"
  // appears in both Spanish and Italian; a single token isn't enough).
  return bestScore >= 2 ? best : null
}

const STORAGE_KEY = "invoiceSchemaLanguage"
const AUTODETECT_KEY = "invoiceSchemaAutoDetect"

export function readInvoiceLanguage(): InvoiceLanguage {
  if (typeof window === "undefined") return "en"
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored && INVOICE_LANGUAGES.some((l) => l.value === stored)) {
    return stored as InvoiceLanguage
  }
  return "en"
}

export function writeInvoiceLanguage(language: InvoiceLanguage): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, language)
  window.dispatchEvent(new CustomEvent("invoice-schema-language", { detail: language }))
}

export function readInvoiceAutoDetect(): boolean {
  if (typeof window === "undefined") return true
  return window.localStorage.getItem(AUTODETECT_KEY) !== "false"
}

export function writeInvoiceAutoDetect(enabled: boolean): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(AUTODETECT_KEY, String(enabled))
}
