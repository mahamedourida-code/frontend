"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { wakeUpBackendSilently } from "@/lib/backend-health";
import { getTrialInfo, incrementTrialUploadCount } from "@/lib/free-trial";
import { ocrApi, OCRWebSocket } from "@/lib/api-client";
import type { AppLimits, JobStatusResponse, RecoverableJobSummary } from "@/lib/api-client";
import { buildDownloadUrl, buildMessengerShareUrl } from "@/lib/public-config";
import { showApiErrorToast, showBatchLimitToast } from "@/lib/api-error-ui";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { useBillingStatus } from "@/hooks/useBillingStatus";
import { useProcessingState } from "@/contexts/ProcessingStateContext";
import { compressImages, formatFileSize } from "@/lib/image-compression";
import {
  acceptedUploadMimeTypes,
  createPdfFirstPageScreenshot,
  isAcceptedUploadFile,
  isPdfFile,
} from "@/lib/upload-files";
import { Download, FileSpreadsheet, FileText, RotateCcw, Share2, X } from "lucide-react";

const LandingDialogs = dynamic(
  () => import("@/components/landing/LandingDialogs"),
  { ssr: false }
);

const siteIcons = {
  export: "/site-icons/io/export.svg",
  upload: "/site-icons/io/upload.svg",
};

type ResultPreview = {
  table: any[][];
  text: string;
  loading?: boolean;
};

function SiteIcon({ src, className, alt = "" }: { src: string; className?: string; alt?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      className={cn("inline-block object-contain", className)}
    />
  );
}

function InlineSpinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block rounded-full border-2 border-current border-r-transparent animate-spin",
        className
      )}
    />
  );
}

export default function LandingConverter() {
  const heroImageRef = useRef<HTMLDivElement>(null);
  // Get state management from context
  const contextValue = useProcessingState()
  const processingState = contextValue?.state
  const updateState = contextValue?.updateState
  const clearState = contextValue?.clearState;

  // Free trial state
  const [trialInfo, setTrialInfo] = useState({ uuid: '', used: 0, remaining: 3, hasRemaining: true, limit: 3 });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [filePreviewUrls, setFilePreviewUrls] = useState<{[key: number]: string}>({});
  const [selectedUploadPreview, setSelectedUploadPreview] = useState<{ url: string; name: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [resultFiles, setResultFiles] = useState<any[]>([]);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedFileToShare, setSelectedFileToShare] = useState<any>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [tablePreviewData, setTablePreviewData] = useState<any[][]>([]);
  const [textPreview, setTextPreview] = useState('');
  const [resultPreviews, setResultPreviews] = useState<Record<string, ResultPreview>>({});
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<{ fileId: string; row: number; col: number } | null>(null);
  const [firstImageUrl, setFirstImageUrl] = useState<string>('');
  const [outputMode, setOutputMode] = useState<'table' | 'text'>('table');
  const [totalFilesToProcess, setTotalFilesToProcess] = useState(0);
  const wsRef = useRef<OCRWebSocket | null>(null);
  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uploadAbortRef = useRef<AbortController | null>(null);
  const currentJobIdRef = useRef<string | null>(null);
  const [shareSession, setShareSession] = useState<any>(null);
  const [selectedFilesForBatch, setSelectedFilesForBatch] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [limits, setLimits] = useState<AppLimits | null>(null);
  const [latestRecoverableJob, setLatestRecoverableJob] = useState<RecoverableJobSummary | null>(null);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [signInRedirectPath, setSignInRedirectPath] = useState("/dashboard/client");
  const supabase = createClient();
  const maxUploadFiles = limits?.max_files_per_batch ?? (isAuthenticated ? 5 : 3);
  const {
    limits: entitlementLimits,
    refresh: refreshBilling,
  } = useBillingStatus({
    enabled: true,
    loadLimits: true,
    loadStatus: isAuthenticated,
  });

  // Helper function to remove _processed from filename
  const cleanFilename = (filename: string | undefined): string => {
    if (!filename) return 'result.xlsx';
    return filename.replace('_processed', '');
  };

  useEffect(() => {
    if (entitlementLimits) setLimits(entitlementLimits);
  }, [entitlementLimits]);

  useEffect(() => {
    setUploadedFiles(prev => prev.length > maxUploadFiles ? prev.slice(0, maxUploadFiles) : prev);
  }, [maxUploadFiles]);

  useEffect(() => {
    let mounted = true;

    ocrApi.getLatestRecoverableJob()
      .then((data) => {
        if (!mounted) return;
        const job = data.job;
        setLatestRecoverableJob(job?.active ? job : null);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    return () => {
      if (uploadAbortRef.current) {
        uploadAbortRef.current.abort();
        uploadAbortRef.current = null;
      }
      stopJobMonitoring();
    };
  }, []);

  // Auto download state
  const [autoDownload, setAutoDownload] = useState(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('autoDownload')
    return saved === 'true'
  }
  return false
   });
  const [showAutoDownloadConfirm, setShowAutoDownloadConfirm] = useState(false);
  const isExecutingAutoActionsRef = useRef(false);

  // First-time convert confirmation
  const [showFirstConvertConfirm, setShowFirstConvertConfirm] = useState(false);

  const openSignInModal = useCallback((redirectPath = "/dashboard/client") => {
    setSignInRedirectPath(redirectPath);
    setShowSignInModal(true);
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Restore state from context on mount
  useEffect(() => {
    // Only restore if we don't already have result files
    if (!resultFiles.length && processingState && processingState.processedFiles && processingState.processedFiles.length > 0) {

      // Restore processed files
      setResultFiles(processingState.processedFiles);

      // Fetch table preview for the first file if available
      if (processingState.processedFiles.length > 0) {
        fetchTablePreview(processingState.processedFiles[0].file_id);
      }

      // Restore status
      if (processingState.status === 'completed' || processingState.processingComplete) {
        setProcessingComplete(true);
        setIsProcessing(false);
      } else if (processingState.status === 'processing') {
        setIsProcessing(true);
        setProcessingComplete(false);
      }
    }
  }, []); // Only run once on mount

  // Save state to context when it changes
  useEffect(() => {
    // Only update if we have updateState function available
    if (!updateState) return;

    if (resultFiles.length > 0 || isProcessing) {
      try {
        updateState({
          processedFiles: resultFiles,
          status: processingComplete ? 'completed' : isProcessing ? 'processing' : 'idle',
          processingComplete: processingComplete,
          uploadedFiles: [] // Don't save File objects
        });
      } catch (error) {
      }
    }
  }, [resultFiles, isProcessing, processingComplete, updateState]);

  // Silently wake up backend when page loads
  useEffect(() => {
    wakeUpBackendSilently()

    // Cleanup WebSocket on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
    };
  }, [])

  // Local trial state is only a UI hint. Authenticated users use account credits.
  useEffect(() => {
    if (isAuthenticated) {
      setTrialInfo({ uuid: '', used: 0, remaining: 0, hasRemaining: false, limit: 0 });
      return;
    }
    const info = getTrialInfo();
    setTrialInfo(info);
  }, [isAuthenticated])

  // Persist auto download setting
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('autoDownload', autoDownload.toString())
    }
  }, [autoDownload])

  // Auto-download when files ready
  useEffect(() => {
    if (!autoDownload) return;

    if (processingComplete && resultFiles.length > 0 && !isExecutingAutoActionsRef.current) {
      isExecutingAutoActionsRef.current = true

      const handleAutoDownload = async () => {
        // toast.info(`Auto-downloading ${resultFiles.length} file(s)...`)
        const downloadedIds = new Set<string>()

        for (const file of resultFiles) {
          if (file.file_id && !downloadedIds.has(file.file_id)) {
            try {
              await handleDownloadFile(file.file_id)
              downloadedIds.add(file.file_id)
              await new Promise(resolve => setTimeout(resolve, 500))
            } catch (error) {
            }
          }
        }
        // toast.success(`Auto-downloaded ${downloadedIds.size} file(s)`)
      }
      handleAutoDownload()
    }
  }, [processingComplete, resultFiles, autoDownload])

  // Helper function to create preview URL for file (converts HEIC if needed)
  const createFilePreviewUrl = useCallback(async (file: File): Promise<string> => {
    if (isPdfFile(file)) {
      return createPdfFirstPageScreenshot(file);
    }

    const fileName = file.name.toLowerCase();
    const isHeic = fileName.endsWith('.heic') || fileName.endsWith('.heif');

    if (isHeic) {
      try {
        const { default: heic2any } = await import("heic2any");
        // Convert HEIC to JPEG blob for preview
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.8
        });

        // heic2any might return an array of blobs, so handle both cases
        const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        return URL.createObjectURL(blob);
      } catch (error) {
        // Return a placeholder or try original
        return URL.createObjectURL(file);
      }
    }

    // For non-HEIC files, use normal blob URL
    return URL.createObjectURL(file);
  }, []);

  // Update preview URLs when files change
  useEffect(() => {
    const generatePreviews = async () => {
      const newPreviewUrls: {[key: number]: string} = {};

      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        if (!filePreviewUrls[i]) {
          const url = await createFilePreviewUrl(file);
          newPreviewUrls[i] = url;
        } else {
          newPreviewUrls[i] = filePreviewUrls[i];
        }
      }

      setFilePreviewUrls(newPreviewUrls);
    };

    if (uploadedFiles.length > 0) {
      generatePreviews();
    } else {
      // Clean up old URLs
      Object.values(filePreviewUrls).forEach(url => URL.revokeObjectURL(url));
      setFilePreviewUrls({});
    }
  }, [uploadedFiles.length]);

  // File upload handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(isAcceptedUploadFile);

    if (files.length > 0) {
      const filesToUse = files.slice(0, maxUploadFiles);
      if (files.length > maxUploadFiles) {
        showBatchLimitToast(maxUploadFiles);
      }
      setUploadedFiles(filesToUse);
    }
  }, [maxUploadFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files).filter(isAcceptedUploadFile);
      const filesToUse = fileArray.slice(0, maxUploadFiles);
      if (fileArray.length > maxUploadFiles) {
        showBatchLimitToast(maxUploadFiles);
      }
      setUploadedFiles(filesToUse);
    }
  }, [maxUploadFiles]);

  const processImages = useCallback(async (filesOverride?: File[]) => {
    const filesForProcessing = filesOverride ?? uploadedFiles;

    try {
      if (filesForProcessing.length > maxUploadFiles) {
        showBatchLimitToast(maxUploadFiles);
        setUploadedFiles(prev => prev.slice(0, maxUploadFiles));
        return;
      }

      setIsProcessing(true);
      setIsUploading(true);
      setUploadProgress(0);
      currentJobIdRef.current = null;
      setProcessingComplete(false);
      setResultFiles([]);
      setTablePreviewData([]);
      setTextPreview('');
      setResultPreviews({});
      setSelectedResultIndex(0);
      setComparisonOpen(false);
      setEditingCell(null);
      setSelectedUploadPreview(null);
      setFirstImageUrl('');
      setTotalFilesToProcess(filesForProcessing.length);
      const uploadController = new AbortController();
      uploadAbortRef.current = uploadController;


      // Compress images if needed
      const compressionResults = await compressImages(filesForProcessing);

      // Log compression summary
      const compressedCount = compressionResults.filter(r => r.compressed).length;
      if (compressedCount > 0) {
        const totalOriginal = compressionResults.reduce((sum, r) => sum + r.originalSize, 0);
        const totalCompressed = compressionResults.reduce((sum, r) => sum + r.compressedSize, 0);
        const totalReduction = Math.round(((totalOriginal - totalCompressed) / totalOriginal) * 100);
        toast.info(`Compressed ${compressedCount} image(s) (${totalReduction}% smaller)`);
      }

      // Extract compressed files for upload
      const filesToUpload = compressionResults.map(r => r.file);

      if (uploadController.signal.aborted) {
        const cancelledError = new Error('Upload cancelled') as Error & { code?: string };
        cancelledError.code = 'ERR_CANCELED';
        throw cancelledError;
      }

      const response = await ocrApi.uploadBatchMultipart(filesToUpload, {
        output_format: outputMode === 'text' ? 'txt' : 'xlsx',
        consolidation_strategy: 'separate',
        signal: uploadController.signal,
        onUploadProgress: setUploadProgress
      });

      currentJobIdRef.current = response.job_id;
      setUploadProgress(100);
      setIsUploading(false);

      // Store session ID for downloads
      if (response.session_id) {
        setCurrentSessionId(response.session_id);
      }

      if (!isAuthenticated) {
        incrementTrialUploadCount(1);
        setTrialInfo(getTrialInfo());
      }
      void refreshBilling({ includeStatus: isAuthenticated, includeLimits: true });

      // Store the first uploaded image for preview immediately
      if (filesForProcessing.length > 0) {
        setFirstImageUrl(await createFilePreviewUrl(filesForProcessing[0]));
      }

      startJobMonitoring(response.job_id, response.session_id);

    } catch (error: any) {
      if (error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError') {
        setIsUploading(false);
        setUploadProgress(0);
        setIsProcessing(false);
        setProcessingComplete(false);
        return;
      }

      setIsProcessing(false);
      setProcessingComplete(false);

      const code = error?.code || '';
      const quotaError =
        error?.status_code === 402 ||
        code === 'ANONYMOUS_FREE_TRIAL_LIMIT_REACHED' ||
        code === 'INSUFFICIENT_CREDITS' ||
        code === 'DAILY_IMAGE_LIMIT_EXCEEDED';

      if (quotaError && !isAuthenticated) {
        setShowLimitDialog(true);
        return;
      }

      showApiErrorToast(error, {
        isAuthenticated,
        upgradeHref: "/pricing?from=quota",
        billingHref: "/dashboard/settings?section=billing",
        onSignIn: () => openSignInModal("/pricing?from=quota"),
        onRetry: () => {
          void processImages(filesForProcessing);
        },
      });
    } finally {
      uploadAbortRef.current = null;
      setIsUploading(false);
    }
  }, [uploadedFiles, maxUploadFiles, isAuthenticated, openSignInModal, outputMode, createFilePreviewUrl, refreshBilling]);

  const handleProcessImage = useCallback(async () => {
    if (!uploadedFiles || uploadedFiles.length === 0) {
      toast.error('Please select files to process');
      return;
    }

    if (uploadedFiles.length > maxUploadFiles) {
      showBatchLimitToast(maxUploadFiles);
      setUploadedFiles(prev => prev.slice(0, maxUploadFiles));
      return;
    }

    await processImages(uploadedFiles);
  }, [uploadedFiles, maxUploadFiles, processImages]);

  const handleDownloadFile = async (fileId: string) => {

    if (!fileId) {
      toast.error('Unable to download: File ID is missing');
      return;
    }

    try {

      // Pass session_id to download endpoint
      const blob = await ocrApi.downloadFile(fileId, currentSessionId || undefined);


      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // Use a simple filename without _processed
      link.download = `result-${fileId.substring(0, 8)}.${outputMode === 'text' ? 'txt' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // toast.success('File downloaded successfully');
    } catch (error: any) {
      const errorMessage = error?.detail || error?.message || 'Failed to download file';
      toast.error(errorMessage);
    }
  };

  // Fetch and parse Excel file for preview
  const fetchTablePreview = async (fileId: string, syncActivePreview = true) => {
    if (!fileId) return null;

    const existing = resultPreviews[fileId];
    if (existing && (existing.table.length > 0 || existing.text)) {
      if (syncActivePreview) {
        setTablePreviewData(existing.table);
        setTextPreview(existing.text);
      }
      return existing;
    }

    setResultPreviews(prev => ({
      ...prev,
      [fileId]: {
        table: prev[fileId]?.table || [],
        text: prev[fileId]?.text || '',
        loading: true,
      },
    }));

    try {
      const blob = await ocrApi.downloadFile(fileId, currentSessionId || undefined);

      if (outputMode === 'text' || blob.type.startsWith('text/')) {
        const text = await blob.text();
        const preview = { table: [], text: text.slice(0, 6000), loading: false };
        setResultPreviews(prev => ({ ...prev, [fileId]: preview }));
        if (syncActivePreview) {
          setTablePreviewData([]);
          setTextPreview(preview.text);
        }
        return preview;
      }

      const XLSX = await import('xlsx');
      const arrayBuffer = await blob.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

      const previewData = data.slice(0, Math.min(24, data.length));
      const preview = { table: previewData, text: '', loading: false };
      setResultPreviews(prev => ({ ...prev, [fileId]: preview }));
      if (syncActivePreview) {
        setTablePreviewData(previewData);
        setTextPreview('');
      }
      return preview;
    } catch (error) {
      setResultPreviews(prev => ({
        ...prev,
        [fileId]: {
          table: prev[fileId]?.table || [],
          text: prev[fileId]?.text || '',
          loading: false,
        },
      }));
      // Don't show error toast - just silently fail to show preview
      return null;
    }
  };

  function stopJobMonitoring() {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.disconnect();
      wsRef.current = null;
    }
  }

  function applyRecoveredStatus(status: JobStatusResponse): boolean {
    if (status.progress?.total_images) {
      setTotalFilesToProcess(status.progress.total_images);
    }

    if (status.results?.files?.length) {
      setResultFiles(status.results.files);
      setSelectedResultIndex(0);
      status.results.files.slice(0, 12).forEach((file: any, index: number) => {
        if (file.file_id) void fetchTablePreview(file.file_id, index === 0);
      });
    }

    if (status.status === 'completed' || status.status === 'partially_completed') {
      setProcessingComplete(true);
      setIsProcessing(false);
      if (updateState) {
        updateState({
          processedFiles: status.results?.files || [],
          status: 'completed',
          processingComplete: true,
          uploadedFiles: []
        });
      }
      stopJobMonitoring();
      void refreshBilling({ includeStatus: isAuthenticated, includeLimits: true });
      return true;
    }

    if (status.status === 'failed') {
      setProcessingComplete(false);
      setIsProcessing(false);
      stopJobMonitoring();
      void refreshBilling({ includeStatus: isAuthenticated, includeLimits: true });
      toast.error(status.errors?.[0] || 'Processing failed');
      return true;
    }

    setIsProcessing(true);
    setProcessingComplete(false);
    return false;
  }

  function startStatusPolling(jobId: string) {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }

    const checkStatus = async () => {
      try {
        const status = await ocrApi.getStatus(jobId);
        const terminal = applyRecoveredStatus(status);
        if (!terminal) {
          pollingRef.current = setTimeout(checkStatus, 3000);
        }
      } catch {
        pollingRef.current = setTimeout(checkStatus, 5000);
      }
    };

    pollingRef.current = setTimeout(checkStatus, 800);
  }

  function startJobMonitoring(jobId: string, sessionId?: string) {
    if (!jobId) return;

    stopJobMonitoring();
    currentJobIdRef.current = jobId;
    setCurrentSessionId(sessionId || null);
    setIsProcessing(true);
    setProcessingComplete(false);
    setLatestRecoverableJob(null);
    startStatusPolling(jobId);

    if (!sessionId) return;

    const websocket = new OCRWebSocket(
      sessionId,
      (data) => {
        const messageType = data.type || '';

        if (messageType === 'file_ready' && data.file_info?.file_id) {
          setResultFiles(prev => {
            const existing = prev || [];
            if (existing.some(f => f.file_id === data.file_info.file_id)) return existing;
            const newFiles = [...existing, data.file_info];
            if (newFiles.length === 1) {
              setSelectedResultIndex(0);
              void fetchTablePreview(data.file_info.file_id, true);
            } else {
              void fetchTablePreview(data.file_info.file_id, false);
            }
            return newFiles;
          });
        }

        if (messageType === 'job_completed' || data.status === 'completed') {
          setProcessingComplete(true);
          setIsProcessing(false);
          if (data.files && data.files.length > 0) {
            setResultFiles(data.files);
            setSelectedResultIndex(0);
            data.files.slice(0, 12).forEach((file: any, index: number) => {
              if (file.file_id) void fetchTablePreview(file.file_id, index === 0);
            });
          }
          stopJobMonitoring();
          void refreshBilling({ includeStatus: isAuthenticated, includeLimits: true });
        }

        if (messageType === 'job_error' || data.status === 'failed') {
          const errorMsg = data.error || data.errors?.[0] || 'Processing failed';
          setIsProcessing(false);
          stopJobMonitoring();
          void refreshBilling({ includeStatus: isAuthenticated, includeLimits: true });
          toast.error(errorMsg);
        }
      },
      () => {
        startStatusPolling(jobId);
      }
    );

    websocket.connect();
    wsRef.current = websocket;
  }

  async function cancelCurrentBatch() {
    const activeJobId = currentJobIdRef.current;

    if (uploadAbortRef.current) {
      uploadAbortRef.current.abort();
      uploadAbortRef.current = null;
    }

    stopJobMonitoring();

    if (activeJobId) {
      try {
        await ocrApi.cancelJob(activeJobId);
      } catch {
      }
    }

    currentJobIdRef.current = null;
    setIsUploading(false);
    setUploadProgress(0);
    setIsProcessing(false);
    setProcessingComplete(false);
    setLatestRecoverableJob(null);
    void refreshBilling({ includeStatus: isAuthenticated, includeLimits: true });
    toast.info('Batch cancelled.');
  }

  async function continueLatestJob() {
    if (!latestRecoverableJob?.job_id) return;

    setRecoveryLoading(true);
    try {
      setUploadedFiles([]);
      setResultFiles([]);
      setTotalFilesToProcess(latestRecoverableJob.total_images || 0);
      startJobMonitoring(latestRecoverableJob.job_id, latestRecoverableJob.session_id);
      toast.success('Latest batch resumed.');
    } catch (error: any) {
      toast.error(error?.detail || 'Could not resume the latest batch.');
    } finally {
      setRecoveryLoading(false);
    }
  }

  const handleReset = () => {
    if (uploadAbortRef.current) {
      uploadAbortRef.current.abort();
      uploadAbortRef.current = null;
    }
    currentJobIdRef.current = null;
    setUploadedFiles([]);
    setResultFiles([]);
    setProcessingComplete(false);
    setIsProcessing(false);
    setIsUploading(false);
    setUploadProgress(0);
    setTablePreviewData([]);
    setTextPreview('');
    setResultPreviews({});
    setSelectedResultIndex(0);
    setComparisonOpen(false);
    setEditingCell(null);
    setSelectedUploadPreview(null);
    setFirstImageUrl('');
    setTotalFilesToProcess(0);
    setCurrentSessionId(null);
    stopJobMonitoring();
    isExecutingAutoActionsRef.current = false;

    // Clear context state
    clearState();
  };

  const handleShareFile = (file: any) => {
    setSelectedFileToShare(file);
    setShareDialogOpen(true);
    setCopySuccess(false);
  };

  const handleCopyLink = async () => {
    if (!selectedFileToShare?.file_id) {
      toast.error('Unable to copy link: File information is missing');
      return;
    }

    let shareContent = '';

    // Check if this is a session-based batch share
    if (selectedFileToShare.file_id === '__SESSION__' && shareSession) {
      shareContent = shareSession.share_url;
    } else {
      // Single file share
      shareContent = buildDownloadUrl(selectedFileToShare.file_id);
    }


    try {
      await navigator.clipboard.writeText(shareContent);
      setCopySuccess(true);
      // toast.success('Download link copied to clipboard');
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link to clipboard');
    }
  };

  // Share handlers for social platforms
  const handleMessengerShare = () => {
    if (!selectedFileToShare?.file_id) return;

    let shareUrl = '';

    // Check if session-based share
    if (selectedFileToShare.file_id === '__SESSION__' && shareSession) {
      shareUrl = shareSession.share_url.replace(/\s/g, '');
    } else {
      shareUrl = buildDownloadUrl(selectedFileToShare.file_id);
    }

    const currentUrl = window.location.origin;
    const messengerUrl = buildMessengerShareUrl(shareUrl, currentUrl);
    if (!messengerUrl) {
      navigator.clipboard.writeText(shareUrl).catch(() => undefined);
      toast.error('Messenger sharing is not configured. Link copied instead.');
      return;
    }

    const popup = window.open(messengerUrl, 'messenger-share-dialog', 'width=600,height=500');
    if (!popup || popup.closed || typeof popup.closed == 'undefined') {
      window.open(messengerUrl, '_blank');
    }
  };

  const handleEmailShare = () => {
    if (!selectedFileToShare?.file_id) return;

    let subject = '';
    let body = '';

    // Check if session-based share
    if (selectedFileToShare.file_id === '__SESSION__' && shareSession) {
      subject = `${selectedFilesForBatch.length} Excel files processed with AxLiner`;
      const sessionUrl = shareSession.share_url.replace(/\s/g, '');
      body = `Hi,\n\nI've processed ${selectedFilesForBatch.length} files with AxLiner. You can download all files from this link:\n\n${sessionUrl}\n\nBest regards`;
    } else {
      const shareUrl = buildDownloadUrl(selectedFileToShare.file_id);
      subject = `Excel file: ${selectedFileToShare.filename || 'Processed with AxLiner'}`;
      body = `Hi,\n\nI've processed this file with AxLiner. You can download it here:\n\n${shareUrl}\n\nBest regards`;
    }

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const gmailWindow = window.open(gmailUrl, '_blank');

    if (!gmailWindow) {
      const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
    }
  };

  const handleLinkedInMessage = () => {
    if (!selectedFileToShare?.file_id) return;

    let shareContent = '';

    // Check if session-based share
    if (selectedFileToShare.file_id === '__SESSION__' && shareSession) {
      shareContent = shareSession.share_url.replace(/\s/g, '');
    } else {
      shareContent = buildDownloadUrl(selectedFileToShare.file_id);
    }

    navigator.clipboard.writeText(shareContent)
      .then(() => {
        // toast.success('Link copied to clipboard!', {
        //   duration: 8000,
        //   description: 'Opening LinkedIn... Click "New message" → Choose recipient → Paste the link (Ctrl+V or Cmd+V)'
        // });
        window.open('https://www.linkedin.com/messaging/compose/', '_blank');
      })
      .catch((err) => {
        const fallbackInput = document.createElement('input');
        fallbackInput.value = shareContent;
        document.body.appendChild(fallbackInput);
        fallbackInput.select();
        document.execCommand('copy');
        document.body.removeChild(fallbackInput);

        // toast.success('Link copied! Opening LinkedIn...', { duration: 6000 });
        window.open('https://www.linkedin.com/messaging/compose/', '_blank');
      });
  };

  const handleXShare = () => {
    if (!selectedFileToShare?.file_id) return;

    let tweetText = '';
    let shareUrl = '';

    // Check if session-based share
    if (selectedFileToShare.file_id === '__SESSION__' && shareSession) {
      shareUrl = shareSession.share_url.replace(/\s/g, '');
      tweetText = `Check out these ${selectedFilesForBatch.length} Excel files I processed with AxLiner! 📊✨`;
    } else {
      shareUrl = buildDownloadUrl(selectedFileToShare.file_id);
      tweetText = `Check out this Excel file I processed with AxLiner! 📊✨`;
    }

    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;

    window.open(xUrl, '_blank', 'width=550,height=420');
    // toast.success('X share window opened!', {
    //   description: 'Customize your tweet and share with your followers'
    // });
  };

  const handleDownloadAll = async () => {
    if (resultFiles.length === 0) return;

    // toast.info(`Downloading ${resultFiles.length} file(s)...`);

    for (const file of resultFiles) {
      if (file.file_id) {
        try {
          await handleDownloadFile(file.file_id);
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
        }
      }
    }

    // toast.success(`Downloaded ${resultFiles.length} file(s)`);
  };

  const handleShareAll = async () => {

    if (!resultFiles || resultFiles.length === 0) {
      toast.error('Unable to share batch: No files available');
      return;
    }

    // Get all valid file IDs
    const allFileIds = resultFiles.map(f => f.file_id).filter(Boolean);

    if (allFileIds.length === 0) {
      toast.error('Unable to share: No valid files found');
      return;
    }

    try {
      // Create a share session for all files

      const sessionResponse = await ocrApi.createShareSession({
        file_ids: allFileIds,
        title: `Batch of ${resultFiles.length} Excel files`,
        description: `Processed on ${new Date().toLocaleDateString()}`,
        expires_in_days: 7
      });


      // Store session info
      setShareSession(sessionResponse);
      setSelectedFilesForBatch(resultFiles);

      // Open share dialog with session info
      setSelectedFileToShare({
        file_id: '__SESSION__',
        filename: `Batch of ${resultFiles.length} Excel files`,
        isBatch: true,
        sessionId: sessionResponse.session_id
      });

      setShareDialogOpen(true);
      setCopySuccess(false);

      // toast.success('Share link created successfully!')

    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to create share link';
      toast.error(`Error: ${errorMessage}`);
    }
  };

  const activeFileCount = totalFilesToProcess || uploadedFiles.length || resultFiles.length || 1;
  const estimatedSeconds = Math.max(25, Math.ceil(activeFileCount / 3) * 25);
  const conversionEstimateLabel =
    estimatedSeconds >= 60
      ? `up to ${Math.ceil(estimatedSeconds / 60)} min`
      : `up to ${estimatedSeconds}s`;
  const getResultInputIndex = (file: any, fallbackIndex: number) => {
    const originalName = String(file?.original_filename || file?.source_filename || file?.input_filename || '').toLowerCase();
    if (!originalName) return fallbackIndex;

    const matchIndex = uploadedFiles.findIndex(uploadedFile => {
      const uploadedName = uploadedFile.name.toLowerCase();
      const uploadedBase = uploadedName.replace(/\.[^.]+$/, '');
      return originalName === uploadedName || originalName.includes(uploadedName) || originalName.includes(uploadedBase);
    });

    return matchIndex >= 0 ? matchIndex : fallbackIndex;
  };
  const getResultPreviewUrl = (index: number, file?: any) => {
    const inputIndex = file ? getResultInputIndex(file, index) : index;
    return filePreviewUrls[inputIndex] || (inputIndex === 0 ? firstImageUrl : "");
  };
  const selectedResult = resultFiles[selectedResultIndex] || resultFiles[0];
  const selectedPreview = selectedResult?.file_id ? resultPreviews[selectedResult.file_id] : undefined;
  const selectedTablePreview = selectedPreview?.table?.length
    ? selectedPreview.table
    : selectedResultIndex === 0
      ? tablePreviewData
      : [];
  const selectedTextPreview = selectedPreview?.text || (selectedResultIndex === 0 ? textPreview : '');
  const selectedImageUrl = getResultPreviewUrl(selectedResultIndex, selectedResult);
  const selectedColumnCount = Math.max(1, ...selectedTablePreview.map(row => row.length));

  const openResultComparison = (index: number) => {
    const file = resultFiles[index];
    if (!file) return;
    setSelectedResultIndex(index);
    setComparisonOpen(true);
    setEditingCell(null);
    if (file.file_id) void fetchTablePreview(file.file_id);
  };

  const updatePreviewCell = (fileId: string, rowIndex: number, cellIndex: number, value: string) => {
    const currentPreview = resultPreviews[fileId] || { table: [], text: '' };
    const nextTable = currentPreview.table.map(row => [...row]);
    if (!nextTable[rowIndex]) nextTable[rowIndex] = [];
    nextTable[rowIndex][cellIndex] = value;

    setResultPreviews(prev => ({
      ...prev,
      [fileId]: {
        table: nextTable,
        text: currentPreview.text,
        loading: false,
      },
    }));

    if (selectedResult?.file_id === fileId) {
      setTablePreviewData(nextTable);
    }
  };

  const renderResultPreviewThumb = (preview?: ResultPreview) => {
    if (preview?.text) {
      const lines = preview.text.split(/\r?\n/).filter(Boolean).slice(0, 5);
      return (
        <div className="flex h-full min-h-[96px] flex-col gap-1.5 overflow-hidden rounded-[0.95rem] border border-[#2f165e]/10 bg-white p-3">
          {lines.length > 0 ? lines.map((line, index) => (
            <span key={index} className="truncate text-[10px] font-semibold text-[#111827]/62">
              {line}
            </span>
          )) : (
            <span className="text-[10px] font-semibold text-[#111827]/45">Text output</span>
          )}
        </div>
      );
    }

    const rows = preview?.table?.length ? preview.table.slice(0, 5) : [];

    return (
      <div className="h-full min-h-[96px] overflow-hidden rounded-[0.95rem] border border-[#2f165e]/10 bg-white">
        <div className="grid grid-cols-4 bg-[#2f165e]">
          {Array.from({ length: 4 }).map((_, index) => (
            <span key={index} className="h-3 border-r border-white/20 last:border-r-0" />
          ))}
        </div>
        {rows.length > 0 ? rows.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-4 border-b border-[#eadfff] last:border-b-0">
            {Array.from({ length: 4 }).map((_, cellIndex) => (
              <span
                key={cellIndex}
                className="truncate border-r border-[#eadfff] px-1.5 py-1 text-[9px] font-semibold text-[#111827]/58 last:border-r-0"
              >
                {row[cellIndex] || ''}
              </span>
            ))}
          </div>
        )) : Array.from({ length: 5 }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-4 border-b border-[#eadfff] last:border-b-0">
            {Array.from({ length: 4 }).map((__, cellIndex) => (
              <span key={cellIndex} className="h-4 border-r border-[#eadfff] last:border-r-0">
                <span className="mx-1 mt-1 block h-1.5 rounded-full bg-[#d8cde7]" />
              </span>
            ))}
          </div>
        ))}
      </div>
    );
  };

  useEffect(() => {
    if (!comparisonOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setComparisonOpen(false);
        setEditingCell(null);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [comparisonOpen]);
  return (
    <>
        {/* Conversion Section */}
        <section className="relative z-10 scroll-mt-28 py-16 sm:py-20">
          <div className="container mx-auto max-w-[1400px] px-4 sm:px-5 lg:px-9">
            <div className="mb-8 text-center">
              <h2 className="text-5xl font-semibold tracking-normal text-[#111827] sm:text-6xl">
                Try It
              </h2>
            </div>
            {resultFiles.length === 0 && !isProcessing && (
              <div className="mx-auto mb-8 flex w-full max-w-[1120px] items-center rounded-full border border-[#2f165e]/25 bg-[#2f165e] p-2 shadow-[0_18px_50px_rgba(47,22,94,0.20)]">
                <button
                  type="button"
                  onClick={() => setOutputMode('table')}
                  className={cn(
                    "flex-1 rounded-full px-4 py-3 text-sm font-semibold transition-colors",
                    outputMode === 'table'
                      ? "bg-[#E9ECE4] text-[#2f165e] shadow-sm"
                      : "text-white/78 hover:bg-white/10 hover:text-white"
                  )}
                >
                  Table output
                </button>
                <button
                  type="button"
                  onClick={() => setOutputMode('text')}
                  className={cn(
                    "flex-1 rounded-full px-4 py-3 text-sm font-semibold transition-colors",
                    outputMode === 'text'
                      ? "bg-[#E9ECE4] text-[#2f165e] shadow-sm"
                      : "text-white/78 hover:bg-white/10 hover:text-white"
                  )}
                >
                  Text output
                </button>
              </div>
            )}
              <div ref={heroImageRef} className={`relative mx-auto ${resultFiles.length > 0 ? 'w-full max-w-none' : 'w-full max-w-[1260px]'}`}>
                <div className={resultFiles.length === 0 ? "grid items-stretch gap-8" : "relative w-full"}>
                <div className="relative w-full space-y-5 rounded-[2.25rem] border border-white/18 bg-[#626979] p-5 text-white shadow-[0_28px_80px_rgba(47,22,94,0.18)] sm:p-6 lg:p-7">
                  {latestRecoverableJob && !isProcessing && (
                    <div className="rounded-[1.25rem] border border-[#eadfff] bg-[#E9ECE4]/85 p-4 shadow-[0_16px_45px_rgba(68,31,132,0.10)] backdrop-blur-xl">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-bold text-foreground">Continue latest batch</p>
                          <p className="text-xs text-muted-foreground">
                            {latestRecoverableJob.processed_images || 0} of {latestRecoverableJob.total_images || 0} images processed
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={continueLatestJob}
                          disabled={recoveryLoading}
                          className="rounded-2xl bg-[#2f165e] text-white hover:bg-[#441f84]"
                        >
                          {recoveryLoading ? 'Resuming...' : 'Continue latest job'}
                        </Button>
                      </div>
                    </div>
                  )}
                  {/* Upload Dropzone - Hide when showing results */}
                  {!processingComplete && resultFiles.length === 0 && (
                    <div className="space-y-3">
                      <div
                        onClick={() => document.getElementById('file-upload-landing')?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`relative rounded-[1.75rem] border border-dashed bg-[#eef0ea]/92 text-[#111827] transition-all duration-200 cursor-pointer ${
                          isDragging
                            ? 'border-[#2f165e] bg-white scale-[0.99]'
                            : uploadedFiles.length > 0
                              ? 'border-[#2f165e]/55 bg-[#eef0ea]'
                              : 'border-white/80 hover:border-[#2f165e]/70 hover:bg-white'
                        } flex min-h-[170px] items-center justify-center p-6 lg:min-h-[190px] lg:p-8`}
                      >
                        <div className="text-center">
                          {uploadedFiles.length === 0 ? (
                            <>
                              <SiteIcon src={siteIcons.upload} className="mx-auto mb-4 h-10 w-10" />
                              <h3 className="mb-1 text-xl font-semibold">
                                {isDragging ? 'Drop files here' : 'Drag or upload your files here'}
                              </h3>
                              <input
                                id="file-upload-landing"
                                type="file"
                                accept={acceptedUploadMimeTypes}
                                multiple
                                onChange={handleFileInput}
                                className="hidden"
                              />
                              <p className="mx-auto max-w-sm text-sm font-semibold uppercase tracking-[0.14em] text-[#111827]/58">
                                PNG, JPEG, WebP, PDF
                              </p>
                            </>
                          ) : (
                            <>
                              {/* Image Queue - Small thumbnails */}
                              <div className="mb-4 grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-6">
                                {uploadedFiles.map((file, index) => (
                                  <div
                                    key={index}
                                    role="button"
                                    tabIndex={0}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      const url = filePreviewUrls[index];
                                      if (url) setSelectedUploadPreview({ url, name: file.name });
                                    }}
                                    onKeyDown={(event) => {
                                      if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        const url = filePreviewUrls[index];
                                        if (url) setSelectedUploadPreview({ url, name: file.name });
                                      }
                                    }}
                                    className="relative group aspect-square cursor-pointer overflow-hidden rounded-xl border border-white/60 bg-card outline-none ring-offset-2 transition hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-[#2f165e]"
                                  >
                                    <img
                                      src={filePreviewUrls[index] || ''}
                                      alt={file.name}
                                      className="w-full h-full object-cover"
                                    />
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
                                        setSelectedUploadPreview(null);
                                      }}
                                      disabled={isProcessing}
                                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background/85 opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100"
                                    >
                                      <span className="relative h-3 w-3" aria-hidden="true">
                                        <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 rotate-45 bg-foreground" />
                                        <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 -rotate-45 bg-foreground" />
                                      </span>
                                    </button>
                                  </div>
                                ))}
                              </div>
                              <p className="mb-3 text-sm font-semibold text-[#111827]">{uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} ready</p>
                              <label htmlFor="file-upload-landing-more">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isProcessing}
                                  className="rounded-full border border-[#2f165e]/25 bg-white/70 text-sm text-[#2f165e]"
                                  asChild
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span>Add More</span>
                                </Button>
                              </label>
                              <input
                                id="file-upload-landing-more"
                                type="file"
                                accept={acceptedUploadMimeTypes}
                                multiple
                                onChange={(e) => {
                                  const newFiles = e.target.files;
                                  if (newFiles && newFiles.length > 0) {
                                    const fileArray = Array.from(newFiles).filter(isAcceptedUploadFile);
                                    setUploadedFiles(prev => {
                                      const remainingSlots = maxUploadFiles - prev.length;
                                      const filesToAdd = fileArray.slice(0, Math.max(0, remainingSlots));
                                      if (fileArray.length > filesToAdd.length) {
                                        showBatchLimitToast(maxUploadFiles);
                                      }
                                      return [...prev, ...filesToAdd];
                                    });
                                  }
                                }}
                                className="hidden"
                              />
                            </>
                          )}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Progressive Results Display - Full Width as soon as we have results */}
                  {(isProcessing || resultFiles.length > 0) && (
                    <div className={`ax-glass-card overflow-hidden rounded-[2rem] border border-white/45 ${resultFiles.length > 0 ? 'p-5 sm:p-6' : 'p-6 sm:p-7'}`}>
                      <div className={`mb-5 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between ${resultFiles.length > 0 ? 'border-b border-white/35 pb-5' : ''}`}>
                        <div className="flex items-start gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.35rem] bg-[#441F84] text-white shadow-lg shadow-[#441F84]/20">
                            {processingComplete ? (
                              <FileSpreadsheet className="h-6 w-6" />
                            ) : (
                              <InlineSpinner className="h-6 w-6" />
                            )}
                          </div>
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-2xl font-semibold tracking-tight text-[#111827]">
                                {processingComplete ? 'Files ready' : 'Converting your files'}
                              </h3>
                              <span className="rounded-full border border-[#2f165e]/18 bg-white/55 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#111827]/70 backdrop-blur-md">
                                {processingComplete ? `${resultFiles.length} ready` : 'converting'}
                              </span>
                            </div>
                            {!processingComplete && (
                              <p className="max-w-xl text-sm font-medium leading-6 text-[#111827]/68">
                                Converting {activeFileCount} file{activeFileCount > 1 ? 's' : ''}. This may take {conversionEstimateLabel}.
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 lg:justify-end">
                          {processingComplete && resultFiles.length > 1 && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleDownloadAll}
                                className="border border-[#2f165e]/25 bg-white/55 backdrop-blur-md"
                              >
                                <Download className="mr-1 h-5 w-5" />
                                Download All
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleShareAll}
                                className="gap-2 bg-white/55 border-2 border-foreground text-foreground backdrop-blur-md hover:bg-muted/50"
                              >
                                <Share2 className="h-5 w-5" />
                                Share All
                              </Button>
                            </>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={isProcessing && !processingComplete ? cancelCurrentBatch : handleReset}
                            className="border border-[#2f165e]/25 bg-white/55 backdrop-blur-md"
                          >
                            {isProcessing && !processingComplete ? <X className="mr-1 h-4 w-4" /> : <RotateCcw className="mr-1 h-4 w-4" />}
                            {isProcessing && !processingComplete ? 'Cancel' : 'Convert Again'}
                          </Button>
                        </div>
                      </div>

                      {isProcessing && !processingComplete && (
                        <div className="mb-5 rounded-[1.35rem] border border-[#eadfff] bg-white/50 p-5 backdrop-blur-md">
                          <div className="flex items-start gap-3">
                            <InlineSpinner className="mt-1 h-5 w-5 shrink-0 text-[#441F84]" />
                            <div>
                              <p className="text-sm font-semibold text-[#111827]">Converting your batch</p>
                              <p className="mt-1 text-sm font-medium leading-6 text-[#111827]/68">
                                This may take {conversionEstimateLabel} based on {activeFileCount} file{activeFileCount > 1 ? 's' : ''}.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {resultFiles.length > 0 && (
                        <div className="space-y-4">
                          {/* Preview Section - Only for first file */}
                          {resultFiles.length > 0 && (selectedTablePreview.length > 0 || selectedTextPreview) && selectedImageUrl && (
                            <div className="space-y-4">
                              {/* Image and Table Preview Side by Side */}
                              <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                                {/* Original Image */}
                                <div className="flex flex-col xl:col-span-1">
                                  <h4 className="mb-3 text-sm font-semibold text-[#111827]/70">Selected input</h4>
                                  <div className="flex max-h-[640px] items-center justify-center overflow-hidden rounded-[1.35rem] border border-white/60 bg-white/55">
                                    <img
                                      src={selectedImageUrl}
                                      alt="Original"
                                      className="max-w-full h-auto max-h-[600px] object-contain"
                                    />
                                  </div>
                                </div>

                                {/* Output Preview */}
                                <div className="flex flex-col xl:col-span-2">
                                  <h4 className="mb-3 text-sm font-semibold text-[#111827]/70">
                                    {outputMode === 'text' ? 'Extracted text preview' : 'Extracted spreadsheet preview'}
                                  </h4>
                                  <div className="max-h-[640px] overflow-auto rounded-[1.35rem] border border-white/60 bg-white">
                                    {outputMode === 'text' || selectedTextPreview ? (
                                      <pre className="min-h-[360px] whitespace-pre-wrap p-5 text-left text-sm leading-7 text-[#111827]">
                                        {selectedTextPreview}
                                      </pre>
                                    ) : (
                                      <>
                                        <table className="w-full border-collapse text-base text-[#111827]">
                                          <tbody>
                                            {selectedTablePreview.map((row, rowIndex) => (
                                              <tr
                                                key={rowIndex}
                                                className={cn(
                                                  "border-b border-[#d8cde7]",
                                                  rowIndex === 0
                                                    ? "bg-[#2f165e] font-semibold text-white"
                                                    : rowIndex % 2 === 0
                                                      ? "bg-[#f8f4ff]"
                                                      : "bg-white"
                                                )}
                                              >
                                                {row.map((cell, cellIndex) => (
                                                  <td
                                                    key={cellIndex}
                                                    className="border-r border-[#d8cde7] px-3 py-2 text-left font-medium last:border-r-0"
                                                  >
                                                    {cell || ''}
                                                  </td>
                                                ))}
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                        {selectedTablePreview.length >= 24 && (
                                          <div className="border-t border-[#d8cde7] bg-[#f8f4ff] px-3 py-2 text-center text-xs font-semibold text-[#4b2d82]">
                                            Showing first 24 rows
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                            </div>
                          )}

                          <div className="rounded-[1.6rem] border border-white/60 bg-white/45 p-4 shadow-[0_18px_50px_rgba(47,22,94,0.10)] backdrop-blur-xl sm:p-5">
                            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#111827]/55">Batch output</p>
                                <p className="mt-1 text-lg font-semibold text-[#111827]">
                                  {resultFiles.length} file{resultFiles.length > 1 ? 's' : ''} ready
                                </p>
                                <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#2f165e]/8 px-3 py-1 text-xs font-semibold text-[#2f165e]">
                                  <span className="h-2 w-2 rounded-full bg-[#2f165e] animate-pulse" />
                                  Click any result to compare and fix cells
                                </p>
                              </div>
                              <Button
                                size="sm"
                                onClick={handleDownloadAll}
                                className="w-full gap-2 rounded-full bg-primary text-white hover:bg-primary/90 sm:w-auto"
                              >
                                <Download className="h-4 w-4" />
                                Download All
                              </Button>
                            </div>

                            <div className={cn(
                              "grid gap-3",
                              resultFiles.length > 8
                                ? "grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4"
                                : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                            )}>
                              {resultFiles.map((file: any, index: number) => {
                                const previewUrl = getResultPreviewUrl(index, file);
                                const compact = resultFiles.length > 8;
                                const filePreview = file.file_id ? resultPreviews[file.file_id] : undefined;

                                return (
                                  <div
                                    key={file.file_id || index}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => openResultComparison(index)}
                                    onKeyDown={(event) => {
                                      if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault();
                                        openResultComparison(index);
                                      }
                                    }}
                                    className={cn(
                                      "group cursor-pointer rounded-[1.2rem] border border-white/70 bg-white/58 p-3 shadow-sm outline-none backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:border-[#2f165e]/28 hover:shadow-[0_18px_44px_rgba(47,22,94,0.14)] focus-visible:ring-2 focus-visible:ring-[#2f165e]",
                                      compact ? "min-h-[150px]" : "min-h-[178px]"
                                    )}
                                  >
                                    <div className="grid grid-cols-[minmax(72px,0.9fr)_minmax(0,1.1fr)] gap-3">
                                      <div className="overflow-hidden rounded-[0.95rem] border border-[#2f165e]/10 bg-white">
                                        {previewUrl ? (
                                          <img
                                            src={previewUrl}
                                            alt={`Input file ${index + 1}`}
                                            className="h-full min-h-[96px] w-full object-cover"
                                          />
                                        ) : (
                                          <div className="flex h-full min-h-[96px] items-center justify-center bg-[#f7f2ff]">
                                            <FileText className="h-7 w-7 text-[#2f165e]/65" />
                                          </div>
                                        )}
                                      </div>
                                      {renderResultPreviewThumb(filePreview)}
                                    </div>

                                    <div className="mt-3 flex min-w-0 items-center justify-between gap-3">
                                      <div className="flex min-w-0 items-center gap-2">
                                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2f165e] text-[11px] font-bold text-white">
                                            {index + 1}
                                          </span>
                                          {outputMode === 'text' ? (
                                            <FileText className="h-5 w-5 shrink-0 text-[#2f165e]" />
                                          ) : (
                                            <FileSpreadsheet className="h-5 w-5 shrink-0 text-[#2f165e]" />
                                          )}
                                        <p className="truncate text-sm font-semibold text-[#111827]">
                                          {cleanFilename(file.filename)}
                                        </p>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        <Button
                                          size="sm"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            handleDownloadFile(file.file_id);
                                          }}
                                          className="h-8 rounded-full bg-primary px-3 text-xs text-white hover:bg-primary/90"
                                        >
                                          Download
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            handleShareFile(file);
                                          }}
                                          className="h-8 rounded-full border border-[#2f165e]/20 bg-white/70 px-2.5 text-[#2f165e] hover:bg-primary/10"
                                          aria-label={`Share ${cleanFilename(file.filename)}`}
                                        >
                                          <Share2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}

                              {isProcessing && totalFilesToProcess > resultFiles.length && (
                                <>
                                  {Array.from({ length: totalFilesToProcess - resultFiles.length }).map((_, index) => (
                                    <div key={`pending-${index}`} className="flex min-h-[112px] items-center gap-3 rounded-[1.2rem] border border-dashed border-[#2f165e]/22 bg-white/30 p-4 backdrop-blur-xl">
                                      <InlineSpinner className="h-5 w-5 shrink-0 text-primary" />
                                      <span className="text-sm font-medium text-[#111827]/70">
                                        Converting file {resultFiles.length + index + 1}
                                      </span>
                                    </div>
                                  ))}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {isProcessing && !processingComplete && resultFiles.length === 0 && (
                        <div className="mt-5 flex items-center justify-center gap-2 rounded-[1.25rem] border border-white/55 bg-white/35 p-4 text-sm font-medium text-[#111827]/70 backdrop-blur-xl">
                          <InlineSpinner className="h-4 w-4" />
                          <span>Converting. This may take {conversionEstimateLabel}.</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Convert button - Hide when processing or files ready */}
                  {!isProcessing && resultFiles.length === 0 && (
                  <div className="grid gap-4">
                    <Button
                     onClick={handleProcessImage}
                     disabled={uploadedFiles.length === 0 || isProcessing}
                     className={`min-h-[58px] rounded-[1.25rem] border text-base font-semibold transition-all duration-200 ${
                      uploadedFiles.length === 0
                           ? 'border-white/20 bg-white/18 text-white/50 hover:bg-white/18 cursor-not-allowed'
                           : 'border-[#E9ECE4] bg-[#E9ECE4] text-[#2f165e] hover:bg-white hover:scale-[1.01] shadow-lg shadow-black/10'
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <InlineSpinner className="h-6 w-6 mr-2" />
                          Converting...
                        </>
                      ) : (
                        <>
                          {uploadedFiles.length === 0 ? 'Add files first' : outputMode === 'text' ? 'Extract Text' : 'Convert to Excel'}
                        </>
                      )}
                    </Button>
                  </div>
                  )}
                </div>

                {resultFiles.length === 0 && (
                  <div className="relative flex min-h-[560px] flex-col justify-between overflow-hidden rounded-[2.25rem] bg-[#626979] p-5 text-white shadow-[0_28px_80px_rgba(47,22,94,0.16)] sm:p-6 lg:p-7">
                    <div className="flex items-center justify-between gap-4 px-1">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/62">Preview</p>
                        <h3 className="mt-2 text-2xl font-semibold text-white">Before and after</h3>
                      </div>
                      <span className="hidden rounded-full bg-[#E9ECE4] px-3 py-1 text-xs font-semibold text-[#2f165e] sm:inline-flex">
                        XLSX ready
                      </span>
                    </div>

                    <div className="mt-6 grid flex-1 gap-6 sm:grid-cols-2">
                      <figure className="flex min-h-[470px] flex-col">
                        <figcaption className="mb-3 px-1 text-sm font-semibold text-white/82">Before</figcaption>
                        <div className="relative flex flex-1 items-center justify-center">
                          <Image
                            src="/b.webp"
                            alt="Handwritten table before conversion"
                            width={640}
                            height={720}
                            sizes="(min-width: 640px) 45vw, 100vw"
                            className="max-h-[450px] w-full object-contain"
                          />
                        </div>
                      </figure>

                      <figure className="flex min-h-[470px] flex-col">
                        <figcaption className="mb-3 px-1 text-sm font-semibold text-white/82">After</figcaption>
                        <div className="relative flex flex-1 items-center justify-center">
                          <Image
                            src="/bb.png"
                            alt="Spreadsheet output after conversion"
                            width={640}
                            height={720}
                            sizes="(min-width: 640px) 45vw, 100vw"
                            className="max-h-[450px] w-full object-contain"
                          />
                        </div>
                      </figure>
                    </div>
                  </div>
                )}
                </div>
              </div>
          </div>
        </section>

      {selectedUploadPreview && (
        <div
          className="fixed inset-0 z-[75] flex items-center justify-center bg-[#111827]/45 p-4 backdrop-blur-xl"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedUploadPreview(null);
          }}
        >
          <div className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/60 bg-white/85 p-4 shadow-[0_36px_110px_rgba(17,24,39,0.34)] backdrop-blur-2xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="truncate text-sm font-semibold text-[#111827]">{selectedUploadPreview.name}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedUploadPreview(null)}
                className="h-9 rounded-full border-[#2f165e]/20 bg-white/75 px-3 text-[#2f165e]"
                aria-label="Close preview"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex max-h-[78vh] items-center justify-center overflow-hidden rounded-[1.35rem] bg-white">
              <img
                src={selectedUploadPreview.url}
                alt={selectedUploadPreview.name}
                className="max-h-[78vh] w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {comparisonOpen && selectedResult && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#111827]/45 p-3 backdrop-blur-xl sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setComparisonOpen(false);
              setEditingCell(null);
            }
          }}
        >
          <div className="w-full max-w-[1220px] overflow-hidden rounded-[2rem] border border-white/60 bg-[#f8f4ff]/92 shadow-[0_36px_110px_rgba(17,24,39,0.34)] backdrop-blur-2xl">
            <div className="flex flex-col gap-3 border-b border-white/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2f165e]/70">
                  Compare and fix
                </p>
                <h3 className="mt-1 truncate text-xl font-semibold text-[#111827]">
                  {cleanFilename(selectedResult.filename)}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <p className="hidden text-sm font-medium text-[#111827]/58 sm:block">
                  Double-click a cell. Click outside to save.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setComparisonOpen(false);
                    setEditingCell(null);
                  }}
                  className="h-9 rounded-full border-[#2f165e]/20 bg-white/75 px-3 text-[#2f165e]"
                  aria-label="Close comparison"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid max-h-[82vh] gap-4 overflow-auto p-4 lg:grid-cols-[0.92fr_1.08fr] lg:p-6">
              <div className="rounded-[1.5rem] border border-white/65 bg-white/50 p-3 backdrop-blur-md">
                <div className="mb-3 flex items-center justify-between px-1">
                  <p className="text-sm font-semibold text-[#111827]/70">Input</p>
                  <span className="rounded-full bg-[#2f165e]/8 px-2.5 py-1 text-[11px] font-semibold text-[#2f165e]">
                    File {selectedResultIndex + 1}
                  </span>
                </div>
                <div className="flex min-h-[420px] items-center justify-center overflow-hidden rounded-[1.2rem] bg-white">
                  {selectedImageUrl ? (
                    <img
                      src={selectedImageUrl}
                      alt="Selected input preview"
                      className="max-h-[68vh] w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full min-h-[420px] items-center justify-center text-sm font-semibold text-[#111827]/48">
                      Input preview unavailable
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/65 bg-white/72 p-3 backdrop-blur-md">
                <div className="mb-3 flex items-center justify-between px-1">
                  <p className="text-sm font-semibold text-[#111827]/70">
                    {outputMode === 'text' ? 'Text output' : 'Excel table'}
                  </p>
                  <span className="rounded-full bg-[#2f165e] px-2.5 py-1 text-[11px] font-semibold text-white">
                    Editable preview
                  </span>
                </div>

                <div className="max-h-[68vh] overflow-auto rounded-[1.2rem] border border-[#d8cde7] bg-white">
                  {selectedPreview?.loading ? (
                    <div className="flex min-h-[420px] items-center justify-center gap-2 text-sm font-semibold text-[#111827]/58">
                      <InlineSpinner className="h-4 w-4 text-[#2f165e]" />
                      Preparing table preview
                    </div>
                  ) : outputMode === 'text' || selectedTextPreview ? (
                    <pre className="min-h-[420px] whitespace-pre-wrap p-5 text-left text-sm leading-7 text-[#111827]">
                      {selectedTextPreview || 'Text preview unavailable.'}
                    </pre>
                  ) : selectedTablePreview.length > 0 ? (
                    <table className="w-full min-w-[680px] border-collapse text-sm text-[#111827]">
                      <tbody>
                        {selectedTablePreview.map((row, rowIndex) => (
                          <tr
                            key={rowIndex}
                            className={cn(
                              "border-b border-[#d8cde7]",
                              rowIndex === 0 ? "bg-[#2f165e] text-white" : rowIndex % 2 === 0 ? "bg-[#fbf8ff]" : "bg-white"
                            )}
                          >
                            {Array.from({ length: selectedColumnCount }).map((_, cellIndex) => {
                              const isEditing =
                                editingCell?.fileId === selectedResult.file_id &&
                                editingCell?.row === rowIndex &&
                                editingCell?.col === cellIndex;
                              const value = row[cellIndex] || '';

                              return (
                                <td
                                  key={cellIndex}
                                  onDoubleClick={() => {
                                    if (selectedResult.file_id) {
                                      setEditingCell({ fileId: selectedResult.file_id, row: rowIndex, col: cellIndex });
                                    }
                                  }}
                                  className={cn(
                                    "min-w-[120px] border-r border-[#d8cde7] px-3 py-2 text-left font-medium last:border-r-0",
                                    rowIndex === 0 ? "border-white/20" : "hover:bg-[#f2e9ff]"
                                  )}
                                >
                                  {isEditing ? (
                                    <input
                                      autoFocus
                                      defaultValue={value}
                                      onBlur={(event) => {
                                        updatePreviewCell(selectedResult.file_id, rowIndex, cellIndex, event.target.value);
                                        setEditingCell(null);
                                      }}
                                      onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === 'Escape') {
                                          event.currentTarget.blur();
                                        }
                                      }}
                                      className="w-full rounded-md border border-[#2f165e]/30 bg-white px-2 py-1 text-sm text-[#111827] outline-none ring-2 ring-[#2f165e]/12"
                                    />
                                  ) : (
                                    <span className={cn(!value && "text-[#111827]/30")}>
                                      {value || ' '}
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex min-h-[420px] items-center justify-center text-sm font-semibold text-[#111827]/48">
                      Table preview unavailable
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {(shareDialogOpen || showLimitDialog || showAutoDownloadConfirm || showFirstConvertConfirm || showSignInModal) && (
        <LandingDialogs
          shareDialogOpen={shareDialogOpen}
          setShareDialogOpen={setShareDialogOpen}
          copySuccess={copySuccess}
          setCopySuccess={setCopySuccess}
          selectedFileToShare={selectedFileToShare}
          showLimitDialog={showLimitDialog}
          setShowLimitDialog={setShowLimitDialog}
          showAutoDownloadConfirm={showAutoDownloadConfirm}
          setShowAutoDownloadConfirm={setShowAutoDownloadConfirm}
          showFirstConvertConfirm={showFirstConvertConfirm}
          setShowFirstConvertConfirm={setShowFirstConvertConfirm}
          showSignInModal={showSignInModal}
          setShowSignInModal={setShowSignInModal}
          signInRedirectPath={signInRedirectPath}
          setAutoDownload={setAutoDownload}
          openSignInModal={openSignInModal}
          processImages={() => processImages()}
          handleEmailShare={handleEmailShare}
          handleLinkedInMessage={handleLinkedInMessage}
          handleXShare={handleXShare}
          handleMessengerShare={handleMessengerShare}
          handleCopyLink={handleCopyLink}
        />
      )}
    </>
  );
}
