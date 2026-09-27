"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Pause, Play } from "lucide-react";

export interface HeroSlideContent {
  align: "left" | "center";
  title: string;
  /** Solo un slide debe ser el h1 de la página. */
  isPageTitle?: boolean;
  subtitle?: string;
  cta: { href: string; label: string };
}

export interface HeroSlide {
  src: string;
  /** Versión vertical opcional para celular. */
  mobileSrc?: string;
  alt: string;
  /** object-position en escritorio (ej. "35% center"). */
  position?: string;
  /** object-position en celular, si conviene otro encuadre. */
  mobilePosition?: string;
  /** Texto sobre la imagen. Sin contenido, el slide muestra solo la foto. */
  content?: HeroSlideContent;
}

const INTERVAL = 6000;

const overlays: Record<HeroSlideContent["align"], string> = {
  left: "bg-gradient-to-t from-brand-navy/90 via-brand-navy/70 via-50% to-brand-navy/20 md:bg-gradient-to-r md:from-brand-navy/90 md:via-brand-navy/70 md:via-[38%] md:to-transparent md:to-[62%]",
  center: "bg-brand-navy/55",
};

/** Banner principal: imágenes que se funden entre sí, cada una con su propio texto (o solo la foto). */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);

  // Avance automático (se detiene al pasar el mouse, con la pausa o si el sistema pide menos movimiento).
  useEffect(() => {
    if (paused || userPaused || slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % slides.length), INTERVAL);
    return () => clearTimeout(timer);
  }, [index, paused, userPaused, slides.length]);

  return (
    <div
      className="relative min-h-[560px] md:min-h-[640px]"
      aria-roledescription="carrusel"
      aria-label="Destacados de San Francisco Muebles"
    >
      {slides.map((slide, i) => {
        const active = i === index;
        const content = slide.content;
        const Title = content?.isPageTitle ? "h1" : "h2";
        return (
          <div
            key={slide.src}
            aria-hidden={!active}
            inert={!active}
            className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${active ? "z-[1] opacity-100" : "opacity-0"}`}
          >
            {/* Foto con zoom lento */}
            <div
              className={`absolute inset-0 transition-transform duration-[7000ms] ease-out motion-reduce:transition-none ${active ? "scale-100" : "scale-[1.06]"}`}
            >
              <div className="absolute inset-0 hidden md:block">
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  className="object-cover"
                  style={{ objectPosition: slide.position }}
                />
              </div>
              <Image
                src={slide.mobileSrc ?? slide.src}
                alt={slide.alt}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover md:hidden"
                style={{ objectPosition: slide.mobilePosition ?? slide.position }}
              />
            </div>

            {content && (
              <>
                <div className={`absolute inset-0 ${overlays[content.align]}`} aria-hidden />
                <div
                  className={`relative mx-auto flex h-full min-h-[560px] max-w-7xl flex-col px-4 pb-24 pt-12 md:min-h-[640px] md:justify-center md:py-24 ${content.align === "center" ? "items-center justify-center text-center" : "justify-end"}`}
                >
                  <div
                    className={`max-w-xl transition duration-700 ease-out ${active ? "translate-y-0 opacity-100 delay-300" : "translate-y-4 opacity-0"}`}
                  >
                    <span
                      aria-hidden
                      className={`block h-1.5 w-16 -skew-x-12 rounded-[1px] bg-brand-orange ${content.align === "center" ? "mx-auto" : ""}`}
                    />
                    <Title
                      id={content.isPageTitle ? "hero-title" : undefined}
                      className="mt-5 font-display text-2xl font-bold uppercase leading-[0.95] text-white sm:text-6xl lg:text-7xl"
                    >
                      {content.title}
                    </Title>
                    {content.subtitle && (
                      <p className="mt-5 text-lg font-medium text-cream/90 md:text-xl">{content.subtitle}</p>
                    )}
                    <Link
                      href={content.cta.href}
                      className="mt-8 inline-flex items-center justify-center gap-2 rounded-md bg-brand-orange px-7 py-3.5 font-semibold text-ink transition-colors hover:bg-[#f7a33f]"
                    >
                      {content.cta.label}
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })}

      {slides.length > 1 && (
        <div
          className="absolute inset-x-0 bottom-5 z-10 md:bottom-8"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4">
            <div className="flex items-center gap-2" role="group" aria-label="Elegir imagen">
              {slides.map((slide, i) => (
                <button
                  key={slide.src}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Imagen ${i + 1} de ${slides.length}`}
                  aria-current={i === index}
                  className="group flex h-8 items-center"
                >
                  <span
                    className={`block h-1.5 rounded-full transition-all duration-500 ${i === index ? "w-10 bg-brand-orange" : "w-4 bg-white/80 shadow group-hover:bg-white"}`}
                  />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setUserPaused((p) => !p)}
              aria-label={userPaused ? "Reanudar carrusel" : "Pausar carrusel"}
              className="flex size-8 items-center justify-center rounded-full bg-white/80 text-brand-blue shadow transition hover:bg-white"
            >
              {userPaused ? <Play className="size-3.5" aria-hidden /> : <Pause className="size-3.5" aria-hidden />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
