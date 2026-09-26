import type { NextRequest } from "next/server";
import { searchCatalog } from "@/lib/catalog/search";

/** Autocompletado del buscador: GET /api/buscar?q=mesa */
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").slice(0, 80);
  const result = await searchCatalog(q);
  return Response.json(result, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}
