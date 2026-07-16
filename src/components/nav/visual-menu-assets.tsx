import Image from "next/image"

import { cn } from "@/lib/utils"

export type NavVisualKey =
  | "batch"
  | "export"
  | "magnifier"
  | "tray"

type NavVisualAsset = {
  src: string
  width: number
  height: number
}

export const navVisualAssets: Record<NavVisualKey, NavVisualAsset> = {
  batch: { src: "/workspace/liked/folder-flow.png", width: 1254, height: 1254 },
  export: { src: "/workspace/liked/purple-export-folder.png", width: 1254, height: 1254 },
  magnifier: { src: "/workspace/liked/magnifier-card.png", width: 1672, height: 941 },
  tray: { src: "/workspace/liked/file-tray.png", width: 1672, height: 941 },
}

const navVisualCrop: Partial<Record<NavVisualKey, string>> = {
  batch: "scale-[1.28] object-[52%_43%]",
  export: "scale-[1.3] object-[50%_45%]",
  magnifier: "scale-[1.26] object-[54%_49%]",
  tray: "scale-[1.24] object-[56%_49%]",
}

type VisualMenuImageProps = {
  visual: NavVisualKey
  label?: string
  className?: string
  imageClassName?: string
  labelClassName?: string
  sizes?: string
}

export function VisualMenuImage({
  visual,
  label,
  className,
  imageClassName,
  labelClassName,
  sizes = "(min-width: 1024px) 320px, 88vw",
}: VisualMenuImageProps) {
  const asset = navVisualAssets[visual]

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden",
        className,
      )}
    >
      <Image
        src={asset.src}
        alt=""
        width={asset.width}
        height={asset.height}
        sizes={sizes}
        draggable={false}
        className={cn(
          "h-full w-full object-cover transition-transform duration-200 ease-[var(--ax-motion-ease)]",
          navVisualCrop[visual],
          "motion-safe:group-hover:scale-[1.34] motion-safe:group-focus-visible:scale-[1.34]",
          imageClassName,
        )}
      />
      {label ? (
        <span
          className={cn(
            "absolute left-2.5 top-2.5 rounded-full bg-white/82 px-2.5 py-1",
            "text-[10.5px] font-bold leading-none text-black shadow-[0_8px_18px_-14px_rgba(0,0,0,0.5)] backdrop-blur-md",
            labelClassName,
          )}
        >
          {label}
        </span>
      ) : null}
    </div>
  )
}
