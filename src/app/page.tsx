"use client"

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/MobileNav";
import ScrollAnimatedSection from "@/components/ScrollAnimatedSection";
import { cn } from "@/lib/utils";
import { AppLogo } from "@/components/AppIcon";
import ParticlesBackground from "@/components/ParticlesBackground";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Label } from "@/components/ui/label";
import { ActiveUsersCounter } from "@/components/ActiveUsersCounter";
import { wakeUpBackendSilently } from "@/lib/backend-health";
import { getTrialInfo, incrementTrialUploadCount } from "@/lib/free-trial";
import { ocrApi, OCRWebSocket } from "@/lib/api-client";
import type { AppLimits, JobStatusResponse, RecoverableJobSummary } from "@/lib/api-client";
import { buildDownloadUrl, buildMessengerShareUrl, buildOfficeViewerUrl } from "@/lib/public-config";
import { showApiErrorToast, showBatchLimitToast } from "@/lib/api-error-ui";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import { useProcessingState } from "@/contexts/ProcessingStateContext";
import * as XLSX from 'xlsx';
import { GoogleSignInModal } from "@/components/GoogleSignInModal";
import NextLink from "next/link";
import { compressImages, formatFileSize } from "@/lib/image-compression";
import { IndustrySolutionsMenuGrid } from "@/components/IndustrySolutionsMenuGrid";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const siteIcons = {
  arrow: "/site-icons/io/arrow.svg",
  copy: "/site-icons/io/copy.svg",
  database: "/site-icons/io/database.svg",
  document: "/site-icons/io/document.svg",
  edit: "/site-icons/io/edit.svg",
  export: "/site-icons/io/export.svg",
  link: "/site-icons/io/link.svg",
  share: "/site-icons/io/share.svg",
  table: "/site-icons/io/table.svg",
  upload: "/site-icons/io/upload.svg",
};

const solutionCards = [
  {
    title: "Accounting",
    href: "/solutions/accounting",
    asset: "/solution/accounting.svg",
    description:
      "Automate the most time-consuming parts of accounting workflows. Extract clean spreadsheet data from receipts, invoices, bank statements, and expense reports so teams can reduce manual entry and focus on review.",
  },
  {
    title: "Banking",
    href: "/solutions/banking",
    asset: "/solution/banking.svg",
    description:
      "Modernize document-heavy financial operations with structured extraction for checks, loan applications, statements, onboarding packets, and KYC documents while keeping every row ready for downstream review.",
  },
  {
    title: "Backoffice Automation",
    href: "/solutions/backoffice-automation",
    asset: "/solution/Backoffice%20Automation.svg",
    description:
      "Remove repetitive data entry from internal operations. Turn invoices, forms, receipts, and handwritten tables into usable Excel files that can feed finance, admin, and operations workflows.",
  },
  {
    title: "Construction",
    href: "/solutions/construction",
    asset: "/solution/Construction.svg",
    description:
      "Convert site notes, delivery forms, checklists, material logs, and handwritten field tables into clean spreadsheets so project teams can keep records current without retyping paperwork.",
  },
  {
    title: "CPG Brands",
    href: "/solutions/cpg-brands",
    asset: "/solution/CPG%20Brands.svg",
    description:
      "Process retail forms, inventory sheets, distributor paperwork, purchase records, and field reports into structured data that merchandising and operations teams can compare quickly.",
  },
  {
    title: "FinTech",
    href: "/solutions/fintech",
    asset: "/solution/FinTech.svg",
    description:
      "Build document intake flows for financial products without asking users or operators to key in every table manually. Extract page-level data into spreadsheets that are easy to validate.",
  },
  {
    title: "Healthcare",
    href: "/solutions/healthcare",
    asset: "/solution/Healthcare.svg",
    description:
      "Digitize handwritten logs, intake forms, lab sheets, inventory notes, and administrative records while preserving the table structure needed for review, reporting, and internal handoff.",
  },
  {
    title: "Real Estate",
    href: "/solutions/real-estate",
    asset: "/solution/Real%20Estate.svg",
    description:
      "Turn lease packets, inspection forms, closing checklists, rent rolls, and property records into organized spreadsheets for brokers, managers, and operations teams.",
  },
];

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

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const heroFlowRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const topBackgroundSectionRef = useRef<HTMLDivElement>(null);
  const topBackgroundRef = useRef<HTMLDivElement>(null);
  const purpleSectionRef = useRef<HTMLDivElement>(null);
  const whatSectionRef = useRef<HTMLDivElement>(null);
  const benchmarkBandRef = useRef<HTMLDivElement>(null);
  const securityBandRef = useRef<HTMLDivElement>(null);

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
  const [firstImageUrl, setFirstImageUrl] = useState<string>('');
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

  useEffect(() => {
    if (heroFlowRef.current) {
      const ctx = gsap.context(() => {
        const outputStartY = (index: number) => (index === 0 ? -12 : index === 1 ? -48 : 28);
        const outputEndY = (index: number) => (index === 0 ? -38 : index === 1 ? 16 : -8);

        gsap.set([".hero-input-card", ".hero-output-card", ".hero-processor"], {
          force3D: true,
          transformOrigin: "50% 50%",
        });

        gsap.fromTo(
          ".hero-input-card",
          { x: -24, opacity: 0, scale: 0.94 },
          { x: 0, opacity: 1, scale: 1, duration: 0.55, delay: 0.15, ease: "power2.out" }
        );

        const heroTimeline = gsap.timeline({ repeat: -1, repeatDelay: 0.95, delay: 0.2 });

        heroTimeline
          .set(".hero-feed-line-left", { scaleX: 0, opacity: 0.68 })
          .set(".hero-feed-line-right", { scaleX: 0, opacity: 0.68 })
          .set(".hero-processor-glow", { opacity: 0.18, scale: 0.92 })
          .set(".hero-processor", { scale: 1 })
          .set(".hero-output-card", {
            opacity: 0,
            x: -38,
            y: outputStartY,
            scale: 0.72,
            rotation: (index: number) => (index === 1 ? -5 : index === 2 ? 5 : -2),
          })
          .to(".hero-feed-line-left", { scaleX: 1, duration: 0.52, ease: "power2.inOut" }, "-=0.05")
          .to(".hero-processor-glow", { opacity: 0.42, scale: 1.04, duration: 0.48, ease: "sine.inOut" }, "-=0.12")
          .to(".hero-processor-glow", { opacity: 0.2, scale: 0.95, duration: 0.42, ease: "sine.inOut" }, "-=0.1")
          .to(".hero-feed-line-right", { scaleX: 1, duration: 0.46, ease: "power2.inOut" }, "-=0.05")
          .to(".hero-output-card", {
            opacity: 1,
            x: 0,
            y: (index: number) => (index === 0 ? -18 : index === 1 ? 34 : index === 2 ? -36 : 0),
            scale: 1,
            rotation: (index: number) => (index === 0 ? -2 : index === 1 ? 2.5 : -3),
            duration: 0.74,
            ease: "power3.out",
            stagger: { each: 0.15, from: "start" },
          }, "-=0.04")
          .to(".hero-output-card", { opacity: 1, duration: 1.12 })
          .to(".hero-output-card", {
            opacity: 0,
            x: 48,
            y: outputEndY,
            scale: 0.86,
            rotation: (index: number) => (index === 1 ? 3 : index === 2 ? -5 : 4),
            duration: 0.46,
            ease: "power2.in",
            stagger: { each: 0.08, from: "end" },
          })
          .to([".hero-feed-line-left", ".hero-feed-line-right"], { scaleX: 0, opacity: 0.35, duration: 0.28 }, "-=0.2");
      }, heroFlowRef);

      return () => {
        ctx.revert();
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      };
    }

    // Removed section animations per user request
    // Removed comparison section animation per user request



    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  useEffect(() => {
    const topSection = topBackgroundSectionRef.current;
    const topBackground = topBackgroundRef.current;
    if (!topSection || !topBackground) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        topBackground,
        { y: 0 },
        {
          y: -180,
          ease: "none",
          scrollTrigger: {
            trigger: topSection,
            start: "top top",
            end: "bottom top",
            scrub: 1.2,
          },
        }
      );
    }, topSection);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const purpleSection = purpleSectionRef.current;
    const whatSection = whatSectionRef.current;
    if (!purpleSection || !whatSection) return;

    const topClipStart =
      "polygon(0 3.8%, 9% 2.7%, 20% 4.4%, 35% 2.1%, 50% 4.2%, 66% 2.5%, 82% 4.1%, 100% 2.8%, 100% 100%, 0 100%)";
    const topClipEnd =
      "polygon(0 9%, 8% 5.8%, 19% 9.8%, 35% 4.2%, 51% 8.4%, 68% 4.8%, 84% 8.1%, 100% 5.3%, 100% 100%, 0 100%)";

    const ctx = gsap.context(() => {
      gsap.fromTo(
        purpleSection,
        { clipPath: topClipStart },
        {
          clipPath: topClipEnd,
          ease: "none",
          scrollTrigger: {
            trigger: purpleSection,
            start: "top 85%",
            end: "top 20%",
            scrub: 1.1,
          },
        }
      );

      gsap.fromTo(
        ".what-story-row",
        { opacity: 0, y: 76 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.18,
          scrollTrigger: {
            trigger: whatSection,
            start: "top 70%",
            end: "bottom 72%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        ".what-story-image",
        { opacity: 0, scale: 0.84, rotation: (index: number) => (index === 1 ? 4 : -4) },
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.2,
          scrollTrigger: {
            trigger: whatSection,
            start: "top 68%",
            end: "bottom 72%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        ".what-story-path",
        { strokeDasharray: 520, strokeDashoffset: 520 },
        {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: whatSection,
            start: "top 60%",
            end: "bottom 62%",
            scrub: 1,
          },
        }
      );

      [benchmarkBandRef.current, securityBandRef.current].forEach((band) => {
        if (!band) return;

        gsap.fromTo(
          band,
          {
            clipPath:
              "polygon(0 4%, 12% 2.8%, 25% 4.6%, 40% 2.4%, 58% 4.3%, 75% 2.7%, 100% 4%, 100% 100%, 0 100%)",
          },
          {
            clipPath:
              "polygon(0 10%, 10% 6.2%, 24% 10.8%, 42% 4.8%, 58% 9.7%, 76% 5.6%, 100% 9%, 100% 100%, 0 100%)",
            ease: "none",
            scrollTrigger: {
              trigger: band.parentElement || band,
              start: "top 82%",
              end: "top 24%",
              scrub: 1.15,
            },
          }
        );
      });
    }, purpleSection);

    return () => ctx.revert();
  }, []);

  // Smooth scroll function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Helper function to create preview URL for file (converts HEIC if needed)
  const createFilePreviewUrl = useCallback(async (file: File): Promise<string> => {
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

    const files = Array.from(e.dataTransfer.files).filter(file => {
      // Accept any file with image MIME type
      if (file.type && file.type.startsWith('image/')) return true;
      
      // Accept HEIC/HEIF files regardless of MIME type
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.heic') || fileName.endsWith('.heif')) return true;
      
      // Accept common image extensions even without MIME type
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
      return imageExtensions.some(ext => fileName.endsWith(ext));
    });

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
      const fileArray = Array.from(files).filter(file => {
        // Accept any file with image MIME type
        if (file.type && file.type.startsWith('image/')) return true;
        
        // Accept HEIC/HEIF files regardless of MIME type
        const fileName = file.name.toLowerCase();
        if (fileName.endsWith('.heic') || fileName.endsWith('.heif')) return true;
        
        // Accept common image extensions even without MIME type
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
        return imageExtensions.some(ext => fileName.endsWith(ext));
      });
      const filesToUse = fileArray.slice(0, maxUploadFiles);
      if (fileArray.length > maxUploadFiles) {
        showBatchLimitToast(maxUploadFiles);
      }
      setUploadedFiles(filesToUse);
    }
  }, [maxUploadFiles]);

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

    // COMMENTED OUT: Check if user has free trials remaining (silently)
    // if (!trialInfo.hasRemaining) {
    //   setShowLimitDialog(true);
    //   return;
    // }

    // Check if first time converting (show confirmation)
    if (typeof window !== 'undefined') {
      const hasConvertedBefore = localStorage.getItem('hasConvertedBefore');
      if (!hasConvertedBefore) {
        setShowFirstConvertConfirm(true);
        return;
      }
    }

    // Proceed with processing
    await processImages();
  }, [uploadedFiles, trialInfo, maxUploadFiles]);

  const processImages = useCallback(async () => {
    try {
      if (uploadedFiles.length > maxUploadFiles) {
        showBatchLimitToast(maxUploadFiles);
        setUploadedFiles(prev => prev.slice(0, maxUploadFiles));
        return;
      }

      setIsProcessing(true);
      setIsUploading(true);
      setUploadProgress(0);
      currentJobIdRef.current = null;
      setProcessingComplete(false);
      setTotalFilesToProcess(uploadedFiles.length);
      const uploadController = new AbortController();
      uploadAbortRef.current = uploadController;


      // Compress images if needed
      const compressionResults = await compressImages(uploadedFiles);
      
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
        output_format: 'xlsx',
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
      if (uploadedFiles.length > 0) {
        const firstFile = uploadedFiles[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          setFirstImageUrl(e.target?.result as string);
        };
        reader.readAsDataURL(firstFile);
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
          void processImages();
        },
      });
    } finally {
      uploadAbortRef.current = null;
      setIsUploading(false);
    }
  }, [uploadedFiles, updateState, maxUploadFiles, isAuthenticated, openSignInModal]);

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
      link.download = `result-${fileId.substring(0, 8)}.xlsx`;
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
      const arrayBuffer = await blob.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];
      
      // Limit to first 10 rows for preview
      const previewData = data.slice(0, Math.min(10, data.length));
      setTablePreviewData(previewData);
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
      if (tablePreviewData.length === 0) {
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
            if (newFiles.length === 1 && tablePreviewData.length === 0) {
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
    <div className="min-h-screen relative bg-transparent">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 pt-3 backdrop-blur-2xl lg:pt-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between rounded-[35px] border border-black/10 bg-neutral-100/55 p-2 shadow-[0_18px_45px_rgba(20,20,20,0.08)] ring-1 ring-white/35 backdrop-blur-2xl lg:p-3">
            {/* Logo */}
            <div className="flex-shrink-0">
              <AppLogo />
            </div>

            {/* Desktop Navigation Items - Hidden on Mobile */}
            <div className="hidden lg:flex items-center justify-center flex-1">
              <NavigationMenu>
                <NavigationMenuList className="gap-1">
                  {/* Solutions Dropdown */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent hover:bg-accent/50 transition-colors text-black dark:text-white">
                      Solutions
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <IndustrySolutionsMenuGrid />
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="/pricing"
                      className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-accent/50 transition-colors text-black dark:text-white")}
                    >
                      Pricing
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  {/* How AxLiner's Built */}
                  <NavigationMenuItem>
                    <button
                      className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-accent/50 transition-colors text-black dark:text-white")}
                      onClick={() => scrollToSection('ai-engine')}
                    >
                      How AxLiner's Built
                    </button>
                  </NavigationMenuItem>

                  {/* Benchmarks */}
                  <NavigationMenuItem>
                    <button
                      className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-accent/50 transition-colors text-black dark:text-white")}
                      onClick={() => scrollToSection('benchmarks')}
                    >
                      Benchmarks
                    </button>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Sign In & Try for Free Buttons - Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated ? (
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4 py-2 text-sm font-medium transition-colors shadow-lg hover:shadow-xl"
                  asChild
                >
                  <NextLink href="/dashboard">Go to Dashboard</NextLink>
                </Button>
              ) : (
                <>
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4 py-2 text-sm font-medium transition-colors shadow-lg hover:shadow-xl"
                    onClick={() => openSignInModal("/pricing?from=signup")}
                  >
                    Sign Up
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white/90 dark:bg-white/20 text-foreground border-[1.6px] border-foreground/30 rounded-full px-4 py-2 text-sm font-medium hover:bg-white dark:hover:bg-white/30 transition-colors backdrop-blur-sm"
                    onClick={() => openSignInModal("/dashboard/client")}
                  >
                    Sign in
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10">
        <div ref={topBackgroundSectionRef} className="relative isolate overflow-hidden" style={{ backgroundColor: "#E9ECE4" }}>
          <div
            ref={topBackgroundRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 bg-cover bg-top bg-no-repeat will-change-transform"
            style={{
              backgroundColor: "#E9ECE4",
            }}
          />
          <div className="relative z-10">
        <section ref={heroRef} className="relative overflow-hidden pt-24 pb-12 sm:pt-32 sm:pb-16 lg:pt-32 lg:pb-20">
          <ParticlesBackground />
          <div className="relative z-10 container mx-auto max-w-[1420px] px-4 sm:px-5 lg:px-9">
            <div className="grid min-h-[650px] items-center gap-10 lg:grid-cols-[minmax(0,1.04fr)_minmax(420px,0.96fr)] lg:gap-14">
              <div className="order-2 flex flex-col items-center lg:order-1 lg:items-start">
                <div className="relative w-full max-w-[680px]">
                  <div className="absolute inset-x-8 bottom-5 h-20 rounded-full bg-[#2f165e]/18 blur-3xl" aria-hidden="true" />
                  <img
                    src="/header.svg"
                    alt="AxLiner document conversion illustration"
                    className="relative z-10 mx-auto h-auto w-full max-w-[640px] object-contain drop-shadow-[0_30px_70px_rgba(42,35,64,0.16)]"
                  />
                </div>

                <div className="mt-6 flex w-full max-w-[650px] flex-col items-center justify-between gap-4 rounded-[28px] border border-white/55 bg-white/38 p-3 shadow-[0_22px_60px_rgba(42,35,64,0.10)] backdrop-blur-2xl sm:flex-row sm:p-4">
                  <Button
                    onClick={() => scrollToSection('converter')}
                    className="h-12 w-full rounded-full bg-[#2f165e] px-6 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(47,22,94,0.22)] hover:bg-[#24104b] sm:w-auto"
                  >
                    Try it
                    <SiteIcon src={siteIcons.arrow} className="ml-2 h-5 w-5" />
                  </Button>

                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <img
                          key={i}
                          src={`/avatars/${i}.webp`}
                          alt={`User ${i + 1}`}
                          className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm"
                        />
                      ))}
                    </div>
                    <div className="h-9 w-px bg-[#2f165e]/18" />
                    <div className="text-left">
                      <p className="text-sm font-bold leading-none text-[#111827]">5,000+</p>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#111827]/60">active teams</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 mx-auto max-w-2xl text-center lg:order-2 lg:mx-0 lg:text-left">
                <div className="mb-6 inline-flex rounded-full border border-white/55 bg-white/38 px-4 py-2 text-sm font-semibold text-[#2f165e] shadow-[0_14px_35px_rgba(42,35,64,0.08)] backdrop-blur-2xl">
                  Free image to spreadsheet conversion
                </div>
                <h1 className="text-4xl font-semibold leading-[1.04] tracking-tight text-black sm:text-5xl lg:text-6xl">
                  Handwritten images to Excel in seconds
                </h1>
                <p className="mt-8 text-base leading-8 text-black sm:text-lg lg:text-xl">
                  Upload handwritten tables, class notes, invoices, receipts, paper forms, and screenshots from any workflow. AxLiner reads the structure, preserves the rows and columns, and gives you clean Excel files you can review, edit, share, or use in reporting without retyping everything by hand.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="relative z-10 -mt-12 overflow-hidden py-12 sm:-mt-16">
          <div className="w-full">
            <div className="text-center mb-12 px-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/45 bg-white/45 px-4 py-2 mb-4 shadow-lg shadow-[#A78BFA]/10 backdrop-blur-2xl">
                <h2 className="text-lg sm:text-xl font-bold text-foreground">
                  Trusted by Professionals
                </h2>
              </div>
            </div>

            {/* First Row - Animates to the left */}
            <div className="relative mb-6 overflow-hidden">
              <div
                className="flex gap-6 items-start"
                style={{
                  animation: 'scroll-left 90s linear infinite',
                  width: 'max-content',
                  willChange: 'transform'
                }}
                onMouseEnter={(e) => e.currentTarget.style.animationPlayState = 'paused'}
                onMouseLeave={(e) => e.currentTarget.style.animationPlayState = 'running'}
              >
                {Array.from({ length: 3 }, (_, setIndex) =>
                  [
                    {
                      name: "Sarah Mitchell",
                      handle: "@sarahmitchell",
                      avatar: "/testimonials/avi_schiffmann.jpg",
                      text: "AxLiner has completely transformed how we process invoices. What used to take hours now takes minutes. The accuracy is incredible!"
                    },
                    {
                      name: "David Chen",
                      handle: "@davidchen",
                      avatar: "/testimonials/alex_finn.jpg",
                      text: "Best OCR tool I've ever used. The handwritten table recognition is mind-blowing. We've processed thousands of documents with near-perfect accuracy."
                    },
                    {
                      name: "Emily Rodriguez",
                      handle: "@emilyrodriguez",
                      avatar: "/testimonials/alvaro_cintas.jpg",
                      text: "Game changer for our data entry team."
                    },
                    {
                      name: "Michael Thompson",
                      handle: "@mikethompson",
                      avatar: "/testimonials/tom_blomfield.jpg",
                      text: "I was skeptical at first, but AxLiner exceeded all expectations. The table structure preservation is phenomenal. We've saved thousands of hours in manual data entry."
                    },
                    {
                      name: "Jessica Park",
                      handle: "@jessicapark",
                      avatar: "/testimonials/catalin.jpg",
                      text: "AxLiner has become an essential tool in our workflow. The accuracy on complex forms is outstanding."
                    }
                  ].map((testimonial, idx) => (
                    <div
                      key={`${setIndex}-${idx}`}
                      className="flex-shrink-0 bg-white dark:bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-6 w-[450px]"
                    >
                      {/* Person Details at Top */}
                      <div className="flex items-center gap-3 mb-4">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-base text-foreground">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.handle}</p>
                        </div>
                        {/* X Logo */}
                        <svg className="w-5 h-5 text-foreground opacity-60" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </div>

                      {/* Dashed Line Separator */}
                      <div className="border-t border-dashed border-border mb-4"></div>

                      {/* Review Text at Bottom */}
                      <p className="text-base text-black dark:text-foreground leading-relaxed">{testimonial.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Second Row - Animates to the right */}
            <div className="relative overflow-hidden">
              <div
                className="flex gap-6 items-start"
                style={{
                  animation: 'scroll-right 90s linear infinite',
                  width: 'max-content',
                  willChange: 'transform'
                }}
                onMouseEnter={(e) => e.currentTarget.style.animationPlayState = 'paused'}
                onMouseLeave={(e) => e.currentTarget.style.animationPlayState = 'running'}
              >
                {Array.from({ length: 3 }, (_, setIndex) =>
                  [
                    {
                      name: "Robert Williams",
                      handle: "@robertwilliams",
                      avatar: "/testimonials/bodega_man.jpg",
                      text: "The reason I chose AxLiner is the consistent accuracy and speed. Processing handwritten documents has never been easier. This tool has revolutionized our data extraction workflow and saved us countless hours of manual work."
                    },
                    {
                      name: "Amanda Foster",
                      handle: "@amandafoster",
                      avatar: "/testimonials/luca.jpg",
                      text: "AxLiner makes document digitization insanely fast and accurate. Our team productivity has doubled."
                    },
                    {
                      name: "Chris Anderson",
                      handle: "@chrisanderson",
                      avatar: "/testimonials/jon_myers.jpg",
                      text: "The UX is incredibly intuitive. Just upload your images and get perfect Excel files in seconds."
                    },
                    {
                      name: "Rachel Martinez",
                      handle: "@rachelmartinez",
                      avatar: "/testimonials/tom_dorr.jpg",
                      text: "I've been using AxLiner exclusively for the past month. The results speak for themselves. Outstanding tool that delivers on its promises every single time."
                    },
                    {
                      name: "James Wilson",
                      handle: "@jameswilson",
                      avatar: "/testimonials/alexander_wilczek.jpg",
                      text: "AxLiner's OCR accuracy beats everything else I've tried."
                    }
                  ].map((testimonial, idx) => (
                    <div
                      key={`${setIndex}-${idx}`}
                      className="flex-shrink-0 bg-white dark:bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-6 w-[450px]"
                    >
                      {/* Person Details at Top */}
                      <div className="flex items-center gap-3 mb-4">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-base text-foreground">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.handle}</p>
                        </div>
                        {/* X Logo */}
                        <svg className="w-5 h-5 text-foreground opacity-60" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </div>

                      {/* Dashed Line Separator */}
                      <div className="border-t border-dashed border-border mb-4"></div>

                      {/* Review Text at Bottom */}
                      <p className="text-base text-black dark:text-foreground leading-relaxed">{testimonial.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Conversion Section */}
        <section id="converter" className="relative z-10 pt-4 pb-16 sm:pt-6 lg:pt-8">
          <div className="container mx-auto px-4 sm:px-5 lg:px-9 max-w-[1400px]">
            <div className="mb-5 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/45 bg-white/45 px-4 py-2 shadow-lg shadow-[#A78BFA]/10 backdrop-blur-2xl">
                <h2 className="text-lg font-bold text-foreground sm:text-xl">
                  Try It
                </h2>
              </div>
            </div>
            {resultFiles.length === 0 && (
              <div className="mx-auto mb-5 flex w-fit items-center rounded-full border border-white/55 bg-white/40 p-1 shadow-[0_16px_40px_rgba(42,35,64,0.08)] backdrop-blur-2xl">
                <button
                  type="button"
                  className="rounded-full bg-[#2f165e] px-4 py-2 text-sm font-semibold text-white shadow-sm"
                >
                  Table output
                </button>
                <button
                  type="button"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-[#111827] transition-colors hover:bg-white/45"
                >
                  Metadata output
                </button>
              </div>
            )}
              <div ref={heroImageRef} className={`relative mx-auto ${resultFiles.length > 0 ? 'w-full max-w-none' : 'w-full max-w-6xl'}`}>
                <div className={resultFiles.length === 0 ? "grid items-stretch gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)]" : "relative w-full"}>
                <div className="ax-glass-card relative w-full space-y-3 rounded-[1.35rem] border border-white/45 p-4 sm:p-5">
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
                        className={`relative border-2 border-dashed rounded-[1.1rem] bg-white/25 backdrop-blur-xl transition-all duration-200 cursor-pointer ${
                          isDragging
                            ? 'border-[#A78BFA] bg-[#A78BFA]/10 scale-[0.99]'
                            : uploadedFiles.length > 0
                              ? 'border-[#A78BFA] bg-[#A78BFA]/5'
                              : 'border-[#A78BFA]/50 hover:border-[#A78BFA] hover:bg-[#A78BFA]/5'
                        } p-6 lg:p-8 min-h-[170px]`}
                      >
                        <div className="text-center">
                          {uploadedFiles.length === 0 ? (
                            <>
                              <SiteIcon src={siteIcons.upload} className="mx-auto mb-3 h-12 w-12" />
                              <h3 className="text-base font-semibold mb-2">
                                {isDragging ? 'Drop your images here' : `Upload up to ${maxUploadFiles} images`}
                              </h3>
                              <input
                                id="file-upload-landing"
                                type="file"
                                accept="image/*,image/heic,image/heif"
                                multiple
                                onChange={handleFileInput}
                                className="hidden"
                              />
                              <p className="text-sm text-[#111827]/70">
                                Click or drag handwritten tables, notes, receipts, or forms.
                              </p>
                            </>
                          ) : (
                            <>
                              {/* Image Queue - Small thumbnails */}
                              <div className="grid grid-cols-4 gap-2 mb-3 max-h-24 overflow-y-auto">
                                {uploadedFiles.map((file, index) => (
                                  <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border bg-card">
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
                              <p className="text-xs text-muted-foreground mb-2">{uploadedFiles.length} image{uploadedFiles.length > 1 ? 's' : ''} ready</p>
                              <label htmlFor="file-upload-landing-more">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isProcessing}
                                  className="border-2 border-[#A78BFA] text-xs"
                                  asChild
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span>Add More</span>
                                </Button>
                              </label>
                              <input
                                id="file-upload-landing-more"
                                type="file"
                                accept="image/*,image/heic,image/heif"
                                multiple
                                onChange={(e) => {
                                  const newFiles = e.target.files;
                                  if (newFiles && newFiles.length > 0) {
                                    const fileArray = Array.from(newFiles).filter(file => {
                                      // Accept any file with image MIME type
                                      if (file.type && file.type.startsWith('image/')) return true;
                                      
                                      // Accept HEIC/HEIF files regardless of MIME type
                                      const fileName = file.name.toLowerCase();
                                      if (fileName.endsWith('.heic') || fileName.endsWith('.heif')) return true;
                                      
                                      // Accept common image extensions even without MIME type
                                      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
                                      return imageExtensions.some(ext => fileName.endsWith(ext));
                                    });
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
                    <div className={`ax-glass-card overflow-hidden rounded-[1.5rem] border border-white/45 ${resultFiles.length > 0 ? 'p-4 sm:p-5' : 'p-6'}`}>
                      <div className={`mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between ${resultFiles.length > 0 ? 'border-b border-white/35 pb-4' : ''}`}>
                        <div className="flex items-start gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#441F84] text-white shadow-lg shadow-[#441F84]/20">
                            {processingComplete ? (
                              <SiteIcon src={siteIcons.export} className="h-5 w-5" />
                            ) : (
                              <InlineSpinner className="h-5 w-5" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-semibold tracking-tight">
                                {processingComplete ? 'Ready to Download' : isUploading ? 'Uploading...' : 'Processing...'}
                              </h3>
                              <span className="rounded-full border border-[#A78BFA]/35 bg-white/45 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground backdrop-blur-md">
                                {processingComplete ? `${resultFiles.length} file${resultFiles.length === 1 ? '' : 's'} ready` : isUploading ? 'uploading' : 'live status'}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {processingComplete
                                ? 'Review the preview, download individual files, or export everything at once.'
                                : isUploading
                                  ? 'Your batch is uploading. You can cancel before processing starts.'
                                  : 'Your files are being converted now. The panel will update as each result is ready.'}
                            </p>
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
                                <SiteIcon src={siteIcons.export} className="mr-1 h-5 w-5" />
                                Download All
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleShareAll}
                                className="gap-2 bg-white/55 border-2 border-foreground text-foreground backdrop-blur-md hover:bg-muted/50"
                              >
                                <SiteIcon src={siteIcons.share} className="h-5 w-5" />
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
                            {isProcessing && !processingComplete ? 'Cancel' : 'Convert Again'}
                          </Button>
                        </div>
                      </div>

                      {isProcessing && !processingComplete && (
                        <div className="mb-4 rounded-2xl border border-[#eadfff] bg-white/45 p-3 backdrop-blur-md">
                          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                            <span>{isUploading ? 'Upload progress' : 'Batch progress'}</span>
                            <span>{liveProgressPercent}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/70">
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
                          {resultFiles.length > 0 && tablePreviewData.length > 0 && firstImageUrl && (
                            <div className="space-y-3">
                              {/* Image and Table Preview Side by Side */}
                              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                                {/* Original Image */}
                                <div className="flex flex-col xl:col-span-1">
                                  <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Original Image</h4>
                                  <div className="border-2 border-[#A78BFA]/20 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center max-h-[600px]">
                                    <img 
                                      src={firstImageUrl} 
                                      alt="Original" 
                                      className="max-w-full h-auto max-h-[600px] object-contain"
                                    />
                                  </div>
                                </div>

                                {/* Table Preview */}
                                <div className="flex flex-col xl:col-span-2">
                                  <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Extracted Data Preview</h4>
                                  <div className="border-2 border-[#A78BFA]/20 rounded-lg overflow-auto max-h-[600px] bg-white">
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
                                  </div>
                                </div>
                              </div>

                              {/* First File Buttons */}
                              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border-2 border-[#A78BFA]">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <SiteIcon src={siteIcons.table} className="h-6 w-6" />
                                  <span className="text-base font-medium truncate">{cleanFilename(resultFiles[0].filename)}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <Button
                                    size="default"
                                    onClick={() => handleDownloadFile(resultFiles[0].file_id)}
                                    className="gap-2 bg-primary hover:bg-primary/90 text-white border-2 border-[#A78BFA]"
                                  >
                                    <SiteIcon src={siteIcons.export} className="h-5 w-5" />
                                    Download
                                  </Button>
                                  <Button
                                    size="default"
                                    variant="outline"
                                    onClick={() => handleShareFile(resultFiles[0])}
                                    className="gap-2 bg-white border-2 border-[#A78BFA] text-foreground hover:bg-primary/10"
                                  >
                                    <SiteIcon src={siteIcons.share} className="h-5 w-5" />
                                    Share
                                  </Button>
                                  <Button
                                    size="default"
                                    variant="outline"
                                    onClick={() => {
                                      window.open(buildOfficeViewerUrl(resultFiles[0].file_id), '_blank')
                                    }}
                                    className="gap-2 bg-white border-2 border-foreground text-foreground hover:bg-muted/50"
                                  >
                                    <SiteIcon src={siteIcons.edit} className="h-5 w-5" />
                                    Edit
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Other Files - Just buttons, starting from index 1 */}
                          {resultFiles.slice(1).map((file: any, index: number) => (
                            <div key={file.file_id || index + 1} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border-2 border-[#A78BFA]/20">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <button
                                  onClick={() => handleDownloadFile(file.file_id)}
                                  className="flex-shrink-0 hover:scale-110 transition-transform"
                                >
                                  <SiteIcon src={siteIcons.table} className="h-6 w-6" />
                                </button>
                                <span className="text-sm font-medium truncate">{cleanFilename(file.filename)}</span>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Button
                                  size="sm"
                                  onClick={() => handleDownloadFile(file.file_id)}
                                  className="gap-2 bg-primary hover:bg-primary/90 text-white border-2 border-[#A78BFA]"
                                >
                                  <SiteIcon src={siteIcons.export} className="h-5 w-5" />
                                  Download
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleShareFile(file)}
                                  className="gap-1.5 bg-white border-2 border-[#A78BFA] text-foreground hover:bg-primary/10"
                                >
                                  <SiteIcon src={siteIcons.share} className="h-5 w-5" />
                                  Share
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    window.open(buildOfficeViewerUrl(file.file_id), '_blank')
                                  }}
                                  className="gap-1.5 bg-white border-2 border-foreground text-foreground hover:bg-muted/50"
                                >
                                  <SiteIcon src={siteIcons.edit} className="h-5 w-5" />
                                  Edit
                                </Button>
                              </div>
                            </div>
                          ))}

                          {/* Show buttons without preview if no preview data available yet */}
                          {(!tablePreviewData.length || !firstImageUrl) && resultFiles.map((file: any, index: number) => (
                            <div key={`no-preview-${file.file_id || index}`} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border-2 border-[#A78BFA]/20">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <button
                                  onClick={() => handleDownloadFile(file.file_id)}
                                  className="flex-shrink-0 hover:scale-110 transition-transform"
                                >
                                  <SiteIcon src={siteIcons.table} className="h-6 w-6" />
                                </button>
                                <span className="text-sm font-medium truncate">{cleanFilename(file.filename)}</span>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Button
                                  size="sm"
                                  onClick={() => handleDownloadFile(file.file_id)}
                                  className="gap-2 bg-primary hover:bg-primary/90 text-white border-2 border-[#A78BFA]"
                                >
                                  <SiteIcon src={siteIcons.export} className="h-5 w-5" />
                                  Download
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleShareFile(file)}
                                  className="gap-1.5 bg-white border-2 border-[#A78BFA] text-foreground hover:bg-primary/10"
                                >
                                  <SiteIcon src={siteIcons.share} className="h-5 w-5" />
                                  Share
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    window.open(buildOfficeViewerUrl(file.file_id), '_blank')
                                  }}
                                  className="gap-1.5 bg-white border-2 border-foreground text-foreground hover:bg-muted/50"
                                >
                                  <SiteIcon src={siteIcons.edit} className="h-5 w-5" />
                                  Edit
                                </Button>
                              </div>
                            </div>
                          ))}

                          {/* Pending Files - Show processing indicators */}
                          {isProcessing && totalFilesToProcess > resultFiles.length && (
                            <>
                              {Array.from({ length: totalFilesToProcess - resultFiles.length }).map((_, index) => (
                                <div key={`pending-${index}`} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border-2 border-dashed border-[#A78BFA]/30">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <InlineSpinner className="h-5 w-5 text-primary flex-shrink-0" />
                                    <span className="text-sm font-medium text-muted-foreground">Processing file {resultFiles.length + index + 1}...</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>Please wait</span>
                                  </div>
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      )}

                      {isProcessing && !processingComplete && resultFiles.length === 0 && (
                        <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                          <InlineSpinner className="h-4 w-4" />
                          <span>{isUploading ? 'Uploading your images...' : 'Converting your images...'}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Convert Button + Options Card Row - Hide when processing or files ready */}
                  {!isProcessing && resultFiles.length === 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                     onClick={handleProcessImage}
                     disabled={uploadedFiles.length === 0 || isProcessing}
                     className={`col-span-2 py-5 text-base font-semibold border-2 h-full transition-all duration-200 ${
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
                          Convert Image
                        </>
                      )}
                    </Button>

                    {/* Options Card - Right Side (1 column) */}
                    <Card className="border border-white/55 bg-white/30 shadow-none backdrop-blur-xl dark:bg-white/30">
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <div>
                            <h3 className="text-xs font-semibold mb-1 text-foreground">Language</h3>
                            <select
                              className="w-full p-1.5 rounded-lg border-2 border-muted-foreground/20 bg-muted/30 text-foreground text-xs font-medium hover:border-[#A78BFA]/50 transition-all focus:outline-none focus:border-primary cursor-pointer"
                              defaultValue="en"
                              onClick={(e) => e.preventDefault()}
                            >
                              <option value="en">English</option>
                              <option value="de">Deutsch</option>
                              <option value="fr">Français</option>
                              <option value="ar">العربية</option>
                              <option value="es">Español</option>
                              <option value="it">Italiano</option>
                              <option value="pt">Português</option>
                              <option value="zh">中文</option>
                            </select>
                          </div>

                          <div>
                            <h3 className="text-xs font-semibold mb-1 text-foreground">Auto</h3>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                if (!autoDownload) {
                                  setShowAutoDownloadConfirm(true)
                                } else {
                                  setAutoDownload(false)
                                  // toast.info('Auto-download disabled')
                                }
                              }}
                              className={cn(
                                "w-full flex items-center justify-between p-1.5 rounded-lg transition-all border",
                                autoDownload
                                  ? "bg-primary/10 border-primary"
                                  : "bg-muted/30 border-muted-foreground/20 hover:border-[#A78BFA]/50"
                              )}
                            >
                              <div className="flex items-center gap-1">
                                <SiteIcon src={siteIcons.export} className={cn("h-4 w-4", autoDownload ? "opacity-100" : "opacity-60")} />
                                <Label className="text-xs font-medium text-foreground cursor-pointer">
                                  Auto Download
                                </Label>
                              </div>
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  )}
                </div>

                {resultFiles.length === 0 && (
                  <div className="ax-glass-card relative flex min-h-[430px] flex-col justify-between overflow-hidden rounded-[1.35rem] border border-white/45 p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f165e]">Preview</p>
                        <h3 className="mt-2 text-xl font-semibold text-[#111827]">Before and after conversion</h3>
                      </div>
                      <span className="hidden rounded-full border border-white/60 bg-white/40 px-3 py-1 text-xs font-semibold text-[#111827]/70 backdrop-blur-xl sm:inline-flex">
                        XLSX ready
                      </span>
                    </div>

                    <div className="mt-5 grid flex-1 gap-4 sm:grid-cols-2">
                      <figure className="flex min-h-[310px] flex-col overflow-hidden rounded-[1.1rem] border border-white/60 bg-white/35">
                        <div className="flex items-center justify-between border-b border-white/55 px-4 py-3">
                          <figcaption className="text-sm font-semibold text-[#111827]">Before</figcaption>
                          <span className="text-xs font-medium text-[#111827]/60">Image</span>
                        </div>
                        <div className="relative flex flex-1 items-center justify-center bg-white/30 p-3">
                          <img
                            src="/b.jpeg"
                            alt="Handwritten table before conversion"
                            className="max-h-[300px] w-full rounded-xl object-contain shadow-[0_18px_45px_rgba(42,35,64,0.10)]"
                          />
                        </div>
                      </figure>

                      <figure className="flex min-h-[310px] flex-col overflow-hidden rounded-[1.1rem] border border-white/60 bg-white/35">
                        <div className="flex items-center justify-between border-b border-white/55 px-4 py-3">
                          <figcaption className="text-sm font-semibold text-[#111827]">After</figcaption>
                          <span className="text-xs font-medium text-[#111827]/60">Spreadsheet</span>
                        </div>
                        <div className="relative flex flex-1 items-center justify-center bg-white/30 p-3">
                          <img
                            src="/bb.png"
                            alt="Spreadsheet output after conversion"
                            className="max-h-[300px] w-full rounded-xl object-contain shadow-[0_18px_45px_rgba(42,35,64,0.10)]"
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

          </div>
        </div>

        <div
          ref={purpleSectionRef}
          className="relative isolate -mt-10 overflow-hidden pt-36 pb-12 text-white [&_.text-card-foreground]:!text-white [&_.text-foreground]:!text-white [&_.text-muted-foreground]:!text-white/85 [&_.text-primary]:!text-white"
          style={{
            backgroundColor: "#2f165e",
            clipPath:
              "polygon(0 3.8%, 9% 2.7%, 20% 4.4%, 35% 2.1%, 50% 4.2%, 66% 2.5%, 82% 4.1%, 100% 2.8%, 100% 100%, 0 100%)",
          }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0"
            style={{ backgroundColor: "#2f165e" }}
          />
          <div className="relative z-10">
        {/* What is Axliner Section */}
        <section ref={whatSectionRef} className="relative z-10 py-16 lg:py-24">
          <div className="container mx-auto max-w-[1860px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1780px]">
              {/* Section Header */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 mb-4 shadow-lg shadow-black/10 backdrop-blur-2xl">
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">
                    What is Axliner?
                  </h2>
                </div>
              </div>

              {/* Main Content */}
              <div className="relative mx-auto max-w-[1540px]">
                <svg
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full lg:block"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <path
                    className="what-story-path"
                    d="M74 15 L26 50 L74 85"
                    fill="none"
                    stroke="rgba(255,255,255,0.42)"
                    strokeWidth="0.34"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="1.4 1.15"
                  />
                </svg>

                <div className="relative z-10 space-y-12 lg:space-y-20">
                  <div className="what-story-row grid items-center gap-8 lg:grid-cols-[minmax(0,0.94fr)_minmax(520px,1.06fr)]">
                    <Card className="rounded-[2rem] border border-white/20 bg-white/10 shadow-2xl shadow-black/10 backdrop-blur-2xl">
                      <CardContent className="p-6 sm:p-8 lg:p-10">
                        <p className="text-xl leading-9 text-foreground lg:text-2xl lg:leading-10">
                          Axliner is a <span className="font-bold">7-billion parameter vision-language model</span> fine-tuned from Meta's Llama 3 family for handwritten tables, forms, and spreadsheet-like documents. It understands document structure first, so the result is usable rows, columns, headers, and values.
                        </p>
                      </CardContent>
                    </Card>

                    <div className="what-story-image relative flex min-h-[280px] items-center justify-center lg:min-h-[430px]">
                      <img
                        src="/what-is/chaos-invoices.svg"
                        alt=""
                        className="h-[300px] w-full object-contain drop-shadow-[0_28px_45px_rgba(0,0,0,0.2)] sm:h-[380px] lg:h-[520px]"
                      />
                    </div>
                  </div>

                  <div className="what-story-row grid items-center gap-8 lg:grid-cols-[minmax(520px,1.05fr)_minmax(0,0.95fr)]">
                    <div className="what-story-image relative order-2 flex min-h-[300px] items-center justify-center lg:order-1 lg:min-h-[460px]">
                      <img
                        src="/what-is/axliner-cpu.svg"
                        alt=""
                        className="h-[320px] w-full object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.22)] sm:h-[410px] lg:h-[560px]"
                      />
                    </div>

                    <Card className="order-1 rounded-[2rem] border border-white/20 bg-white/10 shadow-2xl shadow-black/10 backdrop-blur-2xl lg:order-2">
                      <CardContent className="p-6 sm:p-8 lg:p-10">
                        <p className="text-xl leading-9 text-foreground lg:text-2xl lg:leading-10">
                          During conversion, Axliner cleans the image, detects table regions, reads handwriting, and keeps cell relationships intact. It was trained on diverse handwritten datasets, table extraction data, and augmented noisy documents, so dense notes and phone photos can still become structured spreadsheets.
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="what-story-row grid items-center gap-8 lg:grid-cols-[minmax(0,0.94fr)_minmax(520px,1.06fr)]">
                    <Card className="rounded-[2rem] border border-white/20 bg-white/10 shadow-2xl shadow-black/10 backdrop-blur-2xl">
                      <CardContent className="p-6 sm:p-8 lg:p-10">
                        <p className="text-xl leading-9 text-foreground lg:text-2xl lg:leading-10">
                          The workflow is designed for batch processing. Upload several images, watch progress as each page finishes, then download clean Excel files ready for review, reporting, editing, or sharing without losing the table logic people need in the final workbook.
                        </p>
                      </CardContent>
                    </Card>

                    <div className="what-story-image relative flex min-h-[280px] items-center justify-center lg:min-h-[430px]">
                      <img
                        src="/what-is/chill-output.svg"
                        alt=""
                        className="h-[300px] w-full object-contain drop-shadow-[0_28px_45px_rgba(0,0,0,0.2)] sm:h-[380px] lg:h-[520px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden">
                <Card className="ax-glass-card overflow-hidden rounded-[1.75rem] border border-white/45 shadow-xl shadow-[#441F84]/15">
                  <CardContent className="space-y-8 p-6 sm:p-8 lg:p-10">
                    <p className="text-xl text-foreground leading-relaxed">
                      Axliner is a <span className="font-bold">7-billion parameter vision-language model</span> a fine-tuned Meta's Llama 3 Model. The model underwent extensive instruction fine-tuning specifically optimized for <span className="font-bold">handwritten text recognition</span>, <span className="font-bold">table structure preservation</span>, and <span className="font-bold">multi-language document understanding</span>.
                    </p>

                    <p className="text-xl text-foreground leading-relaxed">
                      Unlike generic OCR systems, Axliner was trained on diverse handwritten datasets including the <span className="font-bold">IAM Handwriting Database</span>, proprietary table extraction datasets, and synthetic augmented data. The fine-tuning process focused on <span className="font-bold">preserving table semantics, cell relationships, and hierarchical document structures</span> — achieving <span className="font-bold">96.8% accuracy</span> on complex handwritten tables.
                    </p>

                    <p className="text-xl text-foreground leading-relaxed">
                      The system supports <span className="font-bold">batch processing using your live plan limit</span>, with real-time conversion progress as each page finishes. Axliner handles <span className="font-bold">8+ languages</span> including complex scripts like Arabic and Chinese, while maintaining cell relationships and formatting integrity across all output formats.
                    </p>

                    <p className="text-xl text-foreground leading-relaxed">
                      Built for enterprise workflows, Axliner excels in <span className="font-bold">financial document processing</span>, <span className="font-bold">invoice digitization</span>, <span className="font-bold">form automation</span>, and archive digitization — trained on over <span className="font-bold">2 million handwritten samples</span> using a Llama 3-based vision-language transformer architecture.
                    </p>
                  </CardContent>
                </Card>

                <div />
              </div>
            </div>
          </div>
        </section>

        {/* Companies Section - Trusted By */}
        <ScrollAnimatedSection id="trusted" className="w-full overflow-hidden py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-5" data-animate="headline">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 shadow-lg shadow-black/10 backdrop-blur-2xl">
                <h2 className="text-base font-semibold text-foreground sm:text-lg">
                  Chosen by experts at top organizations
                </h2>
              </div>
            </div>

            <div className="relative z-10 overflow-hidden" data-animate="stagger">
              <div
                className="flex gap-8 items-center"
                style={{
                  animation: 'scroll-left 60s linear infinite',
                  width: 'max-content',
                  willChange: 'transform'
                }}
              >
                {Array.from({ length: 10 }, (_, setIndex) =>
                  [1, 2, 3, 4, 5, 6, 7, 8, 9].map((imgNum) => (
                    <Card
                      key={`${setIndex}-${imgNum}`}
                      className="flex-shrink-0 bg-white dark:bg-white border border-border/50 hover:border-[#A78BFA]/30 transition-all duration-300 hover:shadow-md w-[120px] h-[80px]"
                    >
                      <CardContent className="p-2 flex items-center justify-center w-full h-full">
                        <img
                          src={`/${imgNum}.jpeg`}
                          alt={`Company ${imgNum}`}
                          className="w-[100px] h-[60px] object-contain opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<span class="text-xs font-medium text-muted-foreground">Company ${imgNum}</span>`;
                            }
                          }}
                        />
                      </CardContent>
                    </Card>
                  ))
                ).flat()}
              </div>
            </div>
          </div>
        </ScrollAnimatedSection>
          </div>
        </div>

        <div className="relative isolate overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 bg-cover bg-top bg-no-repeat"
            style={{ backgroundColor: "#E9ECE4" }}
          />
          <div className="relative z-10">
        {/* Why Choose Us Section */}
        <ScrollAnimatedSection id="features" className="relative z-20 pt-16 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12" data-animate="headline">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/45 bg-white/45 px-4 py-2 mb-4 shadow-lg shadow-[#A78BFA]/10 backdrop-blur-2xl">
                <h2 className="text-lg sm:text-xl font-bold text-foreground">
                  Solutions
                </h2>
              </div>
            </div>

            <div className="mx-auto grid max-w-[1540px] grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {solutionCards.map((solution) => (
                <Card
                  key={solution.title}
                  data-animate="stagger"
                  className="group flex min-h-[560px] overflow-hidden rounded-[6px] border border-white/70 bg-[#f2f5ee]/78 shadow-[0_26px_70px_rgba(42,35,64,0.08)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white hover:bg-[#f7f9f3]/90 hover:shadow-[0_32px_85px_rgba(42,35,64,0.13)]"
                >
                  <CardContent className="flex h-full w-full flex-col p-7 sm:p-8">
                    <div className="flex h-56 items-center justify-center sm:h-64">
                      <img
                        src={solution.asset}
                        alt=""
                        className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    </div>

                    <div className="mt-10 flex flex-1 flex-col">
                      <CardTitle className="text-2xl font-semibold tracking-normal text-[#141b35]">
                        {solution.title}
                      </CardTitle>
                      <CardDescription className="mt-5 text-[15px] leading-7 text-[#24304a]">
                        {solution.description}
                      </CardDescription>

                      <NextLink
                        href={solution.href}
                        className="mt-auto flex items-end justify-between gap-4 pt-12 text-left text-sm font-medium text-[#24304a] transition-colors hover:text-[#151827]"
                      >
                        <span>Discover More</span>
                        <span className="relative block h-10 w-10 text-[#00a51a] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                          <span className="absolute bottom-2 right-1 h-[4px] w-9 origin-right rotate-[-45deg] rounded-full bg-current" />
                          <span className="absolute right-1 top-1 h-8 w-8 border-r-[4px] border-t-[4px] border-current" />
                        </span>
                      </NextLink>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ScrollAnimatedSection>
        {/* Benchmark Section */}
        <ScrollAnimatedSection id="benchmarks" className="relative z-20 -mt-6 overflow-hidden pt-28 pb-16">
          <div
            ref={benchmarkBandRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              backgroundColor: "#E9ECE4",
              boxShadow: "0 -24px 60px rgba(47, 22, 94, 0.08)",
              clipPath:
                "polygon(0 4%, 12% 2.8%, 25% 4.6%, 40% 2.4%, 58% 4.3%, 75% 2.7%, 100% 4%, 100% 100%, 0 100%)",
            }}
          />
          <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12" data-animate="headline">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/45 bg-white/45 px-4 py-2 mb-4 shadow-lg shadow-[#A78BFA]/10 backdrop-blur-2xl">
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">
                    Benchmarks
                  </h2>
                </div>

                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Benchmarked against major cloud providers on real-world handwritten documents and complex table structures.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Accuracy Chart */}
                <Card className="border border-[#A78BFA]/35 bg-white/55 shadow-xl shadow-[#A78BFA]/10 backdrop-blur-md dark:bg-card/70" data-animate="stagger">
  <CardHeader className="pb-3">
    <CardTitle className="text-lg font-semibold">
      Handwritten Text Recognition Accuracy
    </CardTitle>
    <p className="text-sm text-muted-foreground">
      Based on 10,000+ real-world samples
    </p>
  </CardHeader>

  <CardContent>
    <ChartContainer
      config={{
        accuracy: {
          label: "Accuracy",
          color: "var(--primary)",
        },
      }}
      className="h-[300px] w-full"
    >
      <BarChart
        data={[
          { provider: "AxLiner", accuracy: 96.8 },
          { provider: "AWS Textract", accuracy: 77.2 },
          { provider: "Google Vision", accuracy: 54.5 },
          { provider: "Azure Vision", accuracy: 51.7 },
        ]}
        margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="provider"
          tickLine={false}
          axisLine={true}
          tickMargin={10}
          angle={0}
          textAnchor="middle"
        />
        <YAxis
          tickLine={false}
          axisLine={true}
          tickMargin={10}
          domain={[0, 100]}
          ticks={[0, 20, 40, 60, 80, 100]}
          label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft' }}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar
          dataKey="accuracy"
          fill="#441F84"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ChartContainer>

    {/* Footer */}
    <div className="mt-6 pt-4 border-t border-border/50">
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <SiteIcon src={siteIcons.table} className="h-5 w-5" />
        <span>Tested on IAM Handwriting Database v3.0</span>
      </div>
    </div>
  </CardContent>
</Card>


                {/* Performance Metrics Table */}
                <Card className="border border-[#A78BFA]/35 bg-white/55 shadow-xl shadow-[#A78BFA]/10 backdrop-blur-md dark:bg-card/70" data-animate="stagger">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold">Comprehensive Performance Metrics</CardTitle>
                    <p className="text-sm text-muted-foreground">Average across all test scenarios</p>
                  </CardHeader>
                  <CardContent>
                      <div className="overflow-hidden rounded-lg border border-[#A78BFA]/45 bg-white/45 backdrop-blur-md">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border/50 bg-muted/30">
                            <th className="text-left p-3 font-medium">Metric</th>
                            <th className="text-right p-3 font-medium text-primary">AxLiner</th>
                            <th className="text-right p-3 font-medium text-muted-foreground">Industry Avg</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-border/50">
                            <td className="p-3 text-muted-foreground">Character Error Rate</td>
                            <td className="p-3 text-right font-semibold text-primary">3.2%</td>
                            <td className="p-3 text-right text-muted-foreground">5.8%</td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="p-3 text-muted-foreground">Word Recognition</td>
                            <td className="p-3 text-right font-semibold text-[#441F84]">99.5%</td>
                            <td className="p-3 text-right text-muted-foreground">95.1%</td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="p-3 text-muted-foreground">Table Structure</td>
                            <td className="p-3 text-right font-semibold text-primary">99.1%</td>
                            <td className="p-3 text-right text-muted-foreground">92.3%</td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="p-3 text-muted-foreground">Noisy Image Handling</td>
                            <td className="p-3 text-right font-semibold text-primary">94.7%</td>
                            <td className="p-3 text-right text-muted-foreground">87.2%</td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="p-3 text-muted-foreground">Mixed Font Recognition</td>
                            <td className="p-3 text-right font-semibold text-primary">97.9%</td>
                            <td className="p-3 text-right text-muted-foreground">94.6%</td>
                          </tr>
                          <tr>
                            <td className="p-3 text-muted-foreground">Processing Speed</td>
                            <td className="p-3 text-right font-semibold text-primary">0.8s/page</td>
                            <td className="p-3 text-right text-muted-foreground">2.1s/page</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        </ScrollAnimatedSection>
          </div>
        </div>

        <div className="relative isolate overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 bg-cover bg-top bg-no-repeat"
            style={{ backgroundColor: "#E9ECE4" }}
          />
          <div className="relative z-10">
        {/* AI Engine Section */}
        <ScrollAnimatedSection id="ai-engine" className="py-16">
          <div className="container mx-auto max-w-[1640px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto">
              <div className="mx-auto mb-12 max-w-4xl text-center" data-animate="headline">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#A78BFA]/70 bg-white/55 px-4 py-2 shadow-lg shadow-[#A78BFA]/10 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-[#F97316]" />
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">
                    How AxLiner's Engine Is Built
                  </h2>
                </div>
              </div>

              {/* Main Content */}
              <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(440px,0.9fr)] lg:items-start">
                <div className="space-y-12">
                {/* Engine Workflow */}
                <Card className="overflow-hidden border border-[#A78BFA]/35 bg-white/55 shadow-xl shadow-[#A78BFA]/10 backdrop-blur-md" data-animate="stagger">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F97316]/12 text-sm font-black text-[#C2410C] ring-1 ring-[#F97316]/25">01</span>
                      <CardTitle className="text-2xl">Built as a document workflow</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-[#1f2937] font-medium leading-8 text-base sm:text-lg">
                        AxLiner separates the work into focused stages: clean the image, locate the table, read the handwriting, rebuild the rows, then package the result as an editable workbook. That keeps the experience predictable when a file is crooked, crowded, photographed from a phone, or mixed with notes and totals.
                      </p>

                      <p className="text-[#1f2937] font-medium leading-8 text-base sm:text-lg">
                        The engine is tuned for batch jobs where every page needs the same level of structure. Instead of returning a wall of extracted text, it preserves the relationships that matter in Excel: headers, columns, repeated rows, numeric values, and the original reading order.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                      <div className="flex items-start gap-3 rounded-2xl border border-[#A78BFA]/35 bg-[#fbfdfc]/80 p-4 transition duration-300 hover:-translate-y-1 hover:border-[#F97316]/50 hover:shadow-lg">
                        <span className="mt-0.5 h-2 w-8 flex-shrink-0 rounded-full bg-[#F97316]" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">Image cleanup</p>
                          <p className="text-sm text-muted-foreground font-medium">Rotation, contrast, and page noise are normalized before extraction.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-2xl border border-[#A78BFA]/35 bg-[#fbfdfc]/80 p-4 transition duration-300 hover:-translate-y-1 hover:border-[#F97316]/50 hover:shadow-lg">
                        <span className="mt-0.5 h-2 w-8 flex-shrink-0 rounded-full bg-[#F97316]" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">Handwriting read</p>
                          <p className="text-sm text-muted-foreground font-medium">Letters, numbers, and totals stay connected to their table context.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-2xl border border-[#A78BFA]/35 bg-[#fbfdfc]/80 p-4 transition duration-300 hover:-translate-y-1 hover:border-[#F97316]/50 hover:shadow-lg">
                        <span className="mt-0.5 h-2 w-8 flex-shrink-0 rounded-full bg-[#F97316]" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">Table rebuild</p>
                          <p className="text-sm text-muted-foreground font-medium">Cells are mapped back into rows and columns instead of plain text.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-2xl border border-[#A78BFA]/35 bg-[#fbfdfc]/80 p-4 transition duration-300 hover:-translate-y-1 hover:border-[#F97316]/50 hover:shadow-lg">
                        <span className="mt-0.5 h-2 w-8 flex-shrink-0 rounded-full bg-[#F97316]" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">Workbook export</p>
                          <p className="text-sm text-muted-foreground font-medium">The final XLSX is shaped for review, editing, and sharing.</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 rounded-3xl border border-[#4C1D95]/20 bg-[#2E145F] p-5 text-white shadow-2xl shadow-[#2E145F]/20">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FDBA74]">Extraction plan</p>
                      <p className="mt-2 text-lg font-bold">Messy page in, structured spreadsheet out</p>
                      <div className="mt-5 grid gap-2 sm:grid-cols-3">
                        {["headers", "rows", "totals"].map((item) => (
                          <div key={item} className="rounded-xl bg-white/10 px-3 py-2 text-center text-sm font-semibold">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Export Quality */}
                <Card className="overflow-hidden border border-[#A78BFA]/35 bg-white/55 shadow-xl shadow-[#A78BFA]/10 backdrop-blur-md" data-animate="stagger">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F97316]/12 text-sm font-black text-[#C2410C] ring-1 ring-[#F97316]/25">02</span>
                      <CardTitle className="text-2xl">Quality control before export</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-[#1f2937] font-medium leading-8 text-base sm:text-lg">
                        AxLiner treats export quality as part of the engine, not a final download button. Before a workbook is returned, the output is checked for row continuity, empty columns, mismatched totals, and values that are likely to have been read from the wrong cell.
                      </p>
                    </div>

                    <div className="grid gap-3">
                      {[
                        ["Input", "crooked invoice photo"],
                        ["Structure", "detected columns and repeated rows"],
                        ["Output", "editable XLSX with clean sheet names"],
                      ].map(([label, value]) => (
                        <div key={label} className="grid grid-cols-[110px_1fr] items-center rounded-2xl border border-[#A78BFA]/25 bg-[#fbfdfc]/80 px-4 py-3">
                          <span className="text-xs font-black uppercase tracking-[0.18em] text-[#C2410C]">{label}</span>
                          <span className="text-sm font-semibold text-foreground">{value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-[#A78BFA]/40 mt-6 bg-white/70">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border/50 bg-[#F5EEFF]/70">
                            <th className="text-left p-3 font-medium">Check</th>
                            <th className="text-right p-3 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-border/50">
                            <td className="p-3 text-muted-foreground">Column count</td>
                            <td className="p-3 text-right font-semibold text-primary">matched</td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="p-3 text-muted-foreground">Numeric fields</td>
                            <td className="p-3 text-right font-semibold text-primary">verified</td>
                          </tr>
                          <tr>
                            <td className="p-3 text-muted-foreground">Workbook format</td>
                            <td className="p-3 text-right font-semibold text-primary">ready</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      The result is a file that feels closer to a finished spreadsheet than a raw OCR dump.
                    </p>
                  </CardContent>
                </Card>
                </div>

                <div className="relative min-h-[520px] overflow-hidden rounded-l-[2rem] border border-[#A78BFA]/40 shadow-xl shadow-[#A78BFA]/10 lg:min-h-[760px]" data-animate="stagger">
                  <img
                    src="/purchase.webp"
                    alt="Professionals reviewing documents"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                </div>
              </div>

              {/* Footer Note */}
              <div className="mt-12 text-center" data-animate="stagger">
                <p className="text-sm text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                  <span className="font-semibold text-foreground">Designed for operators:</span> every step is shaped around the spreadsheet people need after the upload, from invoices and paper forms to handwritten class notes and archive tables.
                </p>
              </div>
            </div>
          </div>
        </ScrollAnimatedSection>
        <ScrollAnimatedSection id="security" className="relative z-10 overflow-hidden py-20 lg:py-24">
          <div
            ref={securityBandRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              backgroundColor: "#E9ECE4",
              boxShadow: "0 -24px 60px rgba(47, 22, 94, 0.08)",
              clipPath:
                "polygon(0 4%, 12% 2.8%, 25% 4.6%, 40% 2.4%, 58% 4.3%, 75% 2.7%, 100% 4%, 100% 100%, 0 100%)",
            }}
          />
          <div className="container relative z-10 mx-auto max-w-[1540px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[minmax(420px,0.88fr)_minmax(520px,1.12fr)] lg:items-center">
              <div data-animate="headline">
                <p className="text-xl font-medium text-black">Security & Compliance</p>
                <h2 className="mt-6 max-w-2xl text-4xl font-bold leading-tight text-[#11182f] sm:text-5xl lg:text-6xl">
                  Your Data Security Guaranteed
                </h2>

                <div className="mt-10 overflow-hidden rounded-[10px] shadow-[0_28px_70px_rgba(17,24,47,0.14)]">
                  <img
                    src="/secu.jpeg"
                    alt="Secure digital document processing"
                    className="h-[300px] w-full object-cover sm:h-[360px] lg:h-[380px]"
                  />
                </div>
              </div>

              <div className="lg:pt-12" data-animate="stagger">
                <p className="max-w-3xl text-2xl leading-10 text-[#11182f]">
                  At AxLiner, your data is treated with utmost care. We build around global data protection expectations and international privacy requirements for document processing workflows.
                </p>

                <div className="mt-10 space-y-7">
                  {[
                    "ISO 27001-aligned security controls",
                    "Built for GDPR, SOC 2, CCPA and HIPAA-conscious workflows",
                    "Secure infrastructure across Supabase, Fly.io and Vercel",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-4 text-xl text-[#11182f]">
                      <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[#2815FF] text-[#2815FF]">
                        <span className="h-2.5 w-1.5 rotate-45 border-b-2 border-r-2 border-current" />
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="mt-12 rounded-full bg-[#E4E8FA] px-8 py-6 text-lg font-bold text-[#11182f] shadow-none hover:bg-[#d9def4]"
                  asChild
                >
                  <NextLink href="/privacy-policy">More Information</NextLink>
                </Button>
              </div>
            </div>
          </div>
        </ScrollAnimatedSection>
        {/* Final CTA Section */}
        <section className="relative z-10 overflow-hidden py-24">
          <div className="grid w-full items-start gap-10 pr-4 sm:pr-6 lg:grid-cols-[minmax(620px,1.18fr)_minmax(420px,0.82fr)] lg:gap-14 lg:pr-12 xl:pr-20">
            <div className="relative min-h-[340px] w-full overflow-hidden sm:min-h-[430px] lg:min-h-[560px]">
              <img
                src="/cta-team.jpg"
                alt="Team collaborating around laptops"
                className="absolute inset-0 h-full w-full object-cover object-center lg:rounded-r-[2rem]"
              />
            </div>

            {/* CTA Content */}
            <div className="flex min-h-[560px] max-w-3xl flex-col text-center lg:text-left">
              <div className="inline-flex w-fit items-center gap-2 self-center rounded-full border border-white/45 bg-white/45 px-4 py-2 shadow-lg shadow-[#A78BFA]/10 backdrop-blur-2xl lg:self-start mb-14">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                  Ready to Transform Your Workflow?
                </h2>
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                Join thousands of professionals who have already revolutionized their data extraction process with AxLiner.
              </p>
              
              {/* Single Primary CTA */}
              <div className="mt-24 flex justify-center">
                {isAuthenticated ? (
                  <Button
                    size="lg"
                    className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-all duration-200 shadow-lg shadow-primary/20"
                    asChild
                  >
                    <NextLink href="/dashboard">Go to Dashboard</NextLink>
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-all duration-200 shadow-lg shadow-primary/20"
                    onClick={() => openSignInModal("/pricing?from=signup")}
                  >
                    Try for free
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="backdrop-blur-md relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-2xl font-bold text-foreground mb-4">AxLiner</div>
              <p className="text-muted-foreground mb-4">
                Transform screenshots to spreadsheets effortlessly with AI-powered OCR technology.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground hover:text-primary transition-colors">Why Choose Us</a></li>
                <li><a href="#trusted" className="hover:text-foreground hover:text-primary transition-colors">Trusted By</a></li>
                <li><a href="/pricing" className="hover:text-foreground hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#benchmarks" className="hover:text-foreground hover:text-primary transition-colors">Performance Benchmarks</a></li>
                <li><a href="#how-it-works" className="hover:text-foreground hover:text-primary transition-colors">How It Works</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Contact</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="mailto:axliner.excel@gmail.com" className="hover:text-foreground hover:text-primary transition-colors">axliner.excel@gmail.com</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center items-center mt-8">
            <p className="text-muted-foreground text-sm">
              © 2025 AxLiner. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      
      {/* Mobile Navigation */}
      <MobileNav 
        onSectionClick={scrollToSection}
        onSignInClick={() => openSignInModal("/dashboard/client")}
        isAuthenticated={isAuthenticated}
      />

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setCopySuccess(false);
        }
        setShareDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Share File</DialogTitle>
            <DialogDescription className="text-sm">
              {selectedFileToShare?.filename || 'Excel file'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Direct Message Share Options */}
            <div className="space-y-3">
              <p className="text-xs text-center text-muted-foreground">Share your download link:</p>
              <div className="flex justify-center gap-4">
                {/* Gmail */}
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

                {/* LinkedIn Message */}
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

                {/* X (Twitter) */}
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

                {/* Facebook Messenger */}
                <button
                  onClick={handleMessengerShare}
                  className="group flex flex-col items-center gap-1.5 cursor-pointer"
                  title="Send via Facebook Messenger"
                >
                  <SiteIcon src={siteIcons.share} className="h-10 w-10 transition-transform group-hover:scale-110" />
                  <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">Messenger</span>
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground/70 text-center">
                {selectedFileToShare?.filename || 'Excel file'} ready to share
              </p>
              <p className="text-[9px] text-muted-foreground/50 text-center">
                Gmail: Compose email • LinkedIn: Copy & paste • X: Tweet • Messenger: Direct message
              </p>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>
            
            {/* Direct Download Link */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <SiteIcon src={siteIcons.link} className="h-4 w-4" />
                <span className="font-medium">Direct download link</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={selectedFileToShare?.file_id ? buildDownloadUrl(selectedFileToShare.file_id) : ''}
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
                      <SiteIcon src={siteIcons.table} className="mr-1.5 h-4 w-4" />
                      <span className="text-xs">Copied</span>
                    </>
                  ) : (
                    <>
                      <SiteIcon src={siteIcons.copy} className="mr-1.5 h-4 w-4" />
                      <span className="text-xs">Copy</span>
                    </>
                  )}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Anyone with this link can download the Excel file directly
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Free Trial Limit Dialog */}
      <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Free trial limit reached</DialogTitle>
            <DialogDescription className="text-base">
              You can convert 5 images without an account. Create an account to keep using AxLiner, or choose a paid plan if you need more pages.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowLimitDialog(false);
                window.location.href = "/pricing?from=trial-limit";
              }}
              className="flex-1 border-2 border-[#A78BFA]"
            >
              See Plans
            </Button>
            <Button
              onClick={() => {
                setShowLimitDialog(false);
                openSignInModal("/dashboard/client");
              }}
              className="flex-1 bg-primary hover:bg-primary/90 border-2 border-[#A78BFA]"
            >
              Create Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Auto Download Confirmation Dialog */}
      <Dialog open={showAutoDownloadConfirm} onOpenChange={setShowAutoDownloadConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enable Auto-Download?</DialogTitle>
            <DialogDescription>
              All processed files will be automatically downloaded to your device as soon as they're ready.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowAutoDownloadConfirm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setAutoDownload(true)
                setShowAutoDownloadConfirm(false)
                // toast.success('Auto-download enabled')
              }}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Enable Auto-Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* First-Time Convert Confirmation Dialog */}
      <Dialog open={showFirstConvertConfirm} onOpenChange={setShowFirstConvertConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <SiteIcon src={siteIcons.document} className="h-7 w-7" />
              <DialogTitle>You can add up to {maxUploadFiles} images!</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground">
              Process up to {maxUploadFiles} table images in one click.
              <br /><br />
              You can add more files now or proceed to convert your current selection.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowFirstConvertConfirm(false);
                // Trigger file input to add more
                document.getElementById('file-upload-landing')?.click();
              }}
              className="flex-1"
            >
              Add More
            </Button>
            <Button
              onClick={async () => {
                if (typeof window !== 'undefined') {
                  localStorage.setItem('hasConvertedBefore', 'true');
                }
                setShowFirstConvertConfirm(false);
                await processImages();
              }}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Convert This
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Google Sign In Modal */}
      <GoogleSignInModal open={showSignInModal} onOpenChange={setShowSignInModal} redirectPath={signInRedirectPath} />
    </div>
  )}
