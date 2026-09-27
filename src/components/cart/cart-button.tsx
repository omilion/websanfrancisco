"use client";

import { ShoppingBag } from "lucide-react";
import type { CartCatalogInfo } from "@/lib/cart/catalog-info";
import { toggleCartDrawer, useCartCount, useCartDrawer } from "@/lib/cart/store";
import { CartDrawer } from "./cart-drawer";

/** Botón del carrito: abre y cierra el modal del carrito, anclado bajo el botón. */
export function CartButton({ catalog }: { catalog: CartCatalogInfo }) {
  const count = useCartCount();
  const { open } = useCartDrawer();

  return (
    <div className="relative">
      <button
        type="button"
        data-cart-toggle
        onClick={toggleCartDrawer}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={count > 0 ? `Carrito, ${count} ${count === 1 ? "producto" : "productos"}` : "Carrito vacío"}
        className="relative rounded-full p-2 text-brand-blue transition-colors hover:bg-sand"
      >
        <ShoppingBag className="size-6" aria-hidden />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-brand-orange px-1 text-[11px] font-bold leading-5 text-ink">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>
      <CartDrawer catalog={catalog} />
    </div>
  );
}
