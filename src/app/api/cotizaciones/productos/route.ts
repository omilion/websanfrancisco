import { shippingCommunes } from "@/config/site";
import { getStores } from "@/lib/site-content";
import { getCartCatalogInfo } from "@/lib/cart/catalog-info";
import { rateLimited } from "@/lib/quotes/rate-limit";
import type { QuoteRequest } from "@/lib/quotes/schema";
import { newQuoteIds, saveQuote } from "@/lib/quotes/storage";

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function error(message: string, status = 400) {
  return Response.json({ ok: false, error: message }, { status });
}

/**
 * Solicitud de cotización desde el carrito (modo sin pago en línea).
 * Precios y stock se toman del catálogo vigente, nunca de lo que envía el navegador.
 */
export async function POST(request: Request) {
  const stores = await getStores();
  if (rateLimited(request)) return error("Enviaste varias solicitudes seguidas. Intenta de nuevo en unos minutos.", 429);

  let raw: Record<string, unknown>;
  try {
    raw = await request.json();
  } catch {
    return error("Datos inválidos.");
  }

  // ── Productos ──
  const catalog = await getCartCatalogInfo();
  const requested = Array.isArray(raw.items) ? raw.items.slice(0, 50) : [];
  const items: NonNullable<QuoteRequest["items"]> = [];
  for (const entry of requested as { sku?: unknown; quantity?: unknown }[]) {
    const sku = text(entry?.sku, 60);
    const info = catalog[sku];
    const quantity = Math.floor(Number(entry?.quantity));
    if (!info || info.price === null || info.stock <= 0 || !(quantity > 0)) continue;
    items.push({ sku, name: info.name, quantity: Math.min(quantity, info.stock), unitPrice: info.price });
  }
  if (items.length === 0) return error("Tu carrito está vacío o sus productos ya no están disponibles.");

  // ── Contacto ──
  const contact = {
    name: text(raw.nombre, 80),
    phone: text(raw.telefono, 30),
    email: text(raw.email, 120),
    commune: "",
  };
  if (!contact.name || contact.phone.replace(/\D/g, "").length < 8) return error("Completa tu nombre y teléfono.");
  if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) return error("El correo no es válido.");

  const store = stores.find((s) => s.slug === text(raw.tienda, 20));
  if (!store) return error("Elige la tienda que te atenderá.");

  // ── Entrega ──
  const details: QuoteRequest["details"] = [];
  if (raw.entrega === "despacho") {
    const address = text(raw.direccion, 160);
    const commune = text(raw.comuna, 40);
    if (!address || !shippingCommunes.includes(commune)) return error("Completa la dirección y la comuna de despacho.");
    contact.commune = commune;
    details.push({ label: "Entrega", value: "Despacho a domicilio" });
    details.push({ label: "Dirección", value: address });
    const reference = text(raw.referencia, 160);
    if (reference) details.push({ label: "Referencia", value: reference });
  } else {
    contact.commune = store.city;
    details.push({ label: "Entrega", value: `Retiro en tienda ${store.city}` });
  }
  details.push({ label: "Armado e instalación", value: raw.armado === true ? "Sí, cotizar" : "No" });

  const { id, code } = newQuoteIds();
  const quote: QuoteRequest = {
    id,
    code,
    kind: "productos",
    createdAt: new Date().toISOString(),
    type: "productos",
    typeName: "Productos del catálogo",
    dimensions: {},
    details,
    material: "",
    finish: "",
    description: text(raw.comentarios, 2000),
    deadline: "",
    contact,
    store: store.slug,
    attachments: [],
    items,
  };

  try {
    await saveQuote(quote, []);
  } catch (e) {
    console.error("No se pudo guardar la cotización de productos", e);
    return error("No pudimos guardar tu solicitud. Intenta de nuevo o escríbenos por WhatsApp.", 500);
  }

  return Response.json({ ok: true, id, code });
}
