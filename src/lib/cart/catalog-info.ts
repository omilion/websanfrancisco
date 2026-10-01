import "server-only";
import { placeholderFor } from "@/config/images";
import { getCatalog } from "@/lib/catalog";
import { orderLimit } from "@/lib/catalog/availability";

/** Datos actuales del catálogo que el carrito necesita para validar lo guardado en el navegador. */
export interface CartProductInfo {
  name: string;
  slug: string;
  price: number | null;
  stock: number;
  image: string;
}

export type CartCatalogInfo = Record<string, CartProductInfo>;

/** Solo productos de stock (los a medida no se compran en línea), indexados por SKU. */
export async function getCartCatalogInfo(): Promise<CartCatalogInfo> {
  const { products } = await getCatalog();
  return Object.fromEntries(
    products
      .filter((p) => p.saleMode === "stock")
      .map((p) => [
        p.sku,
        {
          name: p.name,
          slug: p.slug,
          price: p.price,
          // Tope de unidades: stock web con pago en línea; en modo cotización, un máximo fijo.
          stock: orderLimit(p),
          image: p.images[0]?.url ?? placeholderFor(p),
        },
      ]),
  );
}
