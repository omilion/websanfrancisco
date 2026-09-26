"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Search, X } from "lucide-react";
import { SearchBox } from "./search-box";

/** Ícono de búsqueda que abre el buscador a pantalla completa (pantallas chicas). */
export function MobileSearch({ categories }: { categories: { slug: string; name: string }[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir buscador"
        className="rounded-md p-2 text-brand-blue hover:bg-sand md:hidden"
      >
        <Search className="size-6" aria-hidden />
      </button>

      {/* Portal al <body>: el backdrop-blur del header encerraría una capa fija. */}
      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Buscar productos"
            className="animate-fade-in fixed inset-0 z-50 bg-cream md:hidden"
          >
            <div className="flex items-start gap-2 border-b border-sand px-4 py-3">
              <div className="flex-1">
                <SearchBox categories={categories} onNavigate={() => setOpen(false)} autoFocus />
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar búsqueda"
                className="mt-0.5 rounded-md p-2 text-brand-blue hover:bg-sand"
              >
                <X className="size-6" aria-hidden />
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
