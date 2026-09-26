"use client";

import { useSyncExternalStore } from "react";

// Carrito guardado en el navegador (localStorage). Solo guarda lo necesario para mostrarlo;
// al pagar, el servidor vuelve a validar precio y stock contra el catálogo antes de ir a Webpay.

export interface CartItem {
  sku: string;
  slug: string;
  name: string;
  /** Precio unitario al momento de agregar (referencial, se revalida al pagar). */
  price: number;
  image: string;
  quantity: number;
  /** Stock máximo disponible al agregar. */
  maxQuantity: number;
  /** Se completa cuando bajamos la cantidad porque bajó el stock (para avisarle al cliente). */
  adjustedTo?: number;
}

const STORAGE_KEY = "sf-carrito-v1";
const EMPTY: CartItem[] = [];

let items: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (Array.isArray(parsed)) items = parsed;
  } catch {
    items = EMPTY;
  }
}

function emit(next: CartItem[]) {
  items = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Navegación privada o almacenamiento bloqueado: el carrito vive solo en esta pestaña.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Mantiene el carrito sincronizado entre pestañas.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    loaded = false;
    load();
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  load();
  return items;
}

export function useCart() {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

export function useCartCount() {
  return useCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function addToCart(item: Omit<CartItem, "quantity">, quantity: number) {
  load();
  const existing = items.find((i) => i.sku === item.sku);
  const nextQuantity = Math.min((existing?.quantity ?? 0) + quantity, item.maxQuantity);
  const updated = { ...item, quantity: nextQuantity };
  emit(existing ? items.map((i) => (i.sku === item.sku ? updated : i)) : [...items, updated]);
  return nextQuantity;
}

export function setQuantity(sku: string, quantity: number) {
  load();
  emit(
    items
      .map((i) =>
        i.sku === sku
          ? { ...i, quantity: Math.min(Math.max(0, quantity), i.maxQuantity), adjustedTo: undefined }
          : i,
      )
      .filter((i) => i.quantity > 0),
  );
}

/** Sincroniza el carrito con el stock vigente (`stockBySku`): baja cantidades que lo superan y marca el ajuste. */
export function clampToStock(stockBySku: Record<string, number>) {
  load();
  let changed = false;
  const next = items.map((i) => {
    const stock = stockBySku[i.sku];
    if (stock === undefined || stock <= 0) return i;
    if (i.quantity > stock) {
      changed = true;
      return { ...i, quantity: stock, maxQuantity: stock, adjustedTo: stock };
    }
    // El stock también puede subir: actualiza el tope sin avisar.
    if (i.maxQuantity !== stock) {
      changed = true;
      return { ...i, maxQuantity: stock };
    }
    return i;
  });
  if (changed) emit(next);
}

export function removeFromCart(sku: string) {
  setQuantity(sku, 0);
}

export function clearCart() {
  emit(EMPTY);
}
