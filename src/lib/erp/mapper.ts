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

/** Bodega del ERP con el stock reservado para la venta web. */
export const ONLINE_WAREHOUSE = "internet";

// El ERP guarda los textos en mayúsculas y sin tildes: se corrigen las palabras más comunes.
const ACCENTS: Record<string, string> = {
  sofa: "sofá",
  sofas: "sofás",
  comoda: "cómoda",
  comodas: "cómodas",
  aereo: "aéreo",
  aereos: "aéreos",
  sillon: "sillón",
  cajon: "cajón",
  rincon: "rincón",
  baño: "baño",
  bano: "baño",
  jardin: "jardín",
  melamina: "melamina",
  repisero: "repisero",
  linea: "línea",
  ocasional: "ocasional",
  clasico: "clásico",
  clasica: "clásica",
  grafico: "gráfico",
  living: "living",
};
const LOWER_WORDS = new Set(["de", "del", "la", "el", "y", "con", "para", "en", "x", "a", "+", "cm", "mt", "mts", "m"]);

function cleanSpaces(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function fixWord(word: string): string {
  const lower = word.toLowerCase();
  return ACCENTS[lower] ?? lower;
}

const capitalize = (w: string) => (w ? w.charAt(0).toLocaleUpperCase("es") + w.slice(1) : w);

/** "SOFAS SECCIONALES" → "Sofás seccionales" (categorías). */
export function sentenceCase(text: string): string {
  const words = cleanSpaces(text).split(" ").map(fixWord);
  return capitalize(words.join(" "));
}

/** "CLOSET GOLDEN 3 PUERTAS" → "Closet Golden 3 Puertas" (nombres de producto). Si ya viene con minúsculas, se respeta. */
export function productName(text: string): string {
  const clean = cleanSpaces(text);
  if (/[a-záéíóúñ]/.test(clean)) return clean;
  return clean
    .split(" ")
    .map((w, i) => {
      const fixed = fixWord(w);
      if (i > 0 && LOWER_WORDS.has(fixed)) return fixed;
      return capitalize(fixed);
    })
    .join(" ")
    .replace(/(\d)\s*X\s*(\d)/g, "$1 x $2");
}

/** "BODEGA QUELLON" → "quellon" (slug de la tienda); "INTERNET" → "internet". */
function warehouseSlug(bodega: string): string {
  return slugify(bodega.replace(/^bodega\s+/i, ""));
}

function price(p: ErpProduct): number | null {
  if (p.precios.web > 0) return p.precios.web;
  if (p.precios.venta1Normal > 0) return p.precios.venta1Normal;
  return null;
}

export function mapErpProduct(p: ErpProduct): Product {
  const stockByStore: Record<string, number> = {};
  let onlineStock = 0;
  for (const { bodega, cantidad } of p.stock.porBodega) {
    const slug = warehouseSlug(bodega);
    // El ERP permite stock negativo (ventas sin inventario): para la tienda cuenta como 0.
    const n = Math.max(0, cantidad);
    if (slug === ONLINE_WAREHOUSE) onlineStock += n;
    else stockByStore[slug] = (stockByStore[slug] ?? 0) + n;
  }

  const name = productName(p.nombreWeb || p.nombre);
  const description = cleanSpaces(p.descripcion ?? "");
  const images = [p.foto, ...(p.galeria ?? [])]
    .filter((url): url is string => Boolean(url))
    .map((url) => ({ url, alt: name }));

  return {
    id: p.codigo,
    sku: p.codigo,
    slug: `${slugify(name)}-${slugify(p.codigo)}`,
    name,
    shortDescription: description.length > 160 ? `${description.slice(0, 157)}…` : description,
    description,
    price: price(p),
    stock: onlineStock,
    stockByStore,
    // El ERP solo publica productos de stock; los proyectos a medida se piden en el cotizador.
    saleMode: "stock",
    categorySlug: slugify(p.grupo?.nombre ?? "otros"),
    subcategorySlug: p.familia ? slugify(p.familia.nombre) : null,
    dimensions: { width: null, height: null, depth: null },
    images,
  };
}

/** Arma el catálogo con los productos activos y marcados para la web en el ERP. */
export function buildCatalog(erpProducts: ErpProduct[]): Catalog {
  const published = erpProducts.filter((p) => p.activo && p.web);
  const categories = new Map<string, Category>();

  for (const p of published) {
    const groupName = p.grupo?.nombre ?? "Otros";
    const slug = slugify(groupName);
    let category = categories.get(slug);
    if (!category) {
      category = { slug, name: sentenceCase(groupName), subcategories: [] };
      categories.set(slug, category);
    }
    if (p.familia) {
      const subSlug = slugify(p.familia.nombre);
      if (!category.subcategories.some((s) => s.slug === subSlug)) {
        category.subcategories.push({ slug: subSlug, name: sentenceCase(p.familia.nombre) });
      }
    }
  }

  return {
    categories: [...categories.values()].sort((a, b) => a.name.localeCompare(b.name, "es")),
    products: published.map(mapErpProduct),
  };
}
