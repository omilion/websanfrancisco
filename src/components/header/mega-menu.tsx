"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, PackageCheck } from "lucide-react";

export interface MenuCategory {
  slug: string;
  name: string;
  image: string | null;
  count: number;
  inStock: number;
  subcategories: { slug: string; name: string }[];
}

export const secondaryNav = [
  { href: "/productos?tipo=stock&disponible=1", label: "En stock" },
  { href: "/a-medida", label: "A medida" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

interface MegaMenuProps {
  categories: MenuCategory[];
  customImage: string | null;
}

/** Navegación principal de escritorio con mega menú de catálogo. El panel se posiciona bajo el <header>. */
export function MegaMenu({ categories, customImage }: MegaMenuProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [activeSlug, setActiveSlug] = useState(categories[0]?.slug);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const rootRef = useRef<HTMLDivElement>(null);
  const active = categories.find((c) => c.slug === activeSlug) ?? categories[0];

  const show = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hide = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };
  const close = () => {
    clearTimeout(closeTimer.current);
    setOpen(false);
  };

  // Cierra con Escape o clic fuera.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const isCatalog = pathname.startsWith("/productos") || pathname.startsWith("/categoria");

  return (
    <div ref={rootRef} className="h-full">
      <nav aria-label="Principal" className="h-full">
        <ul className="flex h-full items-center font-display text-[17px] font-semibold uppercase tracking-wide text-brand-blue">
          <li className="h-full" onMouseEnter={show} onMouseLeave={hide}>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mega-catalogo"
              onClick={() => (open ? close() : show())}
              className={`relative flex h-full items-center gap-1 px-3 font-display text-[17px] font-semibold uppercase tracking-wide transition-colors hover:text-brand-orange-dark ${isCatalog || open ? "text-brand-orange-dark" : ""}`}
            >
              Catálogo
              <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
              <span
                className={`absolute inset-x-3 bottom-0 h-0.5 bg-brand-orange transition-transform ${open || isCatalog ? "scale-x-100" : "scale-x-0"}`}
              />
            </button>

            {/* ── Panel ───────────────────────────────── */}
            <div
              id="mega-catalogo"
              hidden={!open}
              className="absolute inset-x-0 top-full border-y border-sand bg-white shadow-[0_24px_48px_-16px_rgba(1,42,72,0.25)]"
            >
              <div className="mx-auto grid max-w-7xl grid-cols-12 gap-8 px-4 py-8 font-sans normal-case tracking-normal">
                {/* Categorías */}
                <ul className="col-span-3 border-r border-sand pr-6" aria-label="Categorías">
                  {categories.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/categoria/${c.slug}`}
                        onMouseEnter={() => setActiveSlug(c.slug)}
                        onFocus={() => setActiveSlug(c.slug)}
                        onClick={close}
                        className={`group flex items-center justify-between rounded-md px-3 py-2.5 text-[15px] font-semibold transition ${c.slug === active?.slug ? "bg-cream text-brand-blue" : "text-ink hover:text-brand-blue"}`}
                      >
                        {c.name}
                        <span className="flex items-center gap-2 text-xs font-medium text-ink-muted">
                          {c.count}
                          <ArrowRight
                            className={`size-3.5 transition ${c.slug === active?.slug ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0"}`}
                            aria-hidden
                          />
                        </span>
                      </Link>
                    </li>
                  ))}
                  <li className="mt-3 border-t border-sand pt-3">
                    <Link
                      href="/productos"
                      onClick={close}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-brand-blue hover:underline"
                    >
                      Ver todo el catálogo <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  </li>
                </ul>

                {/* Detalle de la categoría activa */}
                {active && (
                  <div className="col-span-5 grid grid-cols-[1fr_1.1fr] gap-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-orange-dark">{active.name}</p>
                      <ul className="mt-4 space-y-1">
                        {active.subcategories.map((s) => (
                          <li key={s.slug}>
                            <Link
                              href={`/categoria/${active.slug}?sub=${s.slug}`}
                              onClick={close}
                              className="block rounded px-1 py-1.5 text-[15px] text-ink transition hover:translate-x-1 hover:text-brand-blue"
                            >
                              {s.name}
                            </Link>
                          </li>
                        ))}
                        <li>
                          <Link
                            href={`/categoria/${active.slug}`}
                            onClick={close}
                            className="block rounded px-1 py-1.5 text-[15px] font-semibold text-brand-blue hover:underline"
                          >
                            Todo {active.name.toLowerCase()}
                          </Link>
                        </li>
                      </ul>
                      {active.inStock > 0 && (
                        <Link
                          href={`/categoria/${active.slug}?disponible=1`}
                          onClick={close}
                          className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-blue/10 px-3 py-1.5 text-sm font-semibold text-brand-blue hover:bg-brand-blue/15"
                        >
                          <PackageCheck className="size-4" aria-hidden />
                          {active.inStock} listos para despacho
                        </Link>
                      )}
                    </div>
                    <Link
                      href={`/categoria/${active.slug}`}
                      onClick={close}
                      className="group relative block aspect-[4/5] overflow-hidden rounded-lg bg-sand"
                    >
                      {active.image && (
                        <Image
                          key={active.image}
                          src={active.image}
                          alt={active.name}
                          fill
                          sizes="260px"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )}
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/75 to-transparent p-4 pt-12">
                        <span className="font-display text-2xl font-bold uppercase text-white">{active.name}</span>
                      </span>
                    </Link>
                  </div>
                )}

                {/* Promoción a medida */}
                <Link
                  href="/a-medida"
                  onClick={close}
                  className="group relative col-span-4 flex min-h-72 flex-col justify-end overflow-hidden rounded-lg bg-brand-navy p-6 text-white"
                >
                  {customImage && (
                    <Image
                      src={customImage}
                      alt=""
                      fill
                      sizes="400px"
                      className="object-cover opacity-55 transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <span className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/60 to-transparent" />
                  <span className="relative">
                    <span className="block h-1.5 w-10 -skew-x-12 bg-brand-orange" />
                    <span className="mt-3 block text-xs font-bold uppercase tracking-[0.2em] text-brand-orange">
                      Hecho a medida
                    </span>
                    <span className="mt-1 block font-display text-3xl font-bold uppercase leading-none">
                      Lo hacemos para tu espacio exacto
                    </span>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                      Cotiza sin costo
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                    </span>
                  </span>
                </Link>
              </div>
            </div>
          </li>

          {secondaryNav.map((item) => {
            const current = pathname === item.href.split(/[?#]/)[0] && !item.href.includes("?");
            return (
              <li key={item.href} className="h-full">
                <Link
                  href={item.href}
                  className={`relative flex h-full items-center px-3 transition-colors hover:text-brand-orange-dark ${current ? "text-brand-orange-dark" : ""}`}
                >
                  {item.label}
                  <span
                    className={`absolute inset-x-3 bottom-0 h-0.5 bg-brand-orange transition-transform ${current ? "scale-x-100" : "scale-x-0"}`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

    </div>
  );
}
