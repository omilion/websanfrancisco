import Image from "next/image";
import { Box, FileText, MessageCircle, Ruler, Truck, Wrench, type LucideIcon } from "lucide-react";
import { processSteps } from "@/config/content";
import { processPhotos } from "@/config/images";

const stepIcons: Record<string, LucideIcon> = {
  medidas: Ruler,
  ideas: MessageCircle,
  cotizacion: FileText,
  diseno: Box,
  fabricacion: Wrench,
  despacho: Truck,
};

/** Los 6 pasos del proceso a medida. "dark" sobre fondo azul, "light" sobre fondo claro. */
export function ProcessStepsGrid({ tone = "dark", compact = false }: { tone?: "light" | "dark"; compact?: boolean }) {
  const dark = tone === "dark";
  return (
    <ol className={`grid gap-3 sm:grid-cols-2 ${compact ? "" : "md:gap-4 lg:grid-cols-3"}`}>
      {processSteps.map((step, i) => {
        const Icon = stepIcons[step.slug] ?? Box;
        return (
          <li
            key={step.slug}
            className={`flex gap-4 rounded-xl p-4 md:p-5 ${dark ? "bg-white/[0.07] ring-1 ring-white/15" : "bg-white ring-1 ring-sand"}`}
          >
            <span
              className={`relative flex size-12 shrink-0 items-center justify-center rounded-full ${dark ? "bg-white/10 text-cream ring-1 ring-white/20" : "bg-brand-blue/10 text-brand-blue"}`}
            >
              <Icon className="size-5" strokeWidth={1.75} aria-hidden />
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-brand-orange text-[11px] font-bold text-ink">
                {i + 1}
              </span>
            </span>
            <div>
              <h3
                className={`font-display text-xl font-bold uppercase leading-tight tracking-wide ${dark ? "text-cream" : "text-brand-blue"}`}
              >
                <span className="sr-only">Paso {i + 1}: </span>
                {step.title}
              </h3>
              <p className={`mt-1 text-sm leading-relaxed ${dark ? "text-cream/75" : "text-ink-muted"}`}>{step.text}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Galería de fotos del proceso (medición, diseño, fabricación, instalación). */
export function ProcessPhotos({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
      {processPhotos.map((photo) => (
        <li key={photo.src}>
          <figure>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            <figcaption
              className={`mt-2 text-xs font-semibold uppercase tracking-wider ${tone === "dark" ? "text-cream/70" : "text-ink-muted"}`}
            >
              {photo.caption}
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
