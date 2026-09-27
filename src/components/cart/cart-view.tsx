"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { fulfillment } from "@/config/site";
import type { CartCatalogInfo } from "@/lib/cart/catalog-info";
import { cartSubtotal, reconcileCart } from "@/lib/cart/reconcile";
import { clampToStock, removeFromCart, setQuantity, useCart } from "@/lib/cart/store";
import { formatPrice } from "@/lib/format";

export function CartView({ catalog }: { catalog: CartCatalogInfo }) {
  const items = useCart();
  const lines = reconcileCart(items, catalog);
  const subtotal = cartSubtotal(lines);
  const units = lines.reduce((sum, l) => sum + l.purchasable, 0);
  const hasIssues = lines.some((l) => l.unavailable);

  // Si bajó el stock, ajusta la cantidad guardada (y el contador del encabezado).
  useEffect(() => {
    clampToStock(Object.fromEntries(Object.entries(catalog).map(([sku, info]) => [sku, info.stock])));
  }, [items, catalog]);

  if (lines.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-sand bg-white px-6 py-16 text-center">
        <ShoppingBag className="mx-auto size-12 text-ink-muted" aria-hidden />
        <h2 className="mt-4 font-display text-3xl font-bold uppercase text-brand-blue">Tu carrito está vacío</h2>
        <p className="mx-auto mt-2 max-w-md text-ink-muted">
          Revisa nuestros muebles en stock o cotiza un proyecto a tu medida.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/productos" className="rounded-md bg-brand-blue px-6 py-3 font-semibold text-white hover:bg-brand-blue-dark">
            Ver catálogo
          </Link>
          <Link href="/cotizar" className="rounded-md border-2 border-brand-blue px-6 py-2.5 font-semibold text-brand-blue hover:bg-cream">
            Cotizar a medida
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-12">
      <ul className="divide-y divide-sand rounded-lg bg-white ring-1 ring-sand" aria-label="Productos en el carrito">
        {lines.map((line) => (
          <li key={line.sku} className="flex gap-4 p-4 md:p-5">
            <Link
              href={`/productos/${line.slug}`}
              className="relative size-24 shrink-0 overflow-hidden rounded-md bg-cream md:size-28"
            >
              <Image src={line.image} alt={line.name} fill sizes="112px" className="object-cover" />
            </Link>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/productos/${line.slug}`} className="font-semibold hover:text-brand-blue">
                    {line.name}
                  </Link>
                  <p className="text-xs text-ink-muted">SKU: {line.sku}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFromCart(line.sku)}
                  aria-label={`Quitar ${line.name}`}
                  className="-mr-1 -mt-1 rounded-full p-2.5 text-ink-muted hover:bg-sand hover:text-ink"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>

              {line.unavailable ? (
                <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-brand-orange-dark">
                  <AlertTriangle className="size-4" aria-hidden /> Ya no está disponible. Quítalo para continuar.
                </p>
              ) : (
                <>
                  {line.priceChanged && (
                    <p className="mt-2 text-xs font-medium text-brand-orange-dark">
                      El precio cambió desde que lo agregaste (antes {formatPrice(line.price)}).
                    </p>
                  )}
                  {line.adjustedTo !== undefined && (
                    <p className="mt-2 text-xs font-medium text-brand-orange-dark">
                      Solo quedan {line.adjustedTo}. Ajustamos la cantidad.
                    </p>
                  )}
                  <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                    <div className="flex items-center rounded-md border border-sand" role="group" aria-label="Cantidad">
                      <button
                        type="button"
                        onClick={() => setQuantity(line.sku, line.purchasable - 1)}
                        aria-label="Quitar uno"
                        className="p-2 text-brand-blue"
                      >
                        <Minus className="size-4" aria-hidden />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold tabular-nums">{line.purchasable}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(line.sku, line.purchasable + 1)}
                        disabled={line.purchasable >= line.currentStock}
                        aria-label="Agregar uno"
                        className="p-2 text-brand-blue disabled:opacity-30"
                      >
                        <Plus className="size-4" aria-hidden />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatPrice(line.currentPrice * line.purchasable)}</p>
                      {line.purchasable > 1 && (
                        <p className="text-xs text-ink-muted">{formatPrice(line.currentPrice)} c/u</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-lg bg-white p-6 ring-1 ring-sand lg:sticky lg:top-28" aria-label="Resumen">
        <h2 className="font-display text-2xl font-bold uppercase text-brand-blue">Resumen</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-muted">
              Subtotal ({units} {units === 1 ? "producto" : "productos"})
            </dt>
            <dd className="font-semibold">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Despacho</dt>
            <dd className="text-right">Retiro en tienda o despacho a cotizar</dd>
          </div>
        </dl>
        <div className="mt-4 flex justify-between border-t border-sand pt-4">
          <span className="font-semibold">Total a pagar</span>
          <span className="text-xl font-bold">{formatPrice(subtotal)}</span>
        </div>
        <p className="mt-1 text-xs text-ink-muted">IVA incluido</p>

        {hasIssues ? (
          <p className="mt-6 rounded-md bg-brand-orange/10 p-3 text-sm text-ink">
            Revisa los productos marcados antes de continuar.
          </p>
        ) : null}
        <Link
          href="/checkout"
          aria-disabled={hasIssues || units === 0}
          className={`mt-6 flex items-center justify-center gap-2 rounded-md px-6 py-3.5 font-semibold text-white ${hasIssues || units === 0 ? "pointer-events-none bg-ink-muted" : "bg-brand-blue hover:bg-brand-blue-dark"}`}
        >
          Continuar al pago
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        <Link href="/productos" className="mt-1 block py-3 text-center text-sm font-medium text-brand-blue hover:underline">
          Seguir comprando
        </Link>

        <p className="mt-6 border-t border-sand pt-4 text-xs text-ink-muted">
          Despacho en toda la {fulfillment.shippingArea}: el costo se coordina contigo según destino y no se
          cobra en este pago. Pago seguro con Webpay.
        </p>
      </aside>
    </div>
  );
}
