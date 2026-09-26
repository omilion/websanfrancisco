import "server-only";
import type { ErpOrder, ErpPage, ErpProduct } from "./types";

// Rutas provisorias: se ajustan cuando Seba confirme el endpoint.
const PRODUCTS_PATH = "/productos";
const ORDERS_PATH = "/pedidos";
const MAX_PAGES = 100;

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
      [process.env.ERP_API_KEY_HEADER || "x-api-key"]: apiKey,
      ...init.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`ERP ${init.method ?? "GET"} ${path} → ${res.status} ${body.slice(0, 200)}`);
  }
  return res;
}

/** Descarga todos los productos, recorriendo páginas si el ERP pagina. */
export async function fetchErpProducts(): Promise<ErpProduct[]> {
  const products: ErpProduct[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await erpFetch(`${PRODUCTS_PATH}?page=${page}`);
    const json = (await res.json()) as ErpPage<ErpProduct> | ErpProduct[];

    if (Array.isArray(json)) return json; // sin paginación
    products.push(...json.data);
    if (!json.total_pages || page >= json.total_pages) break;
  }

  return products;
}

/** Registra en el ERP un pedido pagado con Webpay. */
export async function createErpOrder(order: ErpOrder): Promise<{ id: string }> {
  const res = await erpFetch(ORDERS_PATH, {
    method: "POST",
    body: JSON.stringify(order),
  });
  return res.json();
}
