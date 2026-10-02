import "server-only";
import type { ErpOrder, ErpOrderResult, ErpProduct, ErpProductsResponse, ErpQuote, ErpSiteContent } from "./types";

const PRODUCTS_PATH = "/api/ecommerce/productos";
const ORDERS_PATH = "/api/ecommerce/pedidos";
const QUOTES_PATH = "/api/ecommerce/cotizaciones";
const SITE_PATH = "/api/ecommerce/sitio";

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

/** Contenido editable de la tienda: carrusel, banner, sección a medida y sucursales visibles en la web. */
export async function fetchErpSiteContent(): Promise<ErpSiteContent> {
  const res = await erpFetch(SITE_PATH, { signal: AbortSignal.timeout(10_000) });
  const json = (await res.json()) as ErpSiteContent;
  if (!Array.isArray(json?.slides) || !Array.isArray(json?.sucursales)) throw new Error("ERP: respuesta de sitio incompleta");
  return json;
}

/** Registra en el ERP un pedido pagado con Webpay (idempotente por `orden_compra`). */
export async function createErpOrder(order: ErpOrder): Promise<ErpOrderResult> {
  const res = await erpFetch(ORDERS_PATH, {
    method: "POST",
    body: JSON.stringify(order),
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  return res.json();
}

export interface ErpQuoteFile {
  name: string;
  type: string;
  data: Buffer;
}

/** Envía una cotización (personalizada o a medida) al módulo de cotizaciones del ERP. */
export async function createErpQuote(quote: ErpQuote, files: ErpQuoteFile[] = []): Promise<{ id: number; codigo: string }> {
  const form = new FormData();
  form.set("datos", JSON.stringify(quote));
  for (const f of files) form.append("archivos", new Blob([new Uint8Array(f.data)], { type: f.type }), f.name);

  const baseUrl = process.env.ERP_API_URL;
  const apiKey = process.env.ERP_API_KEY;
  if (!baseUrl || !apiKey) throw new Error("ERP_API_URL y ERP_API_KEY deben estar definidos");
  const res = await fetch(new URL(QUOTES_PATH, baseUrl), {
    method: "POST",
    headers: { Accept: "application/json", [process.env.ERP_API_KEY_HEADER || "X-API-Key"]: apiKey },
    body: form,
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`ERP POST ${QUOTES_PATH} → ${res.status} ${(await res.text().catch(() => "")).slice(0, 200)}`);
  return res.json();
}
