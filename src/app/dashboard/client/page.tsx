"use client"

import { Suspense, useState, useCallback, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useOCR } from "@/hooks/useOCR"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { accountsPayableApi, ocrApi, quickBooksApi } from "@/lib/api-client"
import type {
  AppLimits,
  DocumentMode,
  JobDocumentRecord,
  ProcessedFile,
  QuickBooksConnectionStatus,
  QuickBooksReferenceItem,
  ReceiptQuickBooksPublishRequest,
  RecoverableJobSummary,
  ResolvedDocumentMode,
  VendorRuleFields,
} from "@/lib/api-client"
import { getApiErrorUi, showApiErrorToast, showBatchLimitToast } from "@/lib/api-error-ui"
import { DashboardShell } from "@/components/DashboardShell"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { WorkspaceFilesPanel } from "@/components/dashboard/WorkspaceFilesPanel"
import { useBillingStatus } from "@/hooks/useBillingStatus"
import {
  ConversionWorkspace,
  type WorkspaceBanner,
} from "@/components/dashboard/ConversionWorkspace"
import {
  CheckCircle,
  Link,
  Copy,
  MessageCircle,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
// Removed react-share imports as we're using custom implementations for direct messaging
import { Input } from "@/components/ui/input"
import { wakeUpBackendSilently } from "@/lib/backend-health"
import { useProcessingState } from "@/contexts/ProcessingStateContext"
import { buildDownloadUrl, buildMessengerShareUrl } from "@/lib/public-config"
import {
  createPdfFirstPageScreenshot,
  getPdfPageCount,
  isAcceptedUploadFile,
  isPdfFile,
} from "@/lib/upload-files"

function ProcessImagesFallback() {
  return <DashboardRouteLoader label="Loading conversion workspace" />
}

function filenameStem(name?: string | null, fallback = "axliner_result") {
  const raw = (name || fallback).split(/[\\/]/).pop() || fallback
  const withoutExt = raw.replace(/\.[^/.]+$/, "").replace(/_processed$/i, "")
  const cleaned = withoutExt
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "")
  return cleaned || fallback
}

type WorkspaceOutputMode = "table" | "text" | "csv"

function smartOutputFilename(file: any, index: number, sourceFiles: File[], outputMode: WorkspaceOutputMode) {
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

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function reviewedFileExtension(blob: Blob, requested: "xlsx" | "csv" | "txt") {
  if (blob.type.startsWith("text/plain")) return "txt"
  if (blob.type.includes("csv")) return "csv"
  return requested
}

function reviewedFilename(file: any, index: number, sourceFiles: File[], extension: string) {
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

type ResultPreview = {
  table: any[][]
  text: string
  loading?: boolean
}

type ResultSourceTrace = {
  document_id: string
  original_filename: string
  input_preview_url?: string
  source_page?: number | null
  source_page_count?: number | null
}

type DurableWorkspaceResultFile = Partial<ProcessedFile> & {
  filename: string
  original_filename?: string
  document_id: string
}

type ConversionDocumentMode = DocumentMode

export default function ProcessImagesPage() {
  return (
    <Suspense fallback={<ProcessImagesFallback />}>
      <ProcessImagesContent documentMode="table" />
    </Suspense>
  )
}

export function ProcessImagesContent({ documentMode = "table" }: { documentMode?: ConversionDocumentMode }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get state management from context
  const { state: processingState, updateState, clearState } = useProcessingState()
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [limits, setLimits] = useState<AppLimits | null>(null)
  const maxUploadFiles = limits?.max_files_per_batch ?? 5
  const [filePreviewUrls, setFilePreviewUrls] = useState<{[key: number]: string}>({})
  const [pdfPageCounts, setPdfPageCounts] = useState<{[key: number]: number}>({})
  const [workspaceBanner, setWorkspaceBanner] = useState<WorkspaceBanner | null>(null)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [selectedFileToShare, setSelectedFileToShare] = useState<any>(null)
  const [selectedFilesForBatch, setSelectedFilesForBatch] = useState<any[]>([])
  const [shareSession, setShareSession] = useState<any>(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const [creditLoading, setCreditLoading] = useState(false) // Start with false, set to true when fetching
  const [autoDownload, setAutoDownload] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('autoDownload')
      return saved === 'true'
    }
    return false
  })
  const [autoSave, setAutoSave] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('autoSave')
      return saved === 'true'
    }
    return false
  })

  const [tablePreviewData, setTablePreviewData] = useState<any[][]>([])
  const [textPreview, setTextPreview] = useState('')
  const [resultPreviews, setResultPreviews] = useState<Record<string, ResultPreview>>({})
  const resultPreviewsRef = useRef<Record<string, ResultPreview>>({})
  const [resultSourceTrace, setResultSourceTrace] = useState<Record<string, ResultSourceTrace>>({})
  const [jobDocuments, setJobDocuments] = useState<JobDocumentRecord[]>([])
  const [quickBooksConnection, setQuickBooksConnection] = useState<QuickBooksConnectionStatus | null>(null)
  const [quickBooksReferences, setQuickBooksReferences] = useState<QuickBooksReferenceItem[]>([])
  const [overridingDocumentId, setOverridingDocumentId] = useState<string | null>(null)
  const [firstImageUrl, setFirstImageUrl] = useState<string>('')
  const [activePreviewFileId, setActivePreviewFileId] = useState<string>('')
  const [outputMode, setOutputMode] = useState<WorkspaceOutputMode>(documentMode === "notes" ? "text" : "table")
  const [activeDocumentMode, setActiveDocumentMode] = useState<ConversionDocumentMode>(documentMode)
  const reviewedExportFormat: "xlsx" | "csv" | "txt" =
    activeDocumentMode === "notes" && outputMode === "text"
      ? "txt"
      : outputMode === "csv"
        ? "csv"
        : "xlsx"
  const {
    limits: entitlementLimits,
    credits: entitlementCredits,
    refresh: refreshBilling,
  } = useBillingStatus({
    enabled: Boolean(user && !authLoading),
    loadStatus: true,
    loadLimits: true,
  })

  // Track if auto-actions have been executed for current job to prevent duplicates
  const autoActionsExecutedRef = useRef<string | null>(null)
  const isExecutingAutoActionsRef = useRef(false)
  const lastCreditRefreshRef = useRef<string | null>(null)

  const fetchUserStats = async () => {
    if (!user?.id) {
      setCreditLoading(false)
      return
    }

    try {
      const snapshot = await refreshBilling({
        includeStatus: true,
        includePlans: false,
        includeLimits: true,
      })
      if (snapshot?.limits) setLimits(snapshot.limits)
      
      
    } catch (error) {
    } finally {
      setCreditLoading(false)
    }
  }

  const {
    isUploading,
    isProcessing,
    uploadProgress,
    status,
    progress,
    files: resultFiles,
    error: ocrError,
    uploadBatch,
    downloadFile,
    saveToHistory,
    connectWebSocket,
    resumeJob,
    cancelProcessing,
    reset,
    isSaving,
    isSaved,
    jobId
  } = useOCR()
  const [latestRecoverableJob, setLatestRecoverableJob] = useState<RecoverableJobSummary | null>(null)
  const [recoveryLoading, setRecoveryLoading] = useState(false)
  const openedJobIdRef = useRef<string | null>(null)

  useEffect(() => {
    setActiveDocumentMode(documentMode)
    setOutputMode(documentMode === 'notes' ? 'text' : 'table')
  }, [documentMode])

  useEffect(() => {
    if (!ocrError) return
    setWorkspaceBanner({
      title: "Processing failed",
      description: ocrError,
      tone: "error",
    })
  }, [ocrError])

  // Silently wake up backend when page loads
  useEffect(() => {
    wakeUpBackendSilently()
  }, [])

  useEffect(() => {
    if (entitlementLimits) setLimits(entitlementLimits)
  }, [entitlementLimits])

  useEffect(() => {
    setUploadedFiles(prev => prev.length > maxUploadFiles ? prev.slice(0, maxUploadFiles) : prev)
  }, [maxUploadFiles])

  useEffect(() => {
    if (authLoading || !user) return

    let mounted = true
    ocrApi.getLatestRecoverableJob()
      .then((data) => {
        if (!mounted) return
        const job = data.job
        setLatestRecoverableJob(job?.active ? job : null)
      })
      .catch(() => undefined)

    return () => {
      mounted = false
    }
  }, [authLoading, user?.id])

  useEffect(() => {
    const requestedJobId = searchParams.get("job_id")
    if (authLoading || !user || !requestedJobId || openedJobIdRef.current === requestedJobId) return
    openedJobIdRef.current = requestedJobId
    setActiveDocumentMode("auto")
    setOutputMode("table")
    setRecoveryLoading(true)
    setUploadedFiles([])
    resumeJob(requestedJobId)
      .catch(() => {
        setWorkspaceBanner({
          title: "Batch unavailable",
          description: "This imported batch could not be opened.",
          tone: "error",
        })
      })
      .finally(() => setRecoveryLoading(false))
  }, [authLoading, resumeJob, searchParams, user])

  const continueLatestJob = useCallback(async () => {
    if (!latestRecoverableJob?.job_id) return

    setRecoveryLoading(true)
    try {
      setUploadedFiles([])
      await resumeJob(latestRecoverableJob.job_id, latestRecoverableJob.session_id)
      setLatestRecoverableJob(null)
      toast.success("Latest batch resumed.")
    } catch (error: any) {
      toast.error(error?.detail || "Could not resume the latest batch.")
    } finally {
      setRecoveryLoading(false)
    }
  }, [latestRecoverableJob, resumeJob])

  // Restore state from context on mount
  useEffect(() => {
    if (processingState && processingState.processedFiles.length > 0) {
      
      // Note: We can't directly set resultFiles as it's managed by useOCR hook
      // The state will be persisted at the application level
      // Users can see their previous results when they navigate back
    }
  }, [])

  // Save state to context when it changes
  useEffect(() => {
    if (resultFiles && (resultFiles.length > 0 || isProcessing)) {
      updateState({
        processedFiles: resultFiles,
        status: status === 'completed' ? 'completed' : isProcessing ? 'processing' : 'idle',
        jobId,
        progress: typeof progress?.percentage === "number" ? progress.percentage : isUploading ? uploadProgress : status === 'completed' ? 100 : 0,
        processingComplete: status === 'completed',
        uploadedFiles: [] // Don't save File objects
      })
    }
  }, [resultFiles, isProcessing, status, jobId, progress?.percentage, isUploading, uploadProgress, updateState])

  // Persist auto-download setting to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('autoDownload', autoDownload.toString())
    }
  }, [autoDownload])

  // Persist auto-save setting to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('autoSave', autoSave.toString())
    }
  }, [autoSave])

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/sign-in?next=%2Fdashboard%2Fclient')
    }
  }, [user, authLoading, router])

  // Fetch user's credit status on mount
  useEffect(() => {
    // Only fetch once when user is loaded
    if (!authLoading && user?.id) {
      setCreditLoading(true)
      fetchUserStats()
    } else if (!authLoading && !user) {
      setCreditLoading(false)
    }
  }, [user?.id, authLoading])

  useEffect(() => {
    if (!jobId || !status) return
    const terminal = status === "completed" || status === "partially_completed" || status === "failed" || status === "cancelled"
    if (!terminal) return

    const refreshKey = `${jobId}:${status}`
    if (lastCreditRefreshRef.current === refreshKey) return
    lastCreditRefreshRef.current = refreshKey
    void fetchUserStats()
  }, [jobId, status])

  // Auto-download and auto-save when files are ready
  useEffect(() => {
    // Only run if auto-download or auto-save are enabled
    if (!autoDownload && !autoSave) {
      return
    }

    if (status === 'completed' && resultFiles && resultFiles.length > 0 && jobId) {
      // Check if we've already executed auto-actions for this job
      if (autoActionsExecutedRef.current === jobId) {
        return
      }

      // Check if auto-actions are currently executing
      if (isExecutingAutoActionsRef.current) {
        return
      }

      // Mark this job as processed IMMEDIATELY to prevent duplicate triggers
      autoActionsExecutedRef.current = jobId
      isExecutingAutoActionsRef.current = true

      const handleAutoActions = async () => {

        try {
          // Fetch table preview for the first file
          if (resultFiles.length > 0 && resultFiles[0].file_id && tablePreviewData.length === 0 && !textPreview) {
            fetchTablePreview(resultFiles[0].file_id)
          }

          // Auto-download all files
          if (autoDownload) {
            // toast.info(`Auto-downloading ${resultFiles.length} file(s)...`)

            // Create a Set of downloaded file IDs to prevent duplicates
            const downloadedIds = new Set<string>()

            for (const file of resultFiles) {
              if (file.file_id && !downloadedIds.has(file.file_id)) {
                try {
                  await downloadFile(file.file_id)
                  downloadedIds.add(file.file_id)
                  await new Promise(resolve => setTimeout(resolve, 500))
                } catch (error) {
                }
              } else if (downloadedIds.has(file.file_id)) {
              }
            }

            // toast.success(`Auto-downloaded ${downloadedIds.size} file(s)`)
          }

          // Auto-save to history
          if (autoSave && !isSaved) {
            await saveToHistory()
            // toast.success('Auto-saved to history')
          }
        } finally {
          // Reset execution flag after completion
          isExecutingAutoActionsRef.current = false
        }
      }

      handleAutoActions()
    }
  }, [status, jobId])

  // Reset auto-actions tracker when user starts a new batch
  useEffect(() => {
    if (uploadedFiles.length > 0 && !isProcessing) {
      autoActionsExecutedRef.current = null
      isExecutingAutoActionsRef.current = false
    }
  }, [uploadedFiles.length, isProcessing])

  // Listen for localStorage changes from settings page
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'autoDownload' && e.newValue !== null) {
        setAutoDownload(e.newValue === 'true')
      }
      if (e.key === 'autoSave' && e.newValue !== null) {
        setAutoSave(e.newValue === 'true')
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Also check on focus in case storage event doesn't fire
    const handleFocus = () => {
      const savedDownload = localStorage.getItem('autoDownload')
      const savedSave = localStorage.getItem('autoSave')
      if (savedDownload !== null) setAutoDownload(savedDownload === 'true')
      if (savedSave !== null) setAutoSave(savedSave === 'true')
    }
    
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  // Helper function to create preview URL for file (converts HEIC if needed)
  const createFilePreviewUrl = useCallback(async (file: File): Promise<string> => {
    if (isPdfFile(file)) {
      return createPdfFirstPageScreenshot(file)
    }

    const fileName = file.name.toLowerCase()
    const isHeic = fileName.endsWith('.heic') || fileName.endsWith('.heif')
    
    if (isHeic) {
      try {
        const { default: heic2any } = await import("heic2any")
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.8
        })
        
        const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob
        return URL.createObjectURL(blob)
      } catch (error) {
        return URL.createObjectURL(file)
      }
    }
    
    return URL.createObjectURL(file)
  }, [])

  // Update preview URLs when files change
  useEffect(() => {
    const generatePreviews = async () => {
      const newPreviewUrls: {[key: number]: string} = {}
      
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i]
        if (!filePreviewUrls[i]) {
          const url = await createFilePreviewUrl(file)
          newPreviewUrls[i] = url
        } else {
          newPreviewUrls[i] = filePreviewUrls[i]
        }
      }
      
      setFilePreviewUrls(newPreviewUrls)
    }
    
    if (uploadedFiles.length > 0) {
      generatePreviews()
    } else {
      Object.values(filePreviewUrls).forEach(url => URL.revokeObjectURL(url))
      setFilePreviewUrls({})
    }
  }, [uploadedFiles.length])

  const applyDurableDocuments = useCallback((documents: JobDocumentRecord[]) => {
    const nextTrace: Record<string, ResultSourceTrace> = {}
    documents.forEach((document: JobDocumentRecord) => {
          document.extractions.forEach((extraction) => {
            if (!extraction.result_file_id) return
            nextTrace[extraction.result_file_id] = {
              document_id: document.id,
              original_filename: document.original_filename,
              input_preview_url: extraction.source_preview_url || undefined,
              source_page: extraction.source_page,
              source_page_count: extraction.source_page_count,
            }
          })

          document.result_files.forEach((file) => {
            if (!file.file_id || nextTrace[file.file_id]) return
            nextTrace[file.file_id] = {
              document_id: document.id,
              original_filename: document.original_filename,
              input_preview_url:
                file.input_preview_url ||
                (document.source_content_type !== "application/pdf" ? document.source_access_url || undefined : undefined),
              source_page: file.source_page,
              source_page_count: file.source_page_count,
            }
          })
        })
    setJobDocuments(documents)
    setResultSourceTrace(nextTrace)
  }, [])

  useEffect(() => {
    if (!jobId) {
      setJobDocuments([])
      setResultSourceTrace({})
      return
    }

    let cancelled = false
    const loadTraceability = async () => {
      try {
        const response = await ocrApi.getJobDocuments(jobId)
        if (!cancelled) applyDurableDocuments(response.documents)
      } catch {
        if (!cancelled && status === "completed") {
          setJobDocuments([])
          setResultSourceTrace({})
        }
      }
    }

    void loadTraceability()
    return () => {
      cancelled = true
    }
  }, [applyDurableDocuments, jobId, status, resultFiles?.map((file: any) => file.file_id || "").join("|")])

  const handleDocumentModeOverride = useCallback(async (documentId: string, mode: ResolvedDocumentMode) => {
    if (!jobId) return
    setOverridingDocumentId(documentId)
    setWorkspaceBanner({
      title: "Reprocessing document",
      description: "The selected extractor is running against the stored source file.",
      tone: "info",
    })
    try {
      await ocrApi.overrideJobDocumentMode(jobId, documentId, mode, mode === "notes" ? "txt" : "xlsx")
      for (let attempt = 0; attempt < 16; attempt += 1) {
        await new Promise(resolve => setTimeout(resolve, 1250))
        const response = await ocrApi.getJobDocuments(jobId)
        applyDurableDocuments(response.documents)
        const document = response.documents.find(item => item.id === documentId)
        const processing = document?.extractions.some(extraction => (
          extraction.status === "queued" || extraction.status === "processing"
        ))
        if (document && !processing && document.status !== "processing") {
          setWorkspaceBanner(null)
          void fetchUserStats()
          return
        }
      }
      setWorkspaceBanner({
        title: "Reprocessing continues",
        description: "The result will appear in this batch when ready.",
        tone: "info",
      })
    } catch (error) {
      const uiError = getApiErrorUi(error, {
        isAuthenticated: Boolean(user),
        upgradeHref: "/pricing?from=document-mode",
        billingHref: "/dashboard/settings?section=billing",
      })
      setWorkspaceBanner({
        title: uiError.title,
        description: uiError.description,
        actionLabel: uiError.action?.label,
        onAction: uiError.action?.onClick,
        tone: "error",
      })
    } finally {
      setOverridingDocumentId(null)
    }
  }, [applyDurableDocuments, jobId, user])

  const getResultInputPreviewUrl = useCallback((file: any) => {
    if (file?.input_preview_url) {
      return file.input_preview_url
    }
    const durableTrace = file?.file_id ? resultSourceTrace[file.file_id] : undefined
    if (durableTrace?.input_preview_url) {
      return durableTrace.input_preview_url
    }

    const normalizeName = (value: string) =>
      value
        .toLowerCase()
        .replace(/\.[^.]+$/, '')
        .replace(/_processed$/i, '')
        .replace(/[-_\s]+/g, '')

    const candidates = [
      file?.original_filename,
      file?.source_filename,
      file?.input_filename,
      file?.filename,
    ]
      .filter(Boolean)
      .map((value: string) => normalizeName(String(value)))
      .filter(Boolean)

    const matchIndexes = uploadedFiles.reduce<number[]>((matches, uploadedFile, index) => {
      const uploadedBase = normalizeName(uploadedFile.name)
      if (candidates.some(candidate => (
        candidate === uploadedBase ||
        candidate.includes(uploadedBase) ||
        uploadedBase.includes(candidate)
      ))) {
        matches.push(index)
      }
      return matches
    }, [])

    if (matchIndexes.length === 1) {
      const matchIndex = matchIndexes[0]
      if (
        isPdfFile(uploadedFiles[matchIndex]) &&
        (file?.source_page > 1 || (Boolean(jobId) && (resultFiles?.length || 0) > 1))
      ) {
        return ''
      }
      return filePreviewUrls[matchIndex] || ''
    }

    return uploadedFiles.length === 1 ? filePreviewUrls[0] || '' : ''
  }, [filePreviewUrls, jobId, resultFiles?.length, resultSourceTrace, uploadedFiles])

  useEffect(() => {
    if (!resultFiles?.length) return

    const matchedPreview = getResultInputPreviewUrl(resultFiles[0])
    if (matchedPreview && matchedPreview !== firstImageUrl) {
      setFirstImageUrl(matchedPreview)
    }
  }, [firstImageUrl, getResultInputPreviewUrl, resultFiles])

  useEffect(() => {
    let cancelled = false

    const loadPdfPageCounts = async () => {
      const counts: {[key: number]: number} = {}

      await Promise.all(uploadedFiles.map(async (file, index) => {
        if (!isPdfFile(file)) return
        counts[index] = await getPdfPageCount(file)
      }))

      if (!cancelled) {
        setPdfPageCounts(counts)
      }
    }

    if (uploadedFiles.length > 0) {
      loadPdfPageCounts()
    } else {
      setPdfPageCounts({})
    }

    return () => {
      cancelled = true
    }
  }, [uploadedFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isProcessing || isUploading) return
    setIsDragging(true)
  }, [isProcessing, isUploading])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (isProcessing || isUploading) return

    const files = Array.from(e.dataTransfer.files).filter(isAcceptedUploadFile)
    if (files.length === 0) {
      setWorkspaceBanner({
        title: "Unsupported file type",
        description: "Upload PNG, JPEG, WebP, HEIC, HEIF, or PDF files.",
        tone: "warning",
      })
      return
    }

    setWorkspaceBanner(null)
    const shouldStartFresh = status === 'completed' || Boolean(resultFiles?.length)
    if (shouldStartFresh) {
      reset()
      setTablePreviewData([])
      setTextPreview('')
      setFirstImageUrl('')
      setActivePreviewFileId('')
      clearState()
    }
    
    setUploadedFiles(prev => {
      const remainingSlots = Math.max(0, maxUploadFiles - (shouldStartFresh ? 0 : prev.length))
      const filesToAdd = files.slice(0, remainingSlots)
      if (files.length > filesToAdd.length) {
        showBatchLimitToast(maxUploadFiles)
      }
      return shouldStartFresh ? filesToAdd : [...prev, ...filesToAdd]
    })
  }, [maxUploadFiles, isProcessing, isUploading, status, resultFiles?.length, reset, clearState])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isProcessing || isUploading) {
      e.target.value = ''
      return
    }

    const files = e.target.files
    if (files) {
      const fileArray = Array.from(files).filter(isAcceptedUploadFile)
      if (fileArray.length === 0) {
        setWorkspaceBanner({
          title: "Unsupported file type",
          description: "Upload PNG, JPEG, WebP, HEIC, HEIF, or PDF files.",
          tone: "warning",
        })
        e.target.value = ''
        return
      }

      setWorkspaceBanner(null)
      const shouldStartFresh = status === 'completed' || Boolean(resultFiles?.length)
      if (shouldStartFresh) {
        reset()
        setTablePreviewData([])
        setTextPreview('')
        setFirstImageUrl('')
        setActivePreviewFileId('')
        clearState()
      }
      setUploadedFiles(prev => {
        const remainingSlots = Math.max(0, maxUploadFiles - (shouldStartFresh ? 0 : prev.length))
        const filesToAdd = fileArray.slice(0, remainingSlots)
        if (fileArray.length > filesToAdd.length) {
          showBatchLimitToast(maxUploadFiles)
        }
        return shouldStartFresh ? filesToAdd : [...prev, ...filesToAdd]
      })
      e.target.value = ''
    }
  }, [maxUploadFiles, isProcessing, isUploading, status, resultFiles?.length, reset, clearState])

  const creditAvailable = entitlementCredits?.available_credits ?? limits?.credits?.available_credits ?? 0
  const noCredits = Boolean((entitlementCredits || limits?.credits) && creditAvailable <= 0)

  const handleProcessImages = useCallback(async () => {
    if (uploadedFiles.length === 0) {
      setWorkspaceBanner({
        title: "Add files first",
        description: "Choose images or PDFs before starting the conversion.",
        tone: "info",
      })
      return
    }
    if (noCredits) {
      setWorkspaceBanner({
        title: "No credits left",
        description: "Upgrade when batch conversion is saving more time than manual retyping.",
        actionLabel: "Buy credits",
        onAction: () => router.push("/pricing?from=no-credits"),
        tone: "warning",
      })
      return
    }
    if (uploadedFiles.length > maxUploadFiles) {
      setWorkspaceBanner({
        title: "Reduce batch size",
        description: `Your current plan allows up to ${maxUploadFiles} files per run.`,
        actionLabel: "See plans",
        onAction: () => router.push("/pricing?from=batch-limit"),
        tone: "warning",
      })
      showBatchLimitToast(maxUploadFiles)
      setUploadedFiles(prev => prev.slice(0, maxUploadFiles))
      return
    }

    try {
      setTablePreviewData([])
      setTextPreview('')
      setFirstImageUrl('')
      setActivePreviewFileId('')
      setWorkspaceBanner(null)

      if (uploadedFiles.length > 0) {
        setFirstImageUrl(await createFilePreviewUrl(uploadedFiles[0]))
      }

      const response = await uploadBatch(uploadedFiles, {
        outputFormat:
          activeDocumentMode === 'notes' && outputMode === 'text'
            ? 'txt'
            : outputMode === 'csv'
              ? 'csv'
              : 'xlsx',
        documentMode: activeDocumentMode,
      })
      if (response && response.session_id) {
        connectWebSocket(response.session_id, response.job_id)
        setLatestRecoverableJob(null)
        
        // Refresh stats after a delay
        setTimeout(() => {
          fetchUserStats()
        }, 2000)

        // toast.success(`Processing ${imagesCount} image${imagesCount > 1 ? 's' : ''}...`)
      }
    } catch (error: any) {
      const errorContext = {
        isAuthenticated: true,
        upgradeHref: "/pricing?from=quota",
        billingHref: "/dashboard/settings?section=billing",
        onSignIn: () => router.push(`/sign-in?next=${encodeURIComponent("/dashboard/client")}`),
        onRetry: () => {
          void handleProcessImages()
        },
      }
      const ui = getApiErrorUi(error, errorContext)
      setWorkspaceBanner({
        title: ui.title,
        description: ui.description,
        actionLabel: ui.action?.label,
        onAction: ui.action?.onClick,
        tone: "error",
      })
      showApiErrorToast(error, errorContext)
    }
  }, [uploadedFiles, uploadBatch, connectWebSocket, maxUploadFiles, router, outputMode, activeDocumentMode, createFilePreviewUrl, noCredits])

  const handleCancelProcessing = useCallback(async () => {
    await cancelProcessing()
    setLatestRecoverableJob(null)
    setWorkspaceBanner({
      title: "Batch cancelled",
      description: "You can adjust the selected files and start again.",
      tone: "info",
    })
    void fetchUserStats()
    toast.info("Batch cancelled.")
  }, [cancelProcessing])

  const handleRemoveFile = (index: number) => {
    setWorkspaceBanner(null)
    Object.values(filePreviewUrls).forEach(url => {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url)
    })
    setFilePreviewUrls({})
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleReset = () => {
    setUploadedFiles([])
    setPdfPageCounts({})
    setWorkspaceBanner(null)
    reset() // This resets status to 'idle' and clears resultFiles
    
    // Clear preview data
    setTablePreviewData([])
    setTextPreview('')
    setResultPreviews({})
    resultPreviewsRef.current = {}
    setResultSourceTrace({})
    setFirstImageUrl('')
    setActivePreviewFileId('')
    
    // Clear context state
    clearState()
    
    // Reset auto-actions trackers
    autoActionsExecutedRef.current = null
    isExecutingAutoActionsRef.current = false
  }

  // Fetch and parse Excel file for preview (same as landing page)
  const fetchTablePreview = useCallback(async (fileId: string, syncActivePreview = true) => {
    const existing = resultPreviewsRef.current[fileId]
    if (existing && (existing.table.length > 0 || existing.text)) {
      if (syncActivePreview) {
        setActivePreviewFileId(fileId)
        setTablePreviewData(existing.table)
        setTextPreview(existing.text)
      }
      return existing
    }

    if (syncActivePreview) {
      setActivePreviewFileId(fileId)
    }
    setResultPreviews(prev => {
      const next = {
        ...prev,
        [fileId]: {
          table: prev[fileId]?.table || [],
          text: prev[fileId]?.text || '',
          loading: true,
        },
      }
      resultPreviewsRef.current = next
      return next
    })

    try {
      const blob = await ocrApi.downloadFile(fileId)

      const isReadableTextResponse =
        outputMode === 'text' ||
        (blob.type.startsWith('text/') && !blob.type.toLowerCase().includes('csv'))

      if (isReadableTextResponse) {
        const text = await blob.text()
        const preview = { table: [], text: text.slice(0, 6000), loading: false }
        setResultPreviews(prev => {
          const next = { ...prev, [fileId]: preview }
          resultPreviewsRef.current = next
          return next
        })
        if (syncActivePreview) {
          setTextPreview(preview.text)
          setTablePreviewData([])
        }
        return preview
      }
      
      const XLSX = await import('xlsx')
      const arrayBuffer = await blob.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][]
      
      
      const preview = { table: data, text: '', loading: false }
      setResultPreviews(prev => {
        const next = { ...prev, [fileId]: preview }
        resultPreviewsRef.current = next
        return next
      })
      if (syncActivePreview) {
        setTablePreviewData(data)
        setTextPreview('')
      }
      return preview
    } catch (error) {
      setResultPreviews(prev => {
        const next = {
          ...prev,
          [fileId]: {
            table: prev[fileId]?.table || [],
            text: prev[fileId]?.text || '',
            loading: false,
          },
        }
        resultPreviewsRef.current = next
        return next
      })
      // Don't show error toast - just silently fail to show preview
      return null
    }
  }, [outputMode])

  // Fetch table preview when first result file is ready
  useEffect(() => {
    if (resultFiles && resultFiles.length > 0) {
      if (resultFiles[0].file_id && tablePreviewData.length === 0 && !textPreview) {
        fetchTablePreview(resultFiles[0].file_id)
      }
    }
  }, [resultFiles, tablePreviewData.length, textPreview, fetchTablePreview])

  useEffect(() => {
    if (!resultFiles?.length) return

    resultFiles.slice(0, 16).forEach((file: any) => {
      if (!file.file_id || resultPreviewsRef.current[file.file_id]) return
      void fetchTablePreview(file.file_id, false)
    })
  }, [resultFiles, fetchTablePreview])

  const handleShareFile = async (file: any) => {
    
    // Ensure we have a valid file_id
    if (!file || !file.file_id) {
      toast.error('Unable to share: File information is missing')
      return
    }
    
    setSelectedFileToShare(file)
    setShareDialogOpen(true)
    setCopySuccess(false)
  }
  
  const handleCopyLink = async () => {
    if (!selectedFileToShare?.file_id) {
      toast.error('Unable to copy link: File information is missing')
      return
    }
    
    let shareContent = ''
    
    // Check if this is a session-based batch share
    if (selectedFileToShare.file_id === '__SESSION__' && shareSession) {
      shareContent = shareSession.share_url
    } 
    // Legacy batch share (fallback)
    else if (selectedFileToShare.file_id === '__BATCH__' && selectedFilesForBatch.length > 0) {
      
      // Generate links for all files
      const links = selectedFilesForBatch.map((file, index) => {
        const fileUrl = buildDownloadUrl(file.file_id)
        return `File ${index + 1} (${file.filename || 'result.xlsx'}): ${fileUrl}`
      }).join('\n')
      
      shareContent = `Download links for ${selectedFilesForBatch.length} Excel files:\n\n${links}`
    } 
    // Single file share
    else {
      const shareUrl = buildDownloadUrl(selectedFileToShare.file_id)
      shareContent = shareUrl
    }
    
    
    try {
      await navigator.clipboard.writeText(shareContent)
      setCopySuccess(true)
      const message = selectedFileToShare.file_id === '__BATCH__' 
        ? `Links for ${selectedFilesForBatch.length} files copied!`
        : 'Download link copied to clipboard'
      // toast.success(message)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      toast.error('Failed to copy link to clipboard')
    }
  }
  
  // Custom share handlers
  // Share handlers for direct messaging (not social media posts)
  const handleMessengerShare = () => {
    if (!selectedFileToShare?.file_id) {
      return
    }
    
    
    // For batch sharing, create a message with all links
    let shareUrl = ''
    
    // Check if session-based share
    if (selectedFileToShare.file_id === '__SESSION__' && shareSession) {
      shareUrl = shareSession.share_url.replace(/\s/g, '')
    } 
    // Legacy batch share
    else if (selectedFileToShare.file_id === '__BATCH__' && selectedFilesForBatch.length > 0) {
      // For Messenger, we can only share one link at a time, so create a landing page URL
      // For now, we'll share the first file and indicate there are more
      shareUrl = buildDownloadUrl(selectedFilesForBatch[0].file_id)
    } 
    // Single file share
    else {
      shareUrl = buildDownloadUrl(selectedFileToShare.file_id)
    }
    
    
    // Facebook Messenger Send Dialog for desktop/web
    // Note: This opens the send dialog, not the share dialog
    const currentUrl = window.location.origin
    const messengerUrl = buildMessengerShareUrl(shareUrl, currentUrl)
    if (!messengerUrl) {
      navigator.clipboard.writeText(shareUrl).catch(() => undefined)
      toast.error('Messenger sharing is not configured. Link copied instead.')
      return
    }
    
    
    // Try to open in popup first
    const popup = window.open(messengerUrl, 'messenger-share-dialog', 'width=600,height=500')
    
    if (!popup || popup.closed || typeof popup.closed == 'undefined') {
      // Fallback: open in new tab
      window.open(messengerUrl, '_blank')
    }
    
    // Show note for batch sharing
    if (selectedFileToShare.file_id === '__BATCH__') {
      // toast.info(`Note: Sharing first of ${selectedFilesForBatch.length} files. Copy all links for complete batch.`, {
      //   duration: 5000
      // })
    }
  }
  
  const handleEmailShare = () => {
    if (!selectedFileToShare?.file_id) {
      return
    }
    
    
    let subject = ''
    let body = ''
    
    // Check if session-based share
    if (selectedFileToShare.file_id === '__SESSION__' && shareSession) {
      subject = `${selectedFilesForBatch.length} Excel files processed with AxLiner`
      
      const sessionUrl = shareSession.share_url.replace(/\s/g, '')
      
      body = `Hi,

I've processed ${selectedFilesForBatch.length} files with AxLiner. You can download all files from this link:

${sessionUrl}

Best regards`
    }
    // Legacy batch sharing
    else if (selectedFileToShare.file_id === '__BATCH__' && selectedFilesForBatch.length > 0) {
      subject = `${selectedFilesForBatch.length} Excel files processed with AxLiner`
      
      const fileLinks = selectedFilesForBatch.map((file, index) => {
        const fileUrl = buildDownloadUrl(file.file_id)
        return `File ${index + 1} (${file.filename || 'result.xlsx'}): ${fileUrl}`
      }).join('\n')
      
      body = `Hi,

I've processed ${selectedFilesForBatch.length} files with AxLiner. You can download them here:

${fileLinks}

Best regards`
    } else {
      // Single file
      const shareUrl = buildDownloadUrl(selectedFileToShare.file_id)
      subject = `Excel file: ${selectedFileToShare.filename || 'Processed with AxLiner'}`
      body = `Hi,

I've processed this file with AxLiner. You can download it here:

${shareUrl}

Best regards`
    }
    
    
    // Gmail compose URL with parameters
    // This opens Gmail in a new tab with the compose window pre-filled
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    
    
    // Open Gmail compose in new tab
    const gmailWindow = window.open(gmailUrl, '_blank')
    
    if (!gmailWindow) {
      // Fallback to mailto if popup is blocked
      const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      window.location.href = mailtoUrl
    }
  }
  
  const handleLinkedInMessage = () => {
    if (!selectedFileToShare?.file_id) {
      return
    }
    
    
    let shareContent = ''
    
    // Check if session-based share
    if (selectedFileToShare.file_id === '__SESSION__' && shareSession) {
      shareContent = shareSession.share_url.replace(/\s/g, '')
    }
    // Legacy batch sharing
    else if (selectedFileToShare.file_id === '__BATCH__' && selectedFilesForBatch.length > 0) {
      const fileLinks = selectedFilesForBatch.map((file, index) => {
        const fileUrl = buildDownloadUrl(file.file_id)
        return `File ${index + 1} (${file.filename || 'result.xlsx'}): ${fileUrl}`
      }).join('\n')
      
      shareContent = `Download links for ${selectedFilesForBatch.length} Excel files:\n\n${fileLinks}`
    } 
    // Single file
    else {
      const shareUrl = buildDownloadUrl(selectedFileToShare.file_id)
      shareContent = shareUrl
    }
    
    
    // LinkedIn doesn't support direct message URLs with pre-filled content
    // Best approach: Copy link and show instructions
    navigator.clipboard.writeText(shareContent)
      .then(() => {
        
        // Show detailed instructions
        const isBatch = selectedFileToShare.file_id === '__BATCH__'
        const message = isBatch 
          ? `${selectedFilesForBatch.length} file links copied to clipboard!`
          : 'Link copied to clipboard!'
        // toast.success(message, {
        //   duration: 8000,
        //   description: 'Opening LinkedIn... Click "New message" → Choose recipient → Paste the links (Ctrl+V or Cmd+V)'
        // })
        
        // Open LinkedIn messaging compose page
        // This URL opens the messaging page with compose view
        window.open('https://www.linkedin.com/messaging/compose/', '_blank')
      })
      .catch((err) => {
        // Fallback: show the link for manual copying
        const fallbackInput = document.createElement('input')
        fallbackInput.value = shareContent
        document.body.appendChild(fallbackInput)
        fallbackInput.select()
        document.execCommand('copy')
        document.body.removeChild(fallbackInput)
        
        // toast.success('Link copied! Opening LinkedIn...', {
        //   duration: 6000
        // })
        window.open('https://www.linkedin.com/messaging/compose/', '_blank')
      })
  }

  const handleXShare = () => {
    if (!selectedFileToShare?.file_id) {
      return
    }
    
    
    let tweetText = ''
    let shareUrl = ''
    
    // Check if session-based share
    if (selectedFileToShare.file_id === '__SESSION__' && shareSession) {
      shareUrl = shareSession.share_url.replace(/\s/g, '')
      tweetText = `Check out these ${selectedFilesForBatch.length} Excel files I processed with AxLiner! 📊✨`
    }
    // Legacy batch sharing
    else if (selectedFileToShare.file_id === '__BATCH__' && selectedFilesForBatch.length > 0) {
      // For batch, use the first file URL as example
      shareUrl = buildDownloadUrl(selectedFilesForBatch[0].file_id)
      tweetText = `Check out these ${selectedFilesForBatch.length} Excel files I processed with AxLiner! 📊✨`
    }
    // Single file
    else {
      shareUrl = buildDownloadUrl(selectedFileToShare.file_id)
      tweetText = `Check out this Excel file I processed with AxLiner! 📊✨`
    }
    
    // X (Twitter) Web Intent URL
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`
    
    
    window.open(xUrl, '_blank', 'width=550,height=420')
    
    // toast.success('X share window opened!', {
    //   description: 'Customize your tweet and share with your followers'
    // })
  }

  const handleShareAll = async () => {
    
    if (!jobId || !resultFiles || resultFiles.length === 0) {
      toast.error('Unable to share batch: No files available')
      return
    }
    
    // Get all valid file IDs
    const allFileIds = resultFiles.map(f => f.file_id).filter(Boolean)
    
    if (allFileIds.length === 0) {
      toast.error('Unable to share: No valid files found')
      return
    }
    
    try {
      // Create a share session for all files
      
      const sessionResponse = await ocrApi.createShareSession({
        file_ids: allFileIds,
        title: `Batch of ${resultFiles.length} Excel files`,
        description: `Processed on ${new Date().toLocaleDateString()}`,
        expires_in_days: 7
      })
      
      
      // Store session info
      setShareSession(sessionResponse)
      setSelectedFilesForBatch(resultFiles)
      
      // Open share dialog with session info
      setSelectedFileToShare({
        file_id: '__SESSION__',
        filename: `Batch of ${resultFiles.length} Excel files`,
        isBatch: true,
        sessionId: sessionResponse.session_id
      })
      
      setShareDialogOpen(true)
      setCopySuccess(false)
      
      // toast.success('Share link created successfully!')
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to create share link'
      toast.error(`Error: ${errorMessage}`)
    }
  }

  const handleDownloadAll = async () => {
    if (!resultFiles || resultFiles.length === 0) return

    let downloadCount = 0
    for (const [index, file] of resultFiles.entries()) {
      if (!file.file_id) {
        continue
      }

      try {
        await downloadFile(file.file_id, smartOutputFilename(file, index, uploadedFiles, outputMode))
        downloadCount++
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        toast.error(`Failed to download ${file.filename || 'file'}`)
      }
    }

    if (downloadCount > 0 && downloadCount < resultFiles.length) {
      toast.warning(`Downloaded ${downloadCount} of ${resultFiles.length} files`)
    } else if (downloadCount === 0) {
      toast.error('Failed to download any files')
    }
  }

  const handleDownloadResultFile = async (file: any, index = 0) => {
    if (jobId && file?.document_id) {
      try {
        const blob = await ocrApi.downloadReviewedDocument(jobId, file.document_id, reviewedExportFormat)
        const extension = reviewedFileExtension(blob, reviewedExportFormat)
        downloadBlob(blob, reviewedFilename(file, index, uploadedFiles, extension))
      } catch (error: any) {
        toast.error(error?.detail || error?.message || "Could not download the reviewed file.")
      }
      return
    }
    if (file?.file_id) {
      await downloadFile(file.file_id, smartOutputFilename(file, index, uploadedFiles, outputMode))
      return
    }
    toast.error('Unable to download: File ID is missing')
  }

  const handleDownloadReviewedBatch = async () => {
    if (!jobId) {
      await handleDownloadAll()
      return
    }
    try {
      const blob = await ocrApi.downloadReviewedBatch(jobId, reviewedExportFormat)
      const batchSource = jobDocuments[0]?.original_filename || uploadedFiles[0]?.name || "axliner_batch"
      downloadBlob(blob, `${filenameStem(batchSource, "axliner_batch")}_reviewed.zip`)
      toast.success('Reviewed batch downloaded.')
    } catch (error: any) {
      toast.error(error?.detail || error?.message || 'Could not prepare the reviewed batch.')
    }
  }

  const mergeReviewedDocument = useCallback((reviewDocument: JobDocumentRecord) => {
    setJobDocuments(current => current.map(document => {
      if (document.id !== reviewDocument.id) return document
      return {
        ...document,
        ...reviewDocument,
        source_access_url: document.source_access_url,
        preview_expires_in: document.preview_expires_in,
        extractions: reviewDocument.extractions.map(extraction => {
          const existing = document.extractions.find(item => (
            item.id === extraction.id || item.processing_unit_id === extraction.processing_unit_id
          ))
          return {
            ...existing,
            ...extraction,
            source_preview_url: existing?.source_preview_url,
          }
        }),
        result_files: document.result_files,
      }
    }))
  }, [])

  const handleEditResultFile = (file: any, index = 0) => {
    const matchedPreview = getResultInputPreviewUrl(file)
    if (matchedPreview) setFirstImageUrl(matchedPreview)
    setTablePreviewData([])
    setTextPreview('')
    if (file?.file_id) {
      void fetchTablePreview(file.file_id)
    }
    if (jobId && file.document_id) {
      void ocrApi.getDocumentReview(jobId, file.document_id)
        .then(response => mergeReviewedDocument(response.document))
        .catch(() => undefined)
    }
  }

  const reloadDurableDocuments = useCallback(async () => {
    if (!jobId) return
    const response = await ocrApi.getJobDocuments(jobId)
    applyDurableDocuments(response.documents)
  }, [applyDurableDocuments, jobId])

  const handleDeleteStoredDocument = async (file: any) => {
    if (!jobId || !file?.document_id) return
    const confirmed = window.confirm(
      "Permanently delete this stored document, its extracted values, reviewed edits, and generated files? Existing QuickBooks records are not removed.",
    )
    if (!confirmed) return
    try {
      const result = await ocrApi.deleteStoredDocument(jobId, file.document_id)
      if (result.remaining_documents === 0) {
        handleReset()
      } else {
        await reloadDurableDocuments()
      }
      setWorkspaceBanner({
        title: "Document deleted",
        description: "The stored source, output, and review data are no longer available.",
        tone: "info",
      })
    } catch (error: any) {
      setWorkspaceBanner({
        title: "Document was not deleted",
        description: error?.detail || error?.message || "Try again after the batch has finished.",
        tone: "error",
      })
    }
  }

  const handleDeleteStoredBatch = async () => {
    if (!jobId) return
    const confirmed = window.confirm(
      "Permanently delete this batch, including source files, outputs, extracted values, and review edits? Existing QuickBooks records are not removed.",
    )
    if (!confirmed) return
    try {
      await ocrApi.deleteStoredBatch(jobId)
      handleReset()
      setWorkspaceBanner({
        title: "Batch deleted",
        description: "The stored files and financial extraction data are no longer available.",
        tone: "info",
      })
    } catch (error: any) {
      setWorkspaceBanner({
        title: "Batch was not deleted",
        description: error?.detail || error?.message || "Try again after the batch has finished.",
        tone: "error",
      })
    }
  }

  const persistReviewValue = useCallback(async (
    file: any,
    fieldPath: Array<string | number>,
    value: string,
    baseReviewGrid?: any[][],
  ): Promise<boolean> => {
    if (!jobId || !file?.document_id || !file?.processing_unit_id) {
      setWorkspaceBanner({
        title: "Correction was not saved",
        description: "This result is missing durable document metadata. Reopen the batch and try again.",
        tone: "error",
      })
      return false
    }
    try {
      await ocrApi.updateDocumentReviewValue(jobId, file.document_id, {
        processing_unit_id: file.processing_unit_id,
        field_path: fieldPath,
        value,
        base_review_grid: baseReviewGrid,
      })
      await reloadDurableDocuments()
      setWorkspaceBanner(null)
      return true
    } catch (error) {
      const uiError = getApiErrorUi(error, {
        isAuthenticated: Boolean(user),
        upgradeHref: "/pricing",
        billingHref: "/dashboard/settings?section=billing",
      })
      setWorkspaceBanner({
        title: "Correction was not saved",
        description: uiError.description,
        tone: "error",
      })
      return false
    }
  }, [jobId, reloadDurableDocuments, user])

  const handlePersistCellEdit = useCallback(async (
    file: any,
    rowIndex: number,
    cellIndex: number,
    value: string,
    baseTable: any[][],
  ) => persistReviewValue(file, ["review_grid", rowIndex, cellIndex], value, baseTable), [persistReviewValue])

  const handlePersistStructuredEdit = useCallback(async (
    file: any,
    fieldPath: Array<string | number>,
    value: string,
  ) => persistReviewValue(file, fieldPath, value), [persistReviewValue])

  const handleMarkDocumentReady = useCallback(async (file: any) => {
    if (!jobId || !file?.document_id) return
    try {
      await ocrApi.updateDocumentReviewStatus(jobId, file.document_id, "ready")
      await reloadDurableDocuments()
      setWorkspaceBanner(null)
    } catch (error) {
      const uiError = getApiErrorUi(error, {
        isAuthenticated: Boolean(user),
        upgradeHref: "/pricing",
        billingHref: "/dashboard/settings?section=billing",
      })
      setWorkspaceBanner({
        title: "Could not mark this file ready",
        description: uiError.description,
        tone: "error",
      })
    }
  }, [jobId, reloadDurableDocuments, user])

  const handleOverrideDuplicateWarning = useCallback(async (file: any, warningId: string) => {
    if (!jobId || !file?.document_id) return
    try {
      const response = await ocrApi.overrideDocumentDuplicateWarning(
        jobId,
        file.document_id,
        warningId,
        "Confirmed as a separate document",
      )
      mergeReviewedDocument(response.document)
      await reloadDurableDocuments()
      setWorkspaceBanner(null)
    } catch (error) {
      const uiError = getApiErrorUi(error, {
        isAuthenticated: Boolean(user),
        upgradeHref: "/pricing",
        billingHref: "/dashboard/settings?section=billing",
      })
      setWorkspaceBanner({
        title: "Could not keep this file separately",
        description: uiError.description,
        tone: "error",
      })
    }
  }, [jobId, mergeReviewedDocument, reloadDurableDocuments, user])

  const handleSaveVendorRule = useCallback(async (file: any, suggestedFields: VendorRuleFields) => {
    if (!jobId || !file?.document_id) return false
    try {
      const response = await ocrApi.saveDocumentVendorRule(jobId, file.document_id, suggestedFields)
      mergeReviewedDocument(response.document)
      toast.success("Vendor suggestions saved for this workspace.")
      setWorkspaceBanner(null)
      return true
    } catch (error) {
      const uiError = getApiErrorUi(error, {
        isAuthenticated: Boolean(user),
        upgradeHref: "/pricing",
        billingHref: "/dashboard/settings?section=billing",
      })
      setWorkspaceBanner({
        title: "Vendor memory was not saved",
        description: uiError.description,
        tone: "error",
      })
      return false
    }
  }, [jobId, mergeReviewedDocument, user])

  const handleSendToAccountsPayable = useCallback(async (file: any) => {
    if (!jobId || !file?.document_id) return
    try {
      await accountsPayableApi.createFromDocument(jobId, file.document_id)
      toast.success("Invoice added to Accounts Payable.")
      router.push("/dashboard/accounts-payable")
    } catch (error: any) {
      setWorkspaceBanner({
        title: "Invoice was not added to Accounts Payable",
        description: error?.detail || error?.message || "Confirm the invoice and try again.",
        tone: "error",
      })
    }
  }, [jobId, router])

  const loadQuickBooksReferences = useCallback(async (sync = false) => {
    try {
      let connection = await quickBooksApi.status()
      if (sync && connection.connected) {
        connection = await quickBooksApi.sync()
      }
      setQuickBooksConnection(connection)
      if (!connection.connected) {
        setQuickBooksReferences([])
        return
      }
      const response = await quickBooksApi.references()
      setQuickBooksReferences(response.items)
    } catch {
      setQuickBooksConnection(null)
      setQuickBooksReferences([])
    }
  }, [])

  useEffect(() => {
    if (!user || !jobDocuments.some(document => (
      document.resolved_mode === "receipt" ||
      document.detected_mode === "receipt" ||
      document.selected_mode === "receipt"
    ))) return
    void loadQuickBooksReferences()
  }, [jobDocuments, loadQuickBooksReferences, user])

  const handlePublishReceipt = useCallback(async (
    file: any,
    request: ReceiptQuickBooksPublishRequest,
  ): Promise<boolean> => {
    if (!jobId || !file?.document_id) return false
    const isExpense = request.destination === "expense"
    const confirmation = window.confirm(
      isExpense
        ? "Publish this reviewed receipt as an already-paid QuickBooks expense? This creates a Purchase transaction."
        : "Publish this reviewed receipt as an unpaid QuickBooks bill? This creates a Bill transaction.",
    )
    if (!confirmation) return false
    try {
      const response = await ocrApi.publishReceiptToQuickBooks(jobId, file.document_id, request)
      mergeReviewedDocument(response.document)
      await reloadDurableDocuments()
      toast.success(isExpense ? "Receipt published as a QuickBooks expense." : "Receipt published as a QuickBooks bill.")
      setWorkspaceBanner(null)
      return true
    } catch (error: any) {
      setWorkspaceBanner({
        title: "Receipt was not published",
        description: error?.detail || error?.message || "Review the QuickBooks selections and try again.",
        tone: "error",
      })
      return false
    }
  }, [jobId, mergeReviewedDocument, reloadDurableDocuments])

  

  if (authLoading || !user) {
    return <DashboardRouteLoader label="Loading conversion workspace" />
  }

  const durableResultFiles: DurableWorkspaceResultFile[] = jobDocuments.flatMap((document): DurableWorkspaceResultFile[] => {
    const persistedResults = document.result_files.filter(file => file.status !== "superseded")
    if (persistedResults.length) {
      return persistedResults.map(file => ({ ...file, document_id: document.id }))
    }
    return document.extractions.map(extraction => ({
      file_id: extraction.result_file_id || undefined,
      filename: document.original_filename,
      original_filename: document.original_filename,
      document_id: document.id,
      input_preview_url: extraction.source_preview_url || document.source_access_url || undefined,
      source_page: extraction.source_page,
      source_page_count: extraction.source_page_count,
      status: extraction.status,
      requires_review: true,
      review_flags: extraction.validation_flags,
    }))
  })
  const visibleResultFiles = durableResultFiles.length ? durableResultFiles : resultFiles
  const isComplete = status === 'completed' && Boolean(
    (visibleResultFiles && visibleResultFiles.length > 0)
    || (activeDocumentMode === "auto" && jobDocuments.length > 0)
  )
  const isBankStatementMode = activeDocumentMode === 'bank_statement'
  const isAccountingDocumentMode = activeDocumentMode === 'invoice' || activeDocumentMode === 'receipt' || activeDocumentMode === 'invoice_receipt'
  const isTextOutput = activeDocumentMode === 'notes' && outputMode === 'text'
  const effectiveOutputMode = outputMode
  const displayResultFiles = visibleResultFiles?.map((file, index) => {
    const trace = file.file_id ? resultSourceTrace[file.file_id] : undefined
    const durableDocument = jobDocuments.find(document => (
          document.id === file.document_id ||
          (file.file_id && (
          document.result_files.some(resultFile => resultFile.file_id === file.file_id) ||
          document.extractions.some(extraction => extraction.result_file_id === file.file_id)
          ))
        ))
    const durableExtraction = durableDocument?.extractions.find(extraction => (
      file.file_id ? extraction.result_file_id === file.file_id : extraction.source_page === file.source_page
    )) || durableDocument?.extractions[0]
    const reviewGrid = durableExtraction?.reviewed_data?.review_grid
    const tracedFile = trace
      ? {
          ...file,
          document_id: trace.document_id,
          original_filename: trace.original_filename,
          source_page: trace.source_page,
          source_page_count: trace.source_page_count,
        }
      : file

    return {
      ...tracedFile,
      document_id: durableDocument?.id || tracedFile.document_id,
      processing_unit_id: durableExtraction?.processing_unit_id,
      review_status: durableDocument?.review_status || durableExtraction?.review_status,
      review_grid: Array.isArray(reviewGrid) ? reviewGrid as any[][] : undefined,
      reviewed_data: durableExtraction?.reviewed_data || durableExtraction?.raw_structured_data,
      document_type:
        durableDocument?.resolved_mode ||
        durableDocument?.detected_mode ||
        durableDocument?.selected_mode ||
        activeDocumentMode,
      review_flags: durableExtraction?.validation_flags || tracedFile.review_flags,
      requires_review: durableDocument?.review_status === "needs_review" || tracedFile.requires_review,
      duplicate_warnings: durableDocument?.duplicate_warnings || [],
      vendor_suggestion: durableDocument?.vendor_suggestion || null,
      quickbooks_receipt_publication: durableDocument?.quickbooks_receipt_publication || null,
      filename: smartOutputFilename(tracedFile, index, uploadedFiles, effectiveOutputMode),
      input_preview_url: getResultInputPreviewUrl(tracedFile),
    }
  }) || null
  const uploadedSizeMb = uploadedFiles.reduce((total, file) => total + file.size, 0) / (1024 * 1024)
  const processLabel =
    activeDocumentMode === 'auto'
      ? 'Detect and convert'
      : isBankStatementMode
        ? 'Extract statement'
        : activeDocumentMode === 'invoice'
          ? 'Extract invoice'
          : activeDocumentMode === 'receipt'
            ? 'Extract receipt'
            : activeDocumentMode === 'notes'
              ? 'Extract notes'
              : isTextOutput
                ? 'Extract text'
                : 'Convert files'
  const creditEstimate = uploadedFiles.reduce((total, file, index) => {
    return total + (isPdfFile(file) ? (pdfPageCounts[index] || 1) : 1)
  }, 0)
  const creditsKnown = Boolean(entitlementCredits || limits?.credits)
  const batchExceedsCredits = Boolean(creditsKnown && uploadedFiles.length > 0 && creditEstimate > creditAvailable)
  const creditBanner: WorkspaceBanner | null = noCredits && !isProcessing
    ? {
        title: "No credits left",
        description: "Upgrade when batch conversion is saving more time than manual retyping.",
        actionLabel: "Buy credits",
        onAction: () => router.push("/pricing?from=no-credits"),
        tone: "warning",
      }
    : batchExceedsCredits && !isProcessing
      ? {
          title: "This batch needs more credits",
          description: `${creditEstimate} credits estimated, ${creditAvailable} available. Reduce the batch or upgrade for larger handwritten runs.`,
          actionLabel: "See plans",
          onAction: () => router.push("/pricing?from=credit-estimate"),
          tone: "warning",
        }
    : null

  return (
    <DashboardShell
      activeItem="process"
      title={
        activeDocumentMode === "auto"
          ? "Auto Detect"
          : isBankStatementMode
            ? "Bank Statement Mode"
            : activeDocumentMode === "invoice"
              ? "Invoice Mode"
              : activeDocumentMode === "receipt"
                ? "Receipt Mode"
                : activeDocumentMode === "notes"
                  ? "Notes Mode"
                  : isAccountingDocumentMode
                    ? "Invoice and Receipt Mode"
                    : "Convert Files"
      }
      eyebrow={isBankStatementMode ? "Statements" : isAccountingDocumentMode ? "Accounting" : activeDocumentMode === "notes" ? "Notes" : "Batch"}
      user={user}
      contentClassName="max-w-none px-3 py-3 sm:px-5 lg:px-6"
    >
      <ConversionWorkspace
        banner={workspaceBanner ?? creditBanner}
        onDismissBanner={workspaceBanner ? () => setWorkspaceBanner(null) : undefined}
        latestRecoverableJob={!isProcessing ? latestRecoverableJob : null}
        recoveryLoading={recoveryLoading}
        onContinueLatestJob={continueLatestJob}
        uploadedFiles={uploadedFiles}
        filePreviewUrls={filePreviewUrls}
        pdfPageCounts={pdfPageCounts}
        isDragging={isDragging}
        outputMode={effectiveOutputMode}
        onOutputModeChange={setOutputMode}
        documentMode={activeDocumentMode}
        onDocumentModeChange={(mode) => {
          setActiveDocumentMode(mode)
          setOutputMode(mode === 'notes' ? 'text' : 'table')
        }}
        isUploading={isUploading}
        isProcessing={isProcessing}
        isComplete={Boolean(isComplete)}
        uploadedSizeMb={uploadedSizeMb}
        creditAvailable={creditAvailable}
        creditEstimate={creditEstimate}
        maxUploadFiles={maxUploadFiles}
        processLabel={processLabel}
        noCredits={noCredits || batchExceedsCredits}
        resultFiles={displayResultFiles}
        tablePreviewData={tablePreviewData}
        textPreview={textPreview}
        resultPreviews={resultPreviews}
        firstImageUrl={firstImageUrl}
        activePreviewFileId={activePreviewFileId}
        isTextOutput={isTextOutput}
        isSaving={isSaving}
        isSaved={isSaved}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onFileInput={handleFileInput}
        onRemoveFile={handleRemoveFile}
        onClearFiles={handleReset}
        onConvert={handleProcessImages}
        onCancel={handleCancelProcessing}
        onReset={handleReset}
        onSaveToHistory={saveToHistory}
        onShareFile={handleShareFile}
        onShareAll={handleShareAll}
        onDownloadFile={handleDownloadResultFile}
        onDownloadAll={handleDownloadAll}
        onDownloadReviewedBatch={handleDownloadReviewedBatch}
        onDeleteDocument={handleDeleteStoredDocument}
        onDeleteBatch={handleDeleteStoredBatch}
        onEditFile={handleEditResultFile}
        onPersistCellEdit={handlePersistCellEdit}
        onPersistStructuredEdit={handlePersistStructuredEdit}
        onMarkDocumentReady={handleMarkDocumentReady}
        onSendToAccountsPayable={handleSendToAccountsPayable}
        onOverrideDuplicateWarning={handleOverrideDuplicateWarning}
        onSaveVendorRule={handleSaveVendorRule}
        quickBooksConnection={quickBooksConnection}
        quickBooksReferences={quickBooksReferences}
        onRefreshQuickBooksReferences={() => loadQuickBooksReferences(true)}
        onPublishReceipt={handlePublishReceipt}
        classifiedDocuments={activeDocumentMode === "auto" ? jobDocuments : []}
        overridingDocumentId={overridingDocumentId}
        onOverrideDocumentMode={handleDocumentModeOverride}
      />
      {!isComplete ? <WorkspaceFilesPanel refreshKey={jobId && status === "completed" ? `${jobId}:${isSaved}` : undefined} /> : null}

      <Dialog open={shareDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setSelectedFilesForBatch([])
          setShareSession(null)
          setCopySuccess(false)
        }
        
        setShareDialogOpen(open)
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              {selectedFileToShare?.isBatch ? 'Share All Files' : 'Share File'}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {selectedFileToShare?.file_id === '__SESSION__' && shareSession
                ? `Share ${selectedFilesForBatch.length} Excel files with a single link` 
                : selectedFileToShare?.isBatch 
                ? `Share ${selectedFilesForBatch.length} Excel files - Each file has its own download link` 
                : selectedFileToShare?.filename || 'Excel file'}
              {shareSession && shareSession.expires_at && (
                <span className="block mt-1 text-xs text-muted-foreground">
                  Link expires on {new Date(shareSession.expires_at).toLocaleDateString()}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-3">
              <p className="text-xs text-center text-muted-foreground">Share your download link:</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleEmailShare}
                  className="group flex flex-col items-center gap-1.5 cursor-pointer"
                  title="Compose email in Gmail"
                >
                  <svg className="h-10 w-10 text-[#EA4335] group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                  </svg>
                  <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">Gmail</span>
                </button>

                <button
                  onClick={handleLinkedInMessage}
                  className="group flex flex-col items-center gap-1.5 cursor-pointer"
                  title="Copy link and compose LinkedIn message"
                >
                  <svg className="h-10 w-10 text-[#0077B5] group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                  <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">LinkedIn</span>
                </button>

                <button
                  onClick={handleXShare}
                  className="group flex flex-col items-center gap-1.5 cursor-pointer"
                  title="Share on X (Twitter)"
                >
                  <svg className="h-10 w-10 text-foreground group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">X</span>
                </button>

                <button
                  onClick={handleMessengerShare}
                  className="group flex flex-col items-center gap-1.5 cursor-pointer"
                  title="Send via Facebook Messenger"
                >
                  <MessageCircle className="h-10 w-10 text-[#0084FF] group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">Messenger</span>
                </button>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>
            
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link className="h-3.5 w-3.5" />
                <span className="font-medium">Direct download link</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={(() => {
                    if (selectedFileToShare?.file_id === '__BATCH__' && selectedFilesForBatch?.length > 0) {
                      return `Multiple files (${selectedFilesForBatch.length} links) - Click copy to get all`
                    }

                    const fileId = selectedFileToShare?.file_id || ''
                    return fileId && fileId !== '__BATCH__' ? buildDownloadUrl(fileId) : ''
                  })()}
                  className="text-xs h-9 bg-muted/50 border-muted-foreground/20"
                />
                <Button
                  size="sm"
                  variant={copySuccess ? "default" : "outline"}
                  onClick={handleCopyLink}
                  className="h-9 px-3"
                >
                  {copySuccess ? (
                    <>
                      <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                      <span className="text-xs">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 mr-1.5" />
                      <span className="text-xs">Copy</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </DashboardShell>
  )
}
