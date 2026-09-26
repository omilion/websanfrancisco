import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import { cacheLife } from "next/cache";
import { formatPhone, site, stores } from "@/config/site";
import { mainNav } from "./site-header";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-sand bg-sand/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.2fr_1fr_1.5fr]">
        <div>
          <Image
            src="/brand/logo-horizontal.png"
            alt="San Francisco Muebles"
            width={1319}
            height={606}
            className="h-14 w-auto"
          />
          <p className="mt-4 max-w-xs text-sm text-ink-muted">
            Precisión artesanal desde el corazón de Chiloé. Muebles a medida y de stock fabricados en
            Ancud.
          </p>
          <a
            href={`mailto:${site.email}`}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-blue hover:underline"
          >
            <Mail className="size-4" aria-hidden />
            {site.email}
          </a>
        </div>

        <nav aria-label="Pie de página">
          <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-brand-blue">
            Tienda
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {[...mainNav, { href: "/cotizar", label: "Cotizar" }].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-brand-blue hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-brand-blue">
            Nuestras tiendas
          </h2>
          <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {stores.map((store) => (
              <li key={store.slug}>
                <span className="font-semibold">{store.city}</span>
                <a href={`tel:${store.phone}`} className="block text-ink-muted hover:text-brand-blue">
                  {formatPhone(store.phone)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-sand">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-ink-muted sm:flex-row sm:justify-between">
          <p>© <CurrentYear /> San Francisco Muebles · Ancud, Chiloé</p>
          <p>Pago seguro con Webpay · Precios con IVA incluido</p>
        </div>
      </div>
    </footer>
  );
}

async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}
