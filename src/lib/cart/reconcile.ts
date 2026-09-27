import type { CartProductInfo } from "./catalog-info";
import type { CartItem } from "./store";

export interface CartLine extends CartItem {
  /** Precio vigente según el catálogo. */
  currentPrice: number;
  /** Stock vigente (tope de cantidad). */
  currentStock: number;
  /** Cantidad que realmente se puede comprar (ajustada al stock vigente). */
  purchasable: number;
  priceChanged: boolean;
  unavailable: boolean;
}

/** Cruza el carrito guardado con el catálogo vigente. */
export function reconcileCart(items: CartItem[], info: Record<string, CartProductInfo>): CartLine[] {
  return items.map((item) => {
    const current = info[item.sku];
    const unavailable = !current || current.price === null || current.stock <= 0;
    const currentPrice = current?.price ?? item.price;
    return {
      ...item,
      name: current?.name ?? item.name,
      image: current?.image ?? item.image,
      currentPrice,
      currentStock: current?.stock ?? 0,
      purchasable: unavailable ? 0 : Math.min(item.quantity, current.stock),
      priceChanged: !unavailable && currentPrice !== item.price,
      unavailable,
    };
  });
}

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.currentPrice * line.purchasable, 0);
}
