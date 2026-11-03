import type { NextRequest } from "next/server";
import { quoteCommunes } from "@/config/site";
import { getStores } from "@/lib/site-content";
import { getCartCatalogInfo } from "@/lib/cart/catalog-info";
import { getProductBySlug } from "@/lib/catalog";
import { syncQuoteToErp } from "@/lib/quotes/erp-sync";
import { sniffFile } from "@/lib/quotes/files";
import { rateLimited } from "@/lib/quotes/rate-limit";
import { attachmentRules, toMillimeters, type QuoteRequest } from "@/lib/quotes/schema";
import { newQuoteIds, saveQuote } from "@/lib/quotes/storage";

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function error(message: string, status = 400) {
  return Response.json({ ok: false, error: message }, { status });
}

/**
 * Cotización personalizada desde la ficha de un producto: el mismo mueble con otro color o tamaño.
 * El producto base se toma del catálogo (no de lo que envía el navegador).
 */
export async function POST(request: NextRequest) {
  const stores = await getStores();
  if (rateLimited(request, "personalizada"))
    return error("Enviaste varias solicitudes seguidas. Intenta de nuevo en unos minutos.", 429);

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > attachmentRules.maxTotalBytes + 1024 * 1024) return error("Los archivos superan el tamaño permitido.", 413);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return error("No pudimos leer la solicitud.");
  }
  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(String(form.get("datos") ?? "{}"));
  } catch {
    return error("Datos inválidos.");
  }

  // ── Producto base ──
  const product = await getProductBySlug(text(raw.producto, 120));
  if (!product) return error("No encontramos el producto que quieres personalizar.");

  // ── Cambios pedidos ──
  const color = text(raw.color, 80);
  const dimensions: Record<string, number> = {};
  const rawDims = (raw.medidas ?? {}) as Record<string, unknown>;
  for (const d of ["ancho", "alto", "profundidad"]) {
    const mm = toMillimeters(rawDims[d], raw.unidad);
    if (mm !== null) dimensions[d] = mm;
  }
  const description = text(raw.descripcion, 2000);
  // Los cambios son opcionales: basta con los datos de contacto (la sucursal conversa el detalle).

  // ── Contacto ──
  const contact = {
    name: text(raw.nombre, 80),
    phone: text(raw.telefono, 30),
    email: text(raw.email, 120),
    commune: text(raw.comuna, 60),
  };
  if (!contact.name || contact.phone.replace(/\D/g, "").length < 8 || !contact.commune)
    return error("Completa tu nombre, teléfono y comuna.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) return error("Ingresa un correo válido para enviarte la cotización.");
  if (!quoteCommunes.includes(contact.commune)) return error("Elige tu comuna.");
  const store = stores.find((s) => s.slug === text(raw.tienda, 20));
  if (!store) return error("Elige la tienda que te atenderá.");

  // ── Fotos de referencia ──
  const uploads = form.getAll("archivos").filter((f): f is File => f instanceof File && f.size > 0);
  if (uploads.length > attachmentRules.maxFiles) return error(`Puedes adjuntar hasta ${attachmentRules.maxFiles} archivos.`);
  const files: { file: string; data: Buffer }[] = [];
  const attachments: QuoteRequest["attachments"] = [];
  let total = 0;
  for (const [i, upload] of uploads.entries()) {
    if (upload.size > attachmentRules.maxFileBytes) return error(`"${upload.name}" supera los 10 MB.`);
    total += upload.size;
    if (total > attachmentRules.maxTotalBytes) return error("Los archivos superan el tamaño total permitido.");
    const data = Buffer.from(await upload.arrayBuffer());
    const kind = sniffFile(data);
    if (!kind) return error(`"${upload.name}" no es una imagen o PDF válido.`);
    const file = `archivo-${i + 1}.${kind.ext}`;
    files.push({ file, data });
    attachments.push({ file, name: text(upload.name, 120) || file, type: kind.type, size: upload.size });
  }

  const catalog = await getCartCatalogInfo();
  const price = catalog[product.sku]?.price ?? product.price;
  const details: QuoteRequest["details"] = [];
  if (color) details.push({ label: "Color o terminación pedida", value: color });
  const { id, code } = newQuoteIds();
  const quote: QuoteRequest = {
    id,
    code,
    kind: "personalizada",
    createdAt: new Date().toISOString(),
    type: "personalizada",
    typeName: "Personalización de producto",
    dimensions,
    unidad: "mm",
    details,
    material: "",
    finish: "",
    description,
    deadline: "",
    contact,
    store: store.slug,
    attachments,
    product: { sku: product.sku, slug: product.slug, name: product.name, price },
  };

  try {
    await saveQuote(quote, files);
  } catch (e) {
    console.error("No se pudo guardar la cotización personalizada", e);
    return error("No pudimos guardar tu solicitud. Intenta de nuevo o escríbenos por WhatsApp.", 500);
  }

  // Llega al módulo Cotizaciones del ERP como "personalizada". Si el ERP no responde, se reintenta luego.
  // El cliente recibe el código del ERP (el mismo que ve el vendedor); si el ERP no respondió, el de la tienda.
  const synced = await syncQuoteToErp(quote);

  return Response.json({ ok: true, id, code: synced.erp?.codigo ?? code });
}
