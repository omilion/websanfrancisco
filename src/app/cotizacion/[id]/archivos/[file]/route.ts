import { readAttachment, readQuote } from "@/lib/quotes/storage";

/** Entrega un archivo adjunto de una cotización (solo con el enlace secreto de la solicitud). */
export async function GET(_request: Request, ctx: RouteContext<"/cotizacion/[id]/archivos/[file]">) {
  const { id, file } = await ctx.params;
  const quote = await readQuote(id);
  const meta = quote?.attachments.find((a) => a.file === file);
  const data = meta ? await readAttachment(id, file) : null;
  if (!meta || !data) return new Response("No encontrado", { status: 404 });

  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": meta.type,
      "Content-Disposition": `inline; filename="${encodeURIComponent(meta.name)}"`,
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex",
    },
  });
}
