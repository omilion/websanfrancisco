"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowRight, Loader2, Search, X } from "lucide-react";
import type { SearchSuggestion } from "@/lib/catalog/search";
import { normalize } from "@/lib/catalog/filters";
import { formatPrice } from "@/lib/format";

const POPULAR = ["Mesa de comedor", "Sofá", "Closet a medida", "Velador", "Cama", "Rack TV"];
const EMPTY: SearchSuggestion = { products: [], categories: [], total: 0 };

interface SearchBoxProps {
  /** Categorías para mostrar cuando el campo está vacío. */
  categories: { slug: string; name: string }[];
  /** Se llama al navegar (ej. para cerrar el menú móvil). */
  onNavigate?: () => void;
  autoFocus?: boolean;
}

export function SearchBox({ categories, onNavigate, autoFocus }: SearchBoxProps) {
  const router = useRouter();
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cache = useRef(new Map<string, SearchSuggestion>());

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ q: string; data: SearchSuggestion }>({ q: "", data: EMPTY });
  const [active, setActive] = useState(-1);

  const trimmed = query.trim();
  const data = trimmed && result.q === trimmed ? result.data : EMPTY;
  const seeAllHref = `/productos?q=${encodeURIComponent(trimmed)}`;
  // Opciones navegables con teclado: productos + "ver todos".
  const options = trimmed ? [...data.products.map((p) => `/productos/${p.slug}`), seeAllHref] : [];

  // Búsqueda con espera corta mientras se escribe.
  useEffect(() => {
    if (!trimmed) return;
    const cached = cache.current.get(trimmed);
    if (cached) {
      queueMicrotask(() => setResult({ q: trimmed, data: cached }));
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/buscar?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal });
        const json = (await res.json()) as SearchSuggestion;
        cache.current.set(trimmed, json);
        setResult({ q: trimmed, data: json });
      } catch {
        // búsqueda cancelada o sin conexión: se mantiene lo anterior
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 160);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

  // Cierra al hacer clic fuera.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function go(href: string) {
    setOpen(false);
    setActive(-1);
    inputRef.current?.blur();
    onNavigate?.();
    router.push(href);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (active >= 0 && options[active]) return go(options[active]);
    if (trimmed) go(seeAllHref);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (options.length ? (i + 1) % options.length : -1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (options.length ? (i <= 0 ? options.length - 1 : i - 1) : -1));
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
      inputRef.current?.blur();
    }
  }

  const listId = `${id}-lista`;
  const optionId = (i: number) => `${id}-op-${i}`;

  return (
    <div ref={rootRef} className="relative w-full">
      <form onSubmit={onSubmit} role="search">
        <label htmlFor={`${id}-input`} className="sr-only">
          Buscar muebles
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-ink-muted" aria-hidden />
          <input
            ref={inputRef}
            id={`${id}-input`}
            type="search"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? optionId(active) : undefined}
            autoComplete="off"
            autoFocus={autoFocus}
            enterKeyHint="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(-1);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder="Busca mesas, sofás, closets o SKU…"
            className="h-11 w-full rounded-full border border-sand bg-white pl-11 pr-20 text-[15px] outline-none transition placeholder:text-ink-muted/80 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 [&::-webkit-search-cancel-button]:hidden"
          />
          <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
            {loading && <Loader2 className="size-4 animate-spin text-ink-muted" aria-label="Buscando" />}
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="Borrar búsqueda"
                className="rounded-full p-1.5 text-ink-muted hover:bg-sand"
              >
                <X className="size-4" aria-hidden />
              </button>
            )}
            <button
              type="submit"
              aria-label="Buscar"
              className="flex size-8 items-center justify-center rounded-full bg-brand-blue text-white hover:bg-brand-blue-dark"
            >
              <ArrowRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      </form>

      {open && (
        <div
          id={listId}
          role="listbox"
          aria-label="Sugerencias de búsqueda"
          className="absolute inset-x-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-xl bg-white p-2 shadow-2xl ring-1 ring-sand"
        >
          {!trimmed ? (
            <div className="p-3">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-ink-muted">Búsquedas frecuentes</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {POPULAR.map((term) => (
                  <li key={term}>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery(term);
                        inputRef.current?.focus();
                      }}
                      className="rounded-full bg-cream px-3 py-1.5 text-sm font-medium text-ink ring-1 ring-sand transition hover:bg-sand"
                    >
                      {term}
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.15em] text-ink-muted">Categorías</p>
              <ul className="mt-2 grid grid-cols-2 gap-1">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/categoria/${c.slug}`}
                      onClick={() => {
                        setOpen(false);
                        onNavigate?.();
                      }}
                      className="block rounded-md px-2 py-1.5 text-sm hover:bg-cream hover:text-brand-blue"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : result.q !== trimmed ? (
            <p className="p-4 text-sm text-ink-muted">Buscando…</p>
          ) : data.total === 0 ? (
            <div className="p-4 text-sm">
              <p>
                No encontramos <strong>“{trimmed}”</strong>.
              </p>
              <p className="mt-1 text-ink-muted">
                ¿Lo buscas con otras medidas o terminación?{" "}
                <Link href="/cotizar" onClick={() => go("/cotizar")} className="font-semibold text-brand-blue underline">
                  Te lo fabricamos a medida
                </Link>
                .
              </p>
            </div>
          ) : (
            <>
              {data.categories.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 px-3 pb-2 pt-2">
                  <span className="text-xs font-bold uppercase tracking-[0.15em] text-ink-muted">En</span>
                  {data.categories.map((c) => (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => go(`/categoria/${c.slug}?q=${encodeURIComponent(trimmed)}`)}
                      className="rounded-full bg-brand-blue/10 px-3 py-1 text-sm font-medium text-brand-blue hover:bg-brand-blue/15"
                    >
                      {c.name} <span className="text-brand-blue/60">({c.count})</span>
                    </button>
                  ))}
                </div>
              )}
              <ul>
                {data.products.map((p, i) => (
                  <li key={p.slug} id={optionId(i)} role="option" aria-selected={active === i}>
                    <button
                      type="button"
                      onClick={() => go(`/productos/${p.slug}`)}
                      onMouseEnter={() => setActive(i)}
                      className={`flex w-full items-center gap-3 rounded-lg p-2 text-left transition ${active === i ? "bg-cream" : ""}`}
                    >
                      <span className="relative size-14 shrink-0 overflow-hidden rounded-md bg-cream ring-1 ring-sand">
                        <Image src={p.image} alt="" fill sizes="56px" className="object-cover" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          <Highlight text={p.name} query={trimmed} />
                        </span>
                        <span className="block text-xs text-ink-muted">
                          {p.category}
                          {p.saleMode === "a-medida" ? " · A medida" : p.inStock ? " · En stock" : " · Agotado"}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-bold text-brand-blue">
                        {p.price !== null ? formatPrice(p.price) : "Cotizar"}
                      </span>
                    </button>
                  </li>
                ))}
                <li id={optionId(data.products.length)} role="option" aria-selected={active === data.products.length}>
                  <button
                    type="button"
                    onClick={() => go(seeAllHref)}
                    onMouseEnter={() => setActive(data.products.length)}
                    className={`mt-1 flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold text-brand-blue transition ${active === data.products.length ? "bg-cream" : ""}`}
                  >
                    Ver {data.total === 1 ? "el resultado" : `los ${data.total} resultados`} para “{trimmed}”
                    <ArrowRight className="size-4" aria-hidden />
                  </button>
                </li>
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/** Resalta la parte del nombre que coincide con la búsqueda (sin importar tildes). */
function Highlight({ text, query }: { text: string; query: string }) {
  const term = normalize(query).trim().split(/\s+/)[0];
  const index = term ? normalize(text).indexOf(term) : -1;
  if (index < 0 || normalize(text).length !== text.length) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <mark className="bg-transparent font-bold text-brand-blue">{text.slice(index, index + term.length)}</mark>
      {text.slice(index + term.length)}
    </>
  );
}
