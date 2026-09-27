"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { addToCart, openCartDrawer, useCart } from "@/lib/cart/store";

interface AddToCartProps {
  sku: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  stock: number;
}

export function AddToCart({ sku, slug, name, price, image, stock }: AddToCartProps) {
  const inCart = useCart().find((item) => item.sku === sku)?.quantity ?? 0;
  const available = Math.max(0, stock - inCart);
  const [quantity, setQuantity] = useState(1);
  const qty = Math.min(quantity, Math.max(1, available));

  function handleAdd() {
    addToCart({ sku, slug, name, price, image, maxQuantity: stock }, qty);
    setQuantity(1);
    openCartDrawer(sku);
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex items-center rounded-md border border-sand bg-white" role="group" aria-label="Cantidad">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, qty - 1))}
            disabled={qty <= 1}
            aria-label="Quitar uno"
            className="p-3 text-brand-blue disabled:opacity-30"
          >
            <Minus className="size-4" aria-hidden />
          </button>
          <span className="w-10 text-center font-semibold tabular-nums" aria-live="polite">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQuantity(Math.min(available, qty + 1))}
            disabled={qty >= available}
            aria-label="Agregar uno"
            className="p-3 text-brand-blue disabled:opacity-30"
          >
            <Plus className="size-4" aria-hidden />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={available === 0}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-brand-blue px-6 py-3.5 font-semibold text-white transition-colors hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:bg-ink-muted"
        >
          <ShoppingBag className="size-5" aria-hidden />
          {available === 0 ? "Ya tienes todo el stock en tu carrito" : "Agregar al carrito"}
        </button>
      </div>
    </div>
  );
}
