import { shippingCommunes, stores } from "@/config/site";
import { getLiveCartCatalogInfo } from "@/lib/cart/catalog-info";
import { newAccessKey, newBuyOrder, saveOrder, type OrderLine, type StoredOrder } from "@/lib/orders/storage";
import { rateLimited } from "@/lib/quotes/rate-limit";
import { isValidRut, formatRut } from "@/lib/rut";
import { createTransaction } from "@/lib/webpay/client";

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function error(message: string, status = 400) {
  return Response.json({ ok: false, error: message }, { status });
}

function siteUrl(request: Request): string {
  const configured = process.env.SITE_URL?.trim().replace(/\/+$/, "");
  return configured || new URL(request.url).origin;
}

/**
 * Crea la transacción de Webpay. Precio y stock se toman del catálogo vigente (nunca del navegador);
 * el despacho y el armado no se cobran aquí, se coordinan después con la tienda.
 */
export async function POST(request: Request) {
  if (rateLimited(request, "pago", 12)) return error("Hiciste varios intentos seguidos. Espera unos minutos y vuelve a intentar.", 429);

  let raw: Record<string, unknown>;
  try {
    raw = await request.json();
  } catch {
    return error("Datos inválidos.");
  }

  // ── Productos: precio y stock vigentes ──
  let catalog;
  try {
    catalog = await getLiveCartCatalogInfo({ strict: true });
  } catch {
    return error("No pudimos confirmar el stock en este momento. Intenta de nuevo en unos minutos.", 503);
  }
  const requested = Array.isArray(raw.items) ? raw.items.slice(0, 50) : [];
  const lines: OrderLine[] = [];
  for (const entry of requested as { sku?: unknown; quantity?: unknown }[]) {
    const sku = text(entry?.sku, 60);
    const quantity = Math.floor(Number(entry?.quantity));
    if (!sku || !(quantity > 0)) continue;
    const info = catalog[sku];
    if (!info || info.price === null || info.stock <= 0)
      return error("Uno de los productos de tu carrito ya no está disponible. Revisa el carrito y vuelve a intentar.");
    if (quantity > info.stock)
      return error(`Solo quedan ${info.stock} unidad(es) de "${info.name}". Ajusta la cantidad en el carrito.`);
    const existing = lines.find((l) => l.sku === sku);
    if (existing) {
      existing.quantity += quantity;
      if (existing.quantity > info.stock) return error(`Solo quedan ${info.stock} unidad(es) de "${info.name}".`);
    } else {
      lines.push({ sku, name: info.name, quantity, unitPrice: info.price });
    }
  }
  if (lines.length === 0) return error("Tu carrito está vacío o sus productos ya no están disponibles.");
  const amount = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  if (!Number.isInteger(amount) || amount < 50) return error("El monto del pedido no es válido.");

  // ── Cliente ──
  const name = text(raw.nombre, 80);
  const email = text(raw.email, 120);
  const phone = text(raw.telefono, 30);
  const rutInput = text(raw.rut, 14);
  if (!name || phone.replace(/\D/g, "").length < 8) return error("Completa tu nombre y teléfono.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return error("Ingresa un correo válido: ahí te llega el comprobante.");
  if (rutInput && !isValidRut(rutInput)) return error("El RUT no es válido.");
  if (raw.terminos !== true) return error("Debes aceptar los términos y condiciones.");

  // ── Entrega ──
  const type = raw.entrega === "retiro" ? "retiro" : "despacho";
  const storeSlug = text(raw.tienda, 20);
  let address = "";
  let commune = "";
  if (type === "despacho") {
    address = text(raw.direccion, 160);
    commune = text(raw.comuna, 40);
    if (!address || !shippingCommunes.includes(commune)) return error("Completa la dirección y la comuna de despacho.");
  } else if (!stores.some((s) => s.slug === storeSlug)) {
    return error("Elige la tienda donde retirarás tu pedido.");
  }

  const buyOrder = newBuyOrder();
  const order: StoredOrder = {
    buyOrder,
    accessKey: newAccessKey(),
    sessionId: newAccessKey(),
    createdAt: new Date().toISOString(),
    status: "iniciado",
    amount,
    lines,
    customer: { name, email, phone, rut: rutInput ? formatRut(rutInput) : "", address, commune },
    delivery: { type, store: stores.some((s) => s.slug === storeSlug) ? storeSlug : "", reference: type === "despacho" ? text(raw.referencia, 160) : "" },
    assembly: raw.armado === true,
    comments: text(raw.comentarios, 1000),
  };

  try {
    const tx = await createTransaction({
      buyOrder,
      sessionId: order.sessionId,
      amount,
      returnUrl: `${siteUrl(request)}/checkout/webpay/retorno`,
    });
    order.token = tx.token;
    await saveOrder(order);
    return Response.json({ ok: true, url: tx.url, token: tx.token, buyOrder });
  } catch (e) {
    console.error("No se pudo iniciar el pago con Webpay", e);
    return error("No pudimos conectar con Webpay. Intenta de nuevo en unos minutos o escríbenos por WhatsApp.", 502);
  }
}
