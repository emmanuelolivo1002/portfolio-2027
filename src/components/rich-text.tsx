"use client";

import Image from "next/image";
import { BlocksRenderer, type BlocksContent } from "@strapi/blocks-react-renderer";

export function RichText({ content }: { content: BlocksContent }) {
  return (
    <div className="rich-text">
      <BlocksRenderer
        content={content}
        blocks={{
          image: ({ image }) => (
            <figure>
              <Image src={image.url} alt={image.alternativeText ?? ""} width={image.width} height={image.height} />
              {image.caption && <figcaption>{image.caption}</figcaption>}
            </figure>
          ),
        }}
      />
    </div>
  );
}
