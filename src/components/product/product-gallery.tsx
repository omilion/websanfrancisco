"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/lib/catalog/types";

interface ProductGalleryProps {
  images: ProductImage[];
  /** Se muestra cuando el producto aún no tiene fotos. */
  placeholder: ProductImage;
}

export function ProductGallery({ images, placeholder }: ProductGalleryProps) {
  const list = images.length > 0 ? images : [placeholder];
  const [active, setActive] = useState(0);
  const current = list[Math.min(active, list.length - 1)];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-lg bg-white ring-1 ring-sand">
        <Image
          src={current.url}
          alt={current.alt}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-contain"
        />
        {images.length === 0 && (
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-ink-muted">
            Foto próximamente
          </span>
        )}
      </div>

      {list.length > 1 && (
        <ul className="mt-3 grid grid-cols-5 gap-2" aria-label="Fotos del producto">
          {list.map((image, i) => (
            <li key={image.url}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === active}
                className={`relative block aspect-square w-full overflow-hidden rounded-md ring-2 transition ${i === active ? "ring-brand-blue" : "ring-transparent hover:ring-sand"}`}
              >
                <Image src={image.url} alt="" fill sizes="20vw" className="object-contain" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
