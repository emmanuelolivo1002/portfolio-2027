"use client";

import Image, { type ImageProps } from "next/image";
import { useState, type ReactNode, type SyntheticEvent } from "react";
import { cn } from "@/lib/utils";

type LoadingImageProps = Omit<ImageProps, "onLoad" | "onError"> & { sources?: ReactNode };

export function LoadingImage({ alt, className, sources, ...props }: LoadingImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  function markLoaded(event: SyntheticEvent<HTMLImageElement>) {
    if (!sources || !event.currentTarget.currentSrc.startsWith("data:")) setStatus("loaded");
  }

  const image = (
    <Image
      {...props}
      alt={alt}
      className={cn(!props.fill && "relative", className)}
      data-image-status={status}
      onLoad={markLoaded}
      onLoadCapture={sources ? markLoaded : undefined}
      onError={() => setStatus("error")}
    />
  );

  return (
    <>
      <span className="image-placeholder" data-image-placeholder={status} aria-hidden="true" />
      {sources ? <picture className="block h-full">{sources}{image}</picture> : image}
    </>
  );
}
