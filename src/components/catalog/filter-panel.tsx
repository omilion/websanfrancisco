"use client";

import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import {
  activeFilterCount,
  emptyFilters,
  priceRanges,
  sortOptions,
  toSearchParams,
  type CatalogFilters,
  type SortValue,
} from "@/lib/catalog/filters";

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

interface FilterPanelProps {
  basePath: string;
  filters: CatalogFilters;
  /** En /categoria/[slug] la categoría viene en la ruta, no en la URL. */
  lockedCategory?: boolean;
  categories: FacetOption[];
  subcategories: FacetOption[];
  stores: FacetOption[];
  types: FacetOption[];
}

function useFilterNavigation(basePath: string, filters: CatalogFilters, lockedCategory?: boolean) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function navigate(changes: Partial<CatalogFilters>) {
    const next = { ...filters, pagina: 1, ...changes };
    const omit: (keyof CatalogFilters)[] = lockedCategory ? ["categoria"] : [];
    startTransition(() => {
      router.push(`${basePath}${toSearchParams(next, omit)}`, { scroll: false });
    });
  }

  return { navigate, isPending };
}

export function FilterPanel({
  basePath,
  filters,
  lockedCategory,
  categories,
  subcategories,
  stores,
  types,
}: FilterPanelProps) {
  const [open, setOpen] = useState(false);
  const { navigate, isPending } = useFilterNavigation(basePath, filters, lockedCategory);
  const count = activeFilterCount(filters, lockedCategory ? ["categoria"] : []);

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate({ q: String(new FormData(event.currentTarget).get("q") ?? "").trim() });
  }

  function clearAll() {
    navigate({ ...emptyFilters, categoria: lockedCategory ? filters.categoria : "", orden: filters.orden });
  }

  return (
    <div>
      {/* Botón móvil */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="panel-filtros"
        className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-brand-blue bg-white px-4 py-2.5 font-semibold text-brand-blue lg:hidden"
      >
        <SlidersHorizontal className="size-5" aria-hidden />
        Filtros{count > 0 && ` (${count})`}
      </button>

      <div id="panel-filtros" className={`${open ? "block" : "hidden"} mt-4 lg:mt-0 lg:block`}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold uppercase text-brand-blue">Filtrar</h2>
          {isPending ? (
            <span className="inline-flex items-center gap-1 text-xs text-ink-muted" role="status">
              <Loader2 className="size-3.5 animate-spin" aria-hidden /> Actualizando
            </span>
          ) : (
            count > 0 && (
              <button type="button" onClick={clearAll} className="text-sm font-medium text-brand-blue hover:underline">
                Limpiar filtros
              </button>
            )
          )}
        </div>

        <form onSubmit={onSearch} role="search" className="relative mt-4">
          <label htmlFor="buscar" className="sr-only">
            Buscar productos
          </label>
          <input
            id="buscar"
            key={filters.q}
            name="q"
            type="search"
            defaultValue={filters.q}
            placeholder="Buscar mesa, sofá, velador…"
            className="w-full rounded-md border border-sand bg-white py-2.5 pl-3 pr-10 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
          />
          <button type="submit" aria-label="Buscar" className="absolute inset-y-0 right-0 px-3 text-brand-blue">
            <Search className="size-5" aria-hidden />
          </button>
        </form>

        <FilterGroup title="Sucursal">
          <RadioList
            name="tienda"
            value={filters.tienda}
            allLabel="Todas las tiendas"
            options={stores}
            onChange={(tienda) => navigate({ tienda })}
          />
          <p className="mt-2 text-xs text-ink-muted">Muestra los muebles con stock en esa tienda.</p>
        </FilterGroup>

        <FilterGroup title="Tipo">
          <RadioList
            name="tipo"
            value={filters.tipo}
            allLabel="Todos"
            options={types}
            onChange={(tipo) => navigate({ tipo: tipo as CatalogFilters["tipo"] })}
          />
        </FilterGroup>

        {!lockedCategory && (
          <FilterGroup title="Categoría">
            <RadioList
              name="categoria"
              value={filters.categoria}
              allLabel="Todas"
              options={categories}
              onChange={(categoria) => navigate({ categoria, sub: "" })}
            />
          </FilterGroup>
        )}

        {subcategories.length > 0 && (
          <FilterGroup title={lockedCategory ? "Tipo de mueble" : "Subcategoría"}>
            <RadioList
              name="sub"
              value={filters.sub}
              allLabel="Todas"
              options={subcategories}
              onChange={(sub) => navigate({ sub })}
            />
          </FilterGroup>
        )}

        <FilterGroup title="Precio">
          <RadioList
            name="precio"
            value={filters.precio}
            allLabel="Cualquier precio"
            options={priceRanges.map((r) => ({ value: r.value, label: r.label, count: -1 }))}
            onChange={(precio) => navigate({ precio })}
          />
        </FilterGroup>

        <FilterGroup title="Disponibilidad">
          <label className="flex cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={filters.disponible}
              onChange={(e) => navigate({ disponible: e.target.checked })}
              className="size-4 accent-brand-blue"
            />
            Solo con stock disponible
          </label>
        </FilterGroup>

        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-brand-blue px-4 py-3 font-semibold text-white lg:hidden"
        >
          <X className="size-4" aria-hidden />
          Ver resultados
        </button>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="mt-6 border-t border-sand pt-5">
      <legend className="float-left mb-3 w-full text-sm font-bold uppercase tracking-wide text-ink">{title}</legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

function RadioList({
  name,
  value,
  allLabel,
  options,
  onChange,
}: {
  name: string;
  value: string;
  allLabel: string;
  options: FacetOption[];
  onChange: (value: string) => void;
}) {
  const all: FacetOption = { value: "", label: allLabel, count: -1 };
  return (
    <ul className="space-y-2">
      {[all, ...options].map((option) => {
        const disabled = option.count === 0 && option.value !== value;
        return (
          <li key={option.value || "all"}>
            <label
              className={`flex cursor-pointer items-center gap-3 text-sm ${disabled ? "cursor-not-allowed opacity-45" : ""}`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                disabled={disabled}
                onChange={() => onChange(option.value)}
                className="size-4 accent-brand-blue"
              />
              <span className="flex-1">{option.label}</span>
              {option.count >= 0 && <span className="text-xs text-ink-muted">{option.count}</span>}
            </label>
          </li>
        );
      })}
    </ul>
  );
}

export function SortSelect({
  basePath,
  filters,
  lockedCategory,
}: {
  basePath: string;
  filters: CatalogFilters;
  lockedCategory?: boolean;
}) {
  const { navigate } = useFilterNavigation(basePath, filters, lockedCategory);
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden text-ink-muted sm:inline">Ordenar por</span>
      <select
        value={filters.orden}
        onChange={(e) => navigate({ orden: e.target.value as SortValue })}
        className="rounded-md border border-sand bg-white px-3 py-2 font-medium outline-none focus:border-brand-blue"
        aria-label="Ordenar productos"
      >
        {sortOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
