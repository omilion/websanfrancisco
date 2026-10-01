import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { fetchErpProducts, isErpConfigured } from "@/lib/erp/client";
import { buildCatalog } from "@/lib/erp/mapper";
import { mockErpProducts } from "@/lib/erp/mock";
import type { Catalog, Category, Product } from "./types";

export const CATALOG_TAG = "catalog";

/**
 * Catálogo completo cacheado. Se refresca solo cada minuto (el stock cambia con cada venta) y al instante
 * cuando el ERP llama a POST /api/erp/revalidate. El carrito y el pago leen el stock en vivo, sin esta caché. Si el ERP falla, Next sigue sirviendo
 * la última versión cacheada.
 */
export async function getCatalog(): Promise<Catalog> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CATALOG_TAG);

  const erpProducts = isErpConfigured() ? await fetchErpProducts() : mockErpProducts;
  return buildCatalog(erpProducts);
}

export async function getCategories(): Promise<Category[]> {
  return (await getCatalog()).categories;
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  return (await getCategories()).find((c) => c.slug === slug);
}

export interface ProductFilter {
  category?: string;
  subcategory?: string;
  saleMode?: Product["saleMode"];
}

export async function getProducts(filter: ProductFilter = {}): Promise<Product[]> {
  const { products } = await getCatalog();
  return products.filter(
    (p) =>
      (!filter.category || p.categorySlug === filter.category) &&
      (!filter.subcategory || p.subcategorySlug === filter.subcategory) &&
      (!filter.saleMode || p.saleMode === filter.saleMode),
  );
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return (await getCatalog()).products.find((p) => p.slug === slug);
}

export async function getProductBySku(sku: string): Promise<Product | undefined> {
  return (await getCatalog()).products.find((p) => p.sku === sku);
}
