"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Info,
  Loader2,
  Lock,
  Send,
  Store as StoreIcon,
  Truck,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { fulfillment, shippingCommunes, stores, whatsappUrl } from "@/config/site";
import type { CartCatalogInfo } from "@/lib/cart/catalog-info";
import { cartSubtotal, reconcileCart, type CartLine } from "@/lib/cart/reconcile";
import { clearCart, useCart } from "@/lib/cart/store";
import { formatPrice } from "@/lib/format";
import { isValidRut } from "@/lib/rut";

type Delivery = "despacho" | "retiro";

const inputClass =
  "mt-1.5 w-full rounded-md border border-sand bg-white px-3 py-2.5 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 aria-[invalid=true]:border-brand-orange-dark";

/**
 * Paso final del carrito. `mode="pago"`: checkout con Webpay (cuando el cliente venda en línea).
 * `mode="cotizacion"`: los mismos datos, pero envía una solicitud de cotización sin cobro.
 */
export function CheckoutForm({
  catalog,
  mode = "pago",
}: {
  catalog: CartCatalogInfo;
  mode?: "pago" | "cotizacion";
}) {
  const quoteMode = mode === "cotizacion";
  const lines = reconcileCart(useCart(), catalog).filter((l) => l.purchasable > 0);
  const subtotal = cartSubtotal(lines);
  const [delivery, setDelivery] = useState<Delivery>("despacho");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [result, setResult] = useState<{ id: string; code: string; store: string; message: string } | null>(
    null,
  );

  if (result) return <QuoteSent {...result} />;

  if (lines.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-sand bg-white px-6 py-14 text-center">
        <h2 className="font-display text-3xl font-bold uppercase text-brand-blue">
          {quoteMode ? "No hay productos para cotizar" : "No hay productos para pagar"}
        </h2>
        <p className="mt-2 text-ink-muted">Tu carrito está vacío o sus productos ya no están disponibles.</p>
        <Link
          href="/carrito"
          className="mt-6 inline-block rounded-md bg-brand-blue px-6 py-3 font-semibold text-white"
        >
          Volver al carrito
        </Link>
      </div>
    );
  }

  async function sendQuote(data: FormData) {
    const storeSlug = String(data.get("tienda") ?? "");
    const payload = {
      items: lines.map((l) => ({ sku: l.sku, quantity: l.purchasable })),
      nombre: data.get("nombre"),
      telefono: data.get("telefono"),
      email: data.get("email"),
      entrega: delivery,
      direccion: data.get("direccion"),
      comuna: data.get("comuna"),
      referencia: data.get("referencia"),
      tienda: storeSlug,
      armado: data.get("armado") === "on",
      comentarios: data.get("comentarios"),
    };
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch("/api/cotizaciones/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { ok: boolean; id?: string; code?: string; error?: string };
      if (!json.ok || !json.id || !json.code)
        throw new Error(json.error || "No pudimos enviar tu solicitud.");
      const link = `${window.location.origin}/cotizacion/${json.id}`;
      const message = [
        `Hola, envié una solicitud de cotización desde la web (${json.code}).`,
        ...lines.map((l) => `• ${l.purchasable} × ${l.name}`),
        `*Total referencial:* ${formatPrice(subtotal)}`,
        `*Entrega:* ${delivery === "despacho" ? `Despacho a ${payload.comuna}` : "Retiro en tienda"}`,
        `*Nombre:* ${payload.nombre}`,
      ].join("\n");
      setResult({
        id: json.id,
        code: json.code,
        store: storeSlug,
        message: `${message}\n\nDetalle completo: ${link}`,
      });
      clearCart();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "No pudimos enviar tu solicitud. Intenta de nuevo.");
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (quoteMode) {
      void sendQuote(data);
      return;
    }
    const next: Record<string, string> = {};
    const rut = String(data.get("rut") ?? "").trim();
    if (rut && !isValidRut(rut)) next.rut = "El RUT no es válido.";
    if (!data.get("terminos")) next.terminos = "Debes aceptar los términos y condiciones.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    // TODO(webpay): enviar datos + carrito a un Server Action que revalide precio y stock,
    // cree la transacción en Transbank y redirija a Webpay. Se conecta en la siguiente etapa.
    setSubmitted(true);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate={false}
      className="grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-12"
    >
      <div className="space-y-8">
        {/* Resumen plegable arriba en celular: el total se ve sin bajar hasta el final */}
        <details className="group rounded-lg bg-white ring-1 ring-sand lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-2 text-sm font-semibold text-brand-blue">
              <span className="group-open:hidden">Ver resumen del pedido</span>
              <span className="hidden group-open:inline">Ocultar resumen</span>
              <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
            </span>
            <span className="text-lg font-bold">{formatPrice(subtotal)}</span>
          </summary>
          <ul className="divide-y divide-sand border-t border-sand px-5">
            {lines.map((line) => (
              <SummaryLine key={line.sku} line={line} />
            ))}
          </ul>
        </details>

        <Step number={1} title="Tus datos">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nombre y apellido" required>
              <input name="nombre" required autoComplete="name" className={inputClass} />
            </Field>
            {!quoteMode && (
              <Field label="RUT" hint="Opcional, para tu boleta" error={errors.rut}>
                <input
                  name="rut"
                  placeholder="12.345.678-5"
                  aria-invalid={Boolean(errors.rut)}
                  className={inputClass}
                />
              </Field>
            )}
            <Field
              label="Correo electrónico"
              required={!quoteMode}
              hint={quoteMode ? "Opcional" : "Aquí te llega el comprobante"}
            >
              <input
                name="email"
                type="email"
                required={!quoteMode}
                autoComplete="email"
                className={inputClass}
              />
            </Field>
            <Field label="Teléfono" required>
              <input
                name="telefono"
                type="tel"
                required
                autoComplete="tel"
                placeholder="+56 9 ..."
                className={inputClass}
              />
            </Field>
          </div>
        </Step>

        <Step number={2} title="Entrega">
          <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Tipo de entrega">
            <DeliveryOption
              checked={delivery === "despacho"}
              onChange={() => setDelivery("despacho")}
              icon={<Truck className="size-6" aria-hidden />}
              title="Despacho a domicilio"
              text={`En toda la ${fulfillment.shippingArea}. Costo a coordinar según destino.`}
            />
            {fulfillment.storePickup && (
              <DeliveryOption
                checked={delivery === "retiro"}
                onChange={() => setDelivery("retiro")}
                icon={<StoreIcon className="size-6" aria-hidden />}
                title="Retiro en tienda"
                text="Retira en la sucursal que elijas."
              />
            )}
          </div>

          {delivery === "despacho" ? (
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="Dirección" required wide>
                <input
                  name="direccion"
                  required
                  autoComplete="street-address"
                  placeholder="Calle, número, depto."
                  className={inputClass}
                />
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
              <Field label="Referencia" hint="Opcional">
                <input
                  name="referencia"
                  placeholder="Ej: casa azul frente a la escuela"
                  className={inputClass}
                />
              </Field>
              {quoteMode && (
                <Field label="Tienda que te atenderá" required>
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
              )}
              <p className="flex gap-2 rounded-md bg-sand/60 p-3 text-sm text-ink-muted sm:col-span-2">
                <Info className="mt-0.5 size-4 shrink-0 text-brand-blue" aria-hidden />
                {quoteMode
                  ? "Incluimos el costo del despacho en tu cotización, según tu dirección."
                  : "El despacho no se cobra en este pago: te contactamos para coordinar fecha y costo según tu dirección."}
              </p>
            </div>
          ) : (
            <div className="mt-5">
              <Field label="Tienda de retiro" required>
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
              <p className="mt-3 text-sm text-ink-muted">
                {quoteMode
                  ? "Te confirmamos disponibilidad y cuándo puedes retirar en la tienda que elijas."
                  : "Tu pedido sale de nuestra bodega online: te avisamos cuando esté listo para retirar en la tienda que elijas."}
              </p>
            </div>
          )}
        </Step>

        <Step number={3} title="Extras y comentarios">
          <label className="flex cursor-pointer gap-3 rounded-md border border-sand bg-white p-4">
            <input type="checkbox" name="armado" className="mt-1 size-4 accent-brand-blue" />
            <span>
              <span className="font-semibold">Quiero cotizar armado e instalación</span>
              <span className="block text-sm text-ink-muted">
                Te enviamos el valor según el mueble y la distancia.
                {quoteMode ? "" : " No se cobra en este pago."}
              </span>
            </span>
          </label>
          <Field label={quoteMode ? "Comentarios" : "Comentarios para tu pedido"} hint="Opcional">
            <textarea name="comentarios" rows={3} className={inputClass} />
          </Field>
        </Step>
      </div>

      {/* ── Resumen ─────────────────────────────────────── */}
      <aside
        className="h-fit rounded-lg bg-white p-6 ring-1 ring-sand lg:sticky lg:top-28"
        aria-label="Resumen"
      >
        <h2 className="font-display text-2xl font-bold uppercase text-brand-blue">
          {quoteMode ? "Tu cotización" : "Tu pedido"}
        </h2>
        <ul className="mt-4 divide-y divide-sand">
          {lines.map((line) => (
            <SummaryLine key={line.sku} line={line} />
          ))}
        </ul>

        <dl className="mt-4 space-y-2 border-t border-sand pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-muted">Subtotal</dt>
            <dd className="font-semibold">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">{delivery === "despacho" ? "Despacho" : "Retiro en tienda"}</dt>
            <dd className="text-right">
              {delivery === "despacho" ? (quoteMode ? "Se incluye en la cotización" : "A coordinar") : "—"}
            </dd>
          </div>
        </dl>
        <div className="mt-4 flex justify-between border-t border-sand pt-4">
          <span className="font-semibold">{quoteMode ? "Total referencial" : "Total a pagar ahora"}</span>
          <span className="text-2xl font-bold">{formatPrice(subtotal)}</span>
        </div>
        <p className="text-xs text-ink-muted">IVA incluido</p>

        {quoteMode ? (
          <>
            <button
              type="submit"
              disabled={sending}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-brand-blue px-6 py-4 font-semibold text-white transition-colors hover:bg-brand-blue-dark disabled:opacity-60"
            >
              {sending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Send className="size-4" aria-hidden />
              )}
              {sending ? "Enviando…" : "Enviar solicitud de cotización"}
            </button>
            <p className="mt-3 text-center text-xs text-ink-muted">
              Sin compromiso: te contactamos para confirmar disponibilidad, despacho y forma de pago.
            </p>
            {sendError && (
              <p role="alert" className="mt-4 rounded-md bg-brand-orange/10 p-3 text-sm text-ink">
                {sendError}
              </p>
            )}
          </>
        ) : (
          <>
            <label className="mt-6 flex cursor-pointer gap-3 text-sm">
              <input type="checkbox" name="terminos" required className="mt-0.5 size-4 accent-brand-blue" />
              <span>
                Acepto los <span className="font-semibold text-brand-blue">términos y condiciones</span> y la
                política de despacho.
              </span>
            </label>
            {errors.terminos && <p className="mt-1 text-xs text-brand-orange-dark">{errors.terminos}</p>}

            <button
              type="submit"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-brand-blue px-6 py-4 font-semibold text-white transition-colors hover:bg-brand-blue-dark"
            >
              <Lock className="size-4" aria-hidden />
              Pagar {formatPrice(subtotal)} con Webpay
            </button>
            <p className="mt-3 text-center text-xs text-ink-muted">
              Serás redirigido a Webpay de Transbank para pagar con débito, crédito o prepago.
            </p>

            {submitted && (
              <p
                role="status"
                className="mt-4 rounded-md border-2 border-dashed border-brand-orange/60 bg-brand-orange/5 p-3 text-sm"
              >
                <strong className="text-brand-orange-dark">Vista previa:</strong> los datos están correctos.
                La conexión con Webpay se activa en la siguiente etapa del desarrollo.
              </p>
            )}
          </>
        )}

        <Link
          href="/carrito"
          className="mt-2 block py-3 text-center text-sm font-medium text-brand-blue hover:underline"
        >
          Volver al carrito
        </Link>
      </aside>
    </form>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg bg-white p-6 ring-1 ring-sand md:p-8" aria-labelledby={`paso-${number}`}>
      <h2
        id={`paso-${number}`}
        className="flex items-center gap-3 font-display text-2xl font-bold uppercase text-brand-blue"
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-brand-blue text-lg text-white">
          {number}
        </span>
        {title}
      </h2>
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  hint,
  error,
  wide,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
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
      {error && <span className="mt-1 block text-xs text-brand-orange-dark">{error}</span>}
    </label>
  );
}

function DeliveryOption({
  checked,
  onChange,
  icon,
  title,
  text,
}: {
  checked: boolean;
  onChange: () => void;
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <label
      className={`flex cursor-pointer gap-3 rounded-md border-2 p-4 transition ${checked ? "border-brand-blue bg-brand-blue/5" : "border-sand bg-white hover:border-brand-blue/40"}`}
    >
      <input type="radio" name="entrega" checked={checked} onChange={onChange} className="sr-only" />
      <span className={checked ? "text-brand-blue" : "text-ink-muted"}>{icon}</span>
      <span>
        <span className="block font-semibold">{title}</span>
        <span className="block text-sm text-ink-muted">{text}</span>
      </span>
    </label>
  );
}

function SummaryLine({ line }: { line: CartLine }) {
  return (
    <li className="flex gap-3 py-3">
      <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-cream">
        <Image src={line.image} alt="" fill sizes="56px" className="object-cover" />
        <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-brand-blue text-[11px] font-bold text-white">
          {line.purchasable}
        </span>
      </div>
      <div className="min-w-0 flex-1 text-sm">
        <p className="truncate font-medium">{line.name}</p>
        <p className="text-xs text-ink-muted">{formatPrice(line.currentPrice)} c/u</p>
      </div>
      <p className="text-sm font-semibold">{formatPrice(line.currentPrice * line.purchasable)}</p>
    </li>
  );
}

function QuoteSent({
  id,
  code,
  store: storeSlug,
  message,
}: {
  id: string;
  code: string;
  store: string;
  message: string;
}) {
  const store = stores.find((s) => s.slug === storeSlug) ?? stores[0];
  return (
    <div className="mx-auto max-w-xl rounded-lg bg-white px-6 py-12 text-center ring-1 ring-sand">
      <CheckCircle2 className="mx-auto size-14 text-brand-blue" strokeWidth={1.5} aria-hidden />
      <h2 className="mt-4 font-display text-3xl font-bold uppercase text-brand-blue">
        ¡Recibimos tu solicitud!
      </h2>
      <p className="mt-2 text-ink-muted">
        Tu código es <strong className="text-ink">{code}</strong>.
      </p>
      <p className="mx-auto mt-4 max-w-md text-ink">
        Para que la tienda de <strong>{store.city}</strong> te responda más rápido, envíale el aviso por
        WhatsApp: ya está escrito, solo presiona enviar.
      </p>
      <a
        href={whatsappUrl(store.phone, message)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-[#25D366] px-6 py-3.5 font-semibold text-white shadow-sm transition hover:brightness-95"
      >
        <FaWhatsapp className="size-5" aria-hidden />
        Enviar aviso a la tienda {store.city}
      </a>
      <p className="mt-6 flex flex-col items-center gap-2 text-sm">
        <a
          href={`/cotizacion/${id}`}
          target="_blank"
          rel="noopener"
          className="font-medium text-brand-blue hover:underline"
        >
          Ver el resumen de mi solicitud
        </a>
        <Link href="/productos" className="font-medium text-ink-muted hover:underline">
          Seguir viendo el catálogo
        </Link>
      </p>
    </div>
  );
}
