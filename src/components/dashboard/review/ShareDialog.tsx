"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { CheckCircle, Link, Copy, MessageCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { buildDownloadUrl } from "@/lib/public-config"

type ShareDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedFileToShare: any
  selectedFilesForBatch: any[]
  shareSession: any
  copySuccess: boolean
  onCopyLink: () => void
  onEmailShare: () => void
  onLinkedInMessage: () => void
  onXShare: () => void
  onMessengerShare: () => void
}

export function ShareDialog({
  open,
  onOpenChange,
  selectedFileToShare,
  selectedFilesForBatch,
  shareSession,
  copySuccess,
  onCopyLink,
  onEmailShare,
  onLinkedInMessage,
  onXShare,
  onMessengerShare,
}: ShareDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                onClick={onEmailShare}
                className="group flex flex-col items-center gap-1.5 cursor-pointer"
                title="Compose email in Gmail"
              >
                <svg className="h-10 w-10 text-[#EA4335] group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                </svg>
                <span className="text-[13px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">Gmail</span>
              </button>

              <button
                onClick={onLinkedInMessage}
                className="group flex flex-col items-center gap-1.5 cursor-pointer"
                title="Copy link and compose LinkedIn message"
              >
                <svg className="h-10 w-10 text-[#0077B5] group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                </svg>
                <span className="text-[13px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">LinkedIn</span>
              </button>

              <button
                onClick={onXShare}
                className="group flex flex-col items-center gap-1.5 cursor-pointer"
                title="Share on X (Twitter)"
              >
                <svg className="h-10 w-10 text-foreground group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="text-[13px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">X</span>
              </button>

              <button
                onClick={onMessengerShare}
                className="group flex flex-col items-center gap-1.5 cursor-pointer"
                title="Send via Facebook Messenger"
              >
                <MessageCircle className="h-10 w-10 text-[#0084FF] group-hover:scale-110 transition-transform" />
                <span className="text-[13px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">Messenger</span>
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
                variant={copySuccess ? "reviewed" : "surface"}
                onClick={onCopyLink}
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
  )
}
