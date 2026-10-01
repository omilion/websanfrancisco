import "server-only";
import { placeholderFor } from "@/config/images";
import { getCatalog } from "./index";
import { normalize } from "./filters";
import { isAvailable } from "./availability";

export interface SearchSuggestion {
  products: {
    slug: string;
    name: string;
    price: number | null;
    image: string;
    saleMode: "stock" | "a-medida";
    inStock: boolean;
    category: string;
  }[];
  categories: { slug: string; name: string; count: number }[];
  total: number;
}

/**
 * Búsqueda para el autocompletado del encabezado. Sin tildes y por SKU, ordenada por relevancia:
 * nombre que empieza con el término > palabra del nombre > nombre contiene > descripción/categoría.
 */
export async function searchCatalog(query: string, limit = 6): Promise<SearchSuggestion> {
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return { products: [], categories: [], total: 0 };

  const { products, categories } = await getCatalog();
  const categoryName = new Map(categories.map((c) => [c.slug, c.name]));
  const subcategoryName = new Map(categories.flatMap((c) => c.subcategories.map((s) => [s.slug, s.name])));

  const scored = products
    .map((p) => {
      const name = normalize(p.name);
      const extra = normalize(
        `${p.shortDescription} ${p.sku} ${categoryName.get(p.categorySlug) ?? ""} ${subcategoryName.get(p.subcategorySlug ?? "") ?? ""}`,
      );
      let score = 0;
      for (const t of terms) {
        if (name.startsWith(t)) score += 10;
        else if (name.split(/\s+/).some((w) => w.startsWith(t))) score += 6;
        else if (name.includes(t)) score += 4;
        else if (extra.includes(t)) score += 2;
        else return null; // todos los términos deben aparecer
      }
      if (isAvailable(p)) score += 1;
      return { p, score };
    })
    .filter((x): x is { p: (typeof products)[number]; score: number } => x !== null)
    .sort((a, b) => b.score - a.score);

  const matchedCategories = categories
    .filter((c) => terms.every((t) => normalize(c.name).includes(t)) || scored.some((x) => x.p.categorySlug === c.slug))
    .map((c) => ({ slug: c.slug, name: c.name, count: scored.filter((x) => x.p.categorySlug === c.slug).length }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return {
    total: scored.length,
    categories: matchedCategories,
    products: scored.slice(0, limit).map(({ p }) => ({
      slug: p.slug,
      name: p.name,
      price: p.price,
      image: p.images[0]?.url ?? placeholderFor(p),
      saleMode: p.saleMode,
      inStock: isAvailable(p),
      category: categoryName.get(p.categorySlug) ?? "",
    })),
  };
}
