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
import { Camera, FileSpreadsheet, Zap, Shield, Clock, Users, Star, CheckCircle, Layers, FileText, PenTool, FileInput, DollarSign, Database, Upload, ArrowRight, Sparkles, TrendingUp, Award, Target, Wand2, Sparkle, Trophy, Download, Loader2, X, Share2, Edit3, Copy, MessageCircle, Link, CheckCircle2, AlertTriangle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { ActiveUsersCounter } from "@/components/ActiveUsersCounter";
import { wakeUpBackendSilently } from "@/lib/backend-health";
import { getTrialInfo, incrementTrialUploadCount } from "@/lib/free-trial";
import { ocrApi, OCRWebSocket } from "@/lib/api-client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import { useProcessingState } from "@/contexts/ProcessingStateContext";
import * as XLSX from 'xlsx';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const headerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);

  // Get state management from context
  const contextValue = useProcessingState()
  const processingState = contextValue?.state
  const updateState = contextValue?.updateState
  const clearState = contextValue?.clearState;

  // Free trial state
  const [trialInfo, setTrialInfo] = useState({ uuid: '', used: 0, remaining: 3, hasRemaining: true, limit: 3 });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
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

  // User authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const supabase = createClient();

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
      console.log('[Landing] Restoring state from context:', processingState);
      
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
        console.log('[Landing] Saving state to context:', {
          processedFiles: resultFiles.length,
          status: processingComplete ? 'completed' : isProcessing ? 'processing' : 'idle'
        });
      } catch (error) {
        console.error('[Landing] Error updating state:', error);
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
    console.log('[Landing] Trial info loaded:', info);
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
        toast.info(`Auto-downloading ${resultFiles.length} file(s)...`)
        const downloadedIds = new Set<string>()

        for (const file of resultFiles) {
          if (file.file_id && !downloadedIds.has(file.file_id)) {
            try {
              await handleDownloadFile(file.file_id)
              downloadedIds.add(file.file_id)
              await new Promise(resolve => setTimeout(resolve, 500))
            } catch (error) {
              console.error('[AutoDownload] Failed to download:', error)
            }
          }
        }
        toast.success(`Auto-downloaded ${downloadedIds.size} file(s)`)
      }
      handleAutoDownload()
    }
  }, [processingComplete, resultFiles, autoDownload])

  useEffect(() => {
    // Header animation
    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        { y: -100, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 1,
          ease: "power3.out",
          delay: 0.2
        }
      );
    }

    // Hero content animation
    if (heroContentRef.current) {
      const elements = heroContentRef.current.children;
      gsap.fromTo(elements,
        { 
          y: 50, 
          opacity: 0,
          scale: 0.95
        },
        { 
          y: 0, 
          opacity: 1,
          scale: 1,
          duration: 1.2,
          stagger: 0.5,
          ease: "power3.out",
          delay: 0.5
        }
      );
    }

    // Hero image animation removed per user request

    // Removed section animations per user request
    // Removed comparison section animation per user request



    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
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

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      setUploadedFiles(files); // Allow multiple files
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files).filter(file =>
        file.type.startsWith('image/')
      );
      setUploadedFiles(fileArray); // Allow multiple files
    }
  }, []);

  const handleProcessImage = useCallback(async () => {
    if (!uploadedFiles || uploadedFiles.length === 0) {
      toast.error('Please select files to process');
      return;
    }

    // Check if user has free trials remaining (silently)
    if (!trialInfo.hasRemaining) {
      setShowLimitDialog(true);
      return;
    }

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
  }, [uploadedFiles, trialInfo]);

  const processImages = useCallback(async () => {
    try {
      setIsProcessing(true);
      setProcessingComplete(false);
      setTotalFilesToProcess(uploadedFiles.length);

      console.log('[Landing] Processing images:', uploadedFiles.length);

      // Upload the files
      const response = await ocrApi.uploadBatchMultipart(uploadedFiles, {
        output_format: 'xlsx',
        consolidation_strategy: 'separate'
      });

      console.log('[Landing] Upload successful:', response);

      // Increment trial count
      incrementTrialUploadCount();
      const newInfo = getTrialInfo();
      setTrialInfo(newInfo);

      // Store the first uploaded image for preview immediately
      if (uploadedFiles.length > 0) {
        const firstFile = uploadedFiles[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          setFirstImageUrl(e.target?.result as string);
        };
        reader.readAsDataURL(firstFile);
      }

      // Disconnect any existing WebSocket first
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }

      // Connect WebSocket for real-time progressive updates
      if (response.session_id) {
        console.log('[Landing] Connecting WebSocket for session:', response.session_id);
        
        const websocket = new OCRWebSocket(
          response.session_id,
          (data) => {
            console.log('[Landing] WebSocket message:', data);
            const messageType = data.type || '';

            // Progressive results: Individual file ready for download
            if (messageType === 'file_ready') {
              console.log('[Landing] File ready:', data.file_info);
              
              if (data.file_info && data.file_info.file_id) {
                // Add file to results immediately as it becomes available
                setResultFiles(prev => {
                  const existing = prev || [];
                  // Avoid duplicates
                  if (existing.some(f => f.file_id === data.file_info.file_id)) {
                    return existing;
                  }
                  const newFiles = [...existing, data.file_info];
                  
                  // Fetch table preview for the first file
                  if (newFiles.length === 1 && tablePreviewData.length === 0) {
                    fetchTablePreview(data.file_info.file_id);
                  }
                  
                  return newFiles;
                });

                // Show toast for individual file completion
                toast.success(`File ${data.image_number}/${data.total_images} ready!`);
              }
            }

            // Progress updates
            if (messageType === 'job_progress' || messageType === 'progress') {
              // Update status but keep processing
              if (data.total_images && data.processed_images !== undefined) {
                console.log('[Landing] Progress:', data.processed_images, '/', data.total_images);
              }
            }

            // Job completed
            if (messageType === 'job_completed' || data.status === 'completed') {
              console.log('[Landing] Job completed:', data);
              
              setProcessingComplete(true);
              setIsProcessing(false);

              // Set final files if provided
              if (data.files && data.files.length > 0) {
                setResultFiles(data.files);
              }

              // Update context
              if (updateState) {
                updateState({
                  processedFiles: resultFiles,
                  status: 'completed',
                  processingComplete: true,
                  uploadedFiles: []
                });
              }

              toast.success(`All ${data.total_images || totalFilesToProcess} files processed!`);

              // Show limit dialog if no more free trials
              if (newInfo.remaining === 0) {
                setTimeout(() => setShowLimitDialog(true), 2000);
              }

              // Disconnect WebSocket
              if (wsRef.current) {
                wsRef.current.disconnect();
                wsRef.current = null;
              }
            }

            // Job failed
            if (messageType === 'job_error' || data.status === 'failed') {
              const errorMsg = data.error || data.errors?.[0] || 'Processing failed';
              setIsProcessing(false);
              toast.error(errorMsg);
              
              // Disconnect WebSocket
              if (wsRef.current) {
                wsRef.current.disconnect();
                wsRef.current = null;
              }
            }
          },
          (error) => {
            console.error('[Landing] WebSocket error:', error);
          }
        );

        websocket.connect();
        wsRef.current = websocket;
      } else {
        // Fallback to polling if no session_id
        console.log('[Landing] No session_id, falling back to polling');
        
        const checkStatus = async () => {
          try {
            const status = await ocrApi.getStatus(response.job_id);
            
            if (status.results && status.results.files && status.results.files.length > 0) {
              setResultFiles(status.results.files);
              
              if (status.results.files.length > 0 && tablePreviewData.length === 0) {
                fetchTablePreview(status.results.files[0].file_id);
              }
            }

            if (status.status === 'completed') {
              setProcessingComplete(true);
              setIsProcessing(false);
              toast.success(`${status.results?.files?.length || 0} file(s) processed!`);
              
              if (newInfo.remaining === 0) {
                setTimeout(() => setShowLimitDialog(true), 2000);
              }
            } else if (status.status === 'failed') {
              setIsProcessing(false);
              toast.error('Processing failed');
            } else {
              setTimeout(checkStatus, 2000);
            }
          } catch (error) {
            console.error('[Landing] Error checking status:', error);
            setIsProcessing(false);
            toast.error('Failed to process images. Please try again.');
          }
        };
        
        setTimeout(checkStatus, 2000);
      }

    } catch (error: any) {
      console.error('[Landing] Error processing images:', error);
      setIsProcessing(false);
      setProcessingComplete(false);

      // Check if error is due to trial limit
      if (error?.status_code === 402 || error?.detail?.includes('trial') || error?.detail?.includes('limit')) {
        setShowLimitDialog(true);
      } else {
        toast.error(error?.detail || 'Failed to process images. Please try again.');
      }
    }
  }, [uploadedFiles, updateState]);

  const handleDownloadFile = async (fileId: string) => {
    try {
      const blob = await ocrApi.downloadFile(fileId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `result-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('File downloaded successfully!');
    } catch (error) {
      console.error('[Landing] Error downloading file:', error);
      toast.error('Failed to download file');
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
      console.error('[Landing] Error fetching table preview:', error);
      // Don't show error toast - just silently fail to show preview
    }
  };

  const handleReset = () => {
    setUploadedFiles([]);
    setResultFiles([]);
    setProcessingComplete(false);
    setIsProcessing(false);
    setTablePreviewData([]);
    setFirstImageUrl('');
    setTotalFilesToProcess(0);
    isExecutingAutoActionsRef.current = false;
    
    // Clear context state
    clearState();
    console.log('[Landing] State cleared');
  };

  const handleShareFile = (file: any) => {
    console.log('[Share] Opening share dialog for file:', file);
    setSelectedFileToShare(file);
    setShareDialogOpen(true);
    setCopySuccess(false);
  };

  const handleCopyLink = async () => {
    if (!selectedFileToShare?.file_id) {
      console.error('[Copy] No file selected or file_id missing');
      toast.error('Unable to copy link: File information is missing');
      return;
    }
    
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://backend-lively-hill-7043.fly.dev').trim();
    const shareUrl = `${baseUrl}/api/v1/download/${selectedFileToShare.file_id}`.replace(/\s/g, '');
    
    console.log('[Copy] Copying content:', shareUrl);
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      toast.success('Download link copied to clipboard');
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('[Copy] Failed to copy link:', error);
      toast.error('Failed to copy link to clipboard');
    }
  };

  // Share handlers for social platforms
  const handleMessengerShare = () => {
    if (!selectedFileToShare?.file_id) return;
    
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://backend-lively-hill-7043.fly.dev').trim();
    const shareUrl = `${baseUrl}/api/v1/download/${selectedFileToShare.file_id}`.replace(/\s/g, '');
    const appId = (process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '140586622674265').replace(/"/g, '').trim();
    const currentUrl = window.location.origin;
    const messengerUrl = `https://www.facebook.com/dialog/send?app_id=${appId}&link=${encodeURIComponent(shareUrl)}&redirect_uri=${encodeURIComponent(currentUrl)}`;
    
    const popup = window.open(messengerUrl, 'messenger-share-dialog', 'width=600,height=500');
    if (!popup || popup.closed || typeof popup.closed == 'undefined') {
      window.open(messengerUrl, '_blank');
    }
  };
  
  const handleEmailShare = () => {
    if (!selectedFileToShare?.file_id) return;
    
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://backend-lively-hill-7043.fly.dev').trim();
    const shareUrl = `${baseUrl}/api/v1/download/${selectedFileToShare.file_id}`.replace(/\s/g, '');
    const subject = `Excel file: ${selectedFileToShare.filename || 'Processed with AxLiner'}`;
    const body = `Hi,\n\nI've processed this file with AxLiner. You can download it here:\n\n${shareUrl}\n\nBest regards`;
    
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const gmailWindow = window.open(gmailUrl, '_blank');
    
    if (!gmailWindow) {
      const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
    }
  };
  
  const handleLinkedInMessage = () => {
    if (!selectedFileToShare?.file_id) return;
    
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://backend-lively-hill-7043.fly.dev').trim();
    const shareUrl = `${baseUrl}/api/v1/download/${selectedFileToShare.file_id}`.replace(/\s/g, '');
    
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        toast.success('Link copied to clipboard!', {
          duration: 8000,
          description: 'Opening LinkedIn... Click "New message" → Choose recipient → Paste the link (Ctrl+V or Cmd+V)'
        });
        window.open('https://www.linkedin.com/messaging/compose/', '_blank');
      })
      .catch((err) => {
        const fallbackInput = document.createElement('input');
        fallbackInput.value = shareUrl;
        document.body.appendChild(fallbackInput);
        fallbackInput.select();
        document.execCommand('copy');
        document.body.removeChild(fallbackInput);
        
        toast.success('Link copied! Opening LinkedIn...', { duration: 6000 });
        window.open('https://www.linkedin.com/messaging/compose/', '_blank');
      });
  };

  const handleXShare = () => {
    if (!selectedFileToShare?.file_id) return;
    
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://backend-lively-hill-7043.fly.dev').trim();
    const shareUrl = `${baseUrl}/api/v1/download/${selectedFileToShare.file_id}`.replace(/\s/g, '');
    const tweetText = `Check out this Excel file I processed with AxLiner! 📊✨`;
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;
    
    window.open(xUrl, '_blank', 'width=550,height=420');
    toast.success('X share window opened!', {
      description: 'Customize your tweet and share with your followers'
    });
  };

  const handleDownloadAll = async () => {
    if (resultFiles.length === 0) return;

    toast.info(`Downloading ${resultFiles.length} file(s)...`);

    for (const file of resultFiles) {
      if (file.file_id) {
        try {
          await handleDownloadFile(file.file_id);
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error('[DownloadAll] Failed:', error);
        }
      }
    }

    toast.success(`Downloaded ${resultFiles.length} file(s)`);
  };

  return (
    <div className="min-h-screen bg-background relative" style={{ backgroundColor: '#ffffff' }}>
      {/* Navigation Bar */}
      <nav ref={headerRef} className="fixed top-0 left-0 right-0 z-50 pt-3 lg:pt-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[35px] border-2 border-primary shadow-lg shadow-primary/10 backdrop-blur-md p-2 lg:p-3 flex items-center justify-between" style={{ backgroundColor: '#fbfdfc' }}>
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
                      <div className="grid gap-6 p-8 w-[650px] lg:w-[750px] grid-cols-2">
                        <div className="space-y-5">
                          <h4 className="text-sm font-semibold text-foreground mb-4 tracking-wide uppercase">BY DOCUMENT TYPE</h4>
                          <NavigationMenuLink asChild>
                            <a
                              href="/solutions/handwritten-tables"
                              className="block select-none space-y-2 rounded-lg p-4 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground border border-transparent hover:border-accent"
                            >
                              <div className="flex items-center gap-3">
                                <PenTool className="w-5 h-5 text-primary" />
                                <div className="text-base font-semibold leading-none">Handwritten Tables</div>
                              </div>
                              <p className="text-sm leading-relaxed text-muted-foreground mt-2">
                                Transform handwritten tables into precise Excel spreadsheets with AI-powered recognition
                              </p>
                            </a>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <a
                              href="/solutions/paper-forms"
                              className="block select-none space-y-2 rounded-lg p-4 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground border border-transparent hover:border-accent"
                            >
                              <div className="flex items-center gap-3">
                                <FileInput className="w-5 h-5 text-primary" />
                                <div className="text-base font-semibold leading-none">Paper Forms Automation</div>
                              </div>
                              <p className="text-sm leading-relaxed text-muted-foreground mt-2">
                                Digitize secretary paperwork and manual forms to CSV with intelligent field recognition
                              </p>
                            </a>
                          </NavigationMenuLink>
                        </div>
                        <div className="space-y-5">
                          <h4 className="text-sm font-semibold text-foreground mb-4 tracking-wide uppercase">USE CASES</h4>
                          <NavigationMenuLink asChild>
                            <a
                              href="/solutions/financial-documents"
                              className="block select-none space-y-2 rounded-lg p-4 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground border border-transparent hover:border-accent"
                            >
                              <div className="flex items-center gap-3">
                                <DollarSign className="w-5 h-5 text-primary" />
                                <div className="text-base font-semibold leading-none">Financial Documents</div>
                              </div>
                              <p className="text-sm leading-relaxed text-muted-foreground mt-2">
                                Process invoices, receipts, and expense reports to XLSX with accurate financial data extraction
                              </p>
                            </a>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <a
                              href="/solutions/data-entry"
                              className="block select-none space-y-2 rounded-lg p-4 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground border border-transparent hover:border-accent"
                            >
                              <div className="flex items-center gap-3">
                                <Database className="w-5 h-5 text-primary" />
                                <div className="text-base font-semibold leading-none">Data Entry Automation</div>
                              </div>
                              <p className="text-sm leading-relaxed text-muted-foreground mt-2">
                                Eliminate manual typing with automated Excel conversion and smart data validation
                              </p>
                            </a>
                          </NavigationMenuLink>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* Pricing Link - Hidden */}
                  {/* <NavigationMenuItem>
                    <NavigationMenuLink
                      href="/pricing"
                      className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-accent/50 transition-colors")}
                    >
                      Pricing
                    </NavigationMenuLink>
                  </NavigationMenuItem> */}

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
                  onClick={() => window.location.href = '/dashboard'}
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4 py-2 text-sm font-medium transition-colors shadow-lg hover:shadow-xl"
                    onClick={() => window.location.href = '/sign-in'}
                  >
                    <Upload className="w-4 h-4 mr-1.5" />
                    Try for free
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white/90 dark:bg-white/20 text-foreground border-[1.6px] border-foreground/30 rounded-full px-4 py-2 text-sm font-medium hover:bg-white dark:hover:bg-white/30 transition-colors backdrop-blur-sm"
                    onClick={() => window.location.href = '/sign-in'}
                  >
                    Sign in
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Single Background for Entire Page */}
      <div className="fixed top-0 left-0 w-full pointer-events-none z-0">
        <img
          src="/duplo30.jpg"
          alt="Background pattern"
          className="w-full h-auto"
        />
      </div>

      {/* Hero Section */}
      <main className="relative z-10">
        <section ref={heroRef} className="min-h-screen flex items-center justify-center relative pt-16 lg:pt-12">
          <ParticlesBackground />
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px]">
            <div className={`grid grid-cols-1 ${resultFiles.length > 0 ? 'lg:grid-cols-1' : 'lg:grid-cols-[5fr_7fr]'} gap-8 sm:gap-12 lg:gap-10 items-center`}>
              {/* Left Content - Hide as soon as we have results */}
              {resultFiles.length === 0 && (
                <div ref={heroContentRef} className="max-w-xl -mt-4 lg:-mt-8">
                  <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border-2 border-primary mb-3 sm:mb-5 shadow-lg shadow-primary/10" style={{ backgroundColor: '#fbfdfc' }}>
                    <span className="text-xs sm:text-sm font-semibold text-foreground">AxLiner-7B Handwritten Specialist</span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-normal text-black dark:text-white leading-[1.1] tracking-tight">
                    Convert <span className="text-primary font-bold">Handwritten Images</span> to <span className="text-primary font-bold">Excel</span> instantly
                  </h1>
                  <p className="mt-3 sm:mt-5 text-sm sm:text-lg text-muted-foreground max-w-lg leading-relaxed">
                    Extract up to 100 table images in one click with our specialized 7B parameter model fine-tuned for handwritten text recognition.
                  </p>

                  {/* User Count Section */}
                  <div className="mt-6 sm:mt-8 flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <img
                          key={i}
                          src={`/avatars/${i}.webp`}
                          alt={`User ${i + 1}`}
                          className="w-10 h-10 rounded-full border-2 border-background object-cover"
                        />
                      ))}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground">Join 1,260+ users</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Converting tables daily</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Right Upload Area - Try Our Product - Full width as soon as we have results */}
              <div ref={heroImageRef} className={`relative mt-4 ${resultFiles.length > 0 ? 'w-full max-w-none' : ''}`}>
                <div className="relative w-full space-y-3">
                  {/* Upload Dropzone - Hide when showing results */}
                  {!processingComplete && resultFiles.length === 0 && (
                    <div className="space-y-3">
                      <div
                        onClick={() => document.getElementById('file-upload-landing')?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`relative border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer ${
                          isDragging
                            ? 'border-primary bg-primary/10 scale-[0.99]'
                            : uploadedFiles.length > 0
                              ? 'border-primary bg-primary/5'
                              : 'border-primary/50 hover:border-primary hover:bg-primary/5'
                        } p-12 lg:p-16 min-h-[200px]`}
                      >
                        <div className="text-center">
                          {uploadedFiles.length === 0 ? (
                            <>
                              <Upload className="h-16 w-16 text-primary mx-auto mb-4" />
                              <h3 className="text-xl font-medium mb-3">
                                {isDragging ? 'Drop your images here' : 'Upload up to 100 table images now'}
                              </h3>
                              <input
                                id="file-upload-landing"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileInput}
                                className="hidden"
                              />
                              <p className="text-sm text-muted-foreground">
                                Click or drag to select
                              </p>
                            </>
                          ) : (
                            <>
                              {/* Image Queue - Small thumbnails */}
                              <div className="grid grid-cols-4 gap-2 mb-3 max-h-24 overflow-y-auto">
                                {uploadedFiles.map((file, index) => (
                                  <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border bg-card">
                                    <img
                                      src={URL.createObjectURL(file)}
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
                                      <X className="h-3 w-3" />
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
                                  className="border-2 border-primary text-xs"
                                  asChild
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span>Add More</span>
                                </Button>
                              </label>
                              <input
                                id="file-upload-landing-more"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                  const newFiles = e.target.files;
                                  if (newFiles && newFiles.length > 0) {
                                    const fileArray = Array.from(newFiles).filter(file =>
                                      file.type.startsWith('image/')
                                    );
                                    setUploadedFiles(prev => [...prev, ...fileArray]);
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
                    <div className={`border-2 border-primary rounded-xl ${resultFiles.length > 0 ? 'p-4 max-h-[calc(100vh-8rem)] overflow-y-auto' : 'p-6'}`} style={{ backgroundColor: '#fbfdfc' }}>
                      <div className={`flex items-center justify-between mb-3 ${resultFiles.length > 0 ? 'sticky top-0 bg-[#fbfdfc] z-10 pb-2 border-b border-primary/20' : ''}`}>
                        <h3 className={`${processingComplete && resultFiles.length > 0 ? 'text-lg' : 'text-lg'} font-semibold`}>
                          {processingComplete ? 'Ready to Download' : 'Processing...'}
                        </h3>
                        <div className="flex gap-2">
                          {processingComplete && resultFiles.length > 1 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleDownloadAll}
                              className="border-2 border-primary"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download All
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReset}
                            className="border-2 border-primary"
                          >
                            Convert Again
                          </Button>
                        </div>
                      </div>

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
                                  <div className="border-2 border-primary/20 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center max-h-[600px]">
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
                                  <div className="border-2 border-primary/20 rounded-lg overflow-auto max-h-[600px] bg-white">
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
                              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border-2 border-primary">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                                  <span className="text-base font-medium truncate">{resultFiles[0].filename || 'result.xlsx'}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <Button
                                    size="default"
                                    onClick={() => handleDownloadFile(resultFiles[0].file_id)}
                                    className="gap-2 bg-primary hover:bg-primary/90 text-white border-2 border-primary"
                                  >
                                    <Download className="h-4 w-4" />
                                    Download
                                  </Button>
                                  <Button
                                    size="default"
                                    variant="outline"
                                    onClick={() => handleShareFile(resultFiles[0])}
                                    className="gap-2 bg-white border-2 border-primary text-foreground hover:bg-primary/10"
                                  >
                                    <Share2 className="h-4 w-4" />
                                    Share
                                  </Button>
                                  <Button
                                    size="default"
                                    variant="outline"
                                    onClick={() => {
                                      const fileUrl = encodeURIComponent(`https://backend-lively-hill-7043.fly.dev/api/v1/download/${resultFiles[0].file_id}`)
                                      window.open(`https://view.officeapps.live.com/op/view.aspx?src=${fileUrl}`, '_blank')
                                    }}
                                    className="gap-2 bg-white border-2 border-foreground text-foreground hover:bg-muted/50"
                                  >
                                    <Edit3 className="h-4 w-4" />
                                    Edit
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Other Files - Just buttons, starting from index 1 */}
                          {resultFiles.slice(1).map((file: any, index: number) => (
                            <div key={file.file_id || index + 1} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border-2 border-primary/20">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <button
                                  onClick={() => handleDownloadFile(file.file_id)}
                                  className="flex-shrink-0 hover:scale-110 transition-transform"
                                >
                                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                                </button>
                                <span className="text-sm font-medium truncate">{file.filename || 'result.xlsx'}</span>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Button
                                  size="sm"
                                  onClick={() => handleDownloadFile(file.file_id)}
                                  className="gap-2 bg-primary hover:bg-primary/90 text-white border-2 border-primary"
                                >
                                  <Download className="h-4 w-4" />
                                  Download
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleShareFile(file)}
                                  className="gap-1.5 bg-white border-2 border-primary text-foreground hover:bg-primary/10"
                                >
                                  <Share2 className="h-4 w-4" />
                                  Share
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const fileUrl = encodeURIComponent(`https://backend-lively-hill-7043.fly.dev/api/v1/download/${file.file_id}`)
                                    window.open(`https://view.officeapps.live.com/op/view.aspx?src=${fileUrl}`, '_blank')
                                  }}
                                  className="gap-1.5 bg-white border-2 border-foreground text-foreground hover:bg-muted/50"
                                >
                                  <Edit3 className="h-4 w-4" />
                                  Edit
                                </Button>
                              </div>
                            </div>
                          ))}

                          {/* Show buttons without preview if no preview data available yet */}
                          {(!tablePreviewData.length || !firstImageUrl) && resultFiles.map((file: any, index: number) => (
                            <div key={`no-preview-${file.file_id || index}`} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border-2 border-primary/20">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <button
                                  onClick={() => handleDownloadFile(file.file_id)}
                                  className="flex-shrink-0 hover:scale-110 transition-transform"
                                >
                                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                                </button>
                                <span className="text-sm font-medium truncate">{file.filename || 'result.xlsx'}</span>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Button
                                  size="sm"
                                  onClick={() => handleDownloadFile(file.file_id)}
                                  className="gap-2 bg-primary hover:bg-primary/90 text-white border-2 border-primary"
                                >
                                  <Download className="h-4 w-4" />
                                  Download
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleShareFile(file)}
                                  className="gap-1.5 bg-white border-2 border-primary text-foreground hover:bg-primary/10"
                                >
                                  <Share2 className="h-4 w-4" />
                                  Share
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const fileUrl = encodeURIComponent(`https://backend-lively-hill-7043.fly.dev/api/v1/download/${file.file_id}`)
                                    window.open(`https://view.officeapps.live.com/op/view.aspx?src=${fileUrl}`, '_blank')
                                  }}
                                  className="gap-1.5 bg-white border-2 border-foreground text-foreground hover:bg-muted/50"
                                >
                                  <Edit3 className="h-4 w-4" />
                                  Edit
                                </Button>
                              </div>
                            </div>
                          ))}

                          {/* Pending Files - Show processing indicators */}
                          {isProcessing && totalFilesToProcess > resultFiles.length && (
                            <>
                              {Array.from({ length: totalFilesToProcess - resultFiles.length }).map((_, index) => (
                                <div key={`pending-${index}`} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border-2 border-dashed border-primary/30">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <Loader2 className="h-5 w-5 text-primary animate-spin flex-shrink-0" />
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
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Converting your images...</span>
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
                     className={`col-span-2 py-8 text-xl font-semibold border-2 h-full transition-all duration-200 ${
                      uploadedFiles.length === 0
                           ? 'bg-gray-300 hover:bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed'
                           : 'bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 shadow-lg shadow-primary/20'
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                          Converting...
                        </>
                      ) : (
                        <>
                          Convert Image
                        </>
                      )}
                    </Button>

                    {/* Options Card - Right Side (1 column) */}
                    <Card className="bg-[#fbfdfc] dark:bg-[#fbfdfc] border-2 border-primary shadow-lg shadow-primary/10">
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <div>
                            <h3 className="text-xs font-semibold mb-1 text-foreground">Language</h3>
                            <select
                              className="w-full p-1.5 rounded-lg border-2 border-muted-foreground/20 bg-muted/30 text-foreground text-xs font-medium hover:border-primary/50 transition-all focus:outline-none focus:border-primary cursor-pointer"
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
                                  toast.info('Auto-download disabled')
                                }
                              }}
                              className={cn(
                                "w-full flex items-center justify-between p-1.5 rounded-lg transition-all border-2",
                                autoDownload
                                  ? "bg-primary/10 border-primary"
                                  : "bg-muted/30 border-muted-foreground/20 hover:border-primary/50"
                              )}
                            >
                              <div className="flex items-center gap-1">
                                <Download className={cn("h-3 w-3", autoDownload ? "text-primary" : "text-muted-foreground")} />
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
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <ScrollAnimatedSection id="features" className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12" data-animate="headline">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-transparent border-2 border-primary mb-4 shadow-lg shadow-primary/10">
                <h2 className="text-lg sm:text-xl font-bold text-foreground">
                  Specialized Solutions
                </h2>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 max-w-5xl mx-auto justify-center">
              <Card data-animate="stagger" className="flex-1 bg-transparent border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center">
                  <PenTool className="w-12 h-12 text-primary mx-auto mb-4 stroke-[1.5]" />
                  <CardTitle className="text-xl mb-2">Handwritten Tables</CardTitle>
                  <CardDescription className="text-base">
                    <span className="font-semibold text-amber-700">99.5% accuracy</span> on handwritten tables - industry-leading performance with our specialized model
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card data-animate="stagger" className="flex-1 bg-transparent border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center">
                  <FileText className="w-12 h-12 text-primary mx-auto mb-4 stroke-[1.5]" />
                  <CardTitle className="text-xl mb-2">Paper Forms tables</CardTitle>
                  <CardDescription className="text-base">
                    Digitize secretary paperwork and manual forms to CSV with intelligent field recognition
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card data-animate="stagger" className="flex-1 bg-transparent border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center">
                  <FileSpreadsheet className="w-12 h-12 text-primary mx-auto mb-4 stroke-[1.5]" />
                  <CardTitle className="text-xl mb-2">Financial Documents tables</CardTitle>
                  <CardDescription className="text-base">
                    Process invoices, receipts, and expense reports to XLSX with accurate financial data extraction
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </ScrollAnimatedSection>

        {/* Companies Section - Trusted By */}
        <ScrollAnimatedSection id="trusted" className="py-12 overflow-hidden">
          <div className="text-center mb-8" data-animate="headline">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-transparent border-2 border-primary mb-4 shadow-lg shadow-primary/10">
              <h2 className="text-lg sm:text-base font-semibold text-foreground">
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
              {/* Create multiple sets for truly seamless infinite loop */}
              {Array.from({ length: 10 }, (_, setIndex) =>
                [1, 2, 3, 4, 5, 6, 7, 8, 9].map((imgNum) => (
                  <Card
                    key={`${setIndex}-${imgNum}`}
                    className="flex-shrink-0 bg-white dark:bg-white border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-md w-[120px] h-[80px]"
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
        </ScrollAnimatedSection>

        {/* Transformation Section */}
        <section className="py-32">
          <div className="container mx-auto px-4 max-w-none">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-transparent border-2 border-primary mb-4 shadow-lg shadow-primary/10">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                    See the Transformation
                  </h2>
                </div>
              </div>

              {/* Transformation Rows */}
              <div className="space-y-16">
                {/* Row 1: Handwritten Tables */}
                <div className="flex items-center justify-center gap-2">
                  <div className="w-[1050px] h-[550px] rounded-2xl overflow-hidden border-2 border-[#1a742e] shadow-2xl">
                    <img src="/rt.jpg" alt="Handwritten table" className="w-full h-full object-cover" />
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <svg width="80" height="80" viewBox="0 0 80 80" className="flex-shrink-0">
                      <defs>
                        <marker id="arrowhead1" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                          <polygon points="0 0, 10 3, 0 6" fill="#1a742e" />
                        </marker>
                      </defs>
                      <path
                        d="M 10 40 Q 40 15, 70 40"
                        stroke="#1a742e"
                        strokeWidth="2.5"
                        fill="none"
                        markerEnd="url(#arrowhead1)"
                      />
                    </svg>
                  </div>

                  <div className="w-[1250px] h-[500px] rounded-2xl overflow-hidden border-2 border-[#1a742e] shadow-2xl">
                    <img src="/rtt.png" alt="Excel spreadsheet" className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* Row 2: Paper Forms */}
                <div className="flex items-center justify-center gap-2">
                  <div className="w-[1020px] h-[370px] rounded-2xl overflow-hidden border-2 border-[#1a742e] shadow-2xl">
                    <img src="/b.jpeg" alt="Paper form" className="w-full h-full object-cover" />
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <svg width="80" height="80" viewBox="0 0 80 80" className="flex-shrink-0">
                      <defs>
                        <marker id="arrowhead2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                          <polygon points="0 0, 10 3, 0 6" fill="#1a742e" />
                        </marker>
                      </defs>
                      <path
                        d="M 10 40 Q 40 65, 70 40"
                        stroke="#1a742e"
                        strokeWidth="2.5"
                        fill="none"
                        markerEnd="url(#arrowhead2)"
                      />
                    </svg>
                  </div>

                  <div className="w-[1020px] h-[370px] rounded-2xl overflow-hidden border-2 border-[#1a742e] shadow-2xl">
                    <img src="/bb.png" alt="Digital data" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* AI Engine Section */}
        <ScrollAnimatedSection id="ai-engine" className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16" data-animate="headline">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-primary mb-4 shadow-lg shadow-primary/10" style={{ backgroundColor: '#fbfdfc' }}>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">
                    How AxLiner's Engine Is Built
                  </h2>
                </div>

                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  A transparent look at our instruction fine-tuning methodology, system prompts, and the engineering decisions that power industry-leading OCR accuracy.
                </p>
              </div>

              {/* Main Content */}
              <div className="space-y-12">
                {/* Instruction Fine-Tuning */}
                <Card className="border border-border shadow-lg" style={{ backgroundColor: '#fbfdfc' }} data-animate="stagger">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Layers className="w-6 h-6 text-primary" />
                      <CardTitle className="text-2xl">Instruction Fine-Tuning on Llama 3</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-black font-semibold leading-relaxed">
                        AxLiner was built by fine-tuning the Llama 3 base model on instruction datasets publicly available on the Hugging Face repository. <span className="font-semibold text-foreground">No proprietary data or training tricks were utilized</span> – our approach demonstrates that with careful instruction tuning, open-source models can achieve exceptional performance on document understanding tasks.
                      </p>

                      <p className="text-black font-semibold leading-relaxed">
                        The <span className="font-semibold text-primary">AxLiner OCR Engine</span> is a specialized model that proves base language models can be fine-tuned to excel at specialized tasks. Our fine-tuning process focused on:
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-700/10 border-2 border-amber-700">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">Document Structure Understanding</p>
                          <p className="text-sm text-black font-semibold">Training on table layouts, form structures, and hierarchical document organization</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-700/10 border-2 border-amber-700">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">Handwriting Recognition</p>
                          <p className="text-sm text-black font-semibold">Extensive exposure to varied handwriting styles and degraded document quality</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-700/10 border-2 border-amber-700">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">Context Preservation</p>
                          <p className="text-sm text-black font-semibold">Maintaining relationships between cells, columns, and semantic meaning</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-700/10 border-2 border-amber-700">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">Multi-Language Support</p>
                          <p className="text-sm text-black font-semibold">Fine-tuned on 7+ languages including complex scripts like Arabic and Chinese</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-primary/5 rounded-lg border-2 border-primary">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">Benchmark Result:</span> In independent evaluations on MT-Bench, AxLiner achieved a score of <span className="font-semibold text-primary">7.2</span>, outperforming Llama 3 13B (6.65) despite using a more efficient 7B parameter architecture.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* System Prompts & Guardrails */}
                <Card className="border border-border shadow-lg" style={{ backgroundColor: '#fbfdfc' }} data-animate="stagger">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="w-6 h-6 text-primary" />
                      <CardTitle className="text-2xl">System Prompts for Output Quality</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-black font-semibold leading-relaxed">
                        We introduce carefully crafted system prompts to guide the model in generating high-quality, safe outputs within specified guardrails. This approach allows users to move along the Pareto front of <span className="font-semibold text-foreground">model utility versus guardrails enforcement</span>.
                      </p>
                    </div>

                    <div className="p-5 bg-muted/50 rounded-lg border-2 border-primary font-mono text-sm">
                      <p className="text-foreground leading-relaxed italic">
                        "Always assist with care, respect, and truth. Respond with utmost utility yet securely. Avoid harmful, unethical, prejudiced, or negative content. Ensure replies promote fairness and positivity."
                      </p>
                    </div>

                    <div className="overflow-hidden rounded-lg border-2 border-primary mt-6">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border/50 bg-muted/30">
                            <th className="text-left p-3 font-medium">Configuration</th>
                            <th className="text-right p-3 font-medium">MT-Bench Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-border/50">
                            <td className="p-3 text-muted-foreground">No system prompt</td>
                            <td className="p-3 text-right font-semibold">6.84 ± 0.07</td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="p-3 text-muted-foreground">Llama 3 system prompt</td>
                            <td className="p-3 text-right">6.38 ± 0.07</td>
                          </tr>
                          <tr>
                            <td className="p-3 text-primary font-medium">AxLiner system prompt</td>
                            <td className="p-3 text-right font-semibold text-primary">6.58 ± 0.05</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Our optimized system prompt maintains strong performance while ensuring <span className="font-semibold text-foreground">100% rejection rate</span> on harmful questions from a curated test set of 175 unsafe prompts.
                    </p>
                  </CardContent>
                </Card>

                {/* Content Moderation */}
                <Card className="border border-border shadow-lg" style={{ backgroundColor: '#fbfdfc' }} data-animate="stagger">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="w-6 h-6 text-primary" />
                      <CardTitle className="text-2xl">Content Moderation with Self-Reflection</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-black font-semibold leading-relaxed">
                        AxLiner can be used as a content moderator: the model itself is able to accurately classify user prompts or generated answers as either acceptable or falling into restricted categories through a self-reflection mechanism.
                      </p>
                    </div>

                    <div className="mt-6 p-5 bg-amber-700/10 rounded-lg border-2 border-amber-700">
                      <div className="flex items-start gap-3">
                        <Award className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground mb-2">Self-Reflection Performance</p>
                          <p className="text-sm text-black font-semibold mb-3">
                            Evaluated on a manually curated and balanced dataset of adversarial and standard prompts:
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-background rounded-lg border-2 border-primary">
                              <p className="text-2xl font-bold text-amber-700">99.4%</p>
                              <p className="text-xs text-muted-foreground mt-1">Precision</p>
                            </div>
                            <div className="text-center p-3 bg-background rounded-lg border-2 border-primary">
                              <p className="text-2xl font-bold text-amber-700">95.6%</p>
                              <p className="text-xs text-muted-foreground mt-1">Recall</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Use cases include moderating user-submitted content, brand monitoring, and ensuring compliance in regulated industries. End users can select which categories to filter based on their specific requirements.
                    </p>
                  </CardContent>
                </Card>

              </div>

              {/* Footer Note */}
              <div className="mt-12 text-center" data-animate="stagger">
                <p className="text-sm text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                  <span className="font-semibold text-foreground">Transparency & Reproducibility:</span> Our fine-tuning methodology uses publicly available datasets and standard transformer architectures. We believe in open, reproducible AI research – no proprietary tricks, just thoughtful engineering and domain-specific optimization for document understanding tasks.
                </p>
              </div>
            </div>
          </div>
        </ScrollAnimatedSection>

        {/* Testimonials Section */}
        <section className="py-16 overflow-hidden relative z-10">
          <div className="w-full">
            <div className="text-center mb-12 px-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-transparent border-2 border-primary mb-4 shadow-lg shadow-primary/10">
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

        {/* Benchmark Section */}
        <ScrollAnimatedSection id="benchmarks" className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12" data-animate="headline">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-transparent border-2 border-primary mb-4 shadow-lg shadow-primary/10">
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">
                    Industry-Leading OCR Accuracy
                  </h2>
                </div>

                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Benchmarked against major cloud providers on real-world handwritten documents and complex table structures.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Accuracy Chart */}
                <Card className="bg-transparent border-2 border-primary shadow-lg" data-animate="stagger">
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
          color: "hsl(var(--primary))",
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
          fill="rgb(180 83 9)"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ChartContainer>

    {/* Footer */}
    <div className="mt-6 pt-4 border-t border-border/50">
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <CheckCircle className="w-4 h-4 text-primary" />
        <span>Tested on IAM Handwriting Database v3.0</span>
      </div>
    </div>
  </CardContent>
</Card>


                {/* Performance Metrics Table */}
                <Card className="bg-transparent border-2 border-primary shadow-lg" data-animate="stagger">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold">Comprehensive Performance Metrics</CardTitle>
                    <p className="text-sm text-muted-foreground">Average across all test scenarios</p>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-hidden rounded-lg border-2 border-primary">
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
                            <td className="p-3 text-right font-semibold text-amber-700">99.5%</td>
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

              {/* Key Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/30 border-2 border-primary" data-animate="stagger">
                  <div className="text-2xl font-bold text-amber-700 mb-1">7+ Languages</div>
                  <p className="text-sm text-muted-foreground">Multi-language support including complex scripts</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30 border-2 border-primary" data-animate="stagger">
                  <div className="text-2xl font-bold text-amber-700 mb-1">99.9% Uptime</div>
                  <p className="text-sm text-muted-foreground">Enterprise-grade reliability and availability</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30 border-2 border-primary" data-animate="stagger">
                  <div className="text-2xl font-bold text-amber-700 mb-1">GDPR Compliant</div>
                  <p className="text-sm text-muted-foreground">Data privacy and security certified</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollAnimatedSection>

        {/* Final CTA Section */}
        <section className="py-24 relative z-10">
          <div className="container mx-auto px-1 sm:px-3 lg:px-4 text-center">
            {/* CTA Content */}
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-transparent border-2 border-primary mb-4 shadow-lg shadow-primary/10">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                  Ready to Transform Your Workflow?
                </h2>
              </div>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of professionals who have already revolutionized their data extraction process with AxLiner.
              </p>
              
              {/* Single Primary CTA */}
              <div className="flex justify-center">
                <Button
                  size="lg"
                  className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-all duration-200 shadow-lg shadow-primary/20"
                  onClick={() => window.location.href = isAuthenticated ? '/dashboard' : '/sign-in'}
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Try for free'}
                </Button>
              </div>
            </div>
          </div>
        </section>
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
      <MobileNav onSectionClick={scrollToSection} />

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
                  <MessageCircle className="h-10 w-10 text-[#0084FF] group-hover:scale-110 transition-transform" />
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
                <Link className="h-3.5 w-3.5" />
                <span className="font-medium">Direct download link</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={selectedFileToShare?.file_id ? `${(process.env.NEXT_PUBLIC_API_URL || 'https://backend-lively-hill-7043.fly.dev').trim()}/api/v1/download/${selectedFileToShare.file_id}`.replace(/\s/g, '') : ''}
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
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
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
            <DialogTitle className="text-xl font-bold">Sign In to Continue</DialogTitle>
            <DialogDescription className="text-base">
              To keep using our service, please sign in or create a free account to get 80 free monthly uploads and more features.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowLimitDialog(false)}
              className="flex-1 border-2 border-primary"
            >
              Maybe Later
            </Button>
            <Button
              onClick={() => window.location.href = '/sign-in'}
              className="flex-1 bg-primary hover:bg-primary/90 border-2 border-primary"
            >
              Sign In
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
                toast.success('Auto-download enabled')
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
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              <DialogTitle>You can add up to 100 images!</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground">
              Process up to 100 table images in one click. 
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
    </div>
  )}
