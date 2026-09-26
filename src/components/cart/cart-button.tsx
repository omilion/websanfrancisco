"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartCount } from "@/lib/cart/store";

export function CartButton() {
  const count = useCartCount();

  return (
    <Link
      href="/carrito"
      aria-label={count > 0 ? `Carrito, ${count} ${count === 1 ? "producto" : "productos"}` : "Carrito vacío"}
      className="relative rounded-md p-2 text-brand-blue transition-colors hover:bg-sand"
    >
      <ShoppingBag className="size-6" aria-hidden />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-brand-orange px-1 text-[11px] font-bold leading-5 text-ink">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
