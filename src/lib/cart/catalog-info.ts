import "server-only";
import { placeholderFor } from "@/config/images";
import { getCatalog } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";
import { fetchErpProducts, isErpConfigured } from "@/lib/erp/client";
import { buildCatalog } from "@/lib/erp/mapper";
import { mockErpProducts } from "@/lib/erp/mock";
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

function toCartInfo(products: Product[]): CartCatalogInfo {
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

/** Solo productos de stock (los a medida no se compran en línea), indexados por SKU. Usa el catálogo cacheado. */
export async function getCartCatalogInfo(): Promise<CartCatalogInfo> {
  const { products } = await getCatalog();
  return toCartInfo(products);
}

/**
 * Lo mismo, pero leído del ERP en este instante (sin caché). Es lo que deben usar el carrito, el checkout y la
 * creación del pago: el stock y el precio que se cobran tienen que ser los vigentes, no los de hace un rato.
 * Si el ERP no responde, cae al catálogo cacheado salvo que `strict` sea true (el pago no debe usar datos viejos).
 */
export async function getLiveCartCatalogInfo({ strict = false }: { strict?: boolean } = {}): Promise<CartCatalogInfo> {
  try {
    const erpProducts = isErpConfigured() ? await fetchErpProducts() : mockErpProducts;
    return toCartInfo(buildCatalog(erpProducts).products);
  } catch (e) {
    if (strict) throw e;
    console.error("No se pudo leer el stock en vivo del ERP; se usa el catálogo cacheado", e);
    return getCartCatalogInfo();
  }
}
