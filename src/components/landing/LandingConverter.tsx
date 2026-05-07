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
import { buildDownloadUrl, buildMessengerShareUrl, buildOfficeViewerUrl } from "@/lib/public-config";
import { showApiErrorToast, showBatchLimitToast } from "@/lib/api-error-ui";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { useProcessingState } from "@/contexts/ProcessingStateContext";
import { compressImages, formatFileSize } from "@/lib/image-compression";
import {
  acceptedUploadMimeTypes,
  createPdfFirstPageScreenshot,
  isAcceptedUploadFile,
  isPdfFile,
} from "@/lib/upload-files";
import { Download, FileSpreadsheet, FileText, Pencil, RotateCcw, Share2, X } from "lucide-react";

const LandingDialogs = dynamic(
  () => import("@/components/landing/LandingDialogs"),
  { ssr: false }
);

const siteIcons = {
  export: "/site-icons/io/export.svg",
  upload: "/site-icons/io/upload.svg",
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
  const [trialInfo, setTrialInfo] = useState({ uuid: '', used: 0, remaining: 5, hasRemaining: true, limit: 5 });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [filePreviewUrls, setFilePreviewUrls] = useState<{[key: number]: string}>({});
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
  const maxUploadFiles = limits?.max_files_per_batch ?? 5;

  // Helper function to remove _processed from filename
  const cleanFilename = (filename: string | undefined): string => {
    if (!filename) return 'result.xlsx';
    return filename.replace('_processed', '');
  };

  useEffect(() => {
    let mounted = true;
    ocrApi.getLimits()
      .then((data) => {
        if (mounted) setLimits(data);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

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

  // Initialize trial info on mount
  useEffect(() => {
    const info = getTrialInfo();
    setTrialInfo(info);
  }, [])

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
        incrementTrialUploadCount(filesToUpload.length);
        setTrialInfo(getTrialInfo());
        ocrApi.getLimits()
          .then(setLimits)
          .catch(() => undefined);
      }

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
  }, [uploadedFiles, maxUploadFiles, isAuthenticated, openSignInModal, outputMode, createFilePreviewUrl]);

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
  const fetchTablePreview = async (fileId: string) => {
    try {
      const blob = await ocrApi.downloadFile(fileId);

      if (outputMode === 'text' || blob.type.startsWith('text/')) {
        const text = await blob.text();
        setTextPreview(text.slice(0, 6000));
        setTablePreviewData([]);
        return;
      }

      const XLSX = await import('xlsx');
      const arrayBuffer = await blob.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

      // Limit to first 10 rows for preview
      const previewData = data.slice(0, Math.min(10, data.length));
      setTablePreviewData(previewData);
      setTextPreview('');
    } catch (error) {
      // Don't show error toast - just silently fail to show preview
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
      if (tablePreviewData.length === 0 && !textPreview) {
        fetchTablePreview(status.results.files[0].file_id);
      }
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
      return true;
    }

    if (status.status === 'failed') {
      setProcessingComplete(false);
      setIsProcessing(false);
      stopJobMonitoring();
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
            if (newFiles.length === 1 && tablePreviewData.length === 0 && !textPreview) {
              fetchTablePreview(data.file_info.file_id);
            }
            return newFiles;
          });
        }

        if (messageType === 'job_completed' || data.status === 'completed') {
          setProcessingComplete(true);
          setIsProcessing(false);
          if (data.files && data.files.length > 0) {
            setResultFiles(data.files);
          }
          stopJobMonitoring();
        }

        if (messageType === 'job_error' || data.status === 'failed') {
          const errorMsg = data.error || data.errors?.[0] || 'Processing failed';
          setIsProcessing(false);
          stopJobMonitoring();
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

  const liveProgressPercent = isUploading
    ? uploadProgress
    : totalFilesToProcess > 0
      ? Math.min(100, Math.round((resultFiles.length / totalFilesToProcess) * 100))
      : 0;
  return (
    <>
        {/* Conversion Section */}
        <section className="relative z-10 scroll-mt-28 pt-6 pb-16 sm:pt-8 lg:pt-10">
          <div className="container mx-auto max-w-[1540px] px-4 sm:px-5 lg:px-9">
            <div className="mb-5 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/45 bg-white/45 px-4 py-2 shadow-lg shadow-[#A78BFA]/10 backdrop-blur-2xl">
                <h2 className="text-lg font-bold text-foreground sm:text-xl">
                  Try It
                </h2>
              </div>
            </div>
            {resultFiles.length === 0 && !isProcessing && (
              <div className="mx-auto mb-5 flex w-fit items-center rounded-full border border-white/55 bg-white/40 p-1 shadow-[0_16px_40px_rgba(42,35,64,0.08)] backdrop-blur-2xl">
                <button
                  type="button"
                  onClick={() => setOutputMode('table')}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    outputMode === 'table'
                      ? "bg-[#2f165e] text-white shadow-sm"
                      : "text-[#111827] hover:bg-white/45"
                  )}
                >
                  Table output
                </button>
                <button
                  type="button"
                  onClick={() => setOutputMode('text')}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    outputMode === 'text'
                      ? "bg-[#2f165e] text-white shadow-sm"
                      : "text-[#111827] hover:bg-white/45"
                  )}
                >
                  Text output
                </button>
              </div>
            )}
              <div ref={heroImageRef} className={`relative mx-auto ${resultFiles.length > 0 ? 'w-full max-w-none' : 'w-full max-w-[1480px]'}`}>
                <div className={resultFiles.length === 0 ? "grid items-stretch gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(620px,1.18fr)]" : "relative w-full"}>
                <div className="ax-glass-card relative w-full space-y-5 rounded-[2rem] border border-white/45 p-5 sm:p-6 lg:p-7">
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
                        className={`relative border-2 border-dashed rounded-[1.5rem] bg-white/25 backdrop-blur-xl transition-all duration-200 cursor-pointer ${
                          isDragging
                            ? 'border-[#A78BFA] bg-[#A78BFA]/10 scale-[0.99]'
                            : uploadedFiles.length > 0
                              ? 'border-[#A78BFA] bg-[#A78BFA]/5'
                              : 'border-[#A78BFA]/50 hover:border-[#A78BFA] hover:bg-[#A78BFA]/5'
                        } flex min-h-[230px] items-center justify-center p-7 lg:min-h-[270px] lg:p-10`}
                      >
                        <div className="text-center">
                          {uploadedFiles.length === 0 ? (
                            <>
                              <SiteIcon src={siteIcons.upload} className="mx-auto mb-4 h-14 w-14" />
                              <h3 className="mb-2 text-xl font-semibold">
                                {isDragging ? 'Drop your files here' : `Upload up to ${maxUploadFiles} files`}
                              </h3>
                              <input
                                id="file-upload-landing"
                                type="file"
                                accept={acceptedUploadMimeTypes}
                                multiple
                                onChange={handleFileInput}
                                className="hidden"
                              />
                              <p className="mx-auto max-w-sm text-base leading-7 text-[#111827]/70">
                                Click or drag handwritten images, PDFs, notes, receipts, or forms.
                              </p>
                            </>
                          ) : (
                            <>
                              {/* Image Queue - Small thumbnails */}
                              <div className="mb-4 grid max-h-44 grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
                                {uploadedFiles.map((file, index) => (
                                  <div key={index} className="relative group aspect-square overflow-hidden rounded-2xl border border-white/60 bg-card">
                                    <img
                                      src={filePreviewUrls[index] || ''}
                                      alt={file.name}
                                      className="w-full h-full object-cover"
                                    />
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
                                      }}
                                      disabled={isProcessing}
                                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-background/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <span className="relative h-3 w-3" aria-hidden="true">
                                        <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 rotate-45 bg-foreground" />
                                        <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 -rotate-45 bg-foreground" />
                                      </span>
                                    </button>
                                  </div>
                                ))}
                              </div>
                              <p className="mb-3 text-sm font-semibold text-[#111827]">{uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} ready to convert</p>
                              <label htmlFor="file-upload-landing-more">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isProcessing}
                                  className="rounded-full border-2 border-[#A78BFA] bg-white/60 text-sm"
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
                                {processingComplete ? 'Files ready' : isUploading ? 'Uploading your batch' : 'Converting your files'}
                              </h3>
                              <span className="rounded-full border border-[#A78BFA]/35 bg-white/55 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#111827]/70 backdrop-blur-md">
                                {processingComplete ? `${resultFiles.length} ready` : isUploading ? 'uploading' : 'converting'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 lg:justify-end">
                          {processingComplete && resultFiles.length > 1 && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleDownloadAll}
                                className="border-2 border-[#A78BFA] bg-white/55 backdrop-blur-md"
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
                            className="border-2 border-[#A78BFA] bg-white/55 backdrop-blur-md"
                          >
                            {isProcessing && !processingComplete ? <X className="mr-1 h-4 w-4" /> : <RotateCcw className="mr-1 h-4 w-4" />}
                            {isProcessing && !processingComplete ? 'Cancel' : 'Convert Again'}
                          </Button>
                        </div>
                      </div>

                      {isProcessing && !processingComplete && (
                        <div className="mb-5 rounded-[1.35rem] border border-[#eadfff] bg-white/50 p-5 backdrop-blur-md">
                          <div className="mb-3 flex items-center justify-between text-sm font-semibold text-[#111827]/70">
                            <span>{isUploading ? 'Upload progress' : 'Batch progress'}</span>
                          </div>
                          <div className="h-3 overflow-hidden rounded-full bg-white/80">
                            <div
                              className="h-full rounded-full bg-[#441F84] transition-all duration-300"
                              style={{ width: `${liveProgressPercent}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {resultFiles.length > 0 && (
                        <div className="space-y-4">
                          {/* Preview Section - Only for first file */}
                          {resultFiles.length > 0 && (tablePreviewData.length > 0 || textPreview) && firstImageUrl && (
                            <div className="space-y-4">
                              {/* Image and Table Preview Side by Side */}
                              <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                                {/* Original Image */}
                                <div className="flex flex-col xl:col-span-1">
                                  <h4 className="mb-3 text-sm font-semibold text-[#111827]/70">Original image</h4>
                                  <div className="flex max-h-[640px] items-center justify-center overflow-hidden rounded-[1.35rem] border border-white/60 bg-white/55">
                                    <img
                                      src={firstImageUrl}
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
                                    {outputMode === 'text' || textPreview ? (
                                      <pre className="min-h-[360px] whitespace-pre-wrap p-5 text-left text-sm leading-7 text-[#111827]">
                                        {textPreview}
                                      </pre>
                                    ) : (
                                      <>
                                        <table className="w-full text-base">
                                          <tbody>
                                            {tablePreviewData.map((row, rowIndex) => (
                                              <tr key={rowIndex} className={rowIndex === 0 ? 'bg-primary/10 font-semibold' : 'border-t border-gray-200'}>
                                                {row.map((cell, cellIndex) => (
                                                  <td
                                                    key={cellIndex}
                                                    className="px-2 py-1.5 text-left border-r border-gray-200 last:border-r-0"
                                                  >
                                                    {cell || ''}
                                                  </td>
                                                ))}
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                        {tablePreviewData.length >= 10 && (
                                          <div className="px-3 py-2 bg-muted/50 text-xs text-muted-foreground text-center border-t">
                                            Showing first 10 rows
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* First File Buttons */}
                              <div className="flex flex-col gap-4 rounded-[1.35rem] border border-white/60 bg-white/55 p-4 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  {outputMode === 'text' ? (
                                    <FileText className="h-6 w-6 text-[#2f165e]" />
                                  ) : (
                                    <FileSpreadsheet className="h-6 w-6 text-[#2f165e]" />
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-[#111827]">Primary result</p>
                                    <span className="block truncate text-base font-medium text-[#111827]/75">{cleanFilename(resultFiles[0].filename)}</span>
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                                  <Button
                                    size="default"
                                    onClick={() => handleDownloadFile(resultFiles[0].file_id)}
                                    className="gap-2 rounded-full bg-primary text-white hover:bg-primary/90"
                                  >
                                    <Download className="h-5 w-5" />
                                    Download
                                  </Button>
                                  <Button
                                    size="default"
                                    variant="outline"
                                    onClick={() => handleShareFile(resultFiles[0])}
                                    className="gap-2 rounded-full border border-[#A78BFA] bg-white/70 text-foreground hover:bg-primary/10"
                                  >
                                    <Share2 className="h-5 w-5" />
                                    Share
                                  </Button>
                                  {outputMode !== 'text' && (
                                    <Button
                                      size="default"
                                      variant="outline"
                                      onClick={() => {
                                        window.open(buildOfficeViewerUrl(resultFiles[0].file_id), '_blank')
                                      }}
                                      className="gap-2 rounded-full border border-foreground/40 bg-white/70 text-foreground hover:bg-muted/50"
                                    >
                                      <Pencil className="h-5 w-5" />
                                      Edit
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Other Files - Just buttons, starting from index 1 */}
                          {resultFiles.slice(1).map((file: any, index: number) => (
                            <div key={file.file_id || index + 1} className="flex flex-col gap-3 rounded-[1.25rem] border border-white/60 bg-white/45 p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <button
                                  onClick={() => handleDownloadFile(file.file_id)}
                                  className="flex-shrink-0 hover:scale-110 transition-transform"
                                >
                                  {outputMode === 'text' ? (
                                    <FileText className="h-6 w-6 text-[#2f165e]" />
                                  ) : (
                                    <FileSpreadsheet className="h-6 w-6 text-[#2f165e]" />
                                  )}
                                </button>
                                <span className="text-sm font-medium truncate text-[#111827]">{cleanFilename(file.filename)}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                                <Button
                                  size="sm"
                                  onClick={() => handleDownloadFile(file.file_id)}
                                  className="gap-2 rounded-full bg-primary text-white hover:bg-primary/90"
                                >
                                  <Download className="h-5 w-5" />
                                  Download
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleShareFile(file)}
                                  className="gap-1.5 rounded-full border border-[#A78BFA] bg-white/70 text-foreground hover:bg-primary/10"
                                >
                                  <Share2 className="h-5 w-5" />
                                  Share
                                </Button>
                                {outputMode !== 'text' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      window.open(buildOfficeViewerUrl(file.file_id), '_blank')
                                    }}
                                    className="gap-1.5 rounded-full border border-foreground/40 bg-white/70 text-foreground hover:bg-muted/50"
                                  >
                                    <Pencil className="h-5 w-5" />
                                    Edit
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}

                          {/* Show buttons without preview if no preview data available yet */}
                          {((!tablePreviewData.length && !textPreview) || !firstImageUrl) && resultFiles.map((file: any, index: number) => (
                            <div key={`no-preview-${file.file_id || index}`} className="flex flex-col gap-3 rounded-[1.25rem] border border-white/60 bg-white/45 p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <button
                                  onClick={() => handleDownloadFile(file.file_id)}
                                  className="flex-shrink-0 hover:scale-110 transition-transform"
                                >
                                  {outputMode === 'text' ? (
                                    <FileText className="h-6 w-6 text-[#2f165e]" />
                                  ) : (
                                    <FileSpreadsheet className="h-6 w-6 text-[#2f165e]" />
                                  )}
                                </button>
                                <span className="text-sm font-medium truncate text-[#111827]">{cleanFilename(file.filename)}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                                <Button
                                  size="sm"
                                  onClick={() => handleDownloadFile(file.file_id)}
                                  className="gap-2 rounded-full bg-primary text-white hover:bg-primary/90"
                                >
                                  <Download className="h-5 w-5" />
                                  Download
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleShareFile(file)}
                                  className="gap-1.5 rounded-full border border-[#A78BFA] bg-white/70 text-foreground hover:bg-primary/10"
                                >
                                  <Share2 className="h-5 w-5" />
                                  Share
                                </Button>
                                {outputMode !== 'text' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      window.open(buildOfficeViewerUrl(file.file_id), '_blank')
                                    }}
                                    className="gap-1.5 rounded-full border border-foreground/40 bg-white/70 text-foreground hover:bg-muted/50"
                                  >
                                    <Pencil className="h-5 w-5" />
                                    Edit
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}

                          {/* Pending Files - Show processing indicators */}
                          {isProcessing && totalFilesToProcess > resultFiles.length && (
                            <>
                              {Array.from({ length: totalFilesToProcess - resultFiles.length }).map((_, index) => (
                                <div key={`pending-${index}`} className="flex items-center justify-between rounded-[1.25rem] border border-dashed border-[#A78BFA]/35 bg-white/30 p-4 backdrop-blur-xl">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <InlineSpinner className="h-5 w-5 text-primary flex-shrink-0" />
                                    <span className="text-sm font-medium text-[#111827]/70">Waiting for file {resultFiles.length + index + 1}</span>
                                  </div>
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      )}

                      {isProcessing && !processingComplete && resultFiles.length === 0 && (
                        <div className="mt-5 flex items-center justify-center gap-2 rounded-[1.25rem] border border-white/55 bg-white/35 p-4 text-sm font-medium text-[#111827]/70 backdrop-blur-xl">
                          <InlineSpinner className="h-4 w-4" />
                          <span>{isUploading ? 'Uploading' : 'Converting'}</span>
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
                     className={`min-h-[76px] rounded-[1.25rem] border-2 text-base font-semibold transition-all duration-200 ${
                      uploadedFiles.length === 0
                           ? 'bg-gray-300 hover:bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed'
                           : 'bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 shadow-lg shadow-primary/20'
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
                  <div className="relative flex min-h-[560px] flex-col justify-between overflow-hidden">
                    <div className="flex items-center justify-between gap-4 px-1">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f165e]">Preview</p>
                        <h3 className="mt-2 text-2xl font-semibold text-[#111827]">Before and after</h3>
                      </div>
                      <span className="hidden rounded-full bg-[#2f165e] px-3 py-1 text-xs font-semibold text-white sm:inline-flex">
                        XLSX ready
                      </span>
                    </div>

                    <div className="mt-6 grid flex-1 gap-6 sm:grid-cols-2">
                      <figure className="flex min-h-[470px] flex-col">
                        <figcaption className="mb-3 px-1 text-sm font-semibold text-[#111827]">Before</figcaption>
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
                        <figcaption className="mb-3 px-1 text-sm font-semibold text-[#111827]">After</figcaption>
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
          maxUploadFiles={maxUploadFiles}
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
