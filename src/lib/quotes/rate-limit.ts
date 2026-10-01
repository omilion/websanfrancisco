import "server-only";

// Límite simple por IP para evitar abuso de los formularios (se reinicia con el servidor).
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 6;
const hits = new Map<string, number[]>();

/** `bucket` separa los contadores de formularios distintos (cotizaciones, pagos…). */
export function rateLimited(request: Request, bucket = "default", max = MAX_PER_WINDOW): boolean {
  const ip = `${bucket}:${request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local"}`;
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > max;
}
