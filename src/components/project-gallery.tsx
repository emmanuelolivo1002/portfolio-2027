"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize, Minimize, X } from "lucide-react";
import { useRef, useState } from "react";
import type { PortfolioImage } from "@/content/portfolio";
import { LoadingImage } from "./loading-image";
import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";

const previewSizes = "(min-width: 90rem) 43rem, (min-width: 64rem) 54vw, 92vw";
const thumbnailSizes = "(min-width: 90rem) 14rem, (min-width: 64rem) 18vw, 30vw";

export function ProjectGallery({ title, images }: { title: string; images: PortfolioImage[] }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [actualSize, setActualSize] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const image = images[index];
  const canBrowse = images.length > 1;

  if (!image) return null;

  function select(nextIndex: number) {
    setIndex((nextIndex + images.length) % images.length);
    setActualSize(false);
  }

  return (
    <section aria-label="Project gallery" className="min-w-0 self-start">
      <h3 className="project-section-title mb-4">Project gallery</h3>
      <Dialog open={open} onOpenChange={setOpen}>
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {images.map((item, position) => {
            const lead = position === 0;
            return (
              <button
                key={item.src}
                type="button"
                aria-label={`View image ${position + 1}: ${item.alt}`}
                aria-haspopup="dialog"
                className={`group relative aspect-video min-w-0 overflow-hidden rounded-xl border border-border bg-background-alt hover:border-primary ${lead ? "col-span-full shadow-xl shadow-black/20" : ""}`}
                onClick={(event) => {
                  opener.current = event.currentTarget;
                  select(position);
                  setOpen(true);
                }}
              >
                <LoadingImage
                  src={item.src}
                  alt=""
                  fill
                  sizes={lead ? previewSizes : thumbnailSizes}
                  className={lead ? "object-contain" : "object-cover object-top"}
                />
                {lead && (
                  <span className="absolute right-2.5 bottom-2.5 rounded-lg border border-white/20 bg-black/75 p-2 text-white group-hover:bg-black sm:right-3 sm:bottom-3">
                    <Maximize aria-hidden="true" className="size-4" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <DialogContent
          fullScreen
          showCloseButton={false}
          className="z-[60] grid-rows-[auto_minmax(0,1fr)_auto] bg-[#090d0a] text-foreground"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            opener.current?.focus({ preventScroll: true });
          }}
          onKeyDown={(event) => {
            if (!canBrowse || actualSize || event.altKey || event.ctrlKey || event.metaKey) return;
            let nextIndex: number;
            switch (event.key) {
              case "ArrowLeft": nextIndex = index - 1; break;
              case "ArrowRight": nextIndex = index + 1; break;
              case "Home": nextIndex = 0; break;
              case "End": nextIndex = images.length - 1; break;
              default: return;
            }
            event.preventDefault();
            select(nextIndex);
          }}
        >
          <div className="flex items-center justify-between gap-3 border-b border-border bg-background-alt px-4 py-2 sm:px-8">
            <DialogTitle className="min-w-0 leading-snug sm:text-lg">{title} gallery</DialogTitle>
            <DialogDescription className="sr-only">Open an image at actual size or browse the gallery.</DialogDescription>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 min-w-11 px-2 sm:px-3"
                aria-label={actualSize ? "Fit to screen" : "Actual size"}
                onClick={() => setActualSize(!actualSize)}
              >
                {actualSize ? <Minimize aria-hidden="true" /> : <Maximize aria-hidden="true" />}
                <span className="hidden sm:inline">{actualSize ? "Fit to screen" : "Actual size"}</span>
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="ghost" size="icon" className="size-11" aria-label="Close image viewer">
                  <X aria-hidden="true" className="size-5" />
                </Button>
              </DialogClose>
            </div>
          </div>

          {actualSize ? (
            <div
              key={image.src}
              tabIndex={0}
              role="region"
              aria-label="Full-size image"
              className="overflow-auto overscroll-contain focus-visible:-outline-offset-2"
            >
              <div className="flex min-h-full w-max min-w-full items-center justify-center">
                <Image src={image.src} alt={image.alt} width={image.width} height={image.height} unoptimized className="h-auto max-w-none" />
              </div>
            </div>
          ) : (
            <div
              className="touch-pan-y p-3 sm:p-6"
              onPointerDown={(event) => {
                if (canBrowse && event.pointerType === "touch" && event.isPrimary) {
                  touchStart.current = { x: event.clientX, y: event.clientY };
                }
              }}
              onPointerUp={(event) => {
                const start = touchStart.current;
                touchStart.current = null;
                if (!start) return;
                const dx = event.clientX - start.x;
                const dy = event.clientY - start.y;
                if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy)) select(index + (dx < 0 ? 1 : -1));
              }}
              onPointerCancel={() => { touchStart.current = null; }}
            >
              <div className="relative h-full">
                <LoadingImage
                  key={image.src}
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes={`min(100vw, ${Math.round(100 * image.width / image.height)}vh)`}
                  className="pointer-events-none object-contain"
                />
              </div>
            </div>
          )}

          {(canBrowse || image.caption) && (
            <div className="border-t border-border bg-background-alt px-4 py-2 sm:px-8">
              {image.caption && <p className="pb-1.5 text-center text-sm text-muted-foreground">{image.caption}</p>}
              {canBrowse && (
                <div className="flex items-center justify-center gap-3">
                  <Button type="button" variant="outline" size="icon" className="size-11" aria-label="Previous image" onClick={() => select(index - 1)}>
                    <ChevronLeft aria-hidden="true" />
                  </Button>
                  <span role="status" className="min-w-16 text-center text-sm text-muted-foreground tabular-nums">
                    {index + 1} of {images.length}
                  </span>
                  <Button type="button" variant="outline" size="icon" className="size-11" aria-label="Next image" onClick={() => select(index + 1)}>
                    <ChevronRight aria-hidden="true" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
