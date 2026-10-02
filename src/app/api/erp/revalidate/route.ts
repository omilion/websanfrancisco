import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { CATALOG_TAG } from "@/lib/catalog";
import { SITE_CONTENT_TAG } from "@/lib/site-content";

/**
 * Webhook para el ERP: cuando cambia un producto, precio o stock, o el contenido del módulo Sitio web
 * (carrusel, banner, sección a medida, sucursales), el ERP hace
 *   POST /api/erp/revalidate   con header  x-webhook-secret: <ERP_WEBHOOK_SECRET>
 * y la tienda vuelve a descargar el catálogo y el contenido.
 */
export async function POST(request: Request) {
  const expected = process.env.ERP_WEBHOOK_SECRET;
  const received = request.headers.get("x-webhook-secret") ?? "";

  if (!expected || !safeEqual(received, expected)) {
    return Response.json({ ok: false }, { status: 401 });
  }

  revalidateTag(CATALOG_TAG, "max");
  revalidateTag(SITE_CONTENT_TAG, "max");
  return Response.json({ ok: true });
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}
