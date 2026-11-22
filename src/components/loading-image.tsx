"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function LoadingImage({ alt, className, ...props }: Omit<ImageProps, "onLoad" | "onError">) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  return (
    <>
      <span className="image-placeholder" data-image-placeholder={status} aria-hidden="true" />
      <Image
        {...props}
        alt={alt}
        className={cn(!props.fill && "relative", className)}
        data-image-status={status}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
      />
    </>
  );
}
