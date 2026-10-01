"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle2, Loader2, Paintbrush, Send } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { shippingCommunes, stores, whatsappUrl } from "@/config/site";
import { attachmentRules } from "@/lib/quotes/schema";

const inputClass =
  "mt-1.5 w-full rounded-md border border-sand bg-white px-3 py-2.5 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20";

const COLOR_SUGGESTIONS = ["Blanco", "Negro", "Gris grafito", "Roble natural", "Nogal", "Azul", "Verde", "Otro (lo cuento abajo)"];

interface Props {
  /** Slug del producto en la tienda (el servidor busca el producto y su precio). */
  slug: string;
  name: string;
  /** Medidas actuales del producto en cm, como referencia para pedir otras. */
  dimensions: { width: number | null; height: number | null; depth: number | null };
}

/** Cotización personalizada: el mismo mueble con otro color o tamaño. Llega al módulo Cotizaciones del ERP. */
export function PersonalizedQuote({ slug, name, dimensions }: Props) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ id: string; code: string; store: string; summary: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const files = data.getAll("archivos").filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length > attachmentRules.maxFiles) return setError(`Puedes adjuntar hasta ${attachmentRules.maxFiles} archivos.`);

    const medidas: Record<string, number> = {};
    for (const key of ["ancho", "alto", "profundidad"]) {
      const n = Number(data.get(key));
      if (Number.isFinite(n) && n > 0) medidas[key] = n;
    }
    const payload = {
      producto: slug,
      color: data.get("color"),
      medidas,
      descripcion: data.get("descripcion"),
      nombre: data.get("nombre"),
      telefono: data.get("telefono"),
      email: data.get("email"),
      comuna: data.get("comuna"),
      tienda: data.get("tienda"),
    };
    const body = new FormData();
    body.set("datos", JSON.stringify(payload));
    files.forEach((f) => body.append("archivos", f, f.name));

    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/cotizaciones/personalizada", { method: "POST", body });
      const json = (await res.json()) as { ok: boolean; id?: string; code?: string; error?: string };
      if (!json.ok || !json.id || !json.code) throw new Error(json.error || "No pudimos enviar tu solicitud.");
      const changes = [
        payload.color ? `Color: ${payload.color}` : "",
        Object.entries(medidas)
          .map(([k, v]) => `${k} ${v} cm`)
          .join(", "),
        String(payload.descripcion ?? ""),
      ].filter(Boolean);
      setResult({
        id: json.id,
        code: json.code,
        store: String(payload.tienda),
        summary: [
          `Hola, pedí una cotización personalizada desde la web (${json.code}).`,
          `*Producto:* ${name}`,
          ...changes.map((c) => `• ${c}`),
          `*Nombre:* ${payload.nombre}`,
          `Detalle completo: ${window.location.origin}/cotizacion/${json.id}`,
        ].join("\n"),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos enviar tu solicitud. Intenta de nuevo.");
    } finally {
      setSending(false);
    }
  }

  if (result) {
    const store = stores.find((s) => s.slug === result.store) ?? stores[0];
    return (
      <section id="personalizar" className="mt-8 scroll-mt-28 rounded-lg bg-white p-6 text-center ring-1 ring-sand">
        <CheckCircle2 className="mx-auto size-12 text-brand-blue" strokeWidth={1.5} aria-hidden />
        <h2 className="mt-3 font-display text-2xl font-bold uppercase text-brand-blue">¡Recibimos tu solicitud!</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Tu código es <strong className="text-ink">{result.code}</strong>. La tienda de {store.city} te enviará el precio de tu versión personalizada.
        </p>
        <a
          href={whatsappUrl(store.phone, result.summary)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-md bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
        >
          <FaWhatsapp className="size-5" aria-hidden />
          Avisar a la tienda por WhatsApp
        </a>
        <p className="mt-3 text-sm">
          <Link href={`/cotizacion/${result.id}`} target="_blank" className="font-medium text-brand-blue hover:underline">
            Ver el resumen de mi solicitud
          </Link>
        </p>
      </section>
    );
  }

  return (
    <section id="personalizar" className="mt-8 scroll-mt-28 rounded-lg bg-white p-5 ring-1 ring-sand md:p-6" aria-labelledby="personalizar-titulo">
      <h2 id="personalizar-titulo" className="flex items-center gap-2 font-display text-2xl font-bold uppercase text-brand-blue">
        <Paintbrush className="size-5 text-brand-orange-dark" aria-hidden />
        Cotización personalizada
      </h2>
      <p className="mt-1 text-sm text-ink-muted">
        ¿Te gusta este mueble pero lo quieres en otro color o tamaño? Cuéntanos y te enviamos el precio de tu versión.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Color o terminación" hint="Ej: blanco, roble natural">
          <input name="color" list="colores-personalizado" maxLength={80} className={inputClass} />
          <datalist id="colores-personalizado">
            {COLOR_SUGGESTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-semibold">Medidas que necesitas (cm)</legend>
          <div className="mt-1.5 grid grid-cols-3 gap-3">
            {(
              [
                ["ancho", "Ancho", dimensions.width],
                ["alto", "Alto", dimensions.height],
                ["profundidad", "Fondo", dimensions.depth],
              ] as const
            ).map(([key, label, base]) => (
              <label key={key} className="block text-xs text-ink-muted">
                {label}
                <input
                  name={key}
                  type="number"
                  inputMode="numeric"
                  min={10}
                  max={2000}
                  placeholder={base ? `Actual: ${base}` : "cm"}
                  className={inputClass.replace("mt-1.5", "mt-1")}
                />
              </label>
            ))}
          </div>
        </fieldset>
        <Field label="¿Qué más quieres cambiar?" hint="Opcional" wide>
          <textarea name="descripcion" rows={3} maxLength={2000} placeholder="Cajones extra, otro tipo de puertas, manillas…" className={inputClass} />
        </Field>
        <Field label="Fotos de referencia" hint={`Opcional · ${attachmentRules.label}`} wide>
          <input
            name="archivos"
            type="file"
            multiple
            accept={attachmentRules.accept}
            className="mt-1.5 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-cream file:px-3 file:py-2 file:font-semibold file:text-brand-blue"
          />
        </Field>

        <Field label="Tu nombre" required>
          <input name="nombre" required autoComplete="name" className={inputClass} />
        </Field>
        <Field label="Teléfono" required>
          <input name="telefono" type="tel" required autoComplete="tel" placeholder="+56 9 ..." className={inputClass} />
        </Field>
        <Field label="Correo" hint="Opcional">
          <input name="email" type="email" autoComplete="email" className={inputClass} />
        </Field>
        <Field label="Comuna" required>
          <select name="comuna" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Elige tu comuna
            </option>
            {shippingCommunes.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Tienda que te atenderá" required wide>
          <select name="tienda" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Elige una tienda
            </option>
            {stores.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.city}
              </option>
            ))}
          </select>
        </Field>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={sending}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-brand-blue px-6 py-3.5 font-semibold text-white transition-colors hover:bg-brand-blue-dark disabled:opacity-60"
          >
            {sending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
            {sending ? "Enviando…" : "Pedir cotización personalizada"}
          </button>
          <p className="mt-2 text-center text-xs text-ink-muted">Sin costo ni compromiso. Te respondemos con el precio y el plazo.</p>
          {error && (
            <p role="alert" className="mt-3 rounded-md bg-brand-orange/10 p-3 text-sm text-ink">
              {error}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  required,
  hint,
  wide,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={`block ${wide ? "sm:col-span-2" : ""}`}>
      <span className="text-sm font-semibold">
        {label}
        {required && <span className="text-brand-orange-dark"> *</span>}
      </span>
      {hint && <span className="ml-2 text-xs text-ink-muted">{hint}</span>}
      {children}
    </label>
  );
}
