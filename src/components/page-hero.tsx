import type { ReactNode } from "react";
import type { ResponsiveImage } from "@/config/images";
import { ImageSlot } from "./image-slot";
import { Plank } from "./plank";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  /** Banner de fondo opcional. `pending`: nombre base del archivo mientras falte (ej: "contacto"). */
  image?: ResponsiveImage & { pending: string };
  /** Menos alto en celular (páginas donde lo importante está debajo, como el cotizador). */
  compact?: boolean;
  /** Fondo tenue detrás del texto, sin degradado fuerte (ej: textura de madera). */
  background?: string;
  children?: ReactNode;
}

/** Encabezado de páginas internas. */
export function PageHero({
  eyebrow,
  title,
  description,
  image,
  background,
  compact,
  children,
}: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden border-b border-sand">
      {image && (
        <>
          <div className="absolute inset-0 -z-10 hidden md:block">
            <ImageSlot
              src={image.desktop}
              alt={image.alt}
              pending={`${image.pending}-desktop.jpg`}
              sizes="100vw"
              priority
            />
          </div>
          <div className="absolute inset-0 -z-10 md:hidden">
            <ImageSlot
              src={image.mobile ?? image.desktop}
              alt={image.alt}
              pending={`${image.pending}-movil.jpg`}
              sizes="100vw"
              priority
            />
          </div>
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-cream via-cream/85 to-cream/30 md:bg-gradient-to-r md:from-cream md:via-cream/85 md:via-45% md:to-transparent" />
        </>
      )}
      {background && !image && (
        <div className="absolute inset-0 -z-10">
          <ImageSlot src={background} alt="" pending="" sizes="100vw" className="opacity-60" />
        </div>
      )}
      <div
        className={`mx-auto max-w-7xl px-4 ${compact ? "py-8 md:py-20" : image ? "py-16 md:py-28" : "py-12 md:py-16"}`}
      >
        <div className="max-w-2xl">
          <Plank className="w-16" />
          <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-brand-orange-dark">
            {eyebrow}
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold uppercase leading-[0.95] text-brand-blue sm:text-5xl md:text-6xl">
            {title}
          </h1>
          {description && <div className="mt-5 max-w-xl text-lg text-ink">{description}</div>}
          {children}
        </div>
      </div>
    </section>
  );
}
