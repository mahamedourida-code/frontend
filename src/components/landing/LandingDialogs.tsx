"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { GoogleSignInModal } from "@/components/GoogleSignInModal";
import { buildDownloadUrl } from "@/lib/public-config";

const dialogIcons = {
  copy: "/site-icons/io/copy.svg",
  document: "/site-icons/io/document.svg",
  link: "/site-icons/io/link.svg",
  share: "/site-icons/io/share.svg",
  table: "/site-icons/io/table.svg",
};

function DialogIcon({ src, className, alt = "" }: { src: string; className?: string; alt?: string }) {
  return <img src={src} alt={alt} className={className} loading="lazy" decoding="async" />;
}

type LandingDialogsProps = {
  shareDialogOpen: boolean;
  setShareDialogOpen: (open: boolean) => void;
  copySuccess: boolean;
  setCopySuccess: (value: boolean) => void;
  selectedFileToShare: any;
  showLimitDialog: boolean;
  setShowLimitDialog: (open: boolean) => void;
  showAutoDownloadConfirm: boolean;
  setShowAutoDownloadConfirm: (open: boolean) => void;
  showFirstConvertConfirm: boolean;
  setShowFirstConvertConfirm: (open: boolean) => void;
  showSignInModal: boolean;
  setShowSignInModal: (open: boolean) => void;
  signInRedirectPath: string;
  setAutoDownload: (enabled: boolean) => void;
  openSignInModal: (redirectPath?: string) => void;
  processImages: () => Promise<void>;
  handleEmailShare: () => void;
  handleLinkedInMessage: () => void;
  handleXShare: () => void;
  handleMessengerShare: () => void;
  handleCopyLink: () => void;
};

export default function LandingDialogs({
  shareDialogOpen,
  setShareDialogOpen,
  copySuccess,
  setCopySuccess,
  selectedFileToShare,
  showLimitDialog,
  setShowLimitDialog,
  showAutoDownloadConfirm,
  setShowAutoDownloadConfirm,
  showFirstConvertConfirm,
  setShowFirstConvertConfirm,
  showSignInModal,
  setShowSignInModal,
  signInRedirectPath,
  setAutoDownload,
  openSignInModal,
  processImages,
  handleEmailShare,
  handleLinkedInMessage,
  handleXShare,
  handleMessengerShare,
  handleCopyLink,
}: LandingDialogsProps) {
  return (
    <>
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
              {selectedFileToShare?.filename || "Excel file"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-3">
              <p className="text-center text-xs text-muted-foreground">Share your download link:</p>
              <div className="flex justify-center gap-4">
                <button onClick={handleEmailShare} className="group flex cursor-pointer flex-col items-center gap-1.5" title="Compose email in Gmail">
                  <svg className="h-10 w-10 text-[#EA4335] transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
                  </svg>
                  <span className="text-[11px] text-muted-foreground transition-colors group-hover:text-foreground">Gmail</span>
                </button>

                <button onClick={handleLinkedInMessage} className="group flex cursor-pointer flex-col items-center gap-1.5" title="Copy link and compose LinkedIn message">
                  <svg className="h-10 w-10 text-[#0077B5] transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                  <span className="text-[11px] text-muted-foreground transition-colors group-hover:text-foreground">LinkedIn</span>
                </button>

                <button onClick={handleXShare} className="group flex cursor-pointer flex-col items-center gap-1.5" title="Share on X (Twitter)">
                  <svg className="h-10 w-10 text-foreground transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="text-[11px] text-muted-foreground transition-colors group-hover:text-foreground">X</span>
                </button>

                <button onClick={handleMessengerShare} className="group flex cursor-pointer flex-col items-center gap-1.5" title="Send via Facebook Messenger">
                  <DialogIcon src={dialogIcons.share} className="h-10 w-10 transition-transform group-hover:scale-110" />
                  <span className="text-[11px] text-muted-foreground transition-colors group-hover:text-foreground">Messenger</span>
                </button>
              </div>
              <p className="text-center text-[10px] text-muted-foreground/70">
                {selectedFileToShare?.filename || "Excel file"} ready to share
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

            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DialogIcon src={dialogIcons.link} className="h-4 w-4" />
                <span className="font-medium">Direct download link</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={selectedFileToShare?.file_id ? buildDownloadUrl(selectedFileToShare.file_id) : ""}
                  className="h-9 bg-muted/50 text-xs"
                />
                <Button size="sm" variant={copySuccess ? "default" : "outline"} onClick={handleCopyLink} className="h-9 px-3">
                  {copySuccess ? (
                    <>
                      <DialogIcon src={dialogIcons.table} className="mr-1.5 h-4 w-4" />
                      <span className="text-xs">Copied</span>
                    </>
                  ) : (
                    <>
                      <DialogIcon src={dialogIcons.copy} className="mr-1.5 h-4 w-4" />
                      <span className="text-xs">Copy</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Free trial limit reached</DialogTitle>
            <DialogDescription className="text-base">
              The free trial includes 3 runs with up to 3 images each. Create a free account for 5 runs with up to 5 images each, or choose a paid plan when you need more.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={() => {
              setShowLimitDialog(false);
              window.location.href = "/pricing?from=trial-limit";
            }} className="flex-1 border-2 border-[#A78BFA]">
              See Plans
            </Button>
            <Button onClick={() => {
              setShowLimitDialog(false);
              openSignInModal("/dashboard/client");
            }} className="flex-1 border-2 border-[#A78BFA] bg-primary hover:bg-primary/90">
              Create Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAutoDownloadConfirm} onOpenChange={setShowAutoDownloadConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enable Auto-Download?</DialogTitle>
            <DialogDescription>
              All processed files will be automatically downloaded to your device as soon as they're ready.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex gap-3">
            <Button variant="outline" onClick={() => setShowAutoDownloadConfirm(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={() => {
              setAutoDownload(true);
              setShowAutoDownloadConfirm(false);
            }} className="flex-1 bg-primary hover:bg-primary/90">
              Enable Auto-Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFirstConvertConfirm} onOpenChange={setShowFirstConvertConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mb-2 flex items-center gap-3">
              <DialogIcon src={dialogIcons.document} className="h-7 w-7" />
              <DialogTitle>Ready to convert your files?</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground">
              You can add more files now or proceed to convert your current selection.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex gap-3">
            <Button variant="outline" onClick={() => {
              setShowFirstConvertConfirm(false);
              document.getElementById("file-upload-landing")?.click();
            }} className="flex-1">
              Add More
            </Button>
            <Button onClick={async () => {
              if (typeof window !== "undefined") {
                localStorage.setItem("hasConvertedBefore", "true");
              }
              setShowFirstConvertConfirm(false);
              await processImages();
            }} className="flex-1 bg-primary hover:bg-primary/90">
              Convert This
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <GoogleSignInModal open={showSignInModal} onOpenChange={setShowSignInModal} redirectPath={signInRedirectPath} />
    </>
  );
}
