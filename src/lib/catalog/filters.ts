// Filtros del catálogo. Viven en la URL (ej: /productos?tienda=castro&orden=precio-asc)
// para que se puedan compartir por link y funcionen con el botón atrás.
// Módulo puro: lo usan tanto el servidor como el panel de filtros en el navegador.

import type { Product, SaleMode } from "./types";

export const PAGE_SIZE = 24;

export const sortOptions = [
  { value: "destacados", label: "Destacados" },
  { value: "precio-asc", label: "Menor precio" },
  { value: "precio-desc", label: "Mayor precio" },
  { value: "nombre", label: "Nombre A–Z" },
] as const;

export type SortValue = (typeof sortOptions)[number]["value"];

export const priceRanges = [
  { value: "0-100000", label: "Hasta $100.000", min: 0, max: 100000 },
  { value: "100000-300000", label: "$100.000 a $300.000", min: 100000, max: 300000 },
  { value: "300000-600000", label: "$300.000 a $600.000", min: 300000, max: 600000 },
  { value: "600000-", label: "Más de $600.000", min: 600000, max: Infinity },
] as const;

export interface CatalogFilters {
  q: string;
  categoria: string;
  sub: string;
  tipo: SaleMode | "";
  /** Slug de la tienda: muestra solo productos con stock en esa sucursal. */
  tienda: string;
  precio: string;
  /** Solo productos con stock disponible. */
  disponible: boolean;
  orden: SortValue;
  pagina: number;
}

export const emptyFilters: CatalogFilters = {
  q: "",
  categoria: "",
  sub: "",
  tipo: "",
  tienda: "",
  precio: "",
  disponible: false,
  orden: "destacados",
  pagina: 1,
};

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export function parseFilters(raw: RawParams): CatalogFilters {
  const tipo = first(raw.tipo);
  const orden = first(raw.orden);
  const pagina = Number.parseInt(first(raw.pagina), 10);

  return {
    q: first(raw.q).slice(0, 80),
    categoria: first(raw.categoria),
    sub: first(raw.sub),
    tipo: tipo === "stock" || tipo === "a-medida" ? tipo : "",
    tienda: first(raw.tienda),
    precio: priceRanges.some((r) => r.value === first(raw.precio)) ? first(raw.precio) : "",
    disponible: first(raw.disponible) === "1",
    orden: sortOptions.some((o) => o.value === orden) ? (orden as SortValue) : "destacados",
    pagina: Number.isFinite(pagina) && pagina > 0 ? pagina : 1,
  };
}

/** Arma el query string. Omite valores por defecto para que las URLs queden limpias. */
export function toSearchParams(filters: CatalogFilters, omit: (keyof CatalogFilters)[] = []): string {
  const params = new URLSearchParams();
  const set = (key: keyof CatalogFilters, value: string) => {
    if (value && !omit.includes(key)) params.set(key, value);
  };

  set("q", filters.q);
  set("categoria", filters.categoria);
  set("sub", filters.sub);
  set("tipo", filters.tipo);
  set("tienda", filters.tienda);
  set("precio", filters.precio);
  set("disponible", filters.disponible ? "1" : "");
  set("orden", filters.orden === "destacados" ? "" : filters.orden);
  set("pagina", filters.pagina > 1 ? String(filters.pagina) : "");

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function normalize(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function applyFilters(products: Product[], f: CatalogFilters): Product[] {
  const range = priceRanges.find((r) => r.value === f.precio);
  const terms = normalize(f.q).split(/\s+/).filter(Boolean);

  return products.filter((p) => {
    if (f.categoria && p.categorySlug !== f.categoria) return false;
    if (f.sub && p.subcategorySlug !== f.sub) return false;
    if (f.tipo && p.saleMode !== f.tipo) return false;
    if (f.tienda && !((p.stockByStore[f.tienda] ?? 0) > 0)) return false;
    if (f.disponible && !(p.saleMode === "stock" && p.stock > 0)) return false;
    if (range && (p.price === null || p.price < range.min || p.price >= range.max)) return false;
    if (terms.length) {
      const haystack = normalize(
        `${p.name} ${p.shortDescription} ${p.sku} ${p.categorySlug} ${p.subcategorySlug ?? ""}`.replace(/-/g, " "),
      );
      if (!terms.every((t) => haystack.includes(t))) return false;
    }
    return true;
  });
}

export function sortProducts(products: Product[], orden: SortValue): Product[] {
  const sorted = [...products];
  // Productos sin precio (a medida) siempre al final al ordenar por precio.
  const price = (p: Product, empty: number) => p.price ?? empty;

  switch (orden) {
    case "precio-asc":
      return sorted.sort((a, b) => price(a, Infinity) - price(b, Infinity));
    case "precio-desc":
      return sorted.sort((a, b) => price(b, -Infinity) - price(a, -Infinity));
    case "nombre":
      return sorted.sort((a, b) => a.name.localeCompare(b.name, "es"));
    default:
      // Destacados: primero con stock, luego a medida, al final agotados.
      return sorted.sort((a, b) => rank(a) - rank(b));
  }
}

function rank(p: Product): number {
  if (p.saleMode === "stock" && p.stock > 0) return 0;
  if (p.saleMode === "a-medida") return 1;
  return 2;
}

/** Cuántos filtros están activos (sin contar orden ni página). */
export function activeFilterCount(f: CatalogFilters, ignore: (keyof CatalogFilters)[] = []): number {
  const keys: (keyof CatalogFilters)[] = ["q", "categoria", "sub", "tipo", "tienda", "precio", "disponible"];
  return keys.filter((k) => !ignore.includes(k) && Boolean(f[k])).length;
}
