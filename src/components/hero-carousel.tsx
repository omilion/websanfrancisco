"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";

export interface HeroSlide {
  src: string;
  /** Versión vertical opcional para celular. */
  mobileSrc?: string;
  alt: string;
  /** object-position en escritorio (ej. "35% center"). */
  position?: string;
  /** object-position en celular, si conviene otro encuadre. */
  mobilePosition?: string;
}

const INTERVAL = 6000;

/** Fondo del banner principal: imágenes que se funden entre sí, con puntos y pausa. */
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
    <>
      <div
        className="absolute inset-0 -z-10"
        aria-roledescription="carrusel"
        aria-label="Imágenes de San Francisco Muebles"
      >
        {slides.map((slide, i) => {
          const active = i === index;
          return (
            <div
              key={slide.src}
              aria-hidden={!active}
              className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${active ? "opacity-100" : "opacity-0"}`}
            >
              <div
                className={`absolute inset-0 transition-transform duration-[7000ms] ease-out motion-reduce:transition-none ${active ? "scale-100" : "scale-[1.06]"}`}
              >
                {/* Escritorio */}
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
                {/* Celular */}
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
            </div>
          );
        })}
      </div>

      {slides.length > 1 && (
        <div
          className="absolute inset-x-0 bottom-5 z-10 md:bottom-8"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4">
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
              {userPaused ? (
                <Play className="size-3.5" aria-hidden />
              ) : (
                <Pause className="size-3.5" aria-hidden />
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
