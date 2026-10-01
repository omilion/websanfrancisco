"use client";

import { useEffect } from "react";
import { clearCart } from "@/lib/cart/store";

/** Vacía el carrito cuando el pago quedó aprobado (el pedido ya está en manos de la tienda). */
export function ClearCart() {
  useEffect(() => {
    clearCart();
  }, []);
  return null;
}
