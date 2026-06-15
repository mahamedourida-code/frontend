import type { WorkspaceOutputMode } from "./types"

export function filenameStem(name?: string | null, fallback = "axliner_result") {
  const raw = (name || fallback).split(/[\\/]/).pop() || fallback
  const withoutExt = raw.replace(/\.[^/.]+$/, "").replace(/_processed$/i, "")
  const cleaned = withoutExt
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "")
  return cleaned || fallback
}

export function smartOutputFilename(file: any, index: number, sourceFiles: File[], outputMode: WorkspaceOutputMode) {
  const sourceName =
    file?.original_filename ||
    file?.original_image ||
    file?.source_filename ||
    file?.input_filename ||
    sourceFiles[index]?.name ||
    file?.filename ||
    `axliner_${index + 1}`
  const pageSuffix = file?.source_page ? `_page_${file.source_page}` : ""
  const returnedExtension = String(file?.filename || "").match(/\.(xlsx|csv|txt)$/i)?.[1]?.toLowerCase()
  const extension = returnedExtension || (outputMode === "text" ? "txt" : outputMode === "csv" ? "csv" : "xlsx")
  return `${filenameStem(sourceName, `axliner_${index + 1}`)}${pageSuffix}.${extension}`
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function reviewedFileExtension(blob: Blob, requested: "xlsx" | "csv" | "txt") {
  if (blob.type.startsWith("text/plain")) return "txt"
  if (blob.type.includes("csv")) return "csv"
  return requested
}

export function reviewedFilename(file: any, index: number, sourceFiles: File[], extension: string) {
  const sourceName =
    file?.original_filename ||
    file?.original_image ||
    file?.source_filename ||
    sourceFiles[index]?.name ||
    file?.filename ||
    `axliner_${index + 1}`
  const pageSuffix = file?.source_page ? `_page_${file.source_page}` : ""
  return `${filenameStem(sourceName, `axliner_${index + 1}`)}${pageSuffix}_reviewed.${extension}`
}
