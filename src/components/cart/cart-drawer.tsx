"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Lock,
  Minus,
  Plus,
  Send,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import type { CartCatalogInfo } from "@/lib/cart/catalog-info";
import { cartSubtotal, reconcileCart, type CartLine } from "@/lib/cart/reconcile";
import {
  clampToStock,
  closeCartDrawer,
  removeFromCart,
  setQuantity,
  useCart,
  useCartDrawer,
} from "@/lib/cart/store";
import { checkoutPath, commerce } from "@/config/site";
import { formatPrice } from "@/lib/format";

const noopSubscribe = () => () => {};

/**
 * Panel del carrito que entra desde la derecha, bajo el encabezado (el botón del carrito sigue
 * visible y lo alterna). Se cierra con la ✕, Escape, tocando fuera o con el mismo botón.
 * Queda siempre montado para animar tanto la entrada como la salida.
 */
export function CartDrawer({ catalog }: { catalog: CartCatalogInfo }) {
  const { open, highlight } = useCartDrawer();
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const items = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const lines = reconcileCart(items, catalog);
  const subtotal = cartSubtotal(lines);
  const units = lines.reduce((sum, l) => sum + l.purchasable, 0);
  const hasIssues = lines.some((l) => l.unavailable);
  const added = highlight ? lines.find((l) => l.sku === highlight) : undefined;

  // Mantiene el carrito al día con el stock vigente.
  useEffect(() => {
    if (!open) return;
    clampToStock(Object.fromEntries(Object.entries(catalog).map(([sku, info]) => [sku, info.stock])));
  }, [open, items, catalog]);

  // Al abrir: bloquea el scroll, enfoca el panel y devuelve el foco al cerrar.
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Espera a que el panel deje de estar "invisible" (inicio de la animación) para enfocarlo.
    const focusTimer = setTimeout(() => closeRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCartDrawer();
    // Cualquier toque fuera del modal lo cierra (el botón del carrito se maneja solo: alterna).
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (panelRef.current?.contains(target) || target.closest("[data-cart-toggle]")) return;
      closeCartDrawer();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
      previousFocus?.focus?.();
    };
  }, [open]);

  // Mantiene el foco dentro del panel al usar Tab.
  function trapFocus(e: ReactKeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Tab" || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  }

  if (!mounted) return null;

  // Portal al <body>: el backdrop-blur del header encerraría las capas fijas.
  // --cart-top = borde inferior del encabezado, medido al abrir (ver store.ts).
  return createPortal(
    <>
      <div
        aria-hidden
        className={`fixed inset-x-0 bottom-0 top-[var(--cart-top,0px)] z-30 bg-brand-navy/35 transition-opacity duration-500 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="carrito-titulo"
        aria-hidden={!open}
        inert={!open}
        onKeyDown={trapFocus}
        className={`fixed bottom-0 right-0 top-[var(--cart-top,0px)] z-50 flex w-[min(28rem,92vw)] flex-col border-l border-sand bg-cream shadow-[-24px_0_60px_-24px_rgba(1,42,72,0.5)] transition-[transform,visibility] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${open ? "visible translate-x-0" : "invisible translate-x-full"}`}
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-sand bg-white px-5 py-3.5">
          <h2 id="carrito-titulo" className="font-display text-2xl font-bold uppercase text-brand-blue">
            Tu carrito {units > 0 && <span className="text-ink-muted">({units})</span>}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={closeCartDrawer}
            aria-label="Cerrar carrito"
            className="rounded-full p-2 text-brand-blue transition hover:bg-sand"
          >
            <X className="size-6" aria-hidden />
          </button>
        </div>

        {added && (
          <p
            role="status"
            className="flex items-center gap-2 bg-brand-blue px-5 py-2.5 text-sm font-medium text-white"
          >
            <CheckCircle2 className="size-4 shrink-0 text-brand-orange" aria-hidden />
            <span className="truncate">Agregaste {added.name}</span>
          </p>
        )}

        {lines.length === 0 ? (
          <div className="flex flex-col items-center px-8 py-10 text-center">
            <span className="flex size-20 items-center justify-center rounded-full bg-sand">
              <ShoppingBag className="size-9 text-brand-blue" strokeWidth={1.5} aria-hidden />
            </span>
            <p className="mt-5 font-display text-2xl font-bold uppercase text-brand-blue">
              Tu carrito está vacío
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              Descubre nuestros muebles en stock o cotiza uno a tu medida.
            </p>
            <Link
              href="/productos"
              onClick={closeCartDrawer}
              className="mt-6 w-full rounded-md bg-brand-blue px-5 py-3 font-semibold text-white hover:bg-brand-blue-dark"
            >
              Ver catálogo
            </Link>
            <Link
              href="/cotizar"
              onClick={closeCartDrawer}
              className="mt-3 text-sm font-semibold text-brand-blue hover:underline"
            >
              Cotizar a medida
            </Link>
          </div>
        ) : (
          <>
            <ul
              className="min-h-0 flex-1 divide-y divide-sand overflow-y-auto overscroll-contain px-5"
              aria-label="Productos en el carrito"
            >
              {lines.map((line) => (
                <DrawerLine key={line.sku} line={line} highlighted={line.sku === highlight} />
              ))}
            </ul>

            {/* Resumen */}
            <div className="border-t border-sand bg-white px-5 pb-5 pt-4">
              <div className="flex items-baseline justify-between">
                <span className="font-semibold">Subtotal</span>
                <span className="text-2xl font-bold">{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-ink-muted">
                {commerce.onlinePayments
                  ? "IVA incluido. Despacho y armado se coordinan aparte, sin cobro en este pago."
                  : "IVA incluido. Te confirmamos disponibilidad, despacho y armado."}
              </p>

              {hasIssues && (
                <p className="mt-3 flex items-center gap-2 rounded-md bg-brand-orange/10 p-2.5 text-xs text-ink">
                  <AlertTriangle className="size-4 shrink-0 text-brand-orange-dark" aria-hidden />
                  Quita los productos no disponibles para continuar.
                </p>
              )}

              <Link
                href={checkoutPath}
                onClick={closeCartDrawer}
                aria-disabled={hasIssues}
                className={`mt-4 flex items-center justify-center gap-2 rounded-md px-5 py-3.5 font-semibold text-white transition ${hasIssues ? "pointer-events-none bg-ink-muted" : "bg-brand-blue hover:bg-brand-blue-dark"}`}
              >
                {commerce.onlinePayments ? (
                  <Lock className="size-4" aria-hidden />
                ) : (
                  <Send className="size-4" aria-hidden />
                )}
                {commerce.onlinePayments ? "Ir a pagar" : "Solicitar cotización"}
              </Link>
              <div className="mt-3 flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={closeCartDrawer}
                  className="font-medium text-ink-muted hover:text-ink"
                >
                  Seguir comprando
                </button>
                <Link
                  href="/carrito"
                  onClick={closeCartDrawer}
                  className="inline-flex items-center gap-1 font-semibold text-brand-blue hover:underline"
                >
                  Ver carrito completo <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>,
    document.body,
  );
}

function DrawerLine({ line, highlighted }: { line: CartLine; highlighted: boolean }) {
  return (
    <li className={`-mx-2 flex gap-3 rounded-lg px-2 py-4 ${highlighted ? "bg-brand-orange/5" : ""}`}>
      <Link
        href={`/productos/${line.slug}`}
        onClick={closeCartDrawer}
        className="relative size-20 shrink-0 overflow-hidden rounded-md bg-white ring-1 ring-sand"
      >
        <Image src={line.image} alt={line.name} fill sizes="80px" className="object-cover" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/productos/${line.slug}`}
            onClick={closeCartDrawer}
            className="text-sm font-semibold leading-snug hover:text-brand-blue"
          >
            {line.name}
          </Link>
          <button
            type="button"
            onClick={() => removeFromCart(line.sku)}
            aria-label={`Quitar ${line.name}`}
            className="-mr-1 -mt-1 rounded-md p-1.5 text-ink-muted transition hover:bg-sand hover:text-ink"
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        </div>

        {line.unavailable ? (
          <p className="mt-1 text-xs font-medium text-brand-orange-dark">Ya no está disponible</p>
        ) : (
          <>
            {line.adjustedTo !== undefined && (
              <p className="mt-1 text-xs font-medium text-brand-orange-dark">Solo quedan {line.adjustedTo}</p>
            )}
            <div className="mt-auto flex items-center justify-between pt-2">
              <div
                className="flex items-center rounded-full border border-sand bg-white"
                role="group"
                aria-label="Cantidad"
              >
                <button
                  type="button"
                  onClick={() => setQuantity(line.sku, line.purchasable - 1)}
                  aria-label={line.purchasable === 1 ? `Quitar ${line.name}` : "Quitar uno"}
                  className="p-1.5 text-brand-blue"
                >
                  <Minus className="size-3.5" aria-hidden />
                </button>
                <span className="w-7 text-center text-sm font-semibold tabular-nums">{line.purchasable}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(line.sku, line.purchasable + 1)}
                  disabled={line.purchasable >= line.currentStock}
                  aria-label="Agregar uno"
                  className="p-1.5 text-brand-blue disabled:opacity-30"
                >
                  <Plus className="size-3.5" aria-hidden />
                </button>
              </div>
              <span className="text-sm font-bold">{formatPrice(line.currentPrice * line.purchasable)}</span>
            </div>
          </>
        )}
      </div>
    </li>
  );
}
