import type { Catalog, Category, Product } from "@/lib/catalog/types";
import type { ErpProduct } from "./types";

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function mapErpProduct(p: ErpProduct): Product {
  const stockByStore: Record<string, number> = {};
  for (const { sucursal, stock } of p.stock_sucursales ?? []) {
    const slug = slugify(sucursal);
    stockByStore[slug] = (stockByStore[slug] ?? 0) + Math.max(0, stock);
  }
  const storeTotal = Object.values(stockByStore).reduce((sum, n) => sum + n, 0);

  return {
    id: String(p.id),
    sku: p.sku,
    slug: `${slugify(p.nombre)}-${slugify(p.sku)}`,
    name: p.nombre,
    shortDescription: p.descripcion_corta ?? "",
    description: p.descripcion ?? "",
    price: p.precio,
    stock: p.stock_sucursales?.length ? storeTotal : Math.max(0, p.stock ?? 0),
    stockByStore,
    saleMode: p.tipo_venta === "a_medida" ? "a-medida" : "stock",
    categorySlug: slugify(p.categoria),
    subcategorySlug: p.subcategoria ? slugify(p.subcategoria) : null,
    dimensions: { width: p.ancho, height: p.alto, depth: p.profundidad },
    images: (p.imagenes ?? []).map((url) => ({ url, alt: p.nombre })),
  };
}

/** Arma el catálogo (categorías con sus subcategorías + productos activos). */
export function buildCatalog(erpProducts: ErpProduct[]): Catalog {
  const active = erpProducts.filter((p) => p.activo);
  const categories = new Map<string, Category>();

  for (const p of active) {
    const slug = slugify(p.categoria);
    let category = categories.get(slug);
    if (!category) {
      category = { slug, name: p.categoria, subcategories: [] };
      categories.set(slug, category);
    }
    if (p.subcategoria) {
      const subSlug = slugify(p.subcategoria);
      if (!category.subcategories.some((s) => s.slug === subSlug)) {
        category.subcategories.push({ slug: subSlug, name: p.subcategoria });
      }
    }
  }

  return {
    categories: [...categories.values()],
    products: active.map(mapErpProduct),
  };
}
