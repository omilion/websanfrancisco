import { timingSafeEqual } from "node:crypto";
import { retryUnregisteredOrders } from "@/lib/orders/process";
import { retryUnsyncedQuotes } from "@/lib/quotes/erp-sync";

/** Reintenta enviar al ERP los pedidos cobrados y las cotizaciones que no llegaron. Protegido con ERP_WEBHOOK_SECRET (para un cron). */
export async function POST(request: Request) {
  const secret = process.env.ERP_WEBHOOK_SECRET;
  const given = request.headers.get("x-webhook-secret") ?? "";
  const ok =
    Boolean(secret) && given.length === secret!.length && timingSafeEqual(Buffer.from(given), Buffer.from(secret!));
  if (!ok) return Response.json({ ok: false }, { status: 401 });
  const orders = await retryUnregisteredOrders();
  const quotes = await retryUnsyncedQuotes();
  return Response.json({ ok: true, orders, quotes });
}
