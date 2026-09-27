"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Menu, MessageCircle, Phone, X } from "lucide-react";
import type { MenuCategory } from "./mega-menu";
import { secondaryNav } from "./mega-menu";
import { CategoryIcon } from "../category-icon";
import { SearchBox } from "./search-box";

interface MobileMenuProps {
  categories: MenuCategory[];
  stores: { slug: string; city: string; phone: string; phoneLabel: string; whatsapp: string }[];
}

export function MobileMenu({ categories, stores }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  // Bloquea el scroll de la página y permite cerrar con Escape.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        aria-expanded={open}
        aria-controls="menu-movil"
        className="-ml-2 rounded-md p-2 text-brand-blue hover:bg-sand lg:hidden"
      >
        <Menu className="size-6" aria-hidden />
      </button>

      {/* Portal al <body>: el backdrop-blur del header encerraría las capas fijas. */}
      {open &&
        createPortal(
          <>
            <div
              className="animate-fade-in fixed inset-0 z-50 bg-brand-navy/50 backdrop-blur-sm lg:hidden"
              onClick={close}
              aria-hidden
            />

            <div
              id="menu-movil"
              role="dialog"
              aria-modal="true"
              aria-label="Menú"
              className="animate-slide-in-left fixed inset-y-0 left-0 z-50 flex w-[88%] max-w-sm flex-col bg-cream shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-sand px-4 py-3">
                <Link href="/" onClick={close} aria-label="Inicio">
                  <Image
                    src="/brand/logo-horizontal.png"
                    alt="San Francisco Muebles"
                    width={1319}
                    height={606}
                    className="h-9 w-auto"
                  />
                </Link>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Cerrar menú"
                  className="rounded-md p-2 text-brand-blue hover:bg-sand"
                >
                  <X className="size-6" aria-hidden />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-8 pt-4">
                <SearchBox categories={categories} onNavigate={close} />

                <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-brand-orange-dark">
                  Catálogo
                </p>
                <ul className="mt-2 divide-y divide-sand border-y border-sand">
                  {categories.map((c) => (
                    <li key={c.slug}>
                      <details className="group">
                        <summary className="flex cursor-pointer list-none items-center gap-3 py-3 [&::-webkit-details-marker]:hidden">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                            <CategoryIcon slug={c.slug} className="size-5" />
                          </span>
                          <span className="flex-1 font-display text-xl font-bold uppercase text-brand-blue">
                            {c.name}
                          </span>
                          <span className="text-xs text-ink-muted">{c.count}</span>
                          <ChevronDown
                            className="size-5 text-brand-blue transition-transform group-open:rotate-180"
                            aria-hidden
                          />
                        </summary>
                        <ul className="mb-3 ml-14 space-y-1">
                          {c.subcategories.map((s) => (
                            <li key={s.slug}>
                              <Link
                                href={`/categoria/${c.slug}?sub=${s.slug}`}
                                onClick={close}
                                className="block py-1.5 text-[15px]"
                              >
                                {s.name}
                              </Link>
                            </li>
                          ))}
                          <li>
                            <Link
                              href={`/categoria/${c.slug}`}
                              onClick={close}
                              className="block py-1.5 text-[15px] font-semibold text-brand-blue"
                            >
                              Ver todo {c.name.toLowerCase()}
                            </Link>
                          </li>
                        </ul>
                      </details>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/productos"
                  onClick={close}
                  className="mt-3 block text-sm font-bold text-brand-blue"
                >
                  Ver todo el catálogo →
                </Link>

                <ul className="mt-6 space-y-1 font-display text-2xl font-bold uppercase text-brand-blue">
                  {[...secondaryNav, { href: "/contacto#tiendas", label: "Tiendas" }].map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} onClick={close} className="block py-1.5">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/cotizar"
                  onClick={close}
                  className="mt-6 block rounded-md bg-brand-blue px-4 py-3.5 text-center font-semibold text-white"
                >
                  Cotizar gratis
                </Link>

                <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-brand-orange-dark">
                  Nuestras tiendas
                </p>
                <ul className="mt-3 space-y-2">
                  {stores.map((s) => (
                    <li
                      key={s.slug}
                      className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2.5 ring-1 ring-sand"
                    >
                      <span className="font-semibold">{s.city}</span>
                      <span className="flex items-center gap-1">
                        <a
                          href={`tel:${s.phone}`}
                          aria-label={`Llamar a ${s.city}, ${s.phoneLabel}`}
                          className="rounded-md p-2 text-brand-blue hover:bg-sand"
                        >
                          <Phone className="size-4" aria-hidden />
                        </a>
                        <a
                          href={s.whatsapp}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`WhatsApp ${s.city}`}
                          className="rounded-md p-2 text-brand-blue hover:bg-sand"
                        >
                          <MessageCircle className="size-4" aria-hidden />
                        </a>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
