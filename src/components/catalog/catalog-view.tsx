import Link from "next/link";
import { ArrowLeft, ArrowRight, SearchX, X } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { stores } from "@/config/site";
import { getCatalog } from "@/lib/catalog";
import {
  applyFilters,
  PAGE_SIZE,
  priceRanges,
  sortProducts,
  toSearchParams,
  type CatalogFilters,
} from "@/lib/catalog/filters";
import type { Product } from "@/lib/catalog/types";
import { FilterPanel, SortSelect, type FacetOption } from "./filter-panel";

interface CatalogViewProps {
  filters: CatalogFilters;
  basePath: string;
  /** true en /categoria/[slug]: la categoría viene fija desde la ruta. */
  lockedCategory?: boolean;
}

export async function CatalogView({ filters, basePath, lockedCategory }: CatalogViewProps) {
  const { categories, products } = await getCatalog();
  const omit: (keyof CatalogFilters)[] = lockedCategory ? ["categoria"] : [];
  const hrefWith = (changes: Partial<CatalogFilters>) =>
    `${basePath}${toSearchParams({ ...filters, pagina: 1, ...changes }, omit)}`;

  // Conteo de cada opción: cuántos productos quedarían al elegirla, con el resto de filtros aplicados.
  const countWith = (changes: Partial<CatalogFilters>) =>
    applyFilters(products, { ...filters, ...changes }).length;

  const storeOptions: FacetOption[] = stores.map((s) => ({
    value: s.slug,
    label: s.city,
    count: countWith({ tienda: s.slug }),
  }));
  const typeOptions: FacetOption[] = [
    { value: "stock", label: "En stock", count: countWith({ tipo: "stock" }) },
    { value: "a-medida", label: "A medida", count: countWith({ tipo: "a-medida" }) },
  ];
  const categoryOptions: FacetOption[] = categories.map((c) => ({
    value: c.slug,
    label: c.name,
    count: countWith({ categoria: c.slug, sub: "" }),
  }));
  const currentCategory = categories.find((c) => c.slug === filters.categoria);
  const subcategoryOptions: FacetOption[] = (currentCategory?.subcategories ?? []).map((s) => ({
    value: s.slug,
    label: s.name,
    count: countWith({ sub: s.slug }),
  }));

  // Resultados
  const results = sortProducts(applyFilters(products, filters), filters.orden);
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const page = Math.min(filters.pagina, totalPages);
  const pageItems = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selectedStore = stores.find((s) => s.slug === filters.tienda);

  // Etiquetas de filtros activos (con botón para quitar cada uno)
  const chips: { label: string; href: string }[] = [];
  if (filters.q) chips.push({ label: `“${filters.q}”`, href: hrefWith({ q: "" }) });
  if (selectedStore) chips.push({ label: `Tienda ${selectedStore.city}`, href: hrefWith({ tienda: "" }) });
  if (filters.tipo)
    chips.push({ label: filters.tipo === "stock" ? "En stock" : "A medida", href: hrefWith({ tipo: "" }) });
  if (!lockedCategory && currentCategory)
    chips.push({ label: currentCategory.name, href: hrefWith({ categoria: "", sub: "" }) });
  const currentSub = currentCategory?.subcategories.find((s) => s.slug === filters.sub);
  if (currentSub) chips.push({ label: currentSub.name, href: hrefWith({ sub: "" }) });
  const range = priceRanges.find((r) => r.value === filters.precio);
  if (range) chips.push({ label: range.label, href: hrefWith({ precio: "" }) });
  if (filters.disponible) chips.push({ label: "Con stock", href: hrefWith({ disponible: false }) });

  const storeNote = (p: Product) => {
    if (!selectedStore) return undefined;
    const n = p.stockByStore[selectedStore.slug] ?? 0;
    return `${n} ${n === 1 ? "disponible" : "disponibles"} en ${selectedStore.city}`;
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:py-14 lg:grid-cols-[260px_1fr] lg:gap-12">
      <aside aria-label="Filtros" className="lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:self-start lg:overflow-y-auto lg:pr-2">
        <FilterPanel
          basePath={basePath}
          filters={filters}
          lockedCategory={lockedCategory}
          categories={categoryOptions}
          subcategories={subcategoryOptions}
          stores={storeOptions}
          types={typeOptions}
        />
      </aside>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sand pb-4">
          <p className="text-sm text-ink-muted" aria-live="polite">
            <strong className="text-ink">{results.length}</strong>{" "}
            {results.length === 1 ? "producto" : "productos"}
            {selectedStore && ` con stock en ${selectedStore.city}`}
          </p>
          <SortSelect basePath={basePath} filters={filters} lockedCategory={lockedCategory} />
        </div>

        {chips.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Filtros activos">
            {chips.map((chip) => (
              <li key={chip.label}>
                <Link
                  href={chip.href}
                  scroll={false}
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue/10 px-3 py-2 text-sm font-medium text-brand-blue hover:bg-brand-blue/15"
                  aria-label={`Quitar filtro ${chip.label}`}
                >
                  {chip.label}
                  <X className="size-3.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}

        {pageItems.length > 0 ? (
          <ul className="mt-6 grid grid-cols-2 gap-3 md:gap-5 xl:grid-cols-3">
            {pageItems.map((product) => (
              <li key={product.id} className="flex">
                <ProductCard product={product} note={storeNote(product)} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 rounded-lg border-2 border-dashed border-sand bg-white px-6 py-14 text-center">
            <SearchX className="mx-auto size-10 text-ink-muted" aria-hidden />
            <h2 className="mt-4 font-display text-3xl font-bold uppercase text-brand-blue">
              No encontramos muebles con esos filtros
            </h2>
            <p className="mx-auto mt-2 max-w-md text-ink-muted">
              Prueba quitando algún filtro o pregúntanos: si no lo tenemos en stock, lo podemos fabricar
              a tu medida.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={lockedCategory ? basePath : "/productos"}
                className="rounded-md border-2 border-brand-blue px-5 py-2.5 font-semibold text-brand-blue hover:bg-cream"
              >
                Quitar filtros
              </Link>
              <Link href="/cotizar" className="rounded-md bg-brand-blue px-5 py-3 font-semibold text-white hover:bg-brand-blue-dark">
                Cotizar a medida
              </Link>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <nav aria-label="Paginación" className="mt-10 flex items-center justify-center gap-2">
            {page > 1 && (
              <Link
                href={hrefWith({ pagina: page - 1 })}
                className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold text-brand-blue hover:bg-sand"
              >
                <ArrowLeft className="size-4" aria-hidden /> Anterior
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={hrefWith({ pagina: n })}
                aria-current={n === page ? "page" : undefined}
                className={`flex size-10 items-center justify-center rounded-md text-sm font-semibold ${n === page ? "bg-brand-blue text-white" : "text-brand-blue hover:bg-sand"}`}
              >
                {n}
              </Link>
            ))}
            {page < totalPages && (
              <Link
                href={hrefWith({ pagina: page + 1 })}
                className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold text-brand-blue hover:bg-sand"
              >
                Siguiente <ArrowRight className="size-4" aria-hidden />
              </Link>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}

/** Esqueleto mientras cargan los resultados. */
export function CatalogSkeleton() {
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:py-14 lg:grid-cols-[260px_1fr] lg:gap-12" aria-busy>
      <div className="hidden h-96 animate-pulse rounded-lg bg-sand/60 lg:block" />
      <div>
        <div className="h-10 animate-pulse rounded bg-sand/60" />
        <ul className="mt-6 grid grid-cols-2 gap-3 md:gap-5 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="aspect-[3/4] animate-pulse rounded-lg bg-sand/60" />
          ))}
        </ul>
      </div>
    </div>
  );
}
