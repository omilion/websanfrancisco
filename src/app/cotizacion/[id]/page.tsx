import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FileText, Mail, MapPin, MessageCircle, Phone, Store as StoreIcon } from "lucide-react";
import { Plank } from "@/components/plank";
import { formatPhone, stores, whatsappUrl } from "@/config/site";
import { formatPrice } from "@/lib/format";
import { dimensionLabels } from "@/lib/quotes/schema";
import { readQuote } from "@/lib/quotes/storage";

export const metadata: Metadata = {
  title: "Solicitud de cotización",
  robots: { index: false, follow: false },
};

/** Detalle de una solicitud de cotización. Solo accesible con el enlace secreto. */
export default function CotizacionPage(props: PageProps<"/cotizacion/[id]">) {
  return (
    <Suspense fallback={<div className="mx-auto h-96 max-w-4xl animate-pulse px-4 py-12" aria-busy />}>
      <QuoteDetail params={props.params} />
    </Suspense>
  );
}

async function QuoteDetail({ params }: Pick<PageProps<"/cotizacion/[id]">, "params">) {
  const { id } = await params;
  const quote = await readQuote(id);
  if (!quote) notFound();

  const store = stores.find((s) => s.slug === quote.store);
  const date = new Intl.DateTimeFormat("es-CL", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Santiago",
  }).format(new Date(quote.createdAt));
  const isProducts = quote.kind === "productos";
  const isPersonalized = quote.kind === "personalizada";
  const items = quote.items ?? [];
  const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const dims = Object.entries(quote.dimensions);
  const images = quote.attachments.filter((a) => a.type.startsWith("image/") && a.type !== "image/heic");
  const others = quote.attachments.filter((a) => !images.includes(a));
  const fileUrl = (file: string) => `/cotizacion/${quote.id}/archivos/${file}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-14">
      <Plank className="w-12" />
      <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-brand-orange-dark">
        Solicitud de cotización · {quote.code}
      </p>
      <h1 className="mt-2 font-display text-2xl font-bold uppercase leading-none text-brand-blue sm:text-4xl md:text-[2.75rem]">
        {isProducts ? "Cotización de productos" : isPersonalized ? "Cotización personalizada" : `${quote.typeName} a medida`}
      </h1>
      <p className="mt-2 text-sm text-ink-muted">Recibida el {date}</p>

      <div className="mt-8 grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          {isPersonalized && quote.product && (
            <section className="rounded-lg bg-white p-6 ring-1 ring-sand">
              <h2 className="font-display text-2xl font-bold uppercase text-brand-blue">Producto base</h2>
              <p className="mt-3 font-semibold">{quote.product.name}</p>
              <p className="text-xs text-ink-muted">
                SKU {quote.product.sku}
                {quote.product.price !== null && ` · precio publicado ${formatPrice(quote.product.price)}`}
              </p>
            </section>
          )}

          {isProducts && (
            <section className="rounded-lg bg-white p-6 ring-1 ring-sand">
              <h2 className="font-display text-2xl font-bold uppercase text-brand-blue">Productos</h2>
              <ul className="mt-4 divide-y divide-sand text-sm">
                {items.map((i) => (
                  <li key={i.sku} className="flex items-baseline justify-between gap-4 py-2.5">
                    <span>
                      <span className="font-semibold">
                        {i.quantity} × {i.name}
                      </span>
                      <span className="block text-xs text-ink-muted">
                        SKU {i.sku} · {formatPrice(i.unitPrice)} c/u
                      </span>
                    </span>
                    <span className="font-semibold">{formatPrice(i.unitPrice * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex justify-between border-t border-sand pt-3">
                <span className="font-semibold">Total referencial</span>
                <span className="text-lg font-bold">{formatPrice(total)}</span>
              </div>
              <p className="text-xs text-ink-muted">
                IVA incluido. Precios del catálogo al momento de la solicitud.
              </p>
            </section>
          )}

          {(dims.length > 0 || quote.details.length > 0) && (
            <section className="rounded-lg bg-white p-6 ring-1 ring-sand">
              <h2 className="font-display text-2xl font-bold uppercase text-brand-blue">
                {isProducts ? "Entrega" : isPersonalized ? "Cambios pedidos" : "Detalle del proyecto"}
              </h2>
              <dl className="mt-4 divide-y divide-sand text-sm">
                {dims.map(([k, v]) => (
                  <Row
                    key={k}
                    label={dimensionLabels[k as keyof typeof dimensionLabels] ?? k}
                    value={`${v} cm`}
                  />
                ))}
                {dims.length === 0 && !isProducts && !isPersonalized && (
                  <Row label="Medidas" value="Sin medidas (a tomar en visita)" />
                )}
                {quote.details.map((d) => (
                  <Row key={d.label} label={d.label} value={d.value} />
                ))}
                {quote.material && <Row label="Madera" value={quote.material} />}
                {quote.finish && <Row label="Color o terminación" value={quote.finish} />}
                {quote.deadline && <Row label="Plazo" value={quote.deadline} />}
              </dl>
            </section>
          )}

          {quote.description && (
            <section className="rounded-lg bg-white p-6 ring-1 ring-sand">
              <h2 className="font-display text-2xl font-bold uppercase text-brand-blue">
                {isProducts ? "Comentarios" : isPersonalized ? "Otros cambios" : "Idea del cliente"}
              </h2>
              <p className="mt-3 whitespace-pre-line text-ink">{quote.description}</p>
            </section>
          )}

          {quote.attachments.length > 0 && (
            <section className="rounded-lg bg-white p-6 ring-1 ring-sand">
              <h2 className="font-display text-2xl font-bold uppercase text-brand-blue">
                Fotos y planos ({quote.attachments.length})
              </h2>
              {images.length > 0 && (
                <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {images.map((a) => (
                    <li key={a.file}>
                      <a href={fileUrl(a.file)} target="_blank" rel="noopener" className="block">
                        {/* eslint-disable-next-line @next/next/no-img-element -- archivo privado, no pasa por el optimizador */}
                        <img
                          src={fileUrl(a.file)}
                          alt={a.name}
                          className="aspect-square w-full rounded-md object-cover ring-1 ring-sand"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              {others.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {others.map((a) => (
                    <li key={a.file}>
                      <a
                        href={fileUrl(a.file)}
                        target="_blank"
                        rel="noopener"
                        className="flex items-center gap-2 rounded-md bg-cream px-3 py-2.5 text-sm font-medium text-brand-blue hover:underline"
                      >
                        <FileText className="size-4 shrink-0" aria-hidden />
                        {a.name}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>

        <aside className="h-fit space-y-4 rounded-lg bg-white p-6 ring-1 ring-sand">
          <h2 className="font-display text-2xl font-bold uppercase text-brand-blue">Cliente</h2>
          <p className="font-semibold">{quote.contact.name}</p>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2">
              <Phone className="mt-0.5 size-4 shrink-0 text-brand-orange-dark" aria-hidden />
              <a href={`tel:${quote.contact.phone}`} className="hover:underline">
                {quote.contact.phone}
              </a>
            </li>
            {quote.contact.email && (
              <li className="flex gap-2">
                <Mail className="mt-0.5 size-4 shrink-0 text-brand-orange-dark" aria-hidden />
                <a href={`mailto:${quote.contact.email}`} className="break-all hover:underline">
                  {quote.contact.email}
                </a>
              </li>
            )}
            <li className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand-orange-dark" aria-hidden />
              {quote.contact.commune}
            </li>
            {store && (
              <li className="flex gap-2">
                <StoreIcon className="mt-0.5 size-4 shrink-0 text-brand-orange-dark" aria-hidden />
                Tienda {store.city} · {formatPhone(store.phone)}
              </li>
            )}
          </ul>
          <a
            href={whatsappUrl(
              quote.contact.phone.replace(/\D/g, "").replace(/^(9\d{8})$/, "56$1"),
              `Hola ${quote.contact.name}, te escribimos de San Francisco Muebles por tu cotización ${quote.code}.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-md bg-brand-blue px-4 py-3 text-sm font-semibold text-white hover:bg-brand-blue-dark"
          >
            <MessageCircle className="size-4" aria-hidden />
            Responder por WhatsApp
          </a>
          <Link href="/" className="block text-center text-sm font-medium text-brand-blue hover:underline">
            Ir al sitio
          </Link>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  );
}
