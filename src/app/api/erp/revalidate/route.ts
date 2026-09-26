import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { CATALOG_TAG } from "@/lib/catalog";

/**
 * Webhook para el ERP: cuando cambia un producto, precio o stock, el ERP hace
 *   POST /api/erp/revalidate   con header  x-webhook-secret: <ERP_WEBHOOK_SECRET>
 * y la tienda vuelve a descargar el catálogo.
 */
export async function POST(request: Request) {
  const expected = process.env.ERP_WEBHOOK_SECRET;
  const received = request.headers.get("x-webhook-secret") ?? "";

  if (!expected || !safeEqual(received, expected)) {
    return Response.json({ ok: false }, { status: 401 });
  }

  revalidateTag(CATALOG_TAG, "max");
  return Response.json({ ok: true });
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}
