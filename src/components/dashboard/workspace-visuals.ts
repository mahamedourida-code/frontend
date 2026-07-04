export const workspaceVisuals = {
  portalStack: {
    src: "/workspace/liked/portal-stack.png",
    alt: "Documents moving through a glowing intake portal",
  },
  folderDropSquare: {
    src: "/workspace/liked/folder-drop-square.png",
    alt: "Documents lifting from a folder tray",
  },
  reviewLensWide: {
    src: "/workspace/liked/review-lens-wide.png",
    alt: "A magnifying glass checking a document",
  },
  publishBridgeWide: {
    src: "/workspace/liked/publish-bridge-wide.png",
    alt: "A document pack moving through a publish bridge",
  },
  cloudIntakeWide: {
    src: "/workspace/liked/cloud-intake-wide.png",
    alt: "A cloud intake tray receiving documents",
  },
  darkFolderWide: {
    src: "/workspace/liked/dark-folder-wide.png",
    alt: "Documents flying into a dark folder",
  },
  intakeTrayWide: {
    src: "/workspace/liked/intake-tray-wide.png",
    alt: "A clean intake tray with document tabs",
  },
  cleanSweepSquare: {
    src: "/workspace/liked/clean-sweep-square.png",
    alt: "A tidy sweep of documents and stacked pages",
  },
  receiptCometSquare: {
    src: "/workspace/liked/receipt-comet-square.png",
    alt: "A receipt moving quickly across a coral background",
  },
  magnifyDocWide: {
    src: "/workspace/liked/magnify-doc-wide.png",
    alt: "A magnifier inspecting a paper document",
  },
  exportRibbonWide: {
    src: "/workspace/liked/export-ribbon-wide.png",
    alt: "A tied document pack ready for export",
  },
} as const

export type WorkspaceVisualName = keyof typeof workspaceVisuals
