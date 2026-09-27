import type { NextRequest } from "next/server";
import { stores } from "@/config/site";
import {
  attachmentRules,
  dimensionField,
  getQuoteType,
  quoteDeadlines,
  quoteMaterials,
  type QuoteRequest,
} from "@/lib/quotes/schema";
import { newQuoteIds, saveQuote } from "@/lib/quotes/storage";

// Límite simple por IP para evitar abuso (se reinicia con el servidor).
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 6;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

/** Detecta el tipo real del archivo por sus primeros bytes (no confía en el nombre ni en el navegador). */
function sniff(buf: Buffer): { ext: string; type: string } | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ext: "jpg", type: "image/jpeg" };
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return { ext: "png", type: "image/png" };
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP")
    return { ext: "webp", type: "image/webp" };
  if (buf.toString("ascii", 0, 5) === "%PDF-") return { ext: "pdf", type: "application/pdf" };
  if (
    buf.toString("ascii", 4, 8) === "ftyp" &&
    /^(heic|heix|hevc|hevx|mif1|msf1)$/.test(buf.toString("ascii", 8, 12))
  )
    return { ext: "heic", type: "image/heic" };
  return null;
}

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function error(message: string, status = 400) {
  return Response.json({ ok: false, error: message }, { status });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (rateLimited(ip))
    return error("Enviaste varias solicitudes seguidas. Intenta de nuevo en unos minutos.", 429);

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > attachmentRules.maxTotalBytes + 1024 * 1024)
    return error("Los archivos superan el tamaño permitido.", 413);

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

  // ── Tipo y detalles ──
  const type = getQuoteType(text(raw.tipo, 20));
  if (!type) return error("Elige qué quieres fabricar.");

  const rawDims = (raw.medidas ?? {}) as Record<string, unknown>;
  const dimensions: Record<string, number> = {};
  for (const d of type.dimensions) {
    const n = Number(rawDims[d]);
    if (Number.isFinite(n) && n > 0)
      dimensions[d] = Math.min(Math.max(Math.round(n), dimensionField.min), dimensionField.max);
  }

  const rawDetails = (raw.detalles ?? {}) as Record<string, unknown>;
  const details: QuoteRequest["details"] = [];
  for (const f of type.fields) {
    const v = rawDetails[f.name];
    if (f.kind === "toggle") {
      details.push({ label: f.label, value: v === true ? "Sí" : "No" });
    } else if (f.kind === "select") {
      const s = text(v, 60);
      if (f.options?.includes(s)) details.push({ label: f.label, value: s });
    } else {
      const n = Number(v);
      if (v !== "" && v !== null && v !== undefined && Number.isFinite(n)) {
        const clamped = Math.min(Math.max(Math.round(n), f.min ?? 0), f.max ?? 9999);
        details.push({ label: f.label, value: `${clamped}${f.unit ? ` ${f.unit}` : ""}` });
      }
    }
  }

  // ── Contacto ──
  const contact = {
    name: text(raw.nombre, 80),
    phone: text(raw.telefono, 30),
    email: text(raw.email, 120),
    commune: text(raw.comuna, 60),
  };
  if (!contact.name || contact.phone.replace(/\D/g, "").length < 8 || !contact.commune)
    return error("Completa tu nombre, teléfono y comuna.");
  if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email))
    return error("El correo no es válido.");

  const store = stores.find((s) => s.slug === text(raw.tienda, 20));
  if (!store) return error("Elige la tienda que te atenderá.");

  // ── Archivos ──
  const uploads = form.getAll("archivos").filter((f): f is File => f instanceof File && f.size > 0);
  if (uploads.length > attachmentRules.maxFiles)
    return error(`Puedes adjuntar hasta ${attachmentRules.maxFiles} archivos.`);

  const files: { file: string; data: Buffer }[] = [];
  const attachments: QuoteRequest["attachments"] = [];
  let total = 0;
  for (const [i, upload] of uploads.entries()) {
    if (upload.size > attachmentRules.maxFileBytes) return error(`"${upload.name}" supera los 10 MB.`);
    total += upload.size;
    if (total > attachmentRules.maxTotalBytes)
      return error("Los archivos superan el tamaño total permitido.");
    const data = Buffer.from(await upload.arrayBuffer());
    const kind = sniff(data);
    if (!kind) return error(`"${upload.name}" no es una imagen o PDF válido.`);
    const file = `archivo-${i + 1}.${kind.ext}`;
    files.push({ file, data });
    attachments.push({ file, name: text(upload.name, 120) || file, type: kind.type, size: upload.size });
  }

  const { id, code } = newQuoteIds();
  const material = text(raw.material, 40);
  const deadline = text(raw.plazo, 40);
  const quote: QuoteRequest = {
    id,
    code,
    createdAt: new Date().toISOString(),
    type: type.slug,
    typeName: type.name,
    dimensions,
    details,
    material: quoteMaterials.includes(material) ? material : "",
    finish: text(raw.terminacion, 120),
    description: text(raw.descripcion, 2000),
    deadline: quoteDeadlines.includes(deadline) ? deadline : "",
    contact,
    store: store.slug,
    attachments,
  };

  try {
    await saveQuote(quote, files);
  } catch (e) {
    console.error("No se pudo guardar la cotización", e);
    return error("No pudimos guardar tu solicitud. Intenta de nuevo o escríbenos por WhatsApp.", 500);
  }

  return Response.json({ ok: true, id, code });
}
