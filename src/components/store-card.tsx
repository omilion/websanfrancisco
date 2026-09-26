import { MapPin, MessageCircle, Phone } from "lucide-react";
import { formatPhone, whatsappUrl, type Store } from "@/config/site";

/** Tarjeta de tienda. "dark" sobre fondo azul, "light" sobre fondo claro. */
export function StoreCard({ store, tone = "dark" }: { store: Store; tone?: "light" | "dark" }) {
  const dark = tone === "dark";

  return (
    <div
      className={`flex h-full flex-col rounded-lg p-5 ${dark ? "bg-white/10 text-white ring-1 ring-white/15" : "bg-white text-ink ring-1 ring-sand"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className={`font-display text-2xl font-bold uppercase ${dark ? "" : "text-brand-blue"}`}>
          {store.city}
        </h3>
        {store.isHeadquarters && (
          <span className="rounded bg-brand-orange px-2 py-0.5 text-xs font-bold uppercase text-ink">
            Casa matriz
          </span>
        )}
      </div>

      {store.address && (
        <p className={`mt-2 flex gap-2 text-sm ${dark ? "text-white/80" : "text-ink-muted"}`}>
          <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
          {store.address}
        </p>
      )}
      {!dark && (
        <p className="mt-2 flex gap-2 text-sm text-ink-muted">
          <Phone className="mt-0.5 size-4 shrink-0" aria-hidden />
          {formatPhone(store.phone)}
        </p>
      )}

      <div className="mt-auto flex gap-2 pt-5">
        <a
          href={`tel:${store.phone}`}
          aria-label={`Llamar a ${store.name}, ${formatPhone(store.phone)}`}
          className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold ${dark ? "bg-white text-brand-blue hover:bg-cream" : "bg-brand-blue text-white hover:bg-brand-blue-dark"}`}
        >
          <Phone className="size-4" aria-hidden />
          Llamar
        </a>
        <a
          href={whatsappUrl(store.phone)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`WhatsApp ${store.name}`}
          className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-sm font-semibold ${dark ? "border-white/40 hover:bg-white/10" : "border-brand-blue text-brand-blue hover:bg-cream"}`}
        >
          <MessageCircle className="size-4" aria-hidden />
          WhatsApp
        </a>
      </div>
    </div>
  );
}
