"use client";

import Image from "next/image";
import { BlocksRenderer, type BlocksContent } from "@strapi/blocks-react-renderer";

export function RichText({ content, imageSizes }: { content: BlocksContent; imageSizes?: string }) {
  return (
    <div className="rich-text">
      <BlocksRenderer
        content={content}
        blocks={{
          image: ({ image }) => (
            <figure>
              <Image src={image.url} alt={image.alternativeText ?? ""} width={image.width} height={image.height} sizes={imageSizes} />
              {image.caption && <figcaption>{image.caption}</figcaption>}
            </figure>
          ),
        }}
      />
    </div>
  );
}
