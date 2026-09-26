import Image from "next/image";
import { ImageIcon } from "lucide-react";

interface ImageSlotProps {
  src: string | null;
  alt: string;
  /** Archivo que falta, se muestra mientras src sea null (ej: "hero-desktop.jpg"). */
  pending: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}

/** Imagen que ocupa todo su contenedor, o un bloque provisorio si aún no existe. */
export function ImageSlot({ src, alt, pending, sizes, priority, className = "" }: ImageSlotProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`absolute inset-0 bg-[linear-gradient(135deg,#e9dcc6_0%,#d9c4a3_55%,#c9ad86_100%)] ${className}`}
    >
      <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(100deg,transparent_0_22px,rgba(120,84,40,.18)_22px_24px)]" />
      <span className="absolute right-3 top-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-1.5 rounded bg-white/70 px-2 py-1 text-[11px] font-medium text-ink-muted">
        <ImageIcon className="size-3.5" aria-hidden />
        Foto pendiente · {pending}
      </span>
    </div>
  );
}
