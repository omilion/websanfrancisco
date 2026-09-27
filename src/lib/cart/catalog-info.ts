import "server-only";
import { placeholderFor } from "@/config/images";
import { getCatalog } from "@/lib/catalog";

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
          stock: p.stock,
          image: p.images[0]?.url ?? placeholderFor(p),
        },
      ]),
  );
}
