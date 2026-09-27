"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageCircle, ShoppingBag } from "lucide-react";
import { addToCart, openCartDrawer, useCart } from "@/lib/cart/store";
import { formatPrice } from "@/lib/format";

type Action =
  | { kind: "comprar"; sku: string; slug: string; image: string; stock: number }
  | { kind: "cotizar"; href: string }
  | { kind: "consultar"; href: string };

interface MobileBuyBarProps {
  name: string;
  price: number | null;
  action: Action;
  /** id del bloque de compra principal: la barra aparece cuando ese bloque sale de la pantalla. */
  targetId: string;
}

/** Barra fija inferior en celular con precio y acción principal de la ficha de producto. */
export function MobileBuyBar({ name, price, action, targetId }: MobileBuyBarProps) {
  const [visible, setVisible] = useState(false);
  const cart = useCart();

  // Visible cuando el bloque de compra ya quedó arriba de la pantalla. Se revisa en cada scroll
  // (un IntersectionObserver no avisa si un scroll rápido salta el bloque sin que llegue a verse).
  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    let frame = 0;
    const check = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setVisible(target.getBoundingClientRect().bottom < 0));
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [targetId]);

  const inCart = action.kind === "comprar" ? (cart.find((i) => i.sku === action.sku)?.quantity ?? 0) : 0;
  const soldOutForYou = action.kind === "comprar" && inCart >= action.stock;
  const buttonClass =
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors";

  return (
    <div
      data-buy-bar
      aria-hidden={!visible}
      inert={!visible}
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-sand bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_30px_-18px_rgba(1,42,72,0.45)] backdrop-blur transition-transform duration-300 ease-out lg:hidden ${visible ? "translate-y-0" : "translate-y-full"}`}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{name}</p>
          <p className="text-base font-bold text-brand-blue">
            {price !== null ? formatPrice(price) : "Precio según medidas"}
          </p>
        </div>

        {action.kind === "comprar" && (
          <button
            type="button"
            disabled={soldOutForYou}
            onClick={() => {
              addToCart(
                {
                  sku: action.sku,
                  slug: action.slug,
                  name,
                  price: price ?? 0,
                  image: action.image,
                  maxQuantity: action.stock,
                },
                1,
              );
              openCartDrawer(action.sku);
            }}
            className={`${buttonClass} bg-brand-blue text-white hover:bg-brand-blue-dark disabled:bg-ink-muted`}
          >
            <ShoppingBag className="size-4" aria-hidden />
            {soldOutForYou ? "En tu carrito" : "Agregar"}
          </button>
        )}
        {action.kind === "cotizar" && (
          <Link
            href={action.href}
            className={`${buttonClass} bg-brand-blue text-white hover:bg-brand-blue-dark`}
          >
            Cotizar sin costo
          </Link>
        )}
        {action.kind === "consultar" && (
          <a
            href={action.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${buttonClass} bg-brand-blue text-white hover:bg-brand-blue-dark`}
          >
            <MessageCircle className="size-4" aria-hidden />
            Consultar
          </a>
        )}
      </div>
    </div>
  );
}
