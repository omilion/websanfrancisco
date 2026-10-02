import Image from "next/image";
import { ArrowUpRight, Camera, Clock, MapPin, MessageCircle, Phone } from "lucide-react";
import { formatPhone, mapsUrl, whatsappUrl, type Store } from "@/config/site";

/** Tarjeta de tienda con foto del local. "dark" sobre fondo azul, "light" sobre fondo claro. */
export function StoreCard({ store, tone = "dark" }: { store: Store; tone?: "light" | "dark" }) {
  const dark = tone === "dark";

  return (
    <div
      className={`group flex h-full flex-col overflow-hidden rounded-lg ${dark ? "bg-white/10 text-white ring-1 ring-white/15" : "bg-white text-ink ring-1 ring-sand"}`}
    >
      {/* Foto del local */}
      <div className="relative aspect-[16/10] overflow-hidden bg-brand-navy">
        {store.image ? (
          <Image
            src={store.image}
            alt={`Fachada de ${store.name}`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-[linear-gradient(135deg,#013a63,#012a48)] text-cream/60">
            <Camera className="size-7" strokeWidth={1.5} aria-hidden />
            <span className="text-xs font-medium">Foto de la tienda próximamente</span>
          </div>
        )}
        {store.isHeadquarters && (
          <span className="absolute left-3 top-3 rounded bg-brand-orange px-2 py-0.5 text-xs font-bold uppercase text-ink shadow">
            Casa central
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className={`font-display text-2xl font-bold uppercase leading-none ${dark ? "" : "text-brand-blue"}`}>
          {store.city}
        </h3>

        {store.address && (
          <p className={`mt-3 flex gap-2 text-sm ${dark ? "text-white/80" : "text-ink-muted"}`}>
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              {store.address}
              <a
                href={mapsUrl(store) ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Cómo llegar a ${store.name} en Google Maps`}
                className={`mt-0.5 flex w-fit items-center gap-0.5 py-1 text-xs font-semibold underline-offset-4 hover:underline ${dark ? "text-brand-orange" : "text-brand-blue"}`}
              >
                Cómo llegar <ArrowUpRight className="size-3.5" aria-hidden />
              </a>
            </span>
          </p>
        )}
        <p className={`mt-2 flex gap-2 text-sm tabular-nums ${dark ? "text-white/80" : "text-ink-muted"}`}>
          <Phone className="mt-0.5 size-4 shrink-0" aria-hidden />
          {formatPhone(store.phone)}
        </p>
        {store.hours && (
          <p className={`mt-2 flex gap-2 text-sm ${dark ? "text-white/80" : "text-ink-muted"}`}>
            <Clock className="mt-0.5 size-4 shrink-0" aria-hidden />
            {store.hours}
          </p>
        )}

        <div className="mt-auto flex gap-2 pt-5">
          <a
            href={`tel:${store.phone}`}
            aria-label={`Llamar a ${store.name}, ${formatPhone(store.phone)}`}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2.5 text-sm font-semibold ${dark ? "bg-white text-brand-blue hover:bg-cream" : "bg-brand-blue text-white hover:bg-brand-blue-dark"}`}
          >
            <Phone className="size-4" aria-hidden />
            Llamar
          </a>
          <a
            href={whatsappUrl(store.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`WhatsApp ${store.name}`}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border px-3 py-2.5 text-sm font-semibold ${dark ? "border-white/40 hover:bg-white/10" : "border-brand-blue text-brand-blue hover:bg-cream"}`}
          >
            <MessageCircle className="size-4" aria-hidden />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
