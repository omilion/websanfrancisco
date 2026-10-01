import "server-only";
import type { ErpOrder, ErpProduct, ErpProductsResponse } from "./types";

const PRODUCTS_PATH = "/api/ecommerce/productos";
// Provisoria: Seba aún no entrega el endpoint de pedidos.
const ORDERS_PATH = "/api/ecommerce/pedidos";

export function isErpConfigured(): boolean {
  return Boolean(process.env.ERP_API_URL && process.env.ERP_API_KEY);
}

async function erpFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const baseUrl = process.env.ERP_API_URL;
  const apiKey = process.env.ERP_API_KEY;
  if (!baseUrl || !apiKey) {
    throw new Error("ERP_API_URL y ERP_API_KEY deben estar definidos");
  }

  const res = await fetch(new URL(path, baseUrl), {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      [process.env.ERP_API_KEY_HEADER || "X-API-Key"]: apiKey,
      ...init.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`ERP ${init.method ?? "GET"} ${path} → ${res.status} ${body.slice(0, 200)}`);
  }
  return res;
}

/** Descarga todos los productos del ERP (el endpoint devuelve el catálogo completo, sin paginar). */
export async function fetchErpProducts(): Promise<ErpProduct[]> {
  const res = await erpFetch(PRODUCTS_PATH, { signal: AbortSignal.timeout(20_000) });
  const json = (await res.json()) as ErpProductsResponse;
  if (!Array.isArray(json?.productos)) throw new Error("ERP: respuesta sin lista de productos");
  return json.productos;
}

/** Registra en el ERP un pedido pagado con Webpay. */
export async function createErpOrder(order: ErpOrder): Promise<{ id: string }> {
  const res = await erpFetch(ORDERS_PATH, {
    method: "POST",
    body: JSON.stringify(order),
  });
  return res.json();
}
