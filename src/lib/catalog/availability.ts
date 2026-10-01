import { commerce } from "@/config/site";
import type { Product } from "./types";

/** Máximo por producto en una solicitud de cotización (sin pago en línea, el stock no limita). */
export const QUOTE_MAX_QUANTITY = 20;

/**
 * Hay unidades del producto. Con pago en línea cuenta solo la bodega Internet (lo que se vende en la web);
 * en modo cotización cuenta cualquier tienda o bodega.
 */
export function isAvailable(p: Pick<Product, "saleMode" | "stock" | "stockByStore">): boolean {
  if (p.saleMode !== "stock") return false;
  if (p.stock > 0) return true;
  return !commerce.onlinePayments && Object.values(p.stockByStore).some((n) => n > 0);
}

/**
 * Cuántas unidades se pueden agregar al carrito. Con pago en línea, el stock de la bodega Internet;
 * en modo cotización, cualquier producto con precio (la tienda confirma la disponibilidad al responder).
 */
export function orderLimit(p: Pick<Product, "saleMode" | "stock" | "price">): number {
  if (p.saleMode !== "stock" || p.price === null) return 0;
  return commerce.onlinePayments ? p.stock : QUOTE_MAX_QUANTITY;
}
