import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { ClearCart } from "@/components/checkout/clear-cart";
import { Plank } from "@/components/plank";
import { headquartersOf, whatsappUrl } from "@/config/site";
import { getStores } from "@/lib/site-content";
import { formatPrice } from "@/lib/format";
import { registerOrderInErp } from "@/lib/orders/process";
import { readOrder } from "@/lib/orders/storage";

export const metadata: Metadata = {
  title: "Resultado del pago",
  robots: { index: false, follow: false },
};

export default function ResultPage(props: PageProps<"/checkout/resultado">) {
  return (
    <Suspense fallback={<div className="mx-auto h-96 max-w-2xl animate-pulse px-4 py-12" aria-busy />}>
      <Result searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Result({ searchParams }: Pick<PageProps<"/checkout/resultado">, "searchParams">) {
  const query = await searchParams;
  const buyOrder = typeof query.orden === "string" ? query.orden : "";
  const key = typeof query.k === "string" ? query.k : "";
  let order = buyOrder ? await readOrder(buyOrder) : null;
  if (order && order.accessKey !== key) order = null;

  // Cobrado pero aún sin registrar en el ERP (estuvo caído): se reintenta al abrir esta página.
  if (order?.status === "pagado") order = await registerOrderInErp(order);

  if (!order) {
    return (
      <Shell>
        <Message
          tone="warn"
          title="No encontramos tu pedido"
          text="Si pagaste y no ves la confirmación, escríbenos por WhatsApp con tu comprobante de Webpay y lo revisamos de inmediato."
        />
        <Actions />
      </Shell>
    );
  }

  const stores = await getStores();
  const store = stores.find((s) => s.slug === order.delivery.store) ?? headquartersOf(stores);

  if (order.status === "registrado" || order.status === "pagado") {
    const pay = order.payment;
    const message = [
      `Hola, acabo de pagar mi pedido ${order.buyOrder} en la tienda web.`,
      ...order.lines.map((l) => `• ${l.quantity} × ${l.name}`),
      `*Total pagado:* ${formatPrice(order.amount)}`,
      `*Entrega:* ${order.delivery.type === "despacho" ? `Despacho a ${order.customer.commune}` : `Retiro en tienda ${store.city}`}`,
      `*Nombre:* ${order.customer.name}`,
    ].join("\n");
    return (
      <Shell>
        <ClearCart />
        <Message
          tone="ok"
          title="¡Pago recibido!"
          text={`Gracias, ${order.customer.name.split(" ")[0]}. Tu pedido ${order.buyOrder} quedó confirmado.`}
        />
        <section className="mt-8 rounded-lg bg-white p-6 ring-1 ring-sand" aria-label="Resumen del pedido">
          <ul className="divide-y divide-sand">
            {order.lines.map((l) => (
              <li key={l.sku} className="flex justify-between gap-4 py-3 text-sm">
                <span>
                  {l.quantity} × {l.name}
                </span>
                <span className="font-semibold">{formatPrice(l.unitPrice * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-sand pt-4 text-sm">
            <Row label="Total pagado" value={formatPrice(order.amount)} strong />
            {pay && <Row label="Código de autorización" value={pay.authorizationCode} />}
            {pay?.cardLast4 && (
              <Row
                label="Tarjeta"
                value={`···· ${pay.cardLast4}${pay.paymentType === "VD" ? " (débito)" : pay.paymentType === "VP" ? " (prepago)" : " (crédito)"}`}
              />
            )}
            <Row
              label="Entrega"
              value={
                order.delivery.type === "despacho"
                  ? `Despacho a ${order.customer.address}, ${order.customer.commune}`
                  : `Retiro en tienda ${store.city}`
              }
            />
          </dl>
          <p className="mt-4 rounded-md bg-sand/60 p-3 text-sm text-ink-muted">
            {order.delivery.type === "despacho"
              ? "El despacho no se cobró en este pago: la tienda te contactará para coordinar fecha y costo según tu dirección."
              : "Te avisaremos cuando tu pedido esté listo para retirar."}
            {order.assembly && " También cotizaremos el armado e instalación que pediste."}
          </p>
          {order.status === "pagado" && (
            <p className="mt-3 flex gap-2 text-sm text-ink-muted">
              <Clock className="mt-0.5 size-4 shrink-0 text-brand-orange-dark" aria-hidden />
              Tu pago está confirmado; estamos terminando de registrar el pedido en la tienda. No necesitas hacer nada más.
            </p>
          )}
        </section>
        <Actions whatsapp={{ phone: store.whatsapp, message, city: store.city }} />
      </Shell>
    );
  }

  const copy: Record<string, { title: string; text: string }> = {
    rechazado: {
      title: "Tu pago no fue aprobado",
      text: "Webpay no autorizó la transacción, así que no se hizo ningún cobro. Puedes intentarlo de nuevo con otra tarjeta.",
    },
    abandonado: {
      title: "Cancelaste el pago",
      text: "No se hizo ningún cobro. Tu carrito sigue guardado por si quieres retomarlo.",
    },
    reembolsado: {
      title: "No pudimos confirmar tu pedido",
      text: "Detectamos una diferencia en el monto y devolvimos el cobro a tu tarjeta. Intenta de nuevo o escríbenos por WhatsApp.",
    },
    iniciado: {
      title: "Tu pago aún no se confirma",
      text: "Si ya pagaste, espera unos minutos y actualiza esta página. Si no, puedes volver al carrito e intentarlo de nuevo.",
    },
  };
  const c = copy[order.status] ?? copy.iniciado;
  return (
    <Shell>
      <Message tone={order.status === "iniciado" ? "warn" : "error"} title={c.title} text={c.text} />
      <p className="mt-2 text-center text-xs text-ink-muted">Pedido {order.buyOrder}</p>
      <div className="mt-6 flex justify-center">
        <Link href="/checkout" className="rounded-md bg-brand-blue px-6 py-3 font-semibold text-white hover:bg-brand-blue-dark">
          Volver al pago
        </Link>
      </div>
      <Actions />
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:py-14">
      <Plank className="w-12" />
      {children}
    </div>
  );
}

function Message({ tone, title, text }: { tone: "ok" | "warn" | "error"; title: string; text: string }) {
  const Icon = tone === "ok" ? CheckCircle2 : tone === "error" ? XCircle : AlertTriangle;
  return (
    <div className="mt-6 text-center">
      <Icon
        className={`mx-auto size-14 ${tone === "ok" ? "text-brand-blue" : "text-brand-orange-dark"}`}
        strokeWidth={1.5}
        aria-hidden
      />
      <h1 className="mt-4 font-display text-3xl font-bold uppercase text-brand-blue">{title}</h1>
      <p className="mx-auto mt-2 max-w-md text-ink-muted">{text}</p>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-muted">{label}</dt>
      <dd className={`text-right ${strong ? "text-lg font-bold" : "font-medium"}`}>{value}</dd>
    </div>
  );
}

function Actions({ whatsapp }: { whatsapp?: { phone: string; message: string; city: string } }) {
  return (
    <div className="mt-8 flex flex-col items-center gap-3 text-sm">
      {whatsapp && (
        <a
          href={whatsappUrl(whatsapp.phone, whatsapp.message)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#25D366] px-6 py-3.5 font-semibold text-white shadow-sm transition hover:brightness-95"
        >
          <FaWhatsapp className="size-5" aria-hidden />
          Avisar a la tienda de {whatsapp.city}
        </a>
      )}
      <Link href="/productos" className="font-medium text-brand-blue hover:underline">
        Seguir viendo el catálogo
      </Link>
    </div>
  );
}
