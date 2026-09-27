"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronRight, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useCartDrawer } from "@/lib/cart/store";

export interface WhatsAppContact {
  slug: string;
  city: string;
  phoneLabel: string;
  href: string;
  isHeadquarters: boolean;
}

/**
 * Botón flotante de WhatsApp con selector de sucursal.
 * Se oculta en el checkout y con el carrito abierto, para no distraer.
 */
export function WhatsAppFloat({ contacts }: { contacts: WhatsAppContact[] }) {
  const pathname = usePathname();
  const { open: cartOpen } = useCartDrawer();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Cierra al tocar fuera o con Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (pathname.startsWith("/checkout") || cartOpen) return null;
  // En la ficha de producto hay una barra de compra fija abajo (celular): el botón sube.
  const onProductPage = /^\/productos\/[^/]+$/.test(pathname);

  return (
    <div
      ref={rootRef}
      className={`fixed right-5 z-40 md:right-7 lg:bottom-7 ${onProductPage ? "bottom-24" : "bottom-5 md:bottom-7"}`}
    >
      {/* Selector de sucursal */}
      <div
        id="whatsapp-sucursales"
        role="dialog"
        aria-label="Escríbenos por WhatsApp"
        aria-hidden={!open}
        inert={!open}
        className={`absolute bottom-full right-0 mb-3 w-[min(20rem,calc(100vw-2.5rem))] origin-bottom-right overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_-12px_rgba(1,42,72,0.45)] ring-1 ring-sand transition duration-200 ease-out ${open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-2 scale-95 opacity-0"}`}
      >
        <div className="bg-[#075E54] px-5 py-4 text-white">
          <p className="font-semibold">¿Con qué tienda quieres hablar?</p>
          <p className="text-sm text-white/80">Te respondemos por WhatsApp</p>
        </div>
        <ul className="divide-y divide-sand">
          {contacts.map((c) => (
            <li key={c.slug}>
              <a
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-cream"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
                  <FaWhatsapp className="size-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 font-semibold text-ink">
                    {c.city}
                    {c.isHeadquarters && (
                      <span className="rounded bg-brand-orange/15 px-1.5 py-0.5 text-xs font-bold uppercase text-brand-orange-dark">
                        Casa central
                      </span>
                    )}
                  </span>
                  <span className="block text-sm tabular-nums text-ink-muted">{c.phoneLabel}</span>
                </span>
                <ChevronRight
                  className="size-4 text-ink-muted transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Botón */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="whatsapp-sucursales"
        aria-label={open ? "Cerrar WhatsApp" : "Escríbenos por WhatsApp"}
        className="relative flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-6px_rgba(37,211,102,0.6)] transition-transform hover:scale-105"
      >
        {!open && (
          <span
            className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-20 [animation-duration:2.5s]"
            aria-hidden
          />
        )}
        {open ? <X className="relative size-7" aria-hidden /> : <FaWhatsapp className="relative size-8" aria-hidden />}
      </button>
    </div>
  );
}
