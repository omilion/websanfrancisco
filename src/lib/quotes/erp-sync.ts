import "server-only";
import { createErpQuote } from "@/lib/erp/client";
import type { ErpQuote } from "@/lib/erp/types";
import type { QuoteRequest } from "./schema";
import { listQuoteIds, readAttachment, readQuote, saveQuote } from "./storage";

// Las cotizaciones se guardan primero en la tienda (el cliente nunca pierde su solicitud) y luego se envían
// al módulo Cotizaciones del ERP: "personalizada" (un producto con cambios) y "a medida" (proyecto).
// "productos" (cotización del carrito sin pago en línea) no se envía.

const SYNCED_KINDS = new Set(["a-medida", "personalizada", undefined]);

export function quoteToErp(quote: QuoteRequest): ErpQuote {
  const personalized = quote.kind === "personalizada";
  const fields = [...quote.details];
  if (quote.finish) fields.push({ label: "Color o terminación", value: quote.finish });
  return {
    referencia: quote.id,
    codigo: quote.code,
    tipo: personalized ? "PERSONALIZADA" : "A_MEDIDA",
    titulo: personalized && quote.product ? `Personalización de ${quote.product.name}` : `${quote.typeName} a medida`,
    tienda: quote.store,
    cliente: {
      nombre: quote.contact.name,
      telefono: quote.contact.phone,
      email: quote.contact.email || undefined,
      comuna: quote.contact.commune || undefined,
    },
    producto: quote.product ? { sku: quote.product.sku, nombre: quote.product.name, precio: quote.product.price } : undefined,
    descripcion: quote.description || undefined,
    detalle: {
      medidas: quote.dimensions,
      campos: fields.map((f) => ({ label: f.label, value: f.value })),
      material: quote.material || undefined,
      terminacion: quote.finish || undefined,
      plazo: quote.deadline || undefined,
    },
  };
}

/** Envía la cotización al ERP y deja constancia en su archivo. Nunca lanza: si falla, se reintenta luego. */
export async function syncQuoteToErp(quote: QuoteRequest): Promise<QuoteRequest> {
  if (!SYNCED_KINDS.has(quote.kind) || quote.erp?.id) return quote;
  try {
    const files = [];
    for (const a of quote.attachments) {
      const data = await readAttachment(quote.id, a.file);
      if (data) files.push({ name: a.name, type: a.type, data });
    }
    const result = await createErpQuote(quoteToErp(quote), files);
    const synced: QuoteRequest = { ...quote, erp: { id: result.id, syncedAt: new Date().toISOString() } };
    await saveQuote(synced, []);
    return synced;
  } catch (e) {
    console.error(`No se pudo enviar la cotización ${quote.code} al ERP`, e);
    const failed: QuoteRequest = {
      ...quote,
      erp: { error: e instanceof Error ? e.message.slice(0, 300) : "error", attempts: (quote.erp?.attempts ?? 0) + 1 },
    };
    await saveQuote(failed, []).catch(() => {});
    return failed;
  }
}

/** Reintenta las cotizaciones que aún no llegaron al ERP. */
export async function retryUnsyncedQuotes(): Promise<{ pending: number; synced: number }> {
  let pending = 0;
  let synced = 0;
  for (const id of await listQuoteIds()) {
    const quote = await readQuote(id);
    if (!quote || !SYNCED_KINDS.has(quote.kind) || quote.erp?.id) continue;
    pending++;
    if ((await syncQuoteToErp(quote)).erp?.id) synced++;
  }
  return { pending, synced };
}
