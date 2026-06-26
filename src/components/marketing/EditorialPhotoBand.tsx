import Image from "next/image";

import { cn } from "@/lib/utils";

type EditorialPhotoBandProps = {
  src: string;
  alt: string;
  /** Quiet figure caption shown beneath the frame, in the brand voice. */
  caption: string;
  /** Optional section background; defaults to transparent (sits on the page wash). */
  className?: string;
  /** Desktop aspect ratio of the framed photo. */
  ratioClassName?: string;
  priority?: boolean;
};

/**
 * A calm, editorial real-world photo band for the marketing pages. Matches the
 * flat marketing aesthetic exactly — `#efefef` frame, hairline `black/10`
 * border, `rounded-[28px]`, `#191919` caption — so a photographed desk reads as
 * part of the page, not a stock-photo bolt-on. The image carries the section;
 * the caption is a quiet figure label (blue tick + one specific line), never a
 * heading. No gradients, no overlays, no AI-render look.
 */
export function EditorialPhotoBand({
  src,
  alt,
  caption,
  className,
  ratioClassName = "aspect-[16/10] sm:aspect-[16/7]",
  priority = false,
}: EditorialPhotoBandProps) {
  return (
    <section className={cn("px-4 py-12 sm:px-6 lg:py-16", className)}>
      <figure className="mx-auto max-w-[1120px]">
        <div
          className={cn(
            "relative w-full overflow-hidden rounded-[28px] border border-black/10 bg-[#efefef]",
            ratioClassName,
          )}
        >
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes="(min-width: 1120px) 1120px, 100vw"
            className="object-cover"
          />
        </div>
        <figcaption className="mt-4 flex items-center gap-2.5 text-sm font-medium text-[#191919]">
          <span className="size-1.5 shrink-0 rounded-full bg-[var(--landing-blue)]" aria-hidden="true" />
          {caption}
        </figcaption>
      </figure>
    </section>
  );
}
